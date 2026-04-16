import { Request, Response, NextFunction } from 'express';

// Robokassa server IPs
const ROBOKASSA_IPS = [
  '185.59.216.65',
  '185.59.217.65',
];

export const robokassaIpWhitelist = (req: Request, res: Response, next: NextFunction) => {
  // Skip IP check in development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const clientIp = req.ip || req.socket.remoteAddress || '';
  // Handle IPv6-mapped IPv4 addresses
  const cleanIp = clientIp.replace('::ffff:', '');

  if (!ROBOKASSA_IPS.includes(cleanIp)) {
    console.warn(`Robokassa callback from unauthorized IP: ${cleanIp}`);
    return res.status(403).send('Forbidden');
  }

  next();
};
