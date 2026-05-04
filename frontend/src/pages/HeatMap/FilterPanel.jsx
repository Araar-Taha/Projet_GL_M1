import { useState, useEffect } from 'react'
import { getDepartements, getCommunes } from '../../services/territories.service'
import './FilterPanel.css'

const TYPES_MUTATION = [
  { value: '', label: 'Tous les types' },
  { value: 'Vente', label: 'Vente' },
  { value: "Vente en l'état futur d'achèvement", label: "Vente en l'état futur d'achèvement" },
  { value: 'Vente terrain à bâtir', label: 'Vente terrain à bâtir' },
  { value: 'Echange', label: 'Échange' },
  { value: 'Expropriation', label: 'Expropriation' },
  { value: 'Adjudication', label: 'Adjudication' },
]

function FilterPanel({
  filters,
  onFiltersChange,
  mode,
  onModeChange,
  territoireA,
  territoireB,
  onTerritoireAChange,
  onTerritoireBChange,
  intensityType,
  onIntensityTypeChange,
}) {
  const [departements, setDepartements] = useState([])
  const [communes, setCommunes] = useState([])

  // Chargement initial des départements
  useEffect(() => {
    getDepartements()
      .then(data => setDepartements(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Erreur service:", err);
        setDepartements([]);
      });
  }, []);

  // Chargement des communes quand le département change
  useEffect(() => {
    if (filters.departement) {
      getCommunes(filters.departement)
        .then(setCommunes)
        .catch(() => setCommunes([]))
    } else {
      setCommunes([])
    }
  }, [filters.departement])

  // Mise à jour immédiate des filtres côté parent (réactivité totale)
  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (key === 'departement') {
      newFilters.commune = '';
    }
    onFiltersChange(newFilters);
  }

  return (
    <div className="filter-panel">
      <h3 className="filter-title">Filtres</h3>

      <div className="filter-group">
        <label>Département</label>
        <select
          value={filters.departement || ''}
          onChange={(e) => updateFilter('departement', e.target.value)}
        >
          <option value="">Tous les départements</option>
          {departements.map((dep) => (
            <option key={dep.code} value={dep.code}>{dep.nom}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Commune</label>
        <select
          value={filters.commune || ''}
          onChange={(e) => updateFilter('commune', e.target.value)}
          disabled={!filters.departement}
        >
          <option value="">Toutes les communes</option>
          {communes.map((com) => (
            <option key={com.code} value={com.code}>{com.nom}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Type de mutation</label>
        <select
          value={filters.typeMutation || ''}
          onChange={(e) => updateFilter('typeMutation', e.target.value)}
        >
          {TYPES_MUTATION.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Période</label>
        <div className="filter-row">
          <input
            type="number"
            min="2014"
            max="2024"
            value={filters.anneeDebut || ''}
            onChange={(e) => updateFilter('anneeDebut', Number(e.target.value))}
            placeholder="Début"
          />
          <span className="filter-separator">—</span>
          <input
            type="number"
            min="2014"
            max="2024"
            value={filters.anneeFin || ''}
            onChange={(e) => updateFilter('anneeFin', Number(e.target.value))}
            placeholder="Fin"
          />
        </div>
      </div>

      <h3 className="filter-title">Mode</h3>
      <div className="mode-toggle">
        <button
          className={mode === 'explorer' ? 'active' : ''}
          onClick={() => onModeChange('explorer')}
        >
          Explorer
        </button>
        <button
          className={mode === 'comparer' ? 'active' : ''}
          onClick={() => onModeChange('comparer')}
        >
          Comparer
        </button>
      </div>
      
      {mode === 'explorer' && (
        <>
          <div className="filter-divider" />
          <h3 className="filter-title">Intensité Carte</h3>
          <div className="intensity-toggle">
            <button
              className={intensityType === 'count' ? 'active' : ''}
              onClick={() => onIntensityTypeChange('count')}
            >
              Volume
            </button>
            <button
              className={intensityType === 'avgPrice' ? 'active' : ''}
              onClick={() => onIntensityTypeChange('avgPrice')}
            >
              Prix m²
            </button>
          </div>
        </>
      )}

      {mode === 'comparer' && (
        <div className="compare-selectors">
          <div className="filter-group">
            <label>Territoire A</label>
            <select
              value={territoireA?.code || ''}
              onChange={(e) => {
                const dep = departements.find((d) => d.code === e.target.value)
                onTerritoireAChange(dep || null)
              }}
            >
              <option value="">Sélectionner...</option>
              {departements.map((dep) => (
                <option key={dep.code} value={dep.code}>{dep.nom}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Territoire B</label>
            <select
              value={territoireB?.code || ''}
              onChange={(e) => {
                const dep = departements.find((d) => d.code === e.target.value)
                onTerritoireBChange(dep || null)
              }}
            >
              <option value="">Sélectionner...</option>
              {departements.map((dep) => (
                <option key={dep.code} value={dep.code}>{dep.nom}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterPanel