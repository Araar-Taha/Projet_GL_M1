import { useState, useEffect } from 'react'
import FilterPanel from './FilterPanel'
import MapView from './MapView'
import InfoPanel from './InfoPanel'
import CompareView from './CompareView'
import DashboardGraphes from '../../components/DashboardGraphes'
import CustomGraph from '../../components/CustomGraph'
import { getDepartements } from '../../services/territories.service'
import './HeatMapPage.css'

function HeatMapPage() {
  const [mode, setMode] = useState('explorer')
  const [selectedCommune, setSelectedCommune] = useState(null)
  const [filters, setFilters] = useState({
    departement: '',
    commune: '',
    typeMutation: '',
    anneeDebut: 2020,
    anneeFin: 2024,
  })
  const [territoireA, setTerritoireA] = useState(null)
  const [territoireB, setTerritoireB] = useState(null)
  const [departements, setDepartements] = useState([])
  const [intensityType, setIntensityType] = useState('count') // 'count' ou 'avgPrice'

  // 1. Charger les départements pour avoir accès aux noms
  useEffect(() => {
    getDepartements().then(setDepartements).catch(() => setDepartements([]))
  }, [])

  // 2. Synchroniser le panneau de détails avec le filtre département
  useEffect(() => {
    if (filters.departement) {
      const dep = departements.find(d => d.code === filters.departement);
      if (dep && (!selectedCommune || selectedCommune.code !== dep.code)) {
        setSelectedCommune({
          code: dep.code,
          nom: dep.nom
        });
      }
    } else {
      setSelectedCommune(null);
    }
  }, [filters.departement, departements])

  return (
    <div className="page-container">
      
      {/* BLOC DU HAUT */}
      <div className="top-section">
        <div className="filters-sidebar">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            mode={mode}
            onModeChange={setMode}
            intensityType={intensityType}
            onIntensityTypeChange={setIntensityType}
            territoireA={territoireA}
            territoireB={territoireB}
            onTerritoireAChange={setTerritoireA}
            onTerritoireBChange={setTerritoireB}
          />
        </div>

        <div className="heatmap-center">
          {mode === 'explorer' ? (
            <MapView
              filters={filters}
              intensityType={intensityType}
              onCommuneSelect={(data) => {
                setSelectedCommune(data);
                // On synchronise le département sélectionné avec les filtres globaux
                setFilters(prev => ({ ...prev, departement: data.code }));
              }}
            />
          ) : (
            <CompareView
              territoireA={territoireA}
              territoireB={territoireB}
            />
          )}
        </div>


        {mode === 'explorer' && (
          <div className="info-sidebar">
            <InfoPanel commune={selectedCommune} filters={filters} />
          </div>
        )}
      </div>

      {/* BLOC DU BAS  */}
      <div className="bottom-section">
        {mode === 'explorer' && (
          <>
            <DashboardGraphes filters={filters} />
            <CustomGraph globalFilters={filters} />
          </>
        )}
      </div>

    </div>
  )
}

export default HeatMapPage