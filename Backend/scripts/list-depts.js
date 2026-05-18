import prisma from '../src/lib/prisma.js';

async function list() {
    try {
        const stats = await prisma.$queryRaw`
            SELECT DISTINCT LEFT(code_postal, 2) as code 
            FROM transaction 
            ORDER BY code ASC
        `;
        const codes = stats.map(r => r.code);
        console.log('Liste des départements avec des ventes (', codes.length, ') :');
        console.log(codes.join(', '));
        
        const check08 = codes.includes('08');
        const check02 = codes.includes('02');
        console.log('\nVérification spécifique :');
        console.log('Département 02 présent ?', check02 ? 'OUI' : 'NON');
        console.log('Département 08 présent ?', check08 ? 'OUI' : 'NON');

    } catch (e) {
        console.error(e);
    }
}

list();
