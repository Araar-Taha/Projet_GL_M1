import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { whereCodePostal } from '../lib/codePostal.js';
import { ANNEE_DEFAUT_DEBUT, ANNEE_DEFAUT_FIN } from '../lib/constants.js';

const router = express.Router();

router.get('/stats-by-dept', async (req, res) => {
    const { typeMutation, anneeDebut, anneeFin } = req.query;

    try {
        const where = {};
        if (typeMutation) where.type_transaction = { equals: typeMutation, mode: 'insensitive' };
        where.annee = {
            gte: parseInt(anneeDebut) || ANNEE_DEFAUT_DEBUT,
            lte: parseInt(anneeFin) || ANNEE_DEFAUT_FIN
        };

        const stats = await prisma.transaction.groupBy({
            by: ['code_postal'],
            where,
            _count: { identifiant: true },
            _sum: { valeur_fonciere: true }
        });

        // Agréger par département (2 premiers chiffres du code postal)
        const statsObject = stats.reduce((acc, curr) => {
            if (!curr.code_postal) return acc;
            // On nettoie le code postal de tout espace et on prend les 2 premiers caractères
            const cleanCP = curr.code_postal.trim();
            const deptCode = cleanCP.substring(0, 2);

            if (!acc[deptCode]) {
                acc[deptCode] = { count: 0, totalVal: 0 };
            }
            acc[deptCode].count += curr._count.identifiant;
            acc[deptCode].totalVal += Number(curr._sum.valeur_fonciere || 0);
            return acc;
        }, {});

        // Calculer la moyenne finale par département
        const finalStats = {};
        for (const dept in statsObject) {
            finalStats[dept] = {
                count: statsObject[dept].count,
                avgPrice: statsObject[dept].count > 0 ? Math.round(statsObject[dept].totalVal / statsObject[dept].count) : 0
            };
        }

        res.json(finalStats);
    } catch (error) {
        console.error('Stats by dept error:', error);
        res.status(500).json({ error: 'Erreur lors du calcul des stats par département' });
    }
});

// GET /api/mutations/stats-by-commune/:deptCode
// Retourne les stats groupées par code postal pour un département donné
router.get('/stats-by-commune/:deptCode', async (req, res) => {
    const { deptCode } = req.params;
    const { typeMutation, anneeDebut, anneeFin } = req.query;

    try {
        const where = {
            code_postal: { startsWith: deptCode }
        };

        if (typeMutation) where.type_transaction = { equals: typeMutation, mode: 'insensitive' };
        where.annee = {
            gte: parseInt(anneeDebut) || ANNEE_DEFAUT_DEBUT,
            lte: parseInt(anneeFin) || ANNEE_DEFAUT_FIN
        };

        const stats = await prisma.transaction.groupBy({
            by: ['code_postal'],
            where,
            _count: { identifiant: true },
            _sum: { valeur_fonciere: true }
        });

        // Formater pour le frontend : { "50000": { count, avgPrice }, ... }
        const formatted = {};
        stats.forEach(s => {
            if (!s.code_postal) return;
            formatted[s.code_postal] = {
                count: s._count.identifiant,
                avgPrice: s._count.identifiant > 0 ? Math.round(Number(s._sum.valeur_fonciere || 0) / s._count.identifiant) : 0
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error('Stats by commune error:', error);
        res.status(500).json({ error: 'Erreur lors du calcul des stats par commune' });
    }
});

// GET /api/mutations
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
            where.type_transaction = { equals: typeMutation, mode: 'insensitive' };
        }

        if (anneeDebut || anneeFin) {
            where.annee = {
                gte: parseInt(anneeDebut) || ANNEE_DEFAUT_DEBUT,
                lte: parseInt(anneeFin) || ANNEE_DEFAUT_FIN
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
    const { typeMutation, anneeDebut, anneeFin } = req.query;

    try {
        const where = whereCodePostal(code);

        if (typeMutation) {
            where.type_transaction = { equals: typeMutation, mode: 'insensitive' };
        }

        where.annee = {
            gte: parseInt(anneeDebut) || ANNEE_DEFAUT_DEBUT,
            lte: parseInt(anneeFin) || ANNEE_DEFAUT_FIN
        };

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
    const { typeMutation } = req.query;
    try {
        const where = whereCodePostal(code);

        if (typeMutation) {
            where.type_transaction = { equals: typeMutation, mode: 'insensitive' };
        }

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

// POST /api/mutations
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

export default router;
