import { useState, useEffect } from 'react'
import FilterPanel from './FilterPanel'
import MapView from './MapView'
import InfoPanel from './InfoPanel'
import CompareView from './CompareView'
import DashboardGraphes from '../../components/DashboardGraphes'
import { getMutationsStats } from '../../services/mutations.service'
import { getPopulationStatsByCommune } from '../../services/population.service'
import { getDepartements, getCommunes, getCommuneMapping } from '../../services/territories.service'
import CustomGraph from '../../components/CustomGraph'
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

  // 1. Charger les départements pour les noms au démarrage
  useEffect(() => {
    getDepartements().then(setDepartements).catch(() => setDepartements([]))
  }, [])

  const handleZoneSelect = async (data) => {
    if (!data) {
      setSelectedCommune(null);
      setFilters(prev => ({ ...prev, departement: '', commune: '' }));
      return;
    }

    // On affiche déjà ce qu'on a (nom, code)
    setSelectedCommune(data);
    
    // On met à jour les filtres
    if (data.code.length > 3) {
      const depCode = data.code.substring(0, 2);
      setFilters(prev => ({ ...prev, departement: depCode, commune: data.code }));
      
      // Si on n'a pas encore les stats (ex: sélection via menu), on les charge
      if (data.prixM2 === undefined) {
        try {
          // On a besoin du code postal pour les stats
          const mapping = await getCommuneMapping(depCode);
          const cp = mapping[data.code] || data.code;
          const stats = await getMutationsStats(cp, filters);
          
          // Récupération de la population si manquante via notre service local
          let population = data.population;
          if (population === undefined) {
             const popStats = await getPopulationStatsByCommune(depCode);
             population = popStats[cp] || 0;
          }

          setSelectedCommune(prev => ({
            ...prev,
            prixM2: stats.prixMoyen,
            ventes: stats.totalVentes,
            transactions: stats.nombreTransactions,
            population: population
          }));
        } catch (err) {
          console.error("Erreur chargement stats commune:", err);
        }
      }
    } else {
      setFilters(prev => ({ ...prev, departement: data.code, commune: '' }));
    }
  };

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
            onCommuneSelect={handleZoneSelect}
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
              onCommuneSelect={handleZoneSelect}
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