import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createCorporateAccount,
  getCorporateAccount,
  updateCorporateAccount,
  addCorporateMember,
  getCorporateMembers,
  updateCorporateMember,
  deleteCorporateMember,
  getCorporateMemberById,
} from '../controllers/corporateAccountsController';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// CRUD для корпоративного аккаунта
router.post('/', createCorporateAccount);
router.get('/', getCorporateAccount);
router.put('/', updateCorporateAccount);

// CRUD для участников корпоративного аккаунта
router.post('/members', addCorporateMember);
router.get('/members', getCorporateMembers);
router.get('/members/:id', getCorporateMemberById);
router.put('/members/:id', updateCorporateMember);
router.delete('/members/:id', deleteCorporateMember);

export default router;
