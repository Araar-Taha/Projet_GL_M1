import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// GET /api/territoires/departements
// Récupère la liste des départements depuis la nouvelle table 'departement'
router.get('/departements', async (req, res) => {
    try {
        const deps = await prisma.departement.findMany({
            orderBy: { code: 'asc' }
        });

        const formatted = deps.map(d => ({
            code: d.code,
            nom: `${d.code} - ${d.nom}`
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
                nom_commune: true,
                code_postal: true
            },
            orderBy: {
                nom_commune: 'asc'
            }
        });

        const formatted = communes.map(c => ({
            code: c.code_commune,
            nom: c.nom_commune,
            cp: c.code_postal
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching communes:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/territoires/departements/:code/commune-mapping
// Retourne la correspondance Code INSEE -> Code Postal pour les communes d'un département
router.get('/departements/:code/commune-mapping', async (req, res) => {
    const { code } = req.params;
    try {
        const mapping = await prisma.localisation.findMany({
            where: {
                code_departement: code
            },
            select: {
                code_commune: true,
                code_postal: true
            }
        });

        // Transformer en objet : { "code_insee": "code_postal" }
        const result = {};
        mapping.forEach(m => {
            if (m.code_commune && m.code_postal) {
                result[m.code_commune] = m.code_postal;
            }
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching mapping:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
