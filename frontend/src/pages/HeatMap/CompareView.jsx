import { useState, useEffect } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line } from 'recharts'
import { getPrixEvolution } from '../../services/mutations.service'
import { getPopulationEvolution } from '../../services/population.service'
import './CompareView.css'

const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
}

function CompareView({ territoireA, territoireB }) {
  const [prixData, setPrixData] = useState([])
  const [popData, setPopData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!territoireA || !territoireB) return

    setLoading(true)
    
    // Fonction utilitaire pour fusionner deux tableaux de données par année
    const mergeData = (dataA, dataB, key) => {
      const years = [...new Set([...dataA.map(d => d.annee), ...dataB.map(d => d.annee)])].sort()
      return years.map(year => {
        const itemA = dataA.find(d => d.annee === year)
        const itemB = dataB.find(d => d.annee === year)
        return {
          annee: year,
          [territoireA.nom]: itemA ? itemA[key] : null,
          [territoireB.nom]: itemB ? itemB[key] : null
        }
      })
    }

    Promise.all([
      getPrixEvolution(territoireA.code).catch(() => []),
      getPrixEvolution(territoireB.code).catch(() => []),
      getPopulationEvolution(territoireA.code).catch(() => []),
      getPopulationEvolution(territoireB.code).catch(() => [])
    ]).then(([prixA, prixB, popA, popB]) => {
      setPrixData(mergeData(prixA, prixB, 'prixMoyen'))
      setPopData(mergeData(popA, popB, 'population'))
      setLoading(false)
    }).catch(() => setLoading(false))

  }, [territoireA, territoireB])

  if (!territoireA || !territoireB) {
    return (
      <div className="compare-view empty-compare">
        <div className="compare-message">
          <p>Sélectionnez un deuxième territoire dans les filtres pour comparer.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`compare-view ${loading ? 'loading' : ''}`}>
      <div className="compare-header">
        <h3 className="compare-title">
          ⚖️ <span className="text-gradient">Comparaison du marché</span>
        </h3>
        <div className="compare-badges">
          <span className="badge badge-a">{territoireA.nom}</span>
          <span className="badge-vs">vs</span>
          <span className="badge badge-b">{territoireB.nom}</span>
        </div>
      </div>

      <div className="compare-grid">
        <div className="compare-card animate-scale-in">
          <h4>Évolution de la valeur (m²)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={prixData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
              <XAxis dataKey="annee" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={60} tickFormatter={(v) => `${v}€`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey={territoireA.nom} stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey={territoireB.nom} stroke="#F43F5E" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="compare-card animate-scale-in delay-1">
          <h4>Évolution de la population</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={popData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
              <XAxis dataKey="annee" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={60} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey={territoireA.nom} fill="#4F46E5" radius={[4, 4, 0, 0]} />
              <Bar dataKey={territoireB.nom} fill="#F43F5E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {loading && <div className="loader-overlay">Mise à jour des données...</div>}
    </div>
  )
}

export default CompareView
