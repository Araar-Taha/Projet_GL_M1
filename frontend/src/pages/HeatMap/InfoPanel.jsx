import { useState, useEffect } from 'react'
import { getMutationsStats } from '../../services/mutations.service'
import './InfoPanel.css'

function InfoPanel({ commune, filters }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!commune) return

    const code = commune.code
    setLoading(true)
    
    // On récupère les stats globales pour le territoire avec les filtres (typeMutation, etc.)
    getMutationsStats(code, filters)
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching info stats:", err)
        setStats(null)
        setLoading(false)
      })
  }, [commune, filters])

  if (!commune) {
    return (
      <div className="info-panel empty">
        <p>Sélectionnez une zone pour voir les détails</p>
      </div>
    )
  }

  const isCommune = commune.code.length > 3

  return (
    <div className="info-panel">
      <div className="info-header">
        <span className="zone-badge">
          {isCommune ? `Commune ${commune.code}` : `Département ${commune.code}`}
        </span>
        <h2 className="zone-name">{commune.nom}</h2>
      </div>

      <div className="stats-kpi-container">
        <div className="kpi-card">
          <span className="kpi-label">Prix Moyen m²</span>
          <div className="kpi-value-row">
            <span className="kpi-value">
              {loading ? '...' : (stats?.prixMoyen ? `${stats.prixMoyen.toLocaleString()} €` : 'N/A')}
            </span>
            <span className="kpi-trend">Lissé</span>
          </div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Volume de ventes</span>
          <div className="kpi-value-row">
            <span className="kpi-value">
              {loading ? '...' : (stats?.totalVentes ? stats.totalVentes.toLocaleString() : 'N/A')}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Population</span>
          <div className="kpi-value-row">
            <span className="kpi-value">
              {commune.population ? commune.population.toLocaleString() : 'N/A'}
            </span>
            <span className="kpi-unit">Habitants</span>
          </div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Nb Transactions</span>
          <div className="kpi-value-row">
            <span className="kpi-value">
              {loading ? '...' : (stats?.nombreTransactions ? stats.nombreTransactions.toLocaleString() : 'N/A')}
            </span>
          </div>
        </div>
      </div>

      <div className="info-footer">
        <p>Données DVF consolidées (2014-2024)</p>
      </div>
    </div>
  )
}

export default InfoPanel