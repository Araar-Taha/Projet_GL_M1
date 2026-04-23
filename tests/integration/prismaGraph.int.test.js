/**
 * @jest-environment node
 */
import { getStats } from '../../Backend/src/lib/services/graphService';
import prisma from '../../Backend/src/lib/prisma';

describe('Tests d’Intégration - Connexion Base de Données', () => {

  // Connexion avant de commencer
  beforeAll(async () => {
    try {
      await prisma.$connect();
    } catch (e) {
      console.error(' La BDD est éteinte ou mal configurée !');
      throw e; 
    }
  });

  // Déconnexion à la fin
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // TEST 1 : Le chemin de succès 
  test('1. Récupération réelle : doit retourner des données pour le département 54', async () => {
    const result = await getStats({ departement: '54' });
    
    // On vérifie que Prisma a bien renvoyé la structure attendue
    expect(result).toHaveProperty('evolution');
    expect(Array.isArray(result.evolution)).toBe(true);
    expect(result.distribution).toBeDefined();
  });

  // TEST 2 : La gestion d'erreur (Robustesse)
  test('2. Cas vide : doit renvoyer des tableaux vides pour un département inexistant', async () => {
    const result = await getStats({ departement: '999' });
    
    expect(result.evolution).toEqual([]);
    expect(result.distribution).toEqual([]);
  });

});