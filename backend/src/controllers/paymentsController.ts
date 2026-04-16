import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { RobokassaService } from '../services/robokassa';

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

  // Calculate total
  const totalKopecks = validData.cart.reduce((sum, item) => sum + item.price, 0);

  if (totalKopecks <= 0) {
    throw new AppError('Сумма платежа должна быть больше 0', 400);
  }

  // Generate internal order ID
  const invId = Math.floor(100000 + Math.random() * 900000);

  // Create payment record
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
    Shp_userId: userId,
    Shp_paymentId: payment.id,
  };

  // Generate Robokassa payment URL
  const paymentUrl = RobokassaService.generatePaymentUrl(
    invId,
    totalKopecks,
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

  // TODO: Here you can add logic to:
  // - Create event registrations from cart items
  // - Send confirmation email
  // - Update user profile

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
