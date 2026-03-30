import React from 'react';
import './DashboardGraphes.css';
const DashboardGraphes = () => {
  const titles = [
    'Évolution Prix m²',
    'Évolution de la Population',
    'Tranches d\'âges',
    'Comparaison de zones'
  ];

  return (
    <div className="dashboard-graphes">
      {titles.map((title, index) => (
        <div key={index} className="graph-box">
          <div className="graph-header">
            <h3>{title}</h3>
          </div>
          
          <div className="graph-content">
            {/* Cas 0 : Courbe de prix avec dégradé */}
            {index === 0 && (
  <div className="chart-container" style={{ width: '100%', height: '100px' }}>
    <svg viewBox="0 0 200 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      {/* La zone remplie sous la courbe */}
      <path 
        d="M0,80 Q40,75 70,45 T140,35 T200,10 L200,100 L0,100 Z" 
        fill="rgba(139, 92, 246, 0.2)" 
      />
      {/* La ligne de la courbe */}
      <path 
        d="M0,80 Q40,75 70,45 T140,35 T200,10" 
        fill="none" 
        stroke="#8B5CF6" 
        strokeWidth="4" 
        strokeLinecap="round"
        className="line-anim" 
      />
    </svg>
  </div>
)}

            {/* Cas 1 : Barres de population */}
            {index === 1 && (
              <div className="skeleton-bars">
                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                  <div key={i} className="real-bar" style={{ '--height': `${h}%` }}></div>
                ))}
              </div>
            )}

            {/* Cas 2 : Tranches d'âges en % (L'Abergement-Clémenciat;2019) */}
{index === 2 && (
  <div className="age-bubbles">
    <div className="bubble-group">
      <div className="bubble" style={{width: '65px', height: '65px', background: '#60A5FA', fontSize: '14px'}}>24%</div>
      <span>Enfant</span>
    </div>
    <div className="bubble-group">
      <div className="bubble" style={{width: '90px', height: '90px', background: '#8B5CF6', fontSize: '18px'}}>57%</div>
      <span>Jeune adulte</span>
    </div>
    <div className="bubble-group">
      <div className="bubble" style={{width: '60px', height: '60px', background: '#F472B6', fontSize: '14px'}}>19%</div>
      <span>Senior et retraités</span>
    </div>
  </div>
)}
            {/* Cas 3 : La comparaison de zones */}
            {index === 3 && (
              <div className="comparison-chart">
                <svg width="100%" height="100" viewBox="0 0 200 100" className="chart-svg">
                  <path d="M10,80 L50,40 L90,60 L130,20 L170,50" stroke="#6366F1" strokeWidth="3" fill="none" className="line-anim" />
                  <path d="M10,60 L50,80 L90,30 L130,70 L170,10" stroke="#EC4899" strokeWidth="3" fill="none" className="line-anim" />
                </svg>
                <div className="legend">
                  <div className="legend-item"><div className="color-box" style={{backgroundColor:'#6366F1'}}></div><span>Zone A</span></div>
                  <div className="legend-item"><div className="color-box" style={{backgroundColor:'#EC4899'}}></div><span>Zone B</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardGraphes;