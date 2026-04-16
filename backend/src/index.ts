import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
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

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', apiLimiter);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
