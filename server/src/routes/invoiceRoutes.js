import express from 'express';
import { createInvoice } from '../controllers/invoiceController.js';

const router = express.Router();

router.post('/create', createInvoice);

router.get('/get-all', getAllInvoices);


export default router;