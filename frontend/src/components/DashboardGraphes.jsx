import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../services/api';
import './DashboardGraphes.css';
import { getDepartements, getCommunes } from '../services/territories.service';

const DashboardGraphes = ({ filters }) => {
  const [data, setData] = useState({ evolution: [], distribution: [], ages: [] });
  const [loading, setLoading] = useState(false);
  const [bottomNode, setBottomNode] = useState(null);
  const [deptName, setDeptName] = useState('');
  const [communeName, setCommuneName] = useState('');

  useEffect(() => {
    const node = document.querySelector('.bottom-section');
    if (node) setBottomNode(node);
  }, []);

  useEffect(() => {
    const fetchNames = async () => {
      if (!filters?.departement) {
        setDeptName('');
        setCommuneName('');
        return;
      }
      try {
        const deps = await getDepartements();
        const dep = deps.find(d => String(d.code) === String(filters.departement));
        if (dep) {
          setDeptName(dep.nom);
        } else {
          setDeptName(filters.departement);
        }

        if (filters.commune) {
          const communes = await getCommunes(filters.departement);
          const com = communes.find(c => String(c.code) === String(filters.commune));
          if (com) {
            setCommuneName(com.nom);
          } else {
            const res = await fetch(`https://geo.api.gouv.fr/communes/${filters.commune}?format=json`);
            if (res.ok) {
              const geoData = await res.json();
              if (geoData && geoData.nom) {
                setCommuneName(geoData.nom);
              } else {
                setCommuneName(filters.commune);
              }
            } else {
              setCommuneName(filters.commune);
            }
          }
        } else {
          setCommuneName('');
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des noms :", error);
      }
    };

    fetchNames();
  }, [filters?.departement, filters?.commune]);

  const downloadPDF = async () => {
    const element = document.querySelector('.bottom-section');
    if (!element) return;

    const btn = document.querySelector('.download-btn-wrapper');
    if (btn) btn.style.visibility = 'hidden';

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f8fafc'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    const cleanDept = (deptName || filters.departement || '').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanCommune = communeName ? communeName.replace(/[^a-zA-Z0-9]/g, '_') : '';
    const fileName = cleanCommune
      ? `Rapport_${cleanDept}_${cleanCommune}.pdf`
      : `Rapport_Departement_${cleanDept}.pdf`;

    pdf.save(fileName);

    if (btn) btn.style.visibility = 'visible';
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!filters?.departement) return;

      setLoading(true);

      try {
        const response = await api.get('/graphs/all', {
          params: {
            departement: filters.departement,
            commune: filters.commune || '',
            typeMutation: filters.typeMutation || '',
            anneeDebut: parseInt(filters.anneeDebut) || 2020,
            anneeFin: parseInt(filters.anneeFin) || 2024
          }
        });

        if (response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Erreur API Dashboard lors du filtrage:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

  }, [filters?.departement, filters?.commune, filters?.typeMutation, filters?.anneeDebut, filters?.anneeFin]);


  // Affichage de l'état "vide" si aucun département n'est sélectionné
  if (!filters?.departement) {
    return (
      <div className="dashboard-graphes">
        <div className="graph-box big welcome-container">
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '48px', margin: '0' }}>🗺️</p>
            <h3 style={{ marginTop: '10px', color: '#1e293b' }}>Analyse Territoriale</h3>
            <p style={{ fontSize: '14px' }}>Sélectionnez un département sur la carte.</p>
          </div>
        </div>
      </div>
    );
  }

  const genderData = data.ages?.filter(a => a.label === 'Hommes' || a.label === 'Femmes') || [];
  const ageStructureData = data.ages?.filter(a => a.label !== 'Hommes' && a.label !== 'Femmes') || [];
  const distribution = data.distribution || [];

  const totalCircumference = 314;
  const COLORS = ['#8B5CF6', '#60A5FA', '#F472B6', '#10B981', '#F59E0B', '#94A3B8'];
  let cumulativeOffset = 0;

  return (
    <div className="dashboard-wrapper" style={{ backgroundColor: '#f8fafc', paddingBottom: '20px' }}>

      <div className="dashboard-graphes">

        {/* 2. RÉPARTITION PAR GENRE */}
        <div className="graph-box">
          <div className="graph-header"><h3>Répartition par genre</h3></div>
          <div className="graph-content">
            <div className="gender-unified-container" style={{ padding: '15px 0' }}>
              <div className="gender-legend" style={{ marginBottom: '15px' }}>
                <div className="legend-item male">
                  <span className="dot blue"></span>
                  <span className="label">Hommes</span>
                  <span className="val" style={{ fontSize: '20px' }}>{genderData.find(g => g.label === 'Hommes')?.value || 0}%</span>
                </div>
                <div className="legend-item female">
                  <span className="val" style={{ fontSize: '20px' }}>{genderData.find(g => g.label === 'Femmes')?.value || 0}%</span>
                  <span className="label">Femmes</span>
                  <span className="dot pink"></span>
                </div>
              </div>
              <div className="gender-single-bar" style={{ height: '20px', borderRadius: '10px', background: '#f1f5f9', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${genderData.find(g => g.label === 'Hommes')?.value || 0}%`, backgroundColor: '#60A5FA', transition: 'width 0.5s' }}></div>
                <div style={{ width: `${genderData.find(g => g.label === 'Femmes')?.value || 0}%`, backgroundColor: '#F472B6', transition: 'width 0.5s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. STRUCTURE PAR ÂGE */}
        <div className="graph-box">
          <div className="graph-header"><h3>Tranches d'âges</h3></div>
          <div className="graph-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginTop: '15px' }}>
              {ageStructureData.length > 0 ? ageStructureData.map((age, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                    <span>{age.label}</span>
                    <span style={{ color: age.color || COLORS[i % COLORS.length] }}>{age.value}%</span>
                  </div>
                  <div style={{ height: '14px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${age.value}%`, height: '100%', backgroundColor: age.color || COLORS[i % COLORS.length], transition: 'width 1s ease-in-out' }}></div>
                  </div>
                </div>
              )) : <p className="no-data">Données démographiques indisponibles.</p>}
            </div>
          </div>
        </div>

        {/* 4. RÉPARTITION DES MUTATIONS */}
        <div className="graph-box big">
          <div className="graph-header"><h3>Répartition des mutations</h3></div>
          <div className="graph-content">
            {distribution.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginTop: '15px' }}>
                <div style={{ position: 'relative', width: '180px', height: '180px', flexShrink: 0 }}>
                  <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="15" />
                    {distribution.map((item, i) => {
                      const dash = `${(item.value / 100) * totalCircumference} ${totalCircumference}`;
                      const offset = -cumulativeOffset;
                      cumulativeOffset += (item.value / 100) * totalCircumference;
                      return (
                        <circle key={i} cx="60" cy="60" r="50" fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth="15" strokeDasharray={dash} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.5s' }} />
                      );
                    })}
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b' }}>
                      {distribution.reduce((acc, c) => acc + c.count, 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Total</div>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                  {distribution.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{item.count.toLocaleString()} mutations</div>
                      </div>
                      <div style={{ fontWeight: 'bold', color: COLORS[i % COLORS.length], fontSize: '14px' }}>{item.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : <p className="no-data">Aucune donnée de mutation pour cette sélection.</p>}
          </div>
        </div>

      </div>

      {bottomNode && createPortal(
        <div className="download-btn-wrapper" style={{ display: 'flex', justifyContent: 'center', padding: '20px 0', width: '100%' }}>
          <button onClick={downloadPDF} className="download-pdf-btn">
            Télécharger le rapport complet {communeName ? `de ${communeName}` : `du ${deptName || filters.departement}`}
          </button>
        </div>,
        bottomNode
      )}
    </div>
  );
};

export default DashboardGraphes;
