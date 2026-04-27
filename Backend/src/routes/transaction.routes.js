import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   POST /api/transactions
// @desc    Add a new real estate transaction
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { type_transaction, valeur_fonciere, nombre_mutation, annee, code_postal } = req.body;

        // Basic validation
        if (!type_transaction || valeur_fonciere === undefined || nombre_mutation === undefined || !annee || !code_postal) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        // Insert into database
        const newTransaction = await prisma.transaction.create({
            data: {
                type_transaction,
                valeur_fonciere: parseFloat(valeur_fonciere),
                nombre_mutation: parseInt(nombre_mutation, 10),
                annee: parseInt(annee, 10),
                code_postal: code_postal.toString()
            }
        });

        res.status(201).json({ message: 'Donnée foncière ajoutée avec succès', transaction: newTransaction });

    } catch (error) {
        console.error('Add transaction error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout de la donnée foncière' });
    }
});

// @route   GET /api/transactions
// @desc    Get all real estate transactions (limit 100 for performance)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            take: 100,
            orderBy: { identifiant: 'desc' }, // Get newest first
        });
        res.json(transactions);
    } catch (error) {
        console.error('Fetch transactions error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des transactions' });
    }
});

export default router;
