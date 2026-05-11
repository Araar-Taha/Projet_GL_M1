import prisma from '../src/lib/prisma.js';

async function check() {
    try {
        const stats = await prisma.transaction.groupBy({
            by: ['annee'],
            where: {
                code_postal: {
                    startsWith: '75'
                }
            },
            _count: true
        });
        console.log('Stats par année pour Paris (75) :', stats);
    } catch (e) {
        console.error('Erreur :', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
