import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import { authenticate } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import eventsRoutes from './routes/events';
import registrationsRoutes from './routes/registrations';
import healthCertificatesRoutes from './routes/healthCertificates';
import corporateRoutes from './routes/corporate';
import corporateAccountsRoutes from './routes/corporateAccounts';
import adminRoutes from './routes/admin';
import cmsAuthRoutes from './routes/cmsAuth';
import cmsRoutes from './routes/cms';
import promoCodesRoutes from './routes/promoCodes';
import paymentsRoutes from './routes/payments';
import yandexAuthRoutes from './routes/yandexAuth';
import analyticsRoutes from './routes/analytics';
import contactRoutes from './routes/contact';
import mediaGalleryRoutes from './routes/mediaGallery';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://auth.robokassa.ru", "https://services.robokassa.ru"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://login.yandex.ru", "https://auth.robokassa.ru", "https://services.robokassa.ru"],
      frameSrc: ["'self'", "https://mapmagic.app", "https://www.wikiloc.com", "https://ridewithgps.com"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
    },
  },
}));
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3001',
  'http://localhost:8080',
  'http://localhost:8081',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use('/api', apiLimiter);

app.use('/uploads', authenticate, express.static(path.join(process.cwd(), 'uploads')));

// Swagger UI — только в dev
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { persistAuthorization: true },
  }));
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="swagger.json"');
    res.send(swaggerSpec);
  });
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/health-certificates', healthCertificatesRoutes);
app.use('/api/corporate', corporateRoutes);
app.use('/api/corporate-accounts', corporateAccountsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cms/auth', cmsAuthRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/promo-codes', promoCodesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/auth/yandex', yandexAuthRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/media-gallery', mediaGalleryRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
