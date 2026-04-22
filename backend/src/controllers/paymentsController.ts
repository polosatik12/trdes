import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { RobokassaService } from '../services/robokassa';
import { sendRegistrationConfirmation } from '../services/email';
import { determineCategory, autoAssignBib } from '../services/bibService';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Create payment and get Robokassa URL
const createPaymentSchema = z.object({
  cart: z.array(z.object({
    eventSlug: z.string(),
    eventName: z.string(),
    routeName: z.string(),
    distance: z.string(),
    price: z.number().positive(),
    originalPrice: z.number().positive().optional(),
    promoCode: z.string().nullable().optional(),
    promoDiscount: z.number().optional(),
    city: z.string(),
    requirements: z.array(z.string()).optional(),
  })),
});

export const createPayment = async (req: AuthRequest, res: Response) => {
  const validData = createPaymentSchema.parse(req.body);
  const userId = req.userId;

  if (!userId) {
    throw new AppError('Требуется аутентификация', 401);
  }

  // Calculate total: price in cart is in rubles
  const totalRubles = validData.cart.reduce((sum, item) => sum + item.price, 0);
  const totalKopecks = Math.round(totalRubles * 100);

  if (totalRubles <= 0) {
    throw new AppError('Сумма платежа должна быть больше 0', 400);
  }

  // Generate internal order ID
  const invId = Math.floor(100000 + Math.random() * 900000);

  // Create payment record (amount stored in kopecks)
  const paymentResult = await query(
    `INSERT INTO payments (user_id, robokassa_inv_id, amount_kopecks, description, metadata, status)
     VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
    [
      userId,
      invId,
      totalKopecks,
      `Регистрация на Tour de Russie (${validData.cart.length} поз.)`,
      JSON.stringify({ cart: validData.cart }),
    ]
  );

  const payment = paymentResult.rows[0];

  // Build custom params for Robokassa
  const customParams: Record<string, string> = {
    Shp_paymentId: payment.id,
    Shp_userId: userId,
  };

  // Generate Robokassa payment URL (OutSum in rubles)
  const paymentUrl = RobokassaService.generatePaymentUrl(
    invId,
    totalRubles,
    `Регистрация на Tour de Russie`,
    customParams
  );

  res.json({
    payment: {
      id: payment.id,
      invId: payment.robokassa_inv_id,
      amount: payment.amount_kopecks,
      status: payment.status,
    },
    paymentUrl,
  });
};

// Robokassa ResultURL callback (server-to-server notification)
export const robokassaResultUrl = async (req: Request, res: Response) => {
  const { OutSum, InvId, SignatureValue, ...otherParams } = req.body;

  if (!OutSum || !InvId || !SignatureValue) {
    return res.status(400).send('Missing required parameters');
  }

  // Extract custom params
  const customParams = RobokassaService.extractCustomParams(req.body);

  // Verify signature
  const isValid = RobokassaService.verifySignature(
    OutSum,
    InvId,
    SignatureValue,
    process.env.ROBOKASSA_PASSWORD_2 || '',
    customParams
  );

  if (!isValid) {
    console.error('Robokassa signature verification failed for InvId:', InvId);
    return res.status(400).send('Invalid signature');
  }

  // Find payment
  const paymentResult = await query(
    'SELECT * FROM payments WHERE robokassa_inv_id = $1',
    [parseInt(InvId)]
  );

  if (paymentResult.rows.length === 0) {
    console.error('Payment not found for InvId:', InvId);
    return res.status(404).send('Payment not found');
  }

  const payment = paymentResult.rows[0];

  // Idempotency: if already paid, just confirm
  if (payment.status === 'paid') {
    console.log(`Payment ${payment.id} (InvId: ${InvId}) already paid, confirming`);
    return res.send(`OK${InvId}`);
  }

  // Update payment status
  await query(
    `UPDATE payments
     SET status = 'paid',
         paid_at = NOW(),
         robokassa_payment_method = $1,
         robokassa_currency = $2,
         robokassa_fee_kopecks = $3,
         updated_at = NOW()
     WHERE id = $4`,
    [
      req.body.PaymentMethod || null,
      req.body.IncCurrLabel || null,
      req.body.Fee ? Math.round(parseFloat(req.body.Fee) * 100) : null,
      payment.id,
    ]
  );

  // Create event registrations from cart items
  const cart = payment.metadata?.cart || [];
  for (const item of cart) {
    try {
      // Map routeName to distance_km
      const routeToKm: Record<string, number> = {
        'Grand Tour': 114, 'Median Tour': 60, 'Intro Tour': 25,
      };
      const distanceKm = routeToKm[item.routeName];

      // Resolve event_id and distance_id
      const eventResult = await query(
        distanceKm
          ? `SELECT e.id as event_id, ed.id as distance_id
             FROM events e
             JOIN event_distances ed ON ed.event_id = e.id
             WHERE e.name ILIKE $1 AND ed.distance_km = $2
             LIMIT 1`
          : `SELECT e.id as event_id, ed.id as distance_id
             FROM events e
             JOIN event_distances ed ON ed.event_id = e.id
             WHERE e.name ILIKE $1 AND ed.name ILIKE $2
             LIMIT 1`,
        distanceKm ? [`%${item.city}%`, distanceKm] : [`%${item.city}%`, `%${item.routeName}%`]
      );
      if (eventResult.rows.length === 0) continue;
      const { event_id, distance_id } = eventResult.rows[0];

      // Get user profile and event date for category determination
      const profileResult = await query(
        `SELECT p.date_of_birth, p.gender, e.date as event_date, ed.distance_km
         FROM profiles p, events e, event_distances ed
         WHERE p.id = $1 AND e.id = $2 AND ed.id = $3`,
        [payment.user_id, event_id, distance_id]
      );

      let bib_number: number | null = null;
      let age_category: string | null = null;

      if (profileResult.rows.length > 0) {
        const { date_of_birth, gender, event_date, distance_km } = profileResult.rows[0];
        if (date_of_birth && gender) {
          const cat = determineCategory(distance_km, gender === 'male' ? 'male' : 'female', date_of_birth);
          age_category = cat;
          // Insert first, then auto-assign bib
          const regInsert = await query(
            `INSERT INTO event_registrations (user_id, event_id, distance_id, payment_status, age_category)
             VALUES ($1, $2, $3, 'paid', $4)
             ON CONFLICT (user_id, distance_id) DO UPDATE SET payment_status = 'paid', age_category = EXCLUDED.age_category
             RETURNING id`,
            [payment.user_id, event_id, distance_id, cat]
          );
          const regId = regInsert.rows[0]?.id;
          if (regId) {
            bib_number = await autoAssignBib(regId, event_id, cat);
          }
        }
      }

      if (bib_number === null && age_category === null) {
        // Fallback: insert without bib
        await query(
          `INSERT INTO event_registrations (user_id, event_id, distance_id, payment_status)
           VALUES ($1, $2, $3, 'paid')
           ON CONFLICT (user_id, distance_id) DO UPDATE SET payment_status = 'paid'`,
          [payment.user_id, event_id, distance_id]
        );
      }

      // Send confirmation email
      try {
        const userResult = await query(
          `SELECT u.email, p.first_name, p.last_name FROM users u
           LEFT JOIN profiles p ON p.id = u.id
           WHERE u.id = $1`,
          [payment.user_id]
        );
        const eventInfoResult = await query(
          `SELECT e.name, e.date, e.location, ed.name as distance_name
           FROM events e JOIN event_distances ed ON ed.id = $1
           WHERE e.id = $2`,
          [distance_id, event_id]
        );
        if (userResult.rows.length > 0 && eventInfoResult.rows.length > 0) {
          const u = userResult.rows[0];
          const ev = eventInfoResult.rows[0];
          const fullName = [u.last_name, u.first_name].filter(Boolean).join(' ') || u.email;
          const eventDate = ev.date ? new Date(ev.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
          const cityKey = (ev.location || '').toLowerCase().includes('суздал') ? 'suzdal'
            : (ev.location || '').toLowerCase().includes('игор') ? 'igora'
            : 'pushkin';
          await sendRegistrationConfirmation(u.email, {
            fullName,
            eventName: ev.name,
            eventDate,
            eventLocation: ev.location || item.city,
            distance: item.distance || ev.distance_name,
            bibNumber: bib_number ?? 0,
            city: cityKey,
          });
        }
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr);
      }
    } catch (err) {
      console.error('Failed to create registration for cart item:', item, err);
    }
  }

  console.log(`Payment ${payment.id} (InvId: ${InvId}) marked as paid. Amount: ${OutSum}`);

  // Robokassa expects "OK{InvId}" response
  res.send(`OK${InvId}`);
};

// Robokassa SuccessURL redirect (user-facing)
export const robokassaSuccessUrl = async (req: Request, res: Response) => {
  const { OutSum, InvId, SignatureValue } = req.query;

  if (!OutSum || !InvId || !SignatureValue) {
    return res.redirect(`${FRONTEND_URL}/dashboard/payments?status=error`);
  }

  const customParams = RobokassaService.extractCustomParams(req.query as Record<string, string>);

  const isValid = RobokassaService.verifySignature(
    OutSum as string,
    InvId as string,
    SignatureValue as string,
    process.env.ROBOKASSA_PASSWORD_1 || '',
    customParams
  );

  if (!isValid) {
    return res.redirect(`${FRONTEND_URL}/dashboard/payments?status=error`);
  }

  res.redirect(`${FRONTEND_URL}/dashboard/payments/success?invId=${InvId}`);
};

// Robokassa FailURL redirect
export const robokassaFailUrl = async (req: Request, res: Response) => {
  const { InvId } = req.query;
  if (InvId) {
    await query(
      `UPDATE payments SET status = 'failed', updated_at = NOW() WHERE robokassa_inv_id = $1 AND status = 'pending'`,
      [parseInt(InvId as string)]
    ).catch((err) => console.error('Failed to mark payment as failed:', err));
  }
  res.redirect(`${FRONTEND_URL}/dashboard/payments/failed?invId=${InvId || ''}`);
};

// Get user's payments
export const getUserPayments = async (req: AuthRequest, res: Response) => {
  const result = await query(
    'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
    [req.userId]
  );

  res.json({ payments: result.rows });
};

// Get payment by ID
export const getPaymentById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query(
    'SELECT * FROM payments WHERE id = $1 AND user_id = $2',
    [id, req.userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Платёж не найден', 404);
  }

  res.json({ payment: result.rows[0] });
};
