import express from 'express';
import invoiceController from '../controllers/invoiceController.js';

const router = express.Router();

router.post('/create', invoiceController.createInvoice);

router.get('/get-all/:userId', invoiceController.getInvoicesByUserId);

router.get('/number/:invoiceNumber', invoiceController.getInvoiceByNumber);

router.delete('/soft-delete/:invoiceNumber', invoiceController.softDeleteInvoice);

export default router;