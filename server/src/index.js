import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './database/database.js';
import authRoutes from './routes/authRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
const app = express();

dotenv.config();
const PORT = process.env.PORT || 5000;

(async () => {
    await connectDatabase();
})();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/invoice', invoiceRoutes);

app.get('/status',(req,res) => {
    res.send(`Server is running on port ${PORT}`);
    console.log(`Server is running on port ${PORT}`);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});