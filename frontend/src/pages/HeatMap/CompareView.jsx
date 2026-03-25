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
  const [mutationsData, setMutationsData] = useState([])

  useEffect(() => {
    Promise.all([
      getPrixEvolution(territoireA.code).catch(() => []),
      getPrixEvolution(territoireB.code).catch(() => []),
    ]).then(([dataA, dataB]) => {
      // Fusionner les données par année
      const merged = dataA.map((itemA, i) => ({
        annee: itemA.annee,
        territoireA: itemA.prix,
        territoireB: dataB[i]?.prix ?? null,
      }))
      setPrixData(merged)
    })

    Promise.all([
      getPopulationEvolution(territoireA.code).catch(() => []),
      getPopulationEvolution(territoireB.code).catch(() => []),
    ]).then(([dataA, dataB]) => {
      const merged = dataA.map((itemA, i) => ({
        annee: itemA.annee,
        territoireA: itemA.population,
        territoireB: dataB[i]?.population ?? null,
      }))
      setMutationsData(merged)
    })
  }, [territoireA, territoireB])

  return (
    <div className="compare-view">
      <h3 className="compare-title">
        Comparaison : {territoireA.nom} vs {territoireB.nom}
      </h3>

      <div className="compare-grid">
        {prixData.length > 0 && (
          <div className="compare-card">
            <h4>Évolution valeur m²</h4>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={prixData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
                <XAxis dataKey="annee" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={55} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Line type="monotone" dataKey="territoireA" name={territoireA.nom} stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="territoireB" name={territoireB.nom} stroke="#A44100" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {mutationsData.length > 0 && (
          <div className="compare-card">
            <h4>Évolution population</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mutationsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
                <XAxis dataKey="annee" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={55} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Bar dataKey="territoireA" name={territoireA.nom} fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="territoireB" name={territoireB.nom} fill="#A44100" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

export default CompareView
