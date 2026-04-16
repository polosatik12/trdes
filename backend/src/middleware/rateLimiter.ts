import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Слишком много запросов с этого IP, попробуйте позже',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Слишком много попыток входа, попробуйте через 15 минут',
  skipSuccessfulRequests: true,
});

export const emailLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  message: 'Слишком много запросов на отправку кода, попробуйте через минуту',
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Слишком много загрузок файлов, попробуйте позже',
});
