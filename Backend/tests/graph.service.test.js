import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateStats } from '../src/services/graph.service.js';

describe('Tests Unitaires - Graph Service', () => {

  it('Cas Nominal : calcule le prix moyen et le volume des ventes', async () => {
    const mockTransactions = [
      { annee: 2024, valeur_fonciere: 1000, nombre_mutation: 10, type_transaction: 'Vente' },
      { annee: 2024, valeur_fonciere: 2000, nombre_mutation: 20, type_transaction: 'Vente' },
    ];

    const prismaMock = {
      transaction: { findMany: async () => mockTransactions },
      population: { findFirst: async () => null }
    };

    const result = await calculateStats({ departement: '54', anneeDebut: 2024, anneeFin: 2024 }, prismaMock);

    assert.strictEqual(result.evolution.length, 1);
    assert.strictEqual(result.evolution[0].prixMoyen, 1500);
    assert.strictEqual(result.evolution[0].nbVentes, 30);
  });

  it('Robustesse : gère les mutations nulles ou manquantes', async () => {
    const mockTransactions = [
      { annee: 2024, valeur_fonciere: 500, nombre_mutation: null, type_transaction: 'Vente' },
    ];

    const prismaMock = {
      transaction: { findMany: async () => mockTransactions },
      population: { findFirst: async () => null }
    };

    const result = await calculateStats({ departement: '54' }, prismaMock);
    assert.strictEqual(result.evolution[0].nbVentes, 0);
  });

  it('Répartition : calcule correctement les pourcentages par type', async () => {
    const mockTransactions = [
      { annee: 2024, valeur_fonciere: 1000, nombre_mutation: 1, type_transaction: 'Vente' },
      { annee: 2024, valeur_fonciere: 1000, nombre_mutation: 3, type_transaction: 'Echange' },
    ];

    const prismaMock = {
      transaction: { findMany: async () => mockTransactions },
      population: { findFirst: async () => null }
    };

    const result = await calculateStats({ departement: '54' }, prismaMock);
    const vente = result.distribution.find(d => d.name === 'Vente');
    const echange = result.distribution.find(d => d.name === 'Echange');
    assert.strictEqual(vente.value, 25);
    assert.strictEqual(echange.value, 75);
  });
});
