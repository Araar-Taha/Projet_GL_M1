import React, { useState, useEffect } from 'react';
import './ClassementPage.css';

const ClassementPage = () => {
  const [activeFilter, setActiveFilter] = useState('prix');
  const [scale, setScale] = useState('communes');
  const [loading, setLoading] = useState(true);

  // Données de test pour faire briller l'interface
  const mockData = {
    communes: [
      { code: '75001', nom: 'Paris', prix: '12 500 €', population: '2 148 000', mutations: '1 240' },
      { code: '69001', nom: 'Lyon', prix: '5 200 €', population: '516 000', mutations: '850' },
      { code: '13001', nom: 'Marseille', prix: '3 800 €', population: '861 000', mutations: '920' },
      { code: '33000', nom: 'Bordeaux', prix: '4 900 €', population: '257 000', mutations: '600' },
      { code: '31000', nom: 'Toulouse', prix: '3 600 €', population: '486000', mutations: '710' },
    ],
    departements: [
      { code: '75', nom: 'Paris', prix: '11 200 €', population: '2 165 423', mutations: '15 400' },
      { code: '92', nom: 'Hauts-de-Seine', prix: '7 800 €', population: '1 624 357', mutations: '12 100' },
      { code: '06', nom: 'Alpes-Maritimes', prix: '5 100 €', population: '1 094 283', mutations: '8 400' },
      { code: '69', nom: 'Rhône', prix: '4 500 €', population: '1 875 747', mutations: '9 200' },
      { code: '33', nom: 'Gironde', prix: '4 200 €', population: '1 623 749', mutations: '7 800' },
    ]
  };

  // Simulation d'un chargement quand on change de filtre
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [scale, activeFilter]);

  const dataToShow = mockData[scale];

  return (
    <div className="classement-container">
      <div className="classement-card">
        <div className="classement-header">
          <h1>Classement des Territoires</h1>
          <div className="scale-selector">
            <button className={`scale-btn ${scale === 'communes' ? 'active' : ''}`} onClick={() => setScale('communes')}>Communes</button>
            <button className={`scale-btn ${scale === 'departements' ? 'active' : ''}`} onClick={() => setScale('departements')}>Départements</button>
          </div>
        </div>

        <div className="filter-bar">
          {['prix', 'population', 'mutations'].map((f) => (
            <button 
              key={f}
              className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              Par {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="table-wrapper">
          <table className="classement-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>{scale === 'communes' ? 'Nom de la commune' : 'Nom du département'}</th>
                <th className="sortable-header">
                  {activeFilter === 'prix' ? 'Prix Moyen / m²' : activeFilter === 'population' ? 'Population' : 'Nombre de ventes'}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton"></div></td>
                    <td><div className="skeleton"></div></td>
                    <td><div className="skeleton"></div></td>
                  </tr>
                ))
              ) : (
                dataToShow.map((item) => (
                  <tr key={item.code} className="classement-row">
                    <td><strong>{item.code}</strong></td>
                    <td>{item.nom}</td>
                    <td className="sortable-cell">
                       {activeFilter === 'prix' ? item.prix : activeFilter === 'population' ? item.population : item.mutations}
                       {activeFilter === 'prix' && <span className="trend-up">↑</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassementPage;