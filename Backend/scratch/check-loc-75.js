import prisma from '../src/lib/prisma.js';

async function check() {
    try {
        const count = await prisma.localisation.count({
            where: {
                code_departement: '75'
            }
        });
        console.log('Nombre de localisations pour le département 75 :', count);

        if (count > 0) {
            const samples = await prisma.localisation.findMany({
                where: {
                    code_departement: '75'
                },
                take: 10
            });
            console.log('Exemples de localisation pour le 75 :', samples);
        }
    } catch (e) {
        console.error('Erreur :', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
