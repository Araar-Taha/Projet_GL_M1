/**
 * @jest-environment node
 */
import request from 'supertest';
import app from '../../Backend/index.js'; 

describe('Tests Fonctionnels - API Dashboard', () => {

  test('Doit répondre avec succès à une requête de statistiques complète', async () => {
    // On simule un appel GET sur l' API
    const response = await request(app)
      .get('/api/graphs/all')
      .query({ 
        departement: '54', 
        debut: 2020, 
        fin: 2024 
      });

    // 1. On vérifie que le serveur répond "200 OK"
    expect(response.statusCode).toBe(200);

    // 2. On vérifie que le format est bien du JSON
    expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));

    // 3. On vérifie la présence des blocs de données clés
    expect(response.body).toHaveProperty('evolution');
    expect(response.body).toHaveProperty('distribution');
  });

});