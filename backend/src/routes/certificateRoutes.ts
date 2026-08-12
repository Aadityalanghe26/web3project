import { Router } from 'express';
import {
  getCertificates,
  getCertificateById,
  getCertificatesByStudent,
} from '../controllers/certificateController';

const router = Router();

router.get('/certificates', getCertificates);
router.get('/certificates/:id', getCertificateById);
router.get('/certificates/student/:address', getCertificatesByStudent);

export default router;
