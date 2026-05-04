import express from 'express';
import prisma from '../lib/prisma.js';
import { whereCodePostal } from '../lib/codePostal.js';

const router = express.Router();

// GET /api/population/evolution/:code
router.get('/evolution/:code', async (req, res) => {
    const { code } = req.params;
    try {
        const where = whereCodePostal(code);

        const data = await prisma.population.findMany({
            where,
            orderBy: { annee: 'asc' },
            select: {
                annee: true,
                population_totale: true
            }
        });

        // Aggrégation par année si c'est un département
        const evolution = data.reduce((acc, curr) => {
            const index = acc.findIndex(item => item.annee === curr.annee);
            if (index > -1) {
                acc[index].population += Number(curr.population_totale || 0);
            } else {
                acc.push({ annee: curr.annee, population: Number(curr.population_totale || 0) });
            }
            return acc;
        }, []);

        res.json(evolution);
    } catch (error) {
        console.error('Error fetching population evolution:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/population/ages/:code
router.get('/ages/:code', async (req, res) => {
    const { code } = req.params;
    try {
        const where = whereCodePostal(code);

        // On prend les données les plus récentes
        const records = await prisma.population.findMany({
            where,
            orderBy: { annee: 'desc' }
        });

        if (records.length === 0) return res.json([]);

        // Somme des tranches d'âges
        const stats = records.reduce((acc, curr) => {
            acc.homme += Number(curr.nombre_homme || 0);
            acc.femme += Number(curr.nombre_femme || 0);
            acc.enfant += Number(curr.nombre_enfant || 0);
            acc.jeune += Number(curr.nombre_jeune_adulte || 0);
            acc.senior += Number(curr.nombre_senior_retraite || 0);
            acc.total += Number(curr.population_totale || 0);
            return acc;
        }, { homme: 0, femme: 0, enfant: 0, jeune: 0, senior: 0, total: 0 });

        const total = stats.total || 1;
        const result = [
            { label: 'Hommes', value: Math.round((stats.homme / total) * 100) },
            { label: 'Femmes', value: Math.round((stats.femme / total) * 100) },
            { label: 'Enfants', value: Math.round((stats.enfant / total) * 100) },
            { label: 'Jeunes', value: Math.round((stats.jeune / total) * 100) },
            { label: 'Seniors', value: Math.round((stats.senior / total) * 100) }
        ];

        res.json(result);
    } catch (error) {
        console.error('Error fetching population ages:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/population/stats-by-dept
router.get('/stats-by-dept', async (req, res) => {
    try {
        // On trouve l'année la plus récente disponible
        const latest = await prisma.population.aggregate({
            _max: { annee: true }
        });
        const maxAnnee = latest._max.annee || 2024;

        const data = await prisma.population.findMany({
            where: { annee: maxAnnee },
            select: {
                code_postal: true,
                population_totale: true
            }
        });

        const stats = {};
        data.forEach(curr => {
            if (!curr.code_postal) return;
            const dept = curr.code_postal.substring(0, 2);
            stats[dept] = (stats[dept] || 0) + Number(curr.population_totale || 0);
        });

        res.json(stats);
    } catch (error) {
        console.error('Error fetching population stats by dept:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/population/stats-by-commune/:deptCode
router.get('/stats-by-commune/:deptCode', async (req, res) => {
    const { deptCode } = req.params;
    try {
        const latest = await prisma.population.aggregate({
            _max: { annee: true }
        });
        const maxAnnee = latest._max.annee || 2024;

        const where = {
            ...whereCodePostal(deptCode),
            annee: maxAnnee
        };

        const data = await prisma.population.findMany({
            where,
            select: {
                code_postal: true,
                population_totale: true
            }
        });

        const stats = {};
        data.forEach(curr => {
            if (curr.code_postal) {
                stats[curr.code_postal] = Number(curr.population_totale || 0);
            }
        });

        res.json(stats);
    } catch (error) {
        console.error('Error fetching population stats by commune:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
