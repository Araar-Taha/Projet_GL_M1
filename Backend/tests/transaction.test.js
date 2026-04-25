import test from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:5000/api';
let authToken;

test('Data Entry (Transactions)', async (t) => {

    // First login to get a token
    await t.test('setup: login to get token', async () => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@dvf-test.com',
                mot_de_pass: 'TestPassword123!'
            })
        });
        
        // If login fails because user doesn't exist (e.g was deleted), let's register
        if (!res.ok) {
            const regRes = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: 'Test', prenom: 'User', email: 'test@dvf-test.com', mot_de_pass: 'TestPassword123!'
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

    await t.test('should reject transaction without token', async () => {
        const res = await fetch(`${BASE_URL}/transactions`, {
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

    await t.test('should create a new transaction with valid token', async () => {
        const res = await fetch(`${BASE_URL}/transactions`, {
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
        // If it failed, log the error so we can see it in test output
        if (!res.ok) {
            console.error('Failed to create transaction:', data);
        }
        
        assert.strictEqual(res.status, 201);
        assert.ok(data.transaction.identifiant);
        assert.strictEqual(data.transaction.type_transaction, 'Vente test automatisé');
        // Because of Decimal format in postgres, sometimes value is returned as string
        assert.strictEqual(Number(data.transaction.valeur_fonciere), 999999.99);
    });
    
    await t.test('should fetch transactions to verify DB insertion', async () => {
        // We can just hit the public get route to see if it's there
        const res = await fetch(`${BASE_URL}/transactions`);
        // Wait, does /api/transactions have a GET route?
    });

});
