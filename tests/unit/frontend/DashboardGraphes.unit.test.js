import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardGraphes from '../../../frontend/src/components/DashboardGraphes.jsx';
import axios from 'axios';

jest.mock('axios');

describe('Tests Unitaires - DashboardGraphes (Frontend)', () => {

  test('Affiche les trois blocs de graphiques avec les titres ', async () => {
    axios.get.mockResolvedValue({ 
      data: { 
        evolution: [{ annee: 2024, prixMoyen: 1000, nbVentes: 5 }], 
        distribution: [{ type: 'Vente', count: 10, pourcent: 100 }], 
        ages: [{ categorie: 'Hommes', pourcent: 51 }] 
      } 
    });

    render(<DashboardGraphes filters={{ departement: '54' }} />);

    // 1. Titre Évolution
    expect(await screen.findByText(/ÉVOLUTION DU PRIX AU M² ET VOLUME DE MUTATIONS/i)).toBeInTheDocument();
    
    // 2. Titre Profil Population (Âges)
    expect(screen.getByText(/PROFIL DE LA POPULATION/i)).toBeInTheDocument();
    
    // 3. Titre Répartition (Distribution)
    expect(screen.getByText(/RÉPARTITION DES MUTATIONS/i)).toBeInTheDocument();
  });

});