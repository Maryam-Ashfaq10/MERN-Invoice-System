import Invoice from '../models/Invoice.js';


const generateInvoiceNumber = async () => {
    const year = new Date().getFullYear();
    // Find latest invoice for this year (format: INV-2026-0001)
    const latestInvoice = await Invoice.findOne({
        invoiceNumber: new RegExp(`^INV-${year}-`)
    })
        .sort({ createdAt: -1 })
        .select('invoiceNumber');
    let nextSeq = 1;
    if (latestInvoice?.invoiceNumber) {
        const parts = latestInvoice.invoiceNumber.split('-'); // ["INV","2026","0007"]
        const lastSeq = parseInt(parts[2], 10);
        nextSeq = Number.isNaN(lastSeq) ? 1 : lastSeq + 1;
    }
    return `INV-${year}-${String(nextSeq).padStart(4, '0')}`;
};

export const createInvoice = async (req, res) => {
    try {
        const {

            customerName,
            customerEmail,
            customerPhone,
            currency,
            status,
            createdBy,
            dueDate,
            totalAmount
        } = req.body;

        if (

            !customerName ||
            !customerEmail ||
            !customerPhone ||
            !currency ||
            !status ||
            !createdBy ||
            !dueDate ||
            totalAmount === undefined
        ) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        const invoiceNumber = await generateInvoiceNumber();


        const existingInvoice = await Invoice.findOne({ invoiceNumber });
        if (existingInvoice) {
            return res.status(409).json({ message: 'Invoice number already exists' });
        }

        const invoice = await Invoice.create({
            invoiceNumber,
            customerName,
            customerEmail,
            customerPhone,
            currency,
            status,
            createdBy,
            dueDate,
            totalAmount
        });

        return res.status(201).json({
            message: 'Invoice created successfully',
            data: invoice
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to create invoice',
            error: error.message
        });
    }
};

export const getInvoicesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const includeDeleted = String(req.query.includeDeleted || 'false') === 'true';

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const filter = includeDeleted
            ? { createdBy: userId }
            : { createdBy: userId, isDeleted: false };

        const invoices = await Invoice.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'User invoices fetched successfully',
            count: invoices.length,
            data: invoices
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch user invoices',
            error: error.message
        });
    }
};