import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateStats, getCustomStats } from '../src/services/graph.service.js';

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
  it('Non regression : retourne toutes les annees demandees meme sans donnees', async () => {
    const mockTransactions = [
      { annee: 2021, valeur_fonciere: 1200, nombre_mutation: 2 },
      { annee: 2023, valeur_fonciere: 1800, nombre_mutation: 3 },
    ];

    const mockPopulations = [
      { annee: 2021, population_totale: 1000 },
      { annee: 2023, population_totale: 1500 },
    ];

    const prismaMock = {
      transaction: { findMany: async () => mockTransactions },
      population: { findMany: async () => mockPopulations }
    };

    const result = await getCustomStats({ departement: '54', anneeDebut: 2021, anneeFin: 2024 }, prismaMock);

    assert.deepStrictEqual(
      result.map(item => item.annee),
      [2021, 2022, 2023, 2024]
    );
    assert.deepStrictEqual(result[1], {
      annee: 2022,
      prixMoyen: 0,
      mutations: 0,
      population: 0
    });
    assert.deepStrictEqual(result[3], {
      annee: 2024,
      prixMoyen: 0,
      mutations: 0,
      population: 0
    });
  });

  it('Cas limite : respecte les bornes debut et fin pour une comparaison', async () => {
    const prismaMock = {
      transaction: { findMany: async () => [] },
      population: { findMany: async () => [] }
    };

    const result = await getCustomStats({ commune: '54000', anneeDebut: 2020, anneeFin: 2020 }, prismaMock);

    assert.strictEqual(result.length, 1);
    assert.deepStrictEqual(result[0], {
      annee: 2020,
      prixMoyen: 0,
      mutations: 0,
      population: 0
    });
  });
});
