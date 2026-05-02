import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    currency: { type: String, required: true, trim: true },
    status: { type: String, required: true, enum: ['draft', 'sent', 'paid', 'overdue'] },
    createdBy: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;