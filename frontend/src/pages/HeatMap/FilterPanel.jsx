import { useState, useEffect } from 'react'
import { getDepartements, getCommunes } from '../../services/territories.service'
import './FilterPanel.css'

const TYPES_MUTATION = [
  { value: '', label: 'Tous les types' },
  { value: 'Vente', label: 'Vente' },
  { value: "Vente en l'état futur d'achèvement", label: "Vente en l'état futur d'achèvement" },
  { value: 'Vente terrain à bâtir', label: 'Vente terrain à bâtir' },
  { value: 'Échange', label: 'Échange' },
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
}) {
  const [departements, setDepartements] = useState([])
  const [communes, setCommunes] = useState([])

  // État local pour stocker les modifs avant validation (Brouillon)
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync avec le parent si besoin (ex: reset ou init)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Chargement initial des départements
  useEffect(() => {
    getDepartements()
      .then(data => setDepartements(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Erreur service:", err);
        setDepartements([]);
      });
  }, []);

  // Chargement des communes dès que le département du BROUILLON change
  useEffect(() => {
    if (localFilters.departement) {
      getCommunes(localFilters.departement)
        .then(setCommunes)
        .catch(() => setCommunes([]))
    } else {
      setCommunes([])
    }
  }, [localFilters.departement])

  // Mise à jour du brouillon uniquement
  const updateFilter = (key, value) => {
    if (key === 'departement') {
      setLocalFilters({ ...localFilters, departement: value, commune: '' })
    } else {
      setLocalFilters({ ...localFilters, [key]: value })
    }
  }

  // Validation finale : on envoie le brouillon au parent pour l'API
  const handleExplorerClick = () => {
    onModeChange('explorer');
    onFiltersChange(localFilters); 
  };

  return (
    <div className="filter-panel">
      <h3 className="filter-title">Filtres</h3>

      <div className="filter-group">
        <label>Département</label>
        <select
          value={localFilters.departement || ''}
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
          value={localFilters.commune || ''}
          onChange={(e) => updateFilter('commune', e.target.value)}
          disabled={!localFilters.departement}
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
          value={localFilters.typeMutation || ''}
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
            value={localFilters.anneeDebut || ''}
            onChange={(e) => updateFilter('anneeDebut', Number(e.target.value))}
            placeholder="Début"
          />
          <span className="filter-separator">—</span>
          <input
            type="number"
            min="2014"
            max="2024"
            value={localFilters.anneeFin || ''}
            onChange={(e) => updateFilter('anneeFin', Number(e.target.value))}
            placeholder="Fin"
          />
        </div>
      </div>

      <div className="filter-divider" />

      <h3 className="filter-title">Mode</h3>
      <div className="mode-toggle">
        {/* Le clic ici valide tous les filtres locaux */}
        <button 
          className={mode === 'explorer' ? 'active' : ''} 
          onClick={handleExplorerClick}
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