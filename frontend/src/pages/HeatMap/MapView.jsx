import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { useState, useEffect } from 'react'
import { getMutationsStats, getStatsByDept } from '../../services/mutations.service'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

// Composant interne pour gérer le zoom automatique
function AutoZoom({ filters, geoData }) {
  const map = useMap()

  useEffect(() => {
    if (!geoData) return

    // Cas 1 : Aucun département sélectionné -> On revient sur la vue d'ensemble (France)
    if (!filters.departement) {
      map.setView([46.6, 2.5], 6, { animate: true, duration: 1 })
      return
    }

    // Cas 2 : Un département est sélectionné -> On zoom dessus
    // Normalisation du code (ex: "8" -> "08")
    const targetCode = filters.departement.toString().padStart(2, '0')
    
    // Trouver la feature du département sélectionné
    const feature = geoData.features.find(f => f.properties.code === targetCode)
    
    if (feature) {
      const layer = L.geoJSON(feature)
      const bounds = layer.getBounds()
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30], animate: true, duration: 1 })
      }
    } else {
      console.warn("AutoZoom: Département non trouvé dans le GeoJSON", targetCode)
    }
  }, [filters.departement, geoData, map])

  return null
}

function getColor(count, maxCount) {
  if (!count) return '#f8fafc' // Gris très clair si pas de données
  
  const intensity = count / maxCount
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
  return colors[index]
}

function MapView({ filters, onCommuneSelect }) {
  const [geoData, setGeoData] = useState(null)
  const [intensityStats, setIntensityStats] = useState({})
  const [maxCount, setMaxCount] = useState(1)
  const [loading, setLoading] = useState(false)

  // 1. Charger le GeoJSON des départements
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
  }, [])

  // 2. Charger les vraies stats d'intensité depuis le Backend
  useEffect(() => {
    getStatsByDept(filters).then(stats => {
      setIntensityStats(stats)
      const counts = Object.values(stats)
      if (counts.length > 0) {
        setMaxCount(Math.max(...counts))
      } else {
        setMaxCount(1) // Reset if no data
      }
    }).catch(err => console.error("Map intensity error:", err))
  }, [filters])

  const onEachFeature = (feature, layer) => {
    const { nom, code } = feature.properties
    const count = intensityStats[code] || 0

    layer.bindTooltip(`<b>${nom} (${code})</b><br/>${count} ventes répertoriées`, {
      sticky: true,
      className: 'map-tooltip',
    })

    layer.on('click', async () => {
      setLoading(true)
      try {
        const stats = await getMutationsStats(code)
        onCommuneSelect({
          code,
          nom,
          prixM2: stats.prixMoyen,
          ventes: stats.totalVentes,
          transactions: stats.nombreTransactions
        })
      } catch (err) {
        console.error('Error fetching stats for map click:', err)
      } finally {
        setLoading(false)
      }
    })

    layer.on('mouseover', () => {
      layer.setStyle({ fillOpacity: 0.9, weight: 3, color: '#4F46E5' })
    })
    layer.on('mouseout', () => {
      layer.setStyle({ fillOpacity: 0.7, weight: 1, color: '#ffffff' })
    })
  }

  const style = (feature) => {
    const code = feature.properties.code
    const count = intensityStats[code] || 0
    const isSelected = filters.departement === code

    return {
      fillColor: getColor(count, maxCount),
      weight: isSelected ? 3 : 1,
      color: isSelected ? '#4F46E5' : '#ffffff',
      fillOpacity: isSelected ? 0.9 : 0.7,
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
            <GeoJSON
              key={`map-${maxCount}-${filters.departement}`}
              data={geoData}
              style={style}
              onEachFeature={onEachFeature}
            />
            <AutoZoom filters={filters} geoData={geoData} />
          </>
        )}
      </MapContainer>

      <div className="map-legend">
        <span className="legend-label">Forte densité</span>
        <div className="legend-gradient" />
        <span className="legend-label">Faible densité</span>
      </div>
      
      {loading && <div className="map-loader">Chargement des données...</div>}
    </div>
  )
}

export default MapView
