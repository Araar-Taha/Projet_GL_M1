import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../index.js'; 

describe('Tests Fonctionnels - API Dashboard (Stats)', () => {

  it('Doit répondre avec succès à une requête de statistiques complète', async () => {
    const response = await request(app)
      .get('/api/graphs/all')
      .query({ 
        departement: '54', 
        anneeDebut: 2020, 
        anneeFin: 2024 
      });

    // 1. Vérification du statut
    assert.strictEqual(response.status, 200);

    // 2. Vérification du type de contenu
    assert.match(response.headers['content-type'], /json/);

    // 3. Vérification de la structure des données
    assert.ok(response.body.evolution, 'Devrait avoir une propriété evolution');
    assert.ok(response.body.distribution, 'Devrait avoir une propriété distribution');
    assert.ok(Array.isArray(response.body.evolution), 'Evolution devrait être un tableau');
  });

});

after(async () => {
  const { default: prisma } = await import('../src/lib/prisma.js');
  await prisma.$disconnect();
  if (app.server) {
    app.server.close();
  }
});
