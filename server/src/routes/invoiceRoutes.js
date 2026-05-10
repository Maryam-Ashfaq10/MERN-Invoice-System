import express from 'express';
import invoiceController from '../controllers/invoiceController.js';
import requireAuth from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', requireAuth, invoiceController.createInvoice);

router.get('/get-all/:userId', requireAuth, invoiceController.getInvoicesByUserId);

router.get('/number/:invoiceNumber', requireAuth, invoiceController.getInvoiceByNumber);

router.delete('/soft-delete/:invoiceNumber', requireAuth, invoiceController.softDeleteInvoice);

export default router;