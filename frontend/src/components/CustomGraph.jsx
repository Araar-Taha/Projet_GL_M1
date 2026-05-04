import { useEffect, useState } from 'react';
import api from '../services/api';
import { getDepartements, getCommunes } from '../services/territories.service';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './CustomGraph.css';

const CustomGraph = ({ globalFilters }) => {
  const [departements, setDepartements] = useState([]);
  const [communes, setCommunes] = useState([]);
  
  const [localFilters, setLocalFilters] = useState({
    departement: globalFilters?.departement || '',
    commune: globalFilters?.commune || ''
  });

  const [criteria, setCriteria] = useState({
    population: true,
    mutations: true,
    prix: false
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDepartements().then(data => setDepartements(Array.isArray(data) ? data : [])).catch(() => setDepartements([]));
  }, []);

  useEffect(() => {
    if (localFilters.departement) {
      getCommunes(localFilters.departement).then(setCommunes).catch(() => setCommunes([]));
    } else {
      setCommunes([]);
    }
  }, [localFilters.departement]);

  useEffect(() => {
    if (globalFilters?.departement && globalFilters.departement !== localFilters.departement) {
      setLocalFilters(prev => ({
        ...prev,
        departement: globalFilters.departement,
        commune: globalFilters.commune || ''
      }));
    }
  }, [globalFilters?.departement, globalFilters?.commune]);

  useEffect(() => {
    const fetchCustomData = async () => {
      if (!localFilters.departement) return;
      setLoading(true);
      try {
        const response = await api.get('/graphs/custom', {
          params: {
            departement: localFilters.departement,
            commune: localFilters.commune,
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
  }, [localFilters, globalFilters?.anneeDebut, globalFilters?.anneeFin]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      if (key === 'departement') newFilters.commune = '';
      return newFilters;
    });
  };

  const toggleCriteria = (key) => {
    setCriteria(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="custom-graph-wrapper">
      <div className="graph-header custom-graph-header">
        <h3>Comparaison Multi-Critères</h3>
        <div className="custom-graph-controls">
          <div className="selectors">
            <select value={localFilters.departement} onChange={(e) => handleFilterChange('departement', e.target.value)}>
              <option value="">Sélectionner un département...</option>
              {departements.map(dep => (
                <option key={dep.code} value={dep.code}>{dep.nom}</option>
              ))}
            </select>
            <select value={localFilters.commune} onChange={(e) => handleFilterChange('commune', e.target.value)} disabled={!localFilters.departement}>
              <option value="">Toutes les communes</option>
              {communes.map(com => (
                <option key={com.code} value={com.code}>{com.nom}</option>
              ))}
            </select>
          </div>
          <div className="criteria-toggles">
            <label className="checkbox-label">
              <input type="checkbox" checked={criteria.population} onChange={() => toggleCriteria('population')} />
              Population
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={criteria.mutations} onChange={() => toggleCriteria('mutations')} />
              Volume (Mutations)
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={criteria.prix} onChange={() => toggleCriteria('prix')} />
              Valeur foncière (Prix moyen)
            </label>
          </div>
        </div>
      </div>
      
      <div className="graph-content">
        {!localFilters.departement ? (
          <div className="welcome-message" style={{textAlign: 'center', padding: '2rem', color: '#64748b'}}>
            <p>Veuillez sélectionner un département (sur la carte ou via la liste ci-dessus) pour afficher la comparaison.</p>
          </div>
        ) : loading ? (
          <div className="loader-mini">Chargement...</div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="annee" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              
              {criteria.population && <YAxis yAxisId="pop" orientation="left" stroke="#8884d8" tick={{fontSize: 11}} />}
              {criteria.mutations && <YAxis yAxisId="mut" orientation="right" stroke="#82ca9d" tick={{fontSize: 11}} />}
              {criteria.prix && <YAxis yAxisId="prix" orientation="right" stroke="#ff7300" tick={{fontSize: 11}} />}
              
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              
              {criteria.mutations && <Bar yAxisId="mut" dataKey="mutations" name="Volume (Mutations)" fill="#82ca9d" barSize={40} radius={[4, 4, 0, 0]} />}
              {criteria.population && <Line yAxisId="pop" type="monotone" dataKey="population" name="Population" stroke="#8884d8" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />}
              {criteria.prix && <Line yAxisId="prix" type="monotone" dataKey="prixMoyen" name="Prix Moyen (€)" stroke="#ff7300" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data">Aucune donnée disponible pour cette sélection.</div>
        )}
      </div>
    </div>
  );
};

export default CustomGraph;
