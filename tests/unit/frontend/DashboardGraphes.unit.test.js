import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardGraphes from '../../../frontend/src/components/DashboardGraphes.jsx';
import axios from 'axios';

// On simule axios pour ne pas appeler le vrai serveur pendant le test
jest.mock('axios');

describe('Tests Unitaires - DashboardGraphes (Frontend)', () => {

  test('Affiche l’écran de bienvenue avec le message de sélection', () => {
    render(<DashboardGraphes filters={{}} />);
    
    // Test du titre
    expect(screen.getByText(/Bienvenue sur le Dashboard/i)).toBeInTheDocument();
    
   
    expect(screen.getByText(/Veuillez sélectionner un/i)).toBeInTheDocument();
    expect(screen.getByText(/département/i)).toBeInTheDocument();
  });

  test('Affiche le message d’absence de données ', async () => {
    // 1. On s'assure que le mock renvoie bien du vide
    axios.get.mockResolvedValue({ 
      data: { evolution: [], distribution: [], ages: [] } 
    });

    render(<DashboardGraphes filters={{ departement: '54' }} />);

    await waitFor(() => {
      // On cherche juste le début de la phrase
      expect(screen.getByText(/Aucune transaction de type/i)).toBeInTheDocument();
    });
  });

  test('Affiche le titre du graphique principal après le chargement', async () => {
    axios.get.mockResolvedValue({ 
      data: { 
        evolution: [{ annee: 2024, prixMoyen: 1000, nbVentes: 5 }], 
        distribution: [], 
        ages: [] 
      } 
    });

    render(<DashboardGraphes filters={{ departement: '54' }} />);

    // On vérifie que le titre du bloc d'évolution est là
    const title = await screen.findByText(/Évolution du prix au m²/i);
    expect(title).toBeInTheDocument();
  });
});