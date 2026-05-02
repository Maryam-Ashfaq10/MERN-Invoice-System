import express from 'express';
import { createInvoice } from '../controllers/invoiceController.js';

const router = express.Router();

router.post('/create', createInvoice);

export default router;