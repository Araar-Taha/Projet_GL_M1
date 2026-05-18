import { useState, useEffect } from 'react';
import { getClassement } from '../../services/classement.service';
import './ClassementPage.css';

const ClassementPage = () => {
  const [activeFilter, setActiveFilter] = useState('prix');
  const [scale, setScale] = useState('communes');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    getClassement({ scale, metrique: activeFilter })
      .then(res => setData(res))
      .catch(err => {
        console.error('Erreur classement:', err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [scale, activeFilter]);

  const formatNombre = (n) => Number(n || 0).toLocaleString('fr-FR');

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
              ) : data.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>Aucune donnée disponible.</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.code} className="classement-row">
                    <td><strong>{item.code}</strong></td>
                    <td>{item.nom}</td>
                    <td className="sortable-cell">
                      {activeFilter === 'prix' ? `${formatNombre(item.prix)} €` : formatNombre(item[activeFilter])}
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
