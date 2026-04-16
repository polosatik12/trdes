import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface CMSAuthRequest extends Request {
  cmsUserId?: string;
  cmsUserRole?: string;
}

export const cmsAuthenticate = (req: CMSAuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Требуется аутентификация' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      cmsUserId: string;
      cmsUserRole: string;
    };
    req.cmsUserId = decoded.cmsUserId;
    req.cmsUserRole = decoded.cmsUserRole;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Недействительный токен CMS' });
  }
};

export const cmsRequireRole = (...roles: string[]) => {
  return (req: CMSAuthRequest, res: Response, next: NextFunction) => {
    if (!req.cmsUserRole || !roles.includes(req.cmsUserRole)) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }
    next();
  };
};
