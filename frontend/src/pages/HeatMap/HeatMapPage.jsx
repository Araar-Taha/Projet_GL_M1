import { useState } from 'react'
import FilterPanel from './FilterPanel'
import MapView from './MapView'
import InfoPanel from './InfoPanel'
import CompareView from './CompareView'
import DashboardGraphes from '../../components/DashboardGraphes'
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
    <div className="page-container">
      
      {/* BLOC DU HAUT (Filtres + Carte + Info) */}
      <div className="top-section">
        
        <div className="filters-sidebar">
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
        </div>

        <div className="heatmap-center">
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
        </div>

        {/* Le panneau est TOUJOURS là maintenant, comme tu le voulais ! */}
        {mode === 'explorer' && (
          <div className="info-sidebar">
            <InfoPanel commune={selectedCommune} />
          </div>
        )}
        
      </div>

      {/* BLOC DU BAS (Graphiques) */}
      <div className="bottom-section">
        <DashboardGraphes />
      </div>

    </div>
  )
}

export default HeatMapPage