import React from 'react';
import './DashboardGraphes.css';

const DashboardGraphes = () => {
  const titles = [
    'Évolution Prix m²',
    'Évolution de la Population',
    'Évolution des Tranches d\'âges dans la population',
    'Comparaison de zones'
  ];

  return (
    <div className="dashboard-graphes">
      {titles.map((title, index) => (
        <div key={index} className="graph-box">
          <div className="graph-header">
            <h3>{title}</h3>
          </div>

          {index === 3 ? (
            <div className="comparison-chart">
              <svg width="100%" height="120" viewBox="0 0 200 120" className="chart-svg">
                <path d="M10,100 L50,60 L90,80 L130,40 L170,70" stroke="#3b82f6" strokeWidth="3" fill="none" className="line-anim" />
                <path d="M10,80 L50,100 L90,50 L130,90 L170,30" stroke="#ef4444" strokeWidth="3" fill="none" className="line-anim" />
              </svg>
              <div className="legend">
                <div className="legend-item">
                  <div className="color-box" style={{ backgroundColor: '#3b82f6' }}></div>
                  <span>Zone A</span>
                </div>
                <div className="legend-item">
                  <div className="color-box" style={{ backgroundColor: '#ef4444' }}></div>
                  <span>Zone B</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="skeleton-bars">
              <div className="skeleton-bar" style={{ height: '40px' }}></div>
              <div className="skeleton-bar" style={{ height: '60px' }}></div>
              <div className="skeleton-bar" style={{ height: '80px' }}></div>
              <div className="skeleton-bar" style={{ height: '50px' }}></div>
              <div className="skeleton-bar" style={{ height: '70px' }}></div>
              <div className="skeleton-bar" style={{ height: '90px' }}></div>
              <div className="skeleton-bar" style={{ height: '55px' }}></div>
              <div className="skeleton-bar" style={{ height: '75px' }}></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DashboardGraphes;