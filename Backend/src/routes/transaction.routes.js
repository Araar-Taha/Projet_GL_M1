import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/mutations (ou /api/transactions)
// Supporte les filtres : departement, commune, anneeDebut, anneeFin, typeMutation
router.get('/', async (req, res) => {
    try {
        const { departement, commune, typeMutation, anneeDebut, anneeFin } = req.query;
        
        const where = {};
        
        if (commune) {
            where.code_postal = commune;
        } else if (departement) {
            where.code_postal = { startsWith: departement };
        }

        if (typeMutation) {
            where.type_transaction = typeMutation;
        }

        if (anneeDebut || anneeFin) {
            where.annee = {
                gte: parseInt(anneeDebut) || 2014,
                lte: parseInt(anneeFin) || 2024
            };
        }

        const transactions = await prisma.transaction.findMany({
            where,
            take: 200,
            orderBy: { annee: 'desc' }
        });
        
        res.json(transactions);
    } catch (error) {
        console.error('Fetch transactions error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des transactions' });
    }
});

// GET /api/mutations/stats/:code
router.get('/stats/:code', async (req, res) => {
    const { code } = req.params;
    try {
        const where = code.length <= 3 
            ? { code_postal: { startsWith: code } }
            : { code_postal: code };

        const stats = await prisma.transaction.aggregate({
            where,
            _avg: { valeur_fonciere: true },
            _sum: { nombre_mutation: true },
            _count: { identifiant: true }
        });

        res.json({
            prixMoyen: Math.round(stats._avg.valeur_fonciere || 0),
            totalVentes: stats._sum.nombre_mutation || 0,
            nombreTransactions: stats._count.identifiant
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Erreur stats' });
    }
});

// GET /api/mutations/prix-evolution/:code
router.get('/prix-evolution/:code', async (req, res) => {
    const { code } = req.params;
    try {
        const where = code.length <= 3 
            ? { code_postal: { startsWith: code } }
            : { code_postal: code };

        const data = await prisma.transaction.groupBy({
            by: ['annee'],
            where,
            _avg: { valeur_fonciere: true },
            orderBy: { annee: 'asc' }
        });

        const formatted = data.map(item => ({
            annee: item.annee,
            prixMoyen: Math.round(item._avg.valeur_fonciere || 0)
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Evolution error:', error);
        res.status(500).json({ error: 'Erreur evolution' });
    }
});

// POST /api/transactions
// @access Private
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { type_transaction, valeur_fonciere, nombre_mutation, annee, code_postal } = req.body;
        if (!type_transaction || valeur_fonciere === undefined || nombre_mutation === undefined || !annee || !code_postal) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

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

// GET /api/transactions/stats-by-dept
// Retourne le nombre de transactions par département (basé sur les 2 premiers chiffres du code_postal)
router.get('/stats-by-dept', async (req, res) => {
    try {
        // On effectue une requête brute car Prisma ne supporte pas nativement les GROUP BY sur substring
        const stats = await prisma.$queryRaw`
            SELECT LEFT(code_postal, 2) as code, COUNT(*)::int as count
            FROM transaction
            GROUP BY LEFT(code_postal, 2)
        `;
        
        // Transformer le tableau en objet { "75": 120, "13": 80, ... }
        const statsObject = stats.reduce((acc, curr) => {
            acc[curr.code] = curr.count;
            return acc;
        }, {});

        res.json(statsObject);
    } catch (error) {
        console.error('Stats by dept error:', error);
        res.status(500).json({ error: 'Erreur lors du calcul des stats par département' });
    }
});


export default router;
