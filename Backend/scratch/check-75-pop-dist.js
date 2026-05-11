import prisma from '../src/lib/prisma.js';

async function check() {
    try {
        const stats = await prisma.population.groupBy({
            by: ['code_postal'],
            where: {
                code_postal: {
                    startsWith: '75'
                }
            },
            _sum: { population_totale: true }
        });
        console.log('Répartition population pour Paris (75) :', stats);
    } catch (e) {
        console.error('Erreur :', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
