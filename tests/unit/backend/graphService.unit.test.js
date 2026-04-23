import { getStats } from '../../../Backend/src/lib/services/graphService'; 
import prisma from '../../../Backend/src/lib/prisma'; 

// Simulation (Mock) de Prisma pour rester indépendant de la BDD
jest.mock('../../../Backend/src/lib/prisma', () => ({
  transaction: { findMany: jest.fn() },
  population: { findFirst: jest.fn() },
}));

describe('Tests Unitaires - graphService (Backend)', () => {
  
  beforeEach(() => {
    jest.clearAllMocks(); // Nettoyage entre chaque test
  });

  test('Cas Nominal : calcule le prix moyen et la somme des mutations', async () => {
    const mockTransactions = [
      { annee: 2024, valeur_fonciere: 1000, nombre_mutation: 10, type_transaction: 'Vente' },
      { annee: 2024, valeur_fonciere: 2000, nombre_mutation: 20, type_transaction: 'Vente' },
    ];
    prisma.transaction.findMany.mockResolvedValue(mockTransactions);

    const result = await getStats({ departement: '54', debut: 2024, fin: 2024 });

    // (1000 + 2000) / 2 = 1500
    expect(result.evolution[0].prixMoyen).toBe(1500);
    // 10 + 20 = 30
    expect(result.evolution[0].nbVentes).toBe(30);
  });

  test('Robustesse : gère les mutations nulles', async () => {
    const mockTransactions = [
      { annee: 2024, valeur_fonciere: 500, nombre_mutation: null, type_transaction: 'Vente' },
    ];
    prisma.transaction.findMany.mockResolvedValue(mockTransactions);

    const result = await getStats({ departement: '54' });
    expect(result.evolution[0].nbVentes).toBe(0);
  });

  test('Cas Limite : renvoie vide si rien en base', async () => {
    prisma.transaction.findMany.mockResolvedValue([]);
    const result = await getStats({ departement: '99' });
    expect(result.evolution).toEqual([]);
  });
});