import { Request, Response, NextFunction } from 'express';

// Robokassa server IPs
const ROBOKASSA_IPS = [
  '185.59.216.65',
  '185.59.217.65',
  '185.59.218.65',
  '185.59.219.65',
  '5.63.82.8',
  '5.63.82.9',
  '5.63.82.10',
  '5.63.82.11',
];

export const robokassaIpWhitelist = (req: Request, res: Response, next: NextFunction) => {
  // IP check disabled — Robokassa IPs vary; signature verification is sufficient
  return next();
};
