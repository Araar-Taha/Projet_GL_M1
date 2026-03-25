import React from 'react';
import './PrixM2Chart.css';

const PrixM2Chart = () => {
  return (
    <div className="prix-m2-chart">
      <h3>📈 Évolution Prix m²</h3>
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
    </div>
  );
};

export default PrixM2Chart;