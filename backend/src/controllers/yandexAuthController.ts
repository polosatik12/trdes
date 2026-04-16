import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const YANDEX_CLIENT_ID = process.env.YANDEX_CLIENT_ID || '';
const YANDEX_CLIENT_SECRET = process.env.YANDEX_CLIENT_SECRET || '';
const YANDEX_REDIRECT_URI = process.env.YANDEX_REDIRECT_URI || 'http://localhost:8080/auth/yandex/callback';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate Yandex OAuth authorization URL
 */
export const getYandexAuthUrl = (req: Request, res: Response) => {
  const state = req.query.state as string || '';
  const url = new URL('https://oauth.yandex.ru/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', YANDEX_CLIENT_ID);
  url.searchParams.set('redirect_uri', YANDEX_REDIRECT_URI);
  url.searchParams.set('scope', 'login:email login:info');
  if (state) {
    url.searchParams.set('state', state);
  }

  res.json({ authUrl: url.toString() });
};

/**
 * Handle Yandex OAuth callback
 */
export const yandexCallback = async (req: Request, res: Response) => {
  const { code, state } = req.query;

  if (!code) {
    throw new AppError('Код авторизации не получен', 400);
  }

  // Exchange code for access token
  const tokenResponse = await axios.post('https://oauth.yandex.ru/token', null, {
    params: {
      grant_type: 'authorization_code',
      code,
      client_id: YANDEX_CLIENT_ID,
      client_secret: YANDEX_CLIENT_SECRET,
      redirect_uri: YANDEX_REDIRECT_URI,
    },
  });

  const accessToken = tokenResponse.data.access_token;

  if (!accessToken) {
    throw new AppError('Не удалось получить токен Яндекс', 400);
  }

  // Get user info from Yandex
  const userInfoResponse = await axios.get('https://login.yandex.ru/info', {
    headers: { Authorization: `OAuth ${accessToken}` },
    params: { format: 'json' },
  });

  const yandexUser = userInfoResponse.data;
  const email = yandexUser.default_email || yandexUser.emails?.[0];

  if (!email) {
    throw new AppError('Не удалось получить email из Яндекс ID', 400);
  }

  // Find or create user
  const existingUser = await query('SELECT id, email FROM users WHERE email = $1', [email]);

  let userId: string;
  let userRole: string;

  if (existingUser.rows.length > 0) {
    // User exists — check if they have a Yandex login linked
    userId = existingUser.rows[0].id;

    const roleResult = await query(
      'SELECT role FROM user_roles WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    userRole = roleResult.rows[0]?.role || 'participant';

    // Link Yandex ID if not already linked
    await query(
      `INSERT INTO user_social_logins (user_id, provider, provider_user_id, provider_email)
       VALUES ($1, 'yandex', $2, $3)
       ON CONFLICT (user_id, provider) DO UPDATE SET provider_user_id = $2, provider_email = $3`,
      [userId, yandexUser.id, email]
    );
  } else {
    // Create new user
    const userResult = await query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, ''] // Empty password for OAuth users
    );

    userId = userResult.rows[0].id;
    userRole = 'participant';

    await query('INSERT INTO profiles (id) VALUES ($1)', [userId]);
    await query('INSERT INTO user_roles (user_id, role) VALUES ($1, $2)', [userId, 'participant']);

    // Link Yandex ID
    await query(
      `INSERT INTO user_social_logins (user_id, provider, provider_user_id, provider_email)
       VALUES ($1, 'yandex', $2, $3)`,
      [userId, yandexUser.id, email]
    );

    // Update profile with Yandex data
    const displayName = yandexUser.real_name || yandexUser.display_name || '';
    if (displayName) {
      const nameParts = displayName.split(' ');
      await query(
        'UPDATE profiles SET first_name = $1, last_name = $2 WHERE id = $3',
        [nameParts[0] || null, nameParts.slice(1).join(' ') || null, userId]
      );
    }
  }

  // Generate JWT
  // @ts-expect-error - JWT types issue with expiresIn
  const token = jwt.sign(
    { userId, role: userRole },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // Redirect to frontend with token
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
  const redirectUrl = new URL(`${frontendUrl}/auth/yandex/success`);
  redirectUrl.searchParams.set('token', token);
  if (state) {
    redirectUrl.searchParams.set('state', state);
  }

  res.redirect(redirectUrl.toString());
};

/**
 * Exchange Yandex code for JWT — called from frontend via POST
 */
export const yandexExchange = async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    throw new AppError('Код авторизации не получен', 400);
  }

  // Exchange code for access token
  const tokenResponse = await axios.post('https://oauth.yandex.ru/token', null, {
    params: {
      grant_type: 'authorization_code',
      code,
      client_id: YANDEX_CLIENT_ID,
      client_secret: YANDEX_CLIENT_SECRET,
      redirect_uri: YANDEX_REDIRECT_URI,
    },
  });

  const accessToken = tokenResponse.data.access_token;

  if (!accessToken) {
    throw new AppError('Не удалось получить токен Яндекс', 400);
  }

  // Get user info from Yandex
  const userInfoResponse = await axios.get('https://login.yandex.ru/info', {
    headers: { Authorization: `OAuth ${accessToken}` },
    params: { format: 'json' },
  });

  const yandexUser = userInfoResponse.data;
  const email = yandexUser.default_email || yandexUser.emails?.[0];

  if (!email) {
    throw new AppError('Не удалось получить email из Яндекс ID', 400);
  }

  // Find or create user
  const existingUser = await query('SELECT id, email FROM users WHERE email = $1', [email]);

  let userId: string;
  let userRole: string;

  if (existingUser.rows.length > 0) {
    userId = existingUser.rows[0].id;
    const roleResult = await query('SELECT role FROM user_roles WHERE user_id = $1 LIMIT 1', [userId]);
    userRole = roleResult.rows[0]?.role || 'participant';
    await query(
      `INSERT INTO user_social_logins (user_id, provider, provider_user_id, provider_email)
       VALUES ($1, 'yandex', $2, $3)
       ON CONFLICT (user_id, provider) DO UPDATE SET provider_user_id = $2, provider_email = $3`,
      [userId, yandexUser.id, email]
    );
  } else {
    const userResult = await query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, '']
    );
    userId = userResult.rows[0].id;
    userRole = 'participant';
    await query('INSERT INTO profiles (id) VALUES ($1)', [userId]);
    await query('INSERT INTO user_roles (user_id, role) VALUES ($1, $2)', [userId, 'participant']);
    await query(
      `INSERT INTO user_social_logins (user_id, provider, provider_user_id, provider_email)
       VALUES ($1, 'yandex', $2, $3)`,
      [userId, yandexUser.id, email]
    );
    const displayName = yandexUser.real_name || yandexUser.display_name || '';
    if (displayName) {
      const nameParts = displayName.split(' ');
      await query(
        'UPDATE profiles SET first_name = $1, last_name = $2 WHERE id = $3',
        [nameParts[0] || null, nameParts.slice(1).join(' ') || null, userId]
      );
    }
  }

  // @ts-expect-error - JWT types issue with expiresIn
  const jwtToken = jwt.sign({ userId, role: userRole }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.json({ token: jwtToken });
};

/**
 * Link Yandex account to existing user
 */
export const linkYandexAccount = async (req: AuthRequest, res: Response) => {
  const { code } = req.body;

  if (!code) {
    throw new AppError('Код авторизации не получен', 400);
  }

  // Exchange code for access token
  const tokenResponse = await axios.post('https://oauth.yandex.ru/token', null, {
    params: {
      grant_type: 'authorization_code',
      code,
      client_id: YANDEX_CLIENT_ID,
      client_secret: YANDEX_CLIENT_SECRET,
      redirect_uri: YANDEX_REDIRECT_URI,
    },
  });

  const accessToken = tokenResponse.data.access_token;

  // Get user info
  const userInfoResponse = await axios.get('https://login.yandex.ru/info', {
    headers: { Authorization: `OAuth ${accessToken}` },
    params: { format: 'json' },
  });

  const yandexUser = userInfoResponse.data;

  // Check if this Yandex account is already linked to another user
  const existingLink = await query(
    'SELECT user_id FROM user_social_logins WHERE provider = $1 AND provider_user_id = $2',
    ['yandex', yandexUser.id]
  );

  if (existingLink.rows.length > 0 && existingLink.rows[0].user_id !== req.userId) {
    throw new AppError('Этот Яндекс аккаунт уже привязан к другому пользователю', 400);
  }

  // Link or update
  await query(
    `INSERT INTO user_social_logins (user_id, provider, provider_user_id, provider_email)
     VALUES ($1, 'yandex', $2, $3)
     ON CONFLICT (user_id, provider) DO UPDATE SET provider_user_id = $2, provider_email = $3`,
    [req.userId, yandexUser.id, yandexUser.default_email || yandexUser.emails?.[0] || '']
  );

  res.json({ success: true });
};

/**
 * Unlink Yandex account
 */
export const unlinkYandexAccount = async (req: AuthRequest, res: Response) => {
  const result = await query(
    'DELETE FROM user_social_logins WHERE user_id = $1 AND provider = $2 RETURNING *',
    [req.userId, 'yandex']
  );

  if (result.rows.length === 0) {
    throw new AppError('Яндекс аккаунт не привязан', 404);
  }

  res.json({ success: true });
};

/**
 * Check if user has Yandex linked
 */
export const getYandexLinkStatus = async (req: AuthRequest, res: Response) => {
  const result = await query(
    'SELECT provider_user_id, provider_email FROM user_social_logins WHERE user_id = $1 AND provider = $2',
    [req.userId, 'yandex']
  );

  res.json({
    linked: result.rows.length > 0,
    provider_user_id: result.rows[0]?.provider_user_id || null,
    provider_email: result.rows[0]?.provider_email || null,
  });
};
