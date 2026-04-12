import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import prisma from './src/lib/prisma.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('DVF en live - Prisma connecté');
});

app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            take: 10
        });
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des transactions' });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('error serveur');
});

app.listen(PORT, () => {
    console.log(`Server roule sur http://localhost:${PORT}`);
});
