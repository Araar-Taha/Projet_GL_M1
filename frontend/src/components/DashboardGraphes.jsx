import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import './DashboardGraphes.css';

const DashboardGraphes = ({ filters }) => {
  const [data, setData] = useState({ evolution: [], distribution: [], ages: [] });
  const [loading, setLoading] = useState(false);

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
            anneeDebut: filters.anneeDebut || 2020,
            anneeFin: filters.anneeFin || 2024
          }
        });
        setData(response.data);
      } catch (error) {
        console.error("Erreur API Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [filters]);

  if (!filters?.departement) {
    return (
      <div className="dashboard-graphes">
        <div className="graph-box full-width">
          <div className="welcome-message">
            <span>🗺️</span>
            <h3>Analyse Territoriale</h3>
            <p>Sélectionnez un département sur la carte pour explorer les données immobilières et démographiques.</p>
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#8B5CF6', '#60A5FA', '#F472B6', '#10B981', '#F59E0B', '#94A3B8'];

  return (
    <div className="dashboard-graphes">

      {/* 1. ÉVOLUTION DU PRIX AU M² */}
      <div className="graph-box big">
        <div className="graph-header">
          <h3>Évolution du prix au m²</h3>
        </div>
        <div className="graph-content">
          {loading ? (
            <div className="loader-mini">Chargement...</div>
          ) : data.evolution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.evolution}>
                <defs>
                  <linearGradient id="colorPrix" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="annee" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value.toLocaleString()} €`, "Prix Moyen"]}
                />
                <Area
                  type="monotone"
                  dataKey="prixMoyen"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPrix)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">Aucune donnée sur cette période.</div>
          )}
        </div>
      </div>

      {/* 2. RÉPARTITION PAR ÂGE */}
      <div className="graph-box">
        <div className="graph-header">
          <h3>Structure de la population</h3>
        </div>
        <div className="graph-content">
          {loading ? (
            <div className="loader-mini">...</div>
          ) : data.ages.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.ages} layout="vertical" margin={{ left: -20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{ fill: '#1e293b', fontSize: 11 }} />
                <Tooltip formatter={(value) => [`${value}%`, "Proportion"]} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {data.ages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">Profil indisponible.</div>
          )}
        </div>
      </div>

      {/* 3. TYPES DE MUTATIONS */}
      <div className="graph-box">
        <div className="graph-header">
          <h3>Types de Transactions</h3>
        </div>
        <div className="graph-content">
          {loading ? (
            <div className="loader-mini">...</div>
          ) : data.distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data.distribution}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="name"
                  animationDuration={1500}
                >
                  {data.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">Répartition non disponible.</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default DashboardGraphes;
