import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import prisma from './src/lib/prisma.js';
import authRoutes from './src/routes/auth.routes.js';
import transactionRoutes from './src/routes/transaction.routes.js';
import graphRoutes from './src/lib/routes/graphRoutes.js'; 

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/graphs', graphRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
    res.send('DVF en live - Prisma connecté');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('error serveur');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur sur port ${PORT}`);
});
export default app;