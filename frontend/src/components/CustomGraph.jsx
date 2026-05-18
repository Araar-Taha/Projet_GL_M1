import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './CustomGraph.css';

const CustomGraph = ({ globalFilters }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [criteria, setCriteria] = useState({
    population: true,
    mutations: true,
    prix: true
  });

  useEffect(() => {
    const fetchCustomData = async () => {
      if (!globalFilters?.departement) return;
      setLoading(true);
      try {
        const response = await api.get('/graphs/custom', {
          params: {
            departement: globalFilters.departement,
            commune: globalFilters.commune || '',
            anneeDebut: globalFilters?.anneeDebut || 2020,
            anneeFin: globalFilters?.anneeFin || 2024
          }
        });
        setData(response.data);
      } catch (error) {
        console.error("Erreur Custom Graph API:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomData();
  }, [globalFilters?.departement, globalFilters?.commune, globalFilters?.anneeDebut, globalFilters?.anneeFin]);

  const toggleCriteria = (key) => {
    setCriteria(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="graph-box big" style={{ marginTop: '20px' }}>
      <div className="graph-header multi-criteria-header">
        <div className="header-top">
          <h3>Comparaison Multi-Critères</h3>
        </div>
        <div className="header-toggles">
          <label className={`toggle-btn pop ${criteria.population ? 'active' : ''}`}>
            <input type="checkbox" checked={criteria.population} onChange={() => toggleCriteria('population')} />
            Population
          </label>
          <label className={`toggle-btn mut ${criteria.mutations ? 'active' : ''}`}>
            <input type="checkbox" checked={criteria.mutations} onChange={() => toggleCriteria('mutations')} />
            Volume (Mutations)
          </label>
          <label className={`toggle-btn prix ${criteria.prix ? 'active' : ''}`}>
            <input type="checkbox" checked={criteria.prix} onChange={() => toggleCriteria('prix')} />
            Valeur foncière (Prix moyen)
          </label>
        </div>
      </div>

      <div className="graph-content" style={{ height: '380px', padding: '10px 0' }}>
        {!globalFilters?.departement ? (
          <div className="welcome-message" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <p>Veuillez sélectionner un département sur la carte pour afficher la comparaison.</p>
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <p className="loading">Chargement des données territoriales...</p>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 120, bottom: 20, left: 10 }}>
              <defs>
                <linearGradient id="colorPop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPrix" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMutBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34D399" stopOpacity={0.85} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.35} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={true} horizontal={true} />

              <XAxis
                dataKey="annee"
                axisLine={true}
                tickLine={true}
                stroke="#cbd5e1"
                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }}
                dy={10}
              />

              {/* Axe Population (Gauche) */}
              {criteria.population && (
                <YAxis
                  yAxisId="pop"
                  orientation="left"
                  stroke="#60A5FA"
                  tick={{ fontSize: 10, fontWeight: 800 }}
                  axisLine={true}
                  tickLine={true}
                  width={50}
                  label={{ value: 'Habitants', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: '10px', fill: '#60A5FA', fontWeight: 800 } }}
                />
              )}

              {/* Axe Mutations (Droite 1) */}
              {criteria.mutations && (
                <YAxis
                  yAxisId="mut"
                  orientation="right"
                  stroke="#10B981"
                  tick={{ fontSize: 10, fontWeight: 800 }}
                  axisLine={true}
                  tickLine={true}
                  width={60}
                  label={{ value: 'Volume', angle: 90, position: 'right', offset: 10, style: { fontSize: '10px', fill: '#10B981', fontWeight: 800 } }}
                />
              )}

              {/* Axe Prix (Droite 2 ) */}
              {criteria.prix && (
                <YAxis
                  yAxisId="prix"
                  orientation="right"
                  stroke="#8B5CF6"
                  tick={{ fontSize: 10, fontWeight: 800 }}
                  axisLine={{ stroke: '#8B5CF6', transform: 'translate(100, 0)' }}
                  tickLine={{ stroke: '#8B5CF6', transform: 'translate(100, 0)' }}
                  width={60}
                  dx={100}
                  label={{ value: 'Prix m²', angle: 90, position: 'right', offset: 110, style: { fontSize: '10px', fill: '#8B5CF6', fontWeight: 800 } }}
                />
              )}

              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                itemStyle={{ fontSize: '13px', fontWeight: 600 }}
              />

              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600 }} />

              {criteria.mutations && (
                <Bar
                  yAxisId="mut"
                  dataKey="mutations"
                  name="Volume (Mutations)"
                  fill="url(#colorMutBar)"
                  barSize={32}
                  radius={[6, 6, 0, 0]}
                />
              )}

              {criteria.population && (
                <Area
                  yAxisId="pop"
                  type="monotone"
                  dataKey="population"
                  stroke="#60A5FA"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPop)"
                  name="Population"
                  dot={{ r: 4, fill: '#60A5FA', stroke: 'white', strokeWidth: 2 }}
                />
              )}

              {criteria.prix && (
                <Area
                  yAxisId="prix"
                  type="monotone"
                  dataKey="prixMoyen"
                  stroke="#8B5CF6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorPrix)"
                  name="Prix Moyen (€/m²)"
                  dot={{ r: 5, fill: '#8B5CF6', stroke: 'white', strokeWidth: 2 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Aucune donnée disponible.
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomGraph;