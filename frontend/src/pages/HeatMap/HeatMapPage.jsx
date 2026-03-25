import { useState } from 'react'
import FilterPanel from './FilterPanel'
import MapView from './MapView'
import InfoPanel from './InfoPanel'
import CompareView from './CompareView'
import './HeatMapPage.css'

function HeatMapPage() {
  const [mode, setMode] = useState('explorer')
  const [selectedCommune, setSelectedCommune] = useState(null)
  const [filters, setFilters] = useState({
    departement: '',
    commune: '',
    typeMutation: '',
    anneeDebut: 2019,
    anneeFin: 2024,
  })
  const [territoireA, setTerritoireA] = useState(null)
  const [territoireB, setTerritoireB] = useState(null)

  return (
    <div className="heatmap-page">
      <aside className="heatmap-sidebar">
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          mode={mode}
          onModeChange={setMode}
          territoireA={territoireA}
          territoireB={territoireB}
          onTerritoireAChange={setTerritoireA}
          onTerritoireBChange={setTerritoireB}
        />
      </aside>

      <section className="heatmap-center">
        <MapView
          filters={filters}
          onCommuneSelect={setSelectedCommune}
        />
        {mode === 'comparer' && territoireA && territoireB && (
          <CompareView
            territoireA={territoireA}
            territoireB={territoireB}
          />
        )}
      </section>

      {mode === 'explorer' && (
        <aside className="heatmap-panel">
          <InfoPanel commune={selectedCommune} />
        </aside>
      )}
    </div>
  )
}

export default HeatMapPage
