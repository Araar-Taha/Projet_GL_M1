import test from 'node:test';
import assert from 'node:assert';
import app from '../index.js';

import prisma from '../src/lib/prisma.js';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5001/api';
let authToken;

test('Saisie de données (Transactions)', async (t) => {

    // Nettoyage avant de démarrer
    await t.test('nettoyage : supprimer l\'utilisateur de test s\'il existe', async () => {
        try {
            await prisma.utilisateur.delete({ where: { email: 'test-tx@dvf-test.com' } });
        } catch (e) {}
    });

    // Première connexion pour obtenir un jeton
    await t.test('configuration : connexion pour obtenir le jeton', async () => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test-tx@dvf-test.com',
                mot_de_pass: 'TestPassword123!'
            })
        });
        
        // Si la connexion échoue car l'utilisateur n'existe pas (ex. supprimé), on l'enregistre
        if (!res.ok) {
            const regRes = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: 'Test', prenom: 'Utilisateur', email: 'test-tx@dvf-test.com', mot_de_pass: 'TestPassword123!'
                })
            });
            const regData = await regRes.json();
            assert.strictEqual(regRes.status, 201);
            authToken = regData.token;
        } else {
            const data = await res.json();
            assert.strictEqual(res.status, 200);
            authToken = data.token;
        }
    });

    await t.test('devrait rejeter une transaction sans jeton', async () => {
        const res = await fetch(`${BASE_URL}/mutations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type_transaction: 'Vente',
                valeur_fonciere: 150000,
                nombre_mutation: 1,
                annee: 2024,
                code_postal: '75001'
            })
        });
        assert.strictEqual(res.status, 401);
    });

    await t.test('devrait créer une nouvelle transaction avec un jeton valide', async () => {
        const res = await fetch(`${BASE_URL}/mutations`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                type_transaction: 'Vente test automatisé',
                valeur_fonciere: 999999.99,
                nombre_mutation: 2,
                annee: 2023,
                code_postal: '12345'
            })
        });
        
        const data = await res.json();
        // Si cela a échoué, on logue l'erreur pour la voir dans la sortie du test
        if (!res.ok) {
            console.error('Échec de la création de la transaction :', data);
        }
        
        assert.strictEqual(res.status, 201);
        assert.ok(data.transaction.identifiant);
        assert.strictEqual(data.transaction.type_transaction, 'Vente test automatisé');
        // Le format Decimal de PostgreSQL retourne parfois une chaîne
        assert.strictEqual(Number(data.transaction.valeur_fonciere), 999999.99);
    });

    await t.test('doit pouvoir lister les mutations pour vérifier l\'insertion', async () => {
        const res = await fetch(`${BASE_URL}/mutations?commune=12345`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.ok(Array.isArray(data), 'Devrait retourner un tableau de mutations');
        const found = data.find(m => m.type_transaction === 'Vente test automatisé');
        assert.ok(found, 'La mutation ajoutée devrait être présente dans la liste');
    });

    t.after(async () => {
        await prisma.$disconnect();
        if (app.server) {
            app.server.close();
        }
    });

});
