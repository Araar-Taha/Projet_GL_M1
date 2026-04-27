import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { useState, useEffect } from 'react'
import { getMutationsStats } from '../../services/mutations.service'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

function getColor(intensity) {
  const colors = [
    '#e2dfff', '#c3c0ff', '#a4a0ff', '#7c73ed', '#6359d8', '#4F46E5', '#3525cd',
  ]
  const index = Math.min(Math.floor(intensity * colors.length), colors.length - 1)
  return colors[index]
}

function MapView({ filters, onCommuneSelect }) {
  const [geoData, setGeoData] = useState(null)
  const [loading, setLoading] = useState(false)

  // Charger le GeoJSON des départements
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
  }, [])

  const onEachFeature = (feature, layer) => {
    const { nom, code } = feature.properties

    layer.bindTooltip(`${nom} (${code})`, {
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
          population: 'N/A', // Sera complété par un autre appel si besoin
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
      layer.setStyle({ fillOpacity: 0.9, weight: 2, color: '#1a72ff' })
    })
    layer.on('mouseout', () => {
      layer.setStyle({ fillOpacity: 0.6, weight: 1, color: '#ffffff' })
    })
  }

  const style = (feature) => {
    // Pour l'instant, on garde une intensité basée sur le code pour la couleur 
    // tant qu'on n'a pas une route backend "map-intensity" globale
    const intensity = (parseInt(feature.properties.code, 10) % 20) / 20
    return {
      fillColor: getColor(intensity),
      weight: 1,
      color: '#ffffff',
      fillOpacity: 0.6,
    }
  }

  return (
    <div className={`map-container ${loading ? 'loading-map' : ''}`}>
      <MapContainer
        center={[46.6, 2.5]}
        zoom={6}
        className="leaflet-map"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OSM'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        {geoData && (
          <GeoJSON
            key={JSON.stringify(filters)}
            data={geoData}
            style={style}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      <div className="map-legend">
        <span className="legend-label">Faible</span>
        <div className="legend-gradient" />
        <span className="legend-label">Élevé</span>
      </div>
      
      {loading && <div className="map-loader">Chargement des données...</div>}
    </div>
  )
}

export default MapView

