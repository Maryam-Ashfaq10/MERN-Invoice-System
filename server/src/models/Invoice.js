import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            required: true,
        },
        customerName: {
            type: String,
            required: true,
        },
        customerEmail: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        customerPhone: {
            type: String,
            required: true,
        },
        currency: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
       
        createdAt: {
            type: Date,
            default: null,
        },
        createdBy: {
            type: String,
            required: true,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: 0
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
