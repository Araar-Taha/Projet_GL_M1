import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// GET /api/classement?scale=communes|departements&metrique=prix|population|mutations
router.get('/', async (req, res) => {
    const { scale = 'communes', metrique = 'prix' } = req.query;
    const limit = 10;

    try {
        // Agrégation des transactions par code_postal
        const transactions = await prisma.transaction.groupBy({
            by: ['code_postal'],
            _avg: { valeur_fonciere: true },
            _sum: { nombre_mutation: true }
        });

        const populations = await prisma.population.groupBy({
            by: ['code_postal'],
            _sum: { population_totale: true }
        });

        // On combine les données par code_postal
        const popMap = new Map();
        for (const p of populations) {
            popMap.set(p.code_postal, Number(p._sum.population_totale || 0));
        }

        let lignes = transactions.map(t => ({
            code_postal: t.code_postal,
            prixMoyen: Math.round(t._avg.valeur_fonciere || 0),
            mutations: t._sum.nombre_mutation || 0,
            population: popMap.get(t.code_postal) || 0
        }));

        // Si on est en mode départements, on regroupe par les 2 premiers chiffres
        if (scale === 'departements') {
            const parDept = new Map();
            for (const l of lignes) {
                const dept = l.code_postal?.substring(0, 2);
                if (!dept) continue;
                if (!parDept.has(dept)) {
                    parDept.set(dept, { code: dept, totalPrix: 0, n: 0, mutations: 0, population: 0 });
                }
                const acc = parDept.get(dept);
                acc.totalPrix += l.prixMoyen;
                acc.n += 1;
                acc.mutations += l.mutations;
                acc.population += l.population;
            }

            const departements = await prisma.departement.findMany();
            const nomDept = new Map(departements.map(d => [d.code, d.nom]));

            lignes = Array.from(parDept.values()).map(d => ({
                code: d.code,
                nom: nomDept.get(d.code) || d.code,
                prix: Math.round(d.totalPrix / (d.n || 1)),
                mutations: d.mutations,
                population: d.population
            }));
        } else {
            // Mode communes : on récupère le nom via localisation
            const codes = lignes.map(l => l.code_postal).filter(Boolean);
            const locs = await prisma.localisation.findMany({
                where: { code_postal: { in: codes } },
                select: { code_postal: true, nom_commune: true }
            });
            const nomCommune = new Map();
            for (const loc of locs) {
                if (loc.code_postal && !nomCommune.has(loc.code_postal)) {
                    nomCommune.set(loc.code_postal, loc.nom_commune || loc.code_postal);
                }
            }

            lignes = lignes.map(l => ({
                code: l.code_postal,
                nom: nomCommune.get(l.code_postal) || l.code_postal,
                prix: l.prixMoyen,
                mutations: l.mutations,
                population: l.population
            }));
        }

        // Tri selon la métrique demandée
        const cle = metrique === 'population' ? 'population' : metrique === 'mutations' ? 'mutations' : 'prix';
        lignes.sort((a, b) => b[cle] - a[cle]);

        res.json(lignes.slice(0, limit));
    } catch (error) {
        console.error('Classement error:', error);
        res.status(500).json({ error: 'Erreur lors du calcul du classement' });
    }
});

export default router;
