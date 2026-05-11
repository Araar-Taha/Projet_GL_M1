import prisma from '../src/lib/prisma.js';

async function check() {
    try {
        const stats = await prisma.transaction.aggregate({
            where: {
                code_postal: {
                    startsWith: '75'
                }
            },
            _avg: { valeur_fonciere: true },
            _count: true
        });
        console.log('Stats globales pour Paris (75) :', stats);
    } catch (e) {
        console.error('Erreur :', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
