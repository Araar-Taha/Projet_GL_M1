import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

// Fonction pour calculer la couleur selon l'intensité (0 à 1)
function getColor(intensity) {
  const colors = [
    '#e2dfff', // très faible
    '#c3c0ff', // faible
    '#a4a0ff', // moyen-faible
    '#7c73ed', // moyen
    '#6359d8', // moyen-fort
    '#4F46E5', // fort
    '#3525cd', // très fort
  ]
  const index = Math.min(Math.floor(intensity * colors.length), colors.length - 1)
  return colors[index]
}

function MapView({ filters, onCommuneSelect }) {
  const [geoData, setGeoData] = useState(null)

  useEffect(() => {
    // Charger le GeoJSON des départements
    fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
  }, [])

  const onEachFeature = (feature, layer) => {
    const nom = feature.properties.nom
    const code = feature.properties.code

    // Tooltip au survol
    layer.bindTooltip(`${nom} (${code})`, {
      sticky: true,
      className: 'map-tooltip',
    })

    // Clic → sélection
    layer.on('click', () => {
      onCommuneSelect({
        code,
        nom,
      })
    })

    // Hover effect
    layer.on('mouseover', () => {
      layer.setStyle({ fillOpacity: 0.8, weight: 2 })
    })
    layer.on('mouseout', () => {
      layer.setStyle({ fillOpacity: 0.6, weight: 1 })
    })
  }

  const style = (feature) => {
    // Intensité mockée basée sur le code département
    const mockIntensity = (parseInt(feature.properties.code, 10) % 20) / 20
    return {
      fillColor: getColor(mockIntensity),
      weight: 1,
      color: '#ffffff',
      fillOpacity: 0.6,
    }
  }

  return (
    <div className="map-container">
      <MapContainer
        center={[46.6, 2.5]}
        zoom={6}
        className="leaflet-map"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
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

      {/* Légende */}
      <div className="map-legend">
        <span className="legend-label">Faible</span>
        <div className="legend-gradient" />
        <span className="legend-label">Élevé</span>
      </div>
    </div>
  )
}

export default MapView
