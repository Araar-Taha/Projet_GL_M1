import prisma from '../src/lib/prisma.js';

async function check() {
    try {
        const count = await prisma.transaction.count();
        console.log('Nombre total de transactions :', count);

        if (count > 0) {
            const sample = await prisma.transaction.findFirst();
            console.log('Exemple de donnée :', sample);
        } else {
            console.log('ATTENTION : La table transaction est VIDE.');
        }
    } catch (e) {
        console.error('Erreur lors du check :', e);
    }
}

check();
