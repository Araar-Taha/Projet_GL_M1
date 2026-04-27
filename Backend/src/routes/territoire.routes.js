import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// GET /api/territoires/departements
// Retourne la liste unique des départements (code et nom si possible)
router.get('/departements', async (req, res) => {
    try {
        // Liste unique des codes départements
        const deps = await prisma.localisation.findMany({
            distinct: ['code_departement'],
            select: {
                code_departement: true,
            },
            where: {
                code_departement: { not: null }
            },
            orderBy: {
                code_departement: 'asc'
            }
        });

        // On formate pour le front (on n'a pas forcément le nom dans cette table, on met le code)
        const formatted = deps.map(d => ({
            code: d.code_departement,
            nom: `Département ${d.code_departement}`
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching departements:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/territoires/departements/:code/communes
// Retourne les communes d'un département
router.get('/departements/:code/communes', async (req, res) => {
    const { code } = req.params;
    try {
        const communes = await prisma.localisation.findMany({
            where: {
                code_departement: code
            },
            distinct: ['code_commune'],
            select: {
                code_commune: true,
                nom_commune: true
            },
            orderBy: {
                nom_commune: 'asc'
            }
        });

        const formatted = communes.map(c => ({
            code: c.code_commune,
            nom: c.nom_commune
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching communes:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
