import { useState, useEffect } from 'react'
import { getCommuneInfo } from '../../services/territories.service'
import { getMutationsStats, getPrixEvolution } from '../../services/mutations.service'
import { getPopulationEvolution, getAgeDistribution } from '../../services/population.service'
import PriceEvolutionChart from './charts/PriceEvolutionChart'
import PopulationChart from './charts/PopulationChart'
import AgeDistributionChart from './charts/AgeDistributionChart'
import './InfoPanel.css'

function InfoPanel({ commune }) {
  const [stats, setStats] = useState(null)
  const [prixData, setPrixData] = useState([])
  const [populationData, setPopulationData] = useState([])
  const [ageData, setAgeData] = useState([])

  useEffect(() => {
    if (!commune) return

    const code = commune.code

    getCommuneInfo(code).then(setStats).catch(() => setStats(null))
    getPrixEvolution(code).then(setPrixData).catch(() => setPrixData([]))
    getPopulationEvolution(code).then(setPopulationData).catch(() => setPopulationData([]))
    getAgeDistribution(code).then(setAgeData).catch(() => setAgeData([]))
  }, [commune])

  if (!commune) {
    return (
      <div className="info-panel">
        <div className="info-empty">
          <p>Cliquez sur un département pour afficher ses informations</p>
        </div>
      </div>
    )
  }

  return (
    <div className="info-panel">
      <div className="info-header">
        <h2 className="info-title">📍 Détails de la zone</h2>
      </div>
      <h3 className="commune-name">{commune.nom}</h3>
      <span className="info-code">Code : {commune.code}</span>

      
      <div className="info-charts">
        {prixData.length > 0 && (
          <div className="chart-section">
            <h4>Évolution valeur m²</h4>
            <PriceEvolutionChart data={prixData} />
          </div>
        )}
        {populationData.length > 0 && (
          <div className="chart-section">
            <h4>Évolution population</h4>
            <PopulationChart data={populationData} />
          </div>
        )}
        {ageData.length > 0 && (
          <div className="chart-section">
            <h4>Tranches d'âge</h4>
            <AgeDistributionChart data={ageData} />
          </div>
        )}
      </div>
    </div>
  )
}

export default InfoPanel