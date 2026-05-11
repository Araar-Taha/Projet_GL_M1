import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { useState, useEffect } from 'react'
import { getStatsByDept, getStatsByCommune, getMutationsStats } from '../../services/mutations.service'
import { getPopulationStatsByDept, getPopulationStatsByCommune } from '../../services/population.service'
import { getDepartements, getCommuneMapping } from '../../services/territories.service'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

// Composant interne pour gérer le zoom automatique
function AutoZoom({ filters, geoData, communeGeoData }) {
  const map = useMap()

  useEffect(() => {
    if (!geoData) return

    // Cas 1 : Aucun département sélectionné -> France
    if (!filters.departement) {
      map.setView([46.6, 2.5], 6, { animate: true, duration: 1 })
      return
    }

    // Cas 2 : Un département est sélectionné -> On zoom dessus
    const targetCode = filters.departement.toString().padStart(2, '0')
    const feature = geoData.features.find(f => f.properties.code === targetCode)

    if (feature) {
      const bounds = L.geoJSON(feature).getBounds()
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30], animate: true, duration: 1 })
      }
    }
  }, [filters.departement, geoData, map])

  return null
}

function getColor(value, maxValue) {
  const val = Number(value) || 0
  const max = Number(maxValue) || 1
  if (val <= 0) return '#f8fafc'
  
  // Échelle racine carrée
  const intensity = Math.sqrt(val / Math.max(max, 1))
  
  const colors = [
    '#e2dfff', // Niveau 0
    '#c3c0ff', // Niveau 1
    '#a4a0ff', // Niveau 2
    '#7c73ed', // Niveau 3
    '#6366f1', // Niveau 4
    '#4f46e5', // Niveau 5
    '#3730a3', // Niveau 6
  ]
  
  const index = Math.min(Math.floor(intensity * colors.length), colors.length - 1)
  return colors[index] || '#f8fafc'
}

function MapView({ filters, intensityType, onCommuneSelect }) {
  const [geoData, setGeoData] = useState(null)
  const [deptStats, setDeptStats] = useState({})
  const [communeGeoData, setCommuneGeoData] = useState(null)
  const [communeStats, setCommuneStats] = useState({})
  const [communeMapping, setCommuneMapping] = useState({})
  const [maxDeptCount, setMaxDeptCount] = useState(1)
  const [maxCommuneCount, setMaxCommuneCount] = useState(1)
  const [loading, setLoading] = useState(false)

  // 1. Charger le GeoJSON des départements
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
  }, [])

  // 2. Charger les statistiques (Départements et Communes)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setCommuneGeoData(null)
      setCommuneStats({})

      try {
        // 1. Charger les stats des départements
        const franceFilters = { ...filters };
        delete franceFilters.departement;
        delete franceFilters.commune;

        let dStats;
        if (intensityType === 'population') {
          dStats = await getPopulationStatsByDept();
        } else {
          dStats = await getStatsByDept(franceFilters);
        }
        setDeptStats(dStats)
        
        const dValues = Object.values(dStats)
          .map(s => Number(typeof s === 'object' ? s[intensityType] : s) || 0)
          .filter(v => !isNaN(v) && v > 0);
        
        setMaxDeptCount(dValues.length > 0 ? Math.max(...dValues) : 1)

        // 2. Stats Communes (si dept sélectionné)
        if (filters.departement) {
          const depCode = filters.departement.toString().padStart(2, '0')
          
          let cStats;
          const [mapping, geo] = await Promise.all([
            getCommuneMapping(depCode),
            fetch(`https://geo.api.gouv.fr/departements/${depCode}/communes?format=geojson&geometry=contour`).then(res => res.json())
          ]);

          if (intensityType === 'population') {
            cStats = await getPopulationStatsByCommune(depCode);
          } else {
            cStats = await getStatsByCommune(depCode, filters);
          }
          
          setCommuneStats(cStats)
          setCommuneMapping(mapping)
          setCommuneGeoData(geo)
          
          const cValues = Object.values(cStats)
            .map(s => Number(typeof s === 'object' ? s[intensityType] : s) || Number(s) || 0)
            .filter(v => !isNaN(v) && v > 0);
          
          setMaxCommuneCount(cValues.length > 0 ? Math.max(...cValues) : 1)
        }
      } catch (err) {
        console.error("Erreur chargement données HeatMap:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [filters.departement, filters.anneeDebut, filters.anneeFin, filters.typeMutation, intensityType])

  // Helper pour extraire la valeur selon le type d'intensité
  const getValue = (stat) => {
    if (stat === undefined || stat === null) return 0
    return Number(typeof stat === 'object' ? stat[intensityType] : stat) || 0
  }

  const onEachFeature = (feature, layer) => {
    const { nom, code } = feature.properties
    const isCommune = code.length > 3
    const lookupCode = isCommune ? (communeMapping[code] || code) : code
    const stat = isCommune ? communeStats[lookupCode] : deptStats[code]
    const value = getValue(stat)

    const label = intensityType === 'population'
      ? `${value.toLocaleString()} habitants`
      : intensityType === 'count' 
        ? `${value.toLocaleString()} ventes` 
        : `${value.toLocaleString()} €/m²`

    layer.bindTooltip(`<b>${nom} (${code})</b><br/>${label}`, {
      sticky: true,
      className: 'map-tooltip',
    })

    layer.on('click', async () => {
      if (!isCommune) {
        onCommuneSelect({ 
          code, 
          nom, 
          population: intensityType === 'population' ? value : undefined 
        })
        return
      }

      setLoading(true)
      try {
        const stats = await getMutationsStats(lookupCode, filters)
        onCommuneSelect({
          code,
          nom,
          prixM2: stats.prixMoyen,
          ventes: stats.totalVentes,
          transactions: stats.nombreTransactions,
          population: stats.population
        })
      } catch (err) {
        console.error('Error fetching commune stats:', err)
      } finally {
        setLoading(false)
      }
    })

    layer.on('mouseover', () => layer.setStyle({ fillOpacity: 0.9, weight: 3, color: '#4F46E5' }))
    layer.on('mouseout', () => layer.setStyle({ fillOpacity: 0.7, weight: 1, color: '#ffffff' }))
  }

  const style = (feature) => {
    const { code } = feature.properties
    const isCommune = code.length > 3
    const lookupCode = isCommune ? (communeMapping[code] || code) : code
    const stat = isCommune ? communeStats[lookupCode] : deptStats[code]
    
    const value = getValue(stat)
    const currentMax = isCommune ? maxCommuneCount : maxDeptCount

    const isSelected = isCommune 
      ? (filters.commune === code)
      : (filters.departement === code && !filters.commune)

    return {
      fillColor: getColor(value, currentMax),
      weight: isSelected ? 3 : 1,
      color: isSelected ? '#4F46E5' : '#ffffff',
      fillOpacity: isCommune ? 0.8 : (isSelected ? 0.9 : 0.7),
    }
  }

  return (
    <div className={`map-container ${loading ? 'loading-map' : ''}`}>
      <MapContainer
        center={[46.6, 2.5]}
        zoom={6}
        className="leaflet-map"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; OSM'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />

        {geoData && (
          <>
            {/* Couche 1 : Les départements (toujours visible en fond) */}
            <GeoJSON
              key={`depts-${intensityType}-${filters.departement}-${filters.anneeDebut}-${Object.keys(deptStats).length}`}
              data={geoData}
              style={style}
              onEachFeature={onEachFeature}
            />
            
            {/* Couche 2 : Les communes (uniquement si un département est sélectionné) */}
            {filters.departement && communeGeoData && (
              <GeoJSON
                key={`communes-${filters.departement}-${intensityType}`}
                data={communeGeoData}
                style={style}
                onEachFeature={onEachFeature}
              />
            )}
            
            <AutoZoom 
              filters={filters} 
              geoData={geoData} 
              communeGeoData={communeGeoData} 
            />
          </>
        )}
      </MapContainer>

      <div className="map-legend">
        <span className="legend-label">Faible intensité</span>
        <div className="legend-gradient" />
        <span className="legend-label">Forte intensité</span>
      </div>

      {loading && <div className="map-loader">Chargement des données...</div>}
    </div>
  )
}

export default MapView
