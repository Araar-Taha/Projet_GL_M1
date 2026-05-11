import prisma from '../src/lib/prisma.js';

async function check() {
    try {
        const count = await prisma.transaction.count({
            where: {
                code_postal: {
                    startsWith: '75'
                }
            }
        });
        console.log('Nombre de transactions pour le département 75 (Paris) :', count);

        if (count > 0) {
            const sample = await prisma.transaction.findFirst({
                where: {
                    code_postal: {
                        startsWith: '75'
                    }
                }
            });
            console.log('Exemple de donnée :', sample);
        } else {
            // Check if there are any records with 75 in code_postal but maybe with spaces or something
            const rawCheck = await prisma.transaction.findFirst({
                where: {
                    code_postal: {
                        contains: '75'
                    }
                }
            });
            console.log('Recherche "contains 75" :', rawCheck);
        }
    } catch (e) {
        console.error('Erreur :', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
