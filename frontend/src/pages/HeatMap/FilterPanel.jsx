import { useState, useEffect } from 'react'
import { getDepartements, getCommunes } from '../../services/territories.service'
import { getMutations } from '../../services/mutations.service'
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
  onCommuneSelect, // Ajout de cette prop
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

  // Chargement des communes quand le département change (Source identique à la carte)
  useEffect(() => {
    let isMounted = true;
    if (filters.departement) {
      const depCode = String(filters.departement).padStart(2, '0');
      fetch(`https://geo.api.gouv.fr/departements/${depCode}/communes?format=json`)
        .then(res => res.json())
        .then(data => {
          if (isMounted) {
            // On harmonise le format : { code, nom }
            const formatted = data.map(c => ({
              code: String(c.code),
              nom: c.nom
            })).sort((a, b) => a.nom.localeCompare(b.nom));
            setCommunes(formatted);
          }
        })
        .catch(() => {
          if (isMounted) setCommunes([]);
        });
    } else {
      setCommunes([]);
    }
    return () => { isMounted = false; };
  }, [filters.departement])

  // Mise à jour immédiate des filtres côté parent (réactivité totale)
  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (key === 'departement') {
      newFilters.commune = '';
    }
    onFiltersChange(newFilters);
  }

  const handleExportCSV = async () => {
    try {
      const data = await getMutations(filters);
      if (!data || data.length === 0) {
        alert("Aucune donnée à exporter pour ces filtres.");
        return;
      }

      const headers = Object.keys(data[0]).join(',');
      const csvRows = data.map(row => 
        Object.values(row).map(val => `"${val}"`).join(',')
      );
      const csvContent = [headers, ...csvRows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `export_dvf_${filters.departement || 'france'}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
      alert("Une erreur est survenue lors de l'extraction des données.");
    }
  }

  return (
    <div className="filter-panel">
      <h3 className="filter-title">Filtres</h3>

      <div className="filter-group">
        <label>Département</label>
        <select
          value={String(filters.departement || '')}
          onChange={(e) => {
            const code = String(e.target.value);
            updateFilter('departement', code);
            const dep = departements.find(d => String(d.code) === code);
            onCommuneSelect(dep || null);
          }}
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
          value={String(filters.commune || '')}
          onChange={(e) => {
            const code = String(e.target.value);
            updateFilter('commune', code);
            const com = communes.find(c => String(c.code) === code);
            if (com) {
              onCommuneSelect(com);
            } else {
              // Si on remet "Toutes les communes", on réaffiche le département
              const dep = departements.find(d => String(d.code) === String(filters.departement));
              onCommuneSelect(dep || null);
            }
          }}
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
              Ventes
            </button>
            <button
              className={intensityType === 'avgPrice' ? 'active' : ''}
              onClick={() => onIntensityTypeChange('avgPrice')}
            >
              Prix m²
            </button>
            <button
              className={intensityType === 'population' ? 'active' : ''}
              onClick={() => onIntensityTypeChange('population')}
            >
              Population
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
      <div className="filter-divider" />
      
      <button className="export-button" onClick={handleExportCSV}>
        Extraire les données (.csv)
      </button>
    </div>
  )
}

export default FilterPanel