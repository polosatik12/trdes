import { Request, Response } from 'express';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Создание корпоративного аккаунта
export const createCorporateAccount = async (req: AuthRequest, res: Response) => {
  const {
    company_full_name,
    company_short_name,
    ogrn,
    inn,
    kpp,
    bank_details,
    postal_address,
    coordinator_name,
    coordinator_phone,
    coordinator_email,
  } = req.body;

  const userId = req.userId;

  if (!userId) {
    throw new AppError('Требуется аутентификация', 401);
  }

  // Проверка на существующий INN
  const existingInn = await query(
    'SELECT id FROM corporate_accounts WHERE inn = $1',
    [inn]
  );

  if (existingInn.rows.length > 0) {
    throw new AppError('Организация с таким ИНН уже зарегистрирована', 400);
  }

  const result = await query(
    `INSERT INTO corporate_accounts (
      user_id, company_full_name, company_short_name, ogrn, inn, kpp,
      bank_details, postal_address, coordinator_name, coordinator_phone, coordinator_email
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      userId,
      company_full_name,
      company_short_name,
      ogrn,
      inn,
      kpp,
      bank_details,
      postal_address,
      coordinator_name,
      coordinator_phone,
      coordinator_email,
    ]
  );

  // Обновляем профиль пользователя как corporate
  await query(
    `UPDATE profiles SET participation_type = 'corporate', team_name = $1 WHERE id = $2`,
    [company_short_name, userId]
  );

  res.json({
    corporate_account: result.rows[0],
  });
};

// Получение корпоративного аккаунта текущего пользователя
export const getCorporateAccount = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw new AppError('Требуется аутентификация', 401);
  }

  const result = await query(
    'SELECT * FROM corporate_accounts WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Корпоративный аккаунт не найден', 404);
  }

  res.json({
    corporate_account: result.rows[0],
  });
};

// Обновление корпоративного аккаунта
export const updateCorporateAccount = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const {
    company_full_name,
    company_short_name,
    bank_details,
    postal_address,
    coordinator_name,
    coordinator_phone,
    coordinator_email,
  } = req.body;

  if (!userId) {
    throw new AppError('Требуется аутентификация', 401);
  }

  const result = await query(
    `UPDATE corporate_accounts SET
      company_full_name = COALESCE($1, company_full_name),
      company_short_name = COALESCE($2, company_short_name),
      bank_details = COALESCE($3, bank_details),
      postal_address = COALESCE($4, postal_address),
      coordinator_name = COALESCE($5, coordinator_name),
      coordinator_phone = COALESCE($6, coordinator_phone),
      coordinator_email = COALESCE($7, coordinator_email),
      updated_at = NOW()
    WHERE user_id = $8
    RETURNING *`,
    [
      company_full_name,
      company_short_name,
      bank_details,
      postal_address,
      coordinator_name,
      coordinator_phone,
      coordinator_email,
      userId,
    ]
  );

  if (result.rows.length === 0) {
    throw new AppError('Корпоративный аккаунт не найден', 404);
  }

  res.json({
    corporate_account: result.rows[0],
  });
};

// Добавление участника корпоративного аккаунта
export const addCorporateMember = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const {
    first_name,
    last_name,
    patronymic,
    date_of_birth,
    gender,
    phone,
    email,
    position,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relationship,
  } = req.body;

  if (!userId) {
    throw new AppError('Требуется аутентификация', 401);
  }

  // Получаем корпоративный аккаунт
  const corporateAccount = await query(
    'SELECT id FROM corporate_accounts WHERE user_id = $1',
    [userId]
  );

  if (corporateAccount.rows.length === 0) {
    throw new AppError('Корпоративный аккаунт не найден', 404);
  }

  const corporateAccountId = corporateAccount.rows[0].id;

  const result = await query(
    `INSERT INTO corporate_members (
      corporate_account_id, first_name, last_name, patronymic, date_of_birth,
      gender, phone, email, position, emergency_contact_name,
      emergency_contact_phone, emergency_contact_relationship
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      corporateAccountId,
      first_name,
      last_name,
      patronymic,
      date_of_birth,
      gender,
      phone,
      email,
      position,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
    ]
  );

  res.json({
    member: result.rows[0],
  });
};

// Получение списка участников корпоративного аккаунта
export const getCorporateMembers = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw new AppError('Требуется аутентификация', 401);
  }

  const result = await query(
    `SELECT cm.*, ca.company_short_name
     FROM corporate_members cm
     JOIN corporate_accounts ca ON cm.corporate_account_id = ca.id
     WHERE ca.user_id = $1
     ORDER BY cm.last_name, cm.first_name`,
    [userId]
  );

  res.json({
    members: result.rows,
  });
};

// Обновление участника корпоративного аккаунта
export const updateCorporateMember = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const {
    first_name,
    last_name,
    patronymic,
    date_of_birth,
    gender,
    phone,
    email,
    position,
    status,
  } = req.body;

  if (!userId) {
    throw new AppError('Требуется аутентификация', 401);
  }

  const result = await query(
    `UPDATE corporate_members SET
      first_name = COALESCE($1, first_name),
      last_name = COALESCE($2, last_name),
      patronymic = COALESCE($3, patronymic),
      date_of_birth = COALESCE($4, date_of_birth),
      gender = COALESCE($5, gender),
      phone = COALESCE($6, phone),
      email = COALESCE($7, email),
      position = COALESCE($8, position),
      status = COALESCE($9, status),
      updated_at = NOW()
    WHERE id = $10
    RETURNING *`,
    [
      first_name,
      last_name,
      patronymic,
      date_of_birth,
      gender,
      phone,
      email,
      position,
      status,
      id,
    ]
  );

  if (result.rows.length === 0) {
    throw new AppError('Участник не найден', 404);
  }

  res.json({
    member: result.rows[0],
  });
};

// Удаление участника корпоративного аккаунта
export const deleteCorporateMember = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    throw new AppError('Требуется аутентификация', 401);
  }

  const result = await query(
    'DELETE FROM corporate_members WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Участник не найден', 404);
  }

  res.json({ success: true });
};

// Получение участника по ID
export const getCorporateMemberById = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    throw new AppError('Требуется аутентификация', 401);
  }

  const result = await query(
    `SELECT cm.*, ca.company_short_name
     FROM corporate_members cm
     JOIN corporate_accounts ca ON cm.corporate_account_id = ca.id
     WHERE cm.id = $1 AND ca.user_id = $2`,
    [id, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Участник не найден', 404);
  }

  res.json({
    member: result.rows[0],
  });
};
