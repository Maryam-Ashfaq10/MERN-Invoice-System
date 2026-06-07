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

export const getInvoiceStatsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const statusCounts = await Invoice.aggregate([
            { $match: { createdBy: userId, isDeleted: false } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        const counts = { draft: 0, sent: 0, paid: 0, overdue: 0 };
        let total = 0;

        for (const item of statusCounts) {
            if (item._id in counts) {
                counts[item._id] = item.count;
            }
            total += item.count;
        }

        return res.status(200).json({
            message: 'Invoice stats fetched successfully',
            data: {
                total,
                draft: counts.draft,
                sent: counts.sent,
                paid: counts.paid,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch invoice stats',
            error: error.message,
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

export const getInvoiceByNumber = async (req, res) => {
    try {
        const { invoiceNumber } = req.params;
        const includeDeleted = String(req.query.includeDeleted || 'false') === 'true';

        if (!invoiceNumber) {
            return res.status(400).json({ message: 'invoiceNumber is required' });
        }

        const filter = includeDeleted
            ? { invoiceNumber }
            : { invoiceNumber, isDeleted: false };

        const invoice = await Invoice.findOne(filter);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        return res.status(200).json({
            message: 'Invoice fetched successfully',
            data: invoice
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch invoice',
            error: error.message
        });
    }
};

export const softDeleteInvoice = async (req, res) => {
    try {
        const { invoiceNumber } = req.params;
        const { userId } = req.body; // optional: only owner can delete

        if (!invoiceNumber) {
            return res.status(400).json({ message: 'invoiceNumber is required' });
        }

        const filter = { invoiceNumber, isDeleted: false };

        // Optional: restrict to the user who created the invoice
        if (userId) {
            filter.createdBy = userId;
        }

        const invoice = await Invoice.findOneAndUpdate(
            filter,
            { isDeleted: true },
            { new: true }
        );

        if (!invoice) {
            return res.status(404).json({
                message: 'Invoice not found, already deleted, or not allowed'
            });
        }

        return res.status(200).json({
            message: 'Invoice soft deleted successfully',
            data: invoice
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to soft delete invoice',
            error: error.message
        });
    }
};

export const updateInvoice = async (req, res) => {
    try {
        const { invoiceNumber } = req.params;
        const { userId, ...updates } = req.body;

        if (!invoiceNumber) {
            return res.status(400).json({ message: 'invoiceNumber is required' });
        }

        // Only allow updating these fields
        const allowedFields = [
            'customerName',
            'customerEmail',
            'customerPhone',
            'status',
            'dueDate',
        ];

        const sanitized = {};
        for (const key of allowedFields) {
            if (updates[key] !== undefined) {
                sanitized[key] = updates[key];
            }
        }

        if (Object.keys(sanitized).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        // Validate status enum
        if (sanitized.status && !['draft', 'sent', 'paid', 'overdue'].includes(sanitized.status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const filter = { invoiceNumber, isDeleted: false };
        if (userId) filter.createdBy = userId;

        const invoice = await Invoice.findOneAndUpdate(filter, sanitized, {
            new: true,
            runValidators: true,
        });

        if (!invoice) {
            return res.status(404).json({
                message: 'Invoice not found, deleted, or not allowed',
            });
        }

        return res.status(200).json({
            message: 'Invoice updated successfully',
            data: invoice,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update invoice',
            error: error.message,
        });
    }
};

export default {
    createInvoice,
    getInvoiceStatsByUserId,
    getInvoicesByUserId,
    getInvoiceByNumber,
    softDeleteInvoice,
    updateInvoice
};