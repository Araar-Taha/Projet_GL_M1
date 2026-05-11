import prisma from '../src/lib/prisma.js';

async function check() {
    try {
        const paris = await prisma.population.findFirst({ where: { code_postal: '75056' } });
        const lyon = await prisma.population.findFirst({ where: { code_postal: '69123' } });
        const marseille = await prisma.population.findFirst({ where: { code_postal: '13055' } });
        
        console.log('Paris (75056) found:', !!paris);
        console.log('Lyon (69123) found:', !!lyon);
        console.log('Marseille (13055) found:', !!marseille);

        const lyonTrans = await prisma.transaction.findFirst({ where: { code_postal: { startsWith: '6938' } } });
        const marseilleTrans = await prisma.transaction.findFirst({ where: { code_postal: { startsWith: '132' } } });
        
        console.log('Lyon transactions (6938x) found:', !!lyonTrans);
        console.log('Marseille transactions (132x) found:', !!marseilleTrans);

    } catch (e) {
        console.error('Erreur :', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
