import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:5000/api/auth';

// Unique email for this test run
const TEST_EMAIL = 'test@dvf-test.com';
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NOM = 'TestNom';
const TEST_PRENOM = 'TestPrenom';

let authToken = null;

// Helper to make HTTP requests
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

// ──────────────────────────────────────────────
// 1. Registration
// ──────────────────────────────────────────────
describe('Registration', () => {
    it('should register a new user', async () => {
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

    it('should reject duplicate email', async () => {
        const { status, data } = await request('POST', '/register', {
            nom: 'Autre',
            prenom: 'Personne',
            email: TEST_EMAIL,
            mot_de_pass: 'autremdp',
        });
        assert.equal(status, 409);
        assert.ok(data.error);
    });

    it('should reject missing fields', async () => {
        const { status } = await request('POST', '/register', { nom: 'X' });
        assert.equal(status, 400);
    });
});

// ──────────────────────────────────────────────
// 2. Login
// ──────────────────────────────────────────────
describe('Login', () => {
    it('should login with correct credentials', async () => {
        const { status, data } = await request('POST', '/login', {
            email: TEST_EMAIL,
            mot_de_pass: TEST_PASSWORD,
        });
        assert.equal(status, 200);
        assert.ok(data.token);
        assert.equal(data.user.email, TEST_EMAIL);
        authToken = data.token;
    });

    it('should reject wrong password', async () => {
        const { status } = await request('POST', '/login', {
            email: TEST_EMAIL,
            mot_de_pass: 'wrongpassword',
        });
        assert.equal(status, 401);
    });

    it('should reject non-existent email', async () => {
        const { status } = await request('POST', '/login', {
            email: 'nobody@nowhere.com',
            mot_de_pass: 'anything',
        });
        assert.equal(status, 401);
    });
});

// ──────────────────────────────────────────────
// 3. Profile (GET /me)
// ──────────────────────────────────────────────
describe('Profile', () => {
    it('should return user profile with valid token', async () => {
        const { status, data } = await request('GET', '/me', null, authToken);
        assert.equal(status, 200);
        assert.equal(data.email, TEST_EMAIL);
        assert.equal(data.nom, TEST_NOM);
        assert.equal(data.prenom, TEST_PRENOM);
        // Password should NOT be returned
        assert.equal(data.mot_de_pass, undefined);
    });
});

// ──────────────────────────────────────────────
// 4. Update profile (PUT /me)
// ──────────────────────────────────────────────
describe('Update profile', () => {
    it('should update nom and prenom', async () => {
        const { status, data } = await request('PUT', '/me', {
            nom: 'NouveauNom',
            prenom: 'NouveauPrenom',
        }, authToken);
        assert.equal(status, 200);
        assert.equal(data.user.nom, 'NouveauNom');
        assert.equal(data.user.prenom, 'NouveauPrenom');
    });
});

// ──────────────────────────────────────────────
// 5. Change password (PUT /me/password)
// ──────────────────────────────────────────────
describe('Change password', () => {
    const NEW_PASSWORD = 'NewPassword456!';

    it('should change password with correct old password', async () => {
        const { status, data } = await request('PUT', '/me/password', {
            ancien_mot_de_pass: TEST_PASSWORD,
            nouveau_mot_de_pass: NEW_PASSWORD,
        }, authToken);
        assert.equal(status, 200);
        assert.ok(data.message);
    });

    it('should login with new password', async () => {
        const { status, data } = await request('POST', '/login', {
            email: TEST_EMAIL,
            mot_de_pass: NEW_PASSWORD,
        });
        assert.equal(status, 200);
        assert.ok(data.token);
        authToken = data.token;
    });

    it('should reject wrong old password', async () => {
        const { status } = await request('PUT', '/me/password', {
            ancien_mot_de_pass: 'wrongold',
            nouveau_mot_de_pass: 'whatever',
        }, authToken);
        assert.equal(status, 401);
    });
});

// ──────────────────────────────────────────────
// 6. JWT protection
// ──────────────────────────────────────────────
describe('JWT protection', () => {
    it('should reject request without token', async () => {
        const { status } = await request('GET', '/me');
        assert.equal(status, 401);
    });

    it('should reject request with invalid token', async () => {
        const { status } = await request('GET', '/me', null, 'invalid.token.here');
        assert.equal(status, 401);
    });
});

// ──────────────────────────────────────────────
// 7. Delete account (DELETE /me)
// ──────────────────────────────────────────────
describe('Delete account', () => {
    it('should delete the test account', async () => {
        const { status, data } = await request('DELETE', '/me', null, authToken);
        assert.equal(status, 200);
        assert.ok(data.message);
    });

    it('should not be able to login after deletion', async () => {
        const { status } = await request('POST', '/login', {
            email: TEST_EMAIL,
            mot_de_pass: 'NewPassword456!',
        });
        assert.equal(status, 401);
    });
});
