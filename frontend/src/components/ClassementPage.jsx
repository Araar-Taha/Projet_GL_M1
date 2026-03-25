import React, { useState } from 'react';
import './ClassementPage.css';

const ClassementPage = () => {
  const [activeFilter, setActiveFilter] = useState('prix');
  const [scale, setScale] = useState('communes');
  const [reloading, setReloading] = useState(false);

  const handleFilterClick = (filter) => {
    if (filter !== activeFilter) {
      setReloading(true);
      setActiveFilter(filter);
      setTimeout(() => setReloading(false), 800);
    }
  };

  const handleScaleChange = (newScale) => {
    if (newScale !== scale) {
      setReloading(true);
      setScale(newScale);
      setTimeout(() => setReloading(false), 800);
    }
  };

  const skeletonRows = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="classement-container">
      <div className="classement-card">

        <div className="classement-header">
          <h1>Classement des Territoires</h1>
          <div className="scale-selector">
            <button
              className={`scale-btn ${scale === 'communes' ? 'active' : ''}`}
              onClick={() => handleScaleChange('communes')}
            >
              Communes
            </button>
            <button
              className={`scale-btn ${scale === 'departements' ? 'active' : ''}`}
              onClick={() => handleScaleChange('departements')}
            >
              Départements
            </button>
          </div>
        </div>

        <div className="filter-bar">
          <button
            className={`filter-btn ${activeFilter === 'prix' ? 'active' : ''}`}
            onClick={() => handleFilterClick('prix')}
          >
            Par Prix
          </button>
          <button
            className={`filter-btn ${activeFilter === 'population' ? 'active' : ''}`}
            onClick={() => handleFilterClick('population')}
          >
            Par Population
          </button>
          <button
            className={`filter-btn ${activeFilter === 'mutations' ? 'active' : ''}`}
            onClick={() => handleFilterClick('mutations')}
          >
            Par Mutations
          </button>
        </div>

        <div className="table-wrapper">
          <table className={`classement-table ${reloading ? 'reloading' : ''}`}>
            <thead>
              <tr>
                <th>Code</th>
                <th>{scale === 'communes' ? 'Nom de la commune' : 'Nom du département'}</th>
                <th className="sortable-header">
                  {activeFilter === 'prix' ? 'Prix Moyen' : activeFilter === 'population' ? 'Population' : 'Nombre de ventes'}
                </th>
              </tr>
            </thead>
            <tbody>
              {skeletonRows.map((row) => (
                <tr key={row}>
                  <td><div className="skeleton"></div></td>
                  <td><div className="skeleton"></div></td>
                  <td><div className="skeleton"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default ClassementPage;