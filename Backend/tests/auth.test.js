import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../index.js';

const BASE_URL = (process.env.TEST_BASE_URL || 'http://localhost:5001/api') + '/auth';

const TEST_EMAIL = 'test@dvf-test.com';
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NOM = 'TestNom';
const TEST_PRENOM = 'TestPrenom';

let authToken = null;

async function request(method, path, body = null, token = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    if (body) {
        options.body = JSON.stringify(body);
    }
    const res = await fetch(`${BASE_URL}${path}`, options);
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
}


describe('Inscription', () => {
    it('devrait inscrire un nouvel utilisateur', async () => {
        const { status, data } = await request('POST', '/register', {
            nom: TEST_NOM,
            prenom: TEST_PRENOM,
            email: TEST_EMAIL,
            mot_de_pass: TEST_PASSWORD,
        });
        assert.equal(status, 201);
        assert.ok(data.token);
        assert.equal(data.user.email, TEST_EMAIL);
        assert.equal(data.user.nom, TEST_NOM);
        authToken = data.token;
    });

    it('devrait rejeter un email en double', async () => {
        const { status, data } = await request('POST', '/register', {
            nom: 'Autre',
            prenom: 'Personne',
            email: TEST_EMAIL,
            mot_de_pass: 'autremdp',
        });
        assert.equal(status, 409);
        assert.ok(data.error);
    });

    it('devrait rejeter les champs manquants', async () => {
        const { status } = await request('POST', '/register', { nom: 'X' });
        assert.equal(status, 400);
    });
});


describe('Connexion', () => {
    it('devrait se connecter avec des identifiants corrects', async () => {
        const { status, data } = await request('POST', '/login', {
            email: TEST_EMAIL,
            mot_de_pass: TEST_PASSWORD,
        });
        assert.equal(status, 200);
        assert.ok(data.token);
        assert.equal(data.user.email, TEST_EMAIL);
        authToken = data.token;
    });

    it('devrait rejeter un mauvais mot de passe', async () => {
        const { status } = await request('POST', '/login', {
            email: TEST_EMAIL,
            mot_de_pass: 'wrongpassword',
        });
        assert.equal(status, 401);
    });

    it('devrait rejeter un email inexistant', async () => {
        const { status } = await request('POST', '/login', {
            email: 'nobody@nowhere.com',
            mot_de_pass: 'anything',
        });
        assert.equal(status, 401);
    });
});


describe('Profil', () => {
    it('devrait retourner le profil de l\'utilisateur avec un jeton valide', async () => {
        const { status, data } = await request('GET', '/me', null, authToken);
        assert.equal(status, 200);
        assert.equal(data.email, TEST_EMAIL);
        assert.equal(data.nom, TEST_NOM);
        assert.equal(data.prenom, TEST_PRENOM);
        // Le mot de passe ne devrait PAS être retourné
        assert.equal(data.mot_de_pass, undefined);
    });
});


describe('Mise à jour du profil', () => {
    it('devrait mettre à jour le nom et le prénom', async () => {
        const { status, data } = await request('PUT', '/me', {
            nom: 'NouveauNom',
            prenom: 'NouveauPrenom',
        }, authToken);
        assert.equal(status, 200);
        assert.equal(data.user.nom, 'NouveauNom');
        assert.equal(data.user.prenom, 'NouveauPrenom');
    });
});


describe('Changement de mot de passe', () => {
    const NEW_PASSWORD = 'NewPassword456!';

    it('devrait changer le mot de passe avec le bon ancien mot de passe', async () => {
        const { status, data } = await request('PUT', '/me/password', {
            ancien_mot_de_pass: TEST_PASSWORD,
            nouveau_mot_de_pass: NEW_PASSWORD,
        }, authToken);
        assert.equal(status, 200);
        assert.ok(data.message);
    });

    it('devrait se connecter avec le nouveau mot de passe', async () => {
        const { status, data } = await request('POST', '/login', {
            email: TEST_EMAIL,
            mot_de_pass: NEW_PASSWORD,
        });
        assert.equal(status, 200);
        assert.ok(data.token);
        authToken = data.token;
    });

    it('devrait rejeter un mauvais ancien mot de passe', async () => {
        const { status } = await request('PUT', '/me/password', {
            ancien_mot_de_pass: 'wrongold',
            nouveau_mot_de_pass: 'whatever',
        }, authToken);
        assert.equal(status, 401);
    });
});


describe('Protection JWT', () => {
    it('devrait rejeter les requêtes sans jeton', async () => {
        const { status } = await request('GET', '/me');
        assert.equal(status, 401);
    });

    it('devrait rejeter les requêtes avec un jeton invalide', async () => {
        const { status } = await request('GET', '/me', null, 'invalid.token.here');
        assert.equal(status, 401);
    });
});


describe('Suppression du compte', () => {
    it('devrait supprimer le compte de test', async () => {
        const { status, data } = await request('DELETE', '/me', null, authToken);
        assert.equal(status, 200);
        assert.ok(data.message);
    });

    it('ne devrait plus pouvoir se connecter après suppression', async () => {
        const { status } = await request('POST', '/login', {
            email: TEST_EMAIL,
            mot_de_pass: 'NewPassword456!',
        });
        assert.equal(status, 401);
    });
});

after(async () => {
    const { default: prisma } = await import('../src/lib/prisma.js');
    await prisma.$disconnect();
    if (app.server) {
        app.server.close();
    }
});
