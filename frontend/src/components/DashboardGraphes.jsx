import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DashboardGraphes.css';

const DashboardGraphes = ({ filters }) => {
  const [data, setData] = useState({ evolution: [], distribution: [], ages: [] });
  const [loading, setLoading] = useState(false);

  const typeMut = filters?.typeMutation || filters?.type || '';
  const anneeDeb = parseInt(filters?.anneeDebut || filters?.debut || 2019);
  const anneeFn = parseInt(filters?.anneeFin || filters?.fin || 2024);

  useEffect(() => {
    const fetchStats = async () => {
      //  Sécurité : On ne lance rien sans département
      if (!filters?.departement) return;
      
      setLoading(true);
      try {
        const query = new URLSearchParams({
          departement: filters.departement,
          commune: filters.commune || '',
          type: typeMut, 
          debut: anneeDeb,
          fin: anneeFn
        }).toString();
        const response = await axios.get(`http://localhost:5000/api/graphs/all?${query}`);
        setData(response.data);
      } catch (error) {
        console.error("Erreur API:", error);
      } finally { setLoading(false); }
    };
    fetchStats();
  }, [filters?.departement, filters?.commune, typeMut, anneeDeb, anneeFn]);

  //  LOGIQUE DE BIENVENUE (AU REFRESH) 
  if (!filters?.departement) {
    return (
      <div className="dashboard-graphes">
        <div className="graph-box big" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '48px', margin: '0' }}>🗺️</p>
            <h3 style={{ marginTop: '10px', color: '#1e293b' }}>Bienvenue sur le Dashboard</h3>
            <p style={{ fontSize: '14px' }}>Veuillez sélectionner un <strong>département</strong> pour commencer l'analyse.</p>
          </div>
        </div>
      </div>
    );
  }

  const evolution = data.evolution || [];
  const maxPrice = evolution.length > 0 ? Math.max(...evolution.map(d => d.prixMoyen)) * 1.2 : 1;
  const maxVol = evolution.length > 0 ? Math.max(...evolution.map(d => d.nbVentes || 0)) * 1.5 : 1;

  // CONFIG DONUT MUTATIONS 
  const distribution = data.distribution || [];
  const totalCircumference = 314; 
  const getCol = (i) => ['#8B5CF6', '#60A5FA', '#F472B6', '#10B981', '#F59E0B', '#94a3b8'][i % 6];
  let cumulativeOffset = 0;

  return (
    <div className="dashboard-graphes">
      
      {/* 1. ÉVOLUTION DU PRIX ET VOLUME */}
      <div className="graph-box big">
        <div className="graph-header">
          <h3>Évolution du prix au m² et Volume de mutations </h3>
        </div>
        
        <div className="graph-content">
          {loading ? ( 
            <p className="loading">Chargement des données...</p> 
          ) : evolution.length > 0 ? (
            <div className="chart-container" style={{ position: 'relative', marginTop: '20px', paddingLeft: '35px' }}>
              
              {/* AXE PRIX */}
              <div style={{ position: 'absolute', left: '0', top: '10px', height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '10px', color: '#8B5CF6', fontWeight: 'bold' }}>
                <span>{Math.round(maxPrice).toLocaleString()}€</span>
                <span>{Math.round(maxPrice / 2).toLocaleString()}€</span>
                <span>0€</span>
              </div>

              <svg viewBox="0 0 400 150" className="styled-svg">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <line x1="20" y1="110" x2="380" y2="110" stroke="#f1f5f9" />
                
                {/* Barres de Volume */}
                {evolution.map((item, i) => {
                  const x = 20 + (i / (evolution.length - 1 || 1)) * 360;
                  const barH = (item.nbVentes / maxVol) * 80;
                  return <rect key={i} x={x - 6} y={110 - barH} width="12" height={barH} fill="#e2e8f0" rx="2" />;
                })}

                <path d={`M20,110 ${evolution.map((item, i) => `L${20 + (i / (evolution.length - 1 || 1)) * 360},${110 - ((item.prixMoyen / maxPrice) * 100)}`).join(' ')} L380,110 Z`} fill="url(#areaGrad)" />
                <path d={`M20,${110 - (evolution[0].prixMoyen / maxPrice * 100)} ${evolution.map((item, i) => `L${20 + (i / (evolution.length - 1 || 1)) * 360},${110 - ((item.prixMoyen / maxPrice) * 100)}`).join(' ')}`} fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
                
                {evolution.map((item, i) => (
                  <g key={i}>
                    <circle cx={20 + (i / (evolution.length - 1 || 1)) * 360} cy={110 - ((item.prixMoyen / maxPrice) * 100)} r="4" fill="#8B5CF6" stroke="white" strokeWidth="2" />
                    <text x={20 + (i / (evolution.length - 1 || 1)) * 360} y="135" fontSize="10" textAnchor="middle" fill="#64748b" fontWeight="bold">{item.annee}</text>
                    <text x={20 + (i / (evolution.length - 1 || 1)) * 360} y={110 - ((item.prixMoyen / maxPrice) * 100) - 12} fontSize="9" textAnchor="middle" fontWeight="bold" fill="#1e293b">{item.prixMoyen.toLocaleString()}€</text>
                  </g>
                ))}
              </svg>

              {/* LÉGENDE COMPLÈTE  */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', marginTop: '15px', fontSize: '11px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '15px', height: '3px', background: '#8B5CF6', borderRadius: '2px' }}></div>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>Prix moyen au m²</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#e2e8f0', borderRadius: '3px' }}></div>
                  <span style={{ color: '#64748b' }}>Volume de mutations</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="no-data-box" style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
              <p style={{ fontSize: '24px', margin: '0 0 10px 0' }}>📉</p>
              <p style={{ fontSize: '13px', margin: 0 }}>
                Aucune transaction de type <strong>"{typeMut || 'Tous types'}"</strong> n'a été enregistrée pour cette zone entre {anneeDeb} et {anneeFn}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. PROFIL DE LA POPULATION */}
      <div className="graph-box">
        <div className="graph-header"><h3>Profil de la population</h3></div>
        <div className="graph-content">
          <div className="age-bars">
            {data.ages.length > 0 ? data.ages.map((age, i) => (
              <div key={i} className="age-bar-item">
                <div className="bar-label">{age.label}</div>
                <div className="bar-container">
                  <div className="bar-fill" style={{ width: `${age.value}%`, backgroundColor: age.color }}></div>
                  <span className="bar-percent">{age.value}%</span>
                </div>
              </div>
            )) : <p className="no-data">Données indisponibles.</p>}
          </div>
        </div>
      </div>

      {/* 3. RÉPARTITION DES MUTATIONS (DONUT ) */}
      <div className="graph-box">
        <div className="graph-header"><h3>Répartition des mutations</h3></div>
        <div className="graph-content">
          {distribution.length > 0 ? (
            <div className="donut-container" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  {distribution.map((item, i) => {
                    const dash = `${(item.value / 100) * totalCircumference} ${totalCircumference}`;
                    const offset = -cumulativeOffset;
                    cumulativeOffset += (item.value / 100) * totalCircumference;
                    return <circle key={i} cx="60" cy="60" r="50" fill="none" stroke={getCol(i)} strokeWidth="12" strokeDasharray={dash} strokeDashoffset={offset} style={{ transition: 'all 0.3s' }} />;
                  })}
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>{distribution.reduce((acc, c) => acc + c.count, 0)}</div>
                  <div style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {distribution.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', padding: '5px 8px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: getCol(i) }}></div>
                    <div style={{ flex: 1, fontWeight: 'bold', color: '#1e293b' }}>{item.name}</div>

<div style={{ color: '#64748b', fontSize: '10px' }}>
  {item.count} {item.count > 1 ? 'mutations' : 'mutation'}
</div>

<div style={{ fontWeight: 'bold', color: getCol(i), minWidth: '35px', textAlign: 'right' }}>{item.value}%</div>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="no-data">Aucune donnée de mutation.</p>}
        </div>
      </div>

    </div>
  );
};

export default DashboardGraphes;