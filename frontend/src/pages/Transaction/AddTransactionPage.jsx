import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createTransaction } from '../../services/mutations.service'
import './AddTransactionPage.css'

// Importing the generated illustration
// Note: In a real project, this would be a path like /assets/illustration.png
// For this environment, we'll use the absolute path for demonstration
const ILLUSTRATION_PATH = '/data_entry_illustration_1777905066637.png'

export default function AddTransactionPage() {
    const { isAuthenticated, user } = useAuth()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        type_transaction: 'Vente',
        valeur_fonciere: '',
        nombre_mutation: '1',
        annee: new Date().getFullYear().toString(),
        code_postal: ''
    })
    const [status, setStatus] = useState({ type: '', message: '' })
    const [submitting, setSubmitting] = useState(false)

    // Ensure only logged in users can see this
    if (!isAuthenticated) {
        return (
            <div className="add-transaction-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div className="transaction-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🔒</div>
                    <h3>Accès sécurisé</h3>
                    <p>Veuillez vous connecter pour accéder à l'interface de saisie des données.</p>
                    <button className="submit-btn" onClick={() => navigate('/auth')}>Se connecter</button>
                </div>
            </div>
        )
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setStatus({ type: '', message: '' })

        try {
            await createTransaction(formData)
            setStatus({ type: 'success', message: 'La transaction a été enregistrée avec succès.' })
            setFormData({
                type_transaction: 'Vente',
                valeur_fonciere: '',
                nombre_mutation: '1',
                annee: new Date().getFullYear().toString(),
                code_postal: ''
            })
        } catch (error) {
            setStatus({ 
                type: 'error', 
                message: error.response?.data?.error || 'Erreur lors de l\'enregistrement. Veuillez vérifier les données.'
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="add-transaction-container">
            {/* Left Section: Hero & Info */}
            <aside className="add-transaction-hero">
                <div className="hero-info">
                    <span className="hero-badge">Contribution au Système</span>
                    <h1>Enrichissez la <br /><span style={{ color: '#a5b4fc' }}>Base Foncière</span></h1>
                    <p>
                        Vos contributions permettent d'affiner les analyses du marché immobilier. 
                        Remplissez le formulaire pour ajouter une nouvelle donnée transactionnelle.
                    </p>
                    
                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>+12k</div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Transactions</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>99.9%</div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>Précision</div>
                        </div>
                    </div>

                    <img 
                        src={ILLUSTRATION_PATH} 
                        alt="Data Illustration" 
                        className="hero-illustration"
                        onError={(e) => { e.target.style.display = 'none' }} // Fallback if image not found
                    />
                </div>
            </aside>

            {/* Right Section: The Form */}
            <main className="add-transaction-content">
                <div className="transaction-card">
                    <h2>Nouvelle Saisie</h2>
                    <p>Détails de la mutation foncière</p>

                    {status.message && (
                        <div className={`status-msg ${status.type}`}>
                            {status.type === 'success' ? '✅' : '❌'} {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="input-group full-width">
                                <label>Type de transaction</label>
                                <select 
                                    name="type_transaction" 
                                    value={formData.type_transaction} 
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Vente">Vente</option>
                                    <option value="Vente en l'état futur d'achèvement">Vente VEFA</option>
                                    <option value="Echange">Echange</option>
                                    <option value="Adjudication">Adjudication</option>
                                    <option value="Expropriation">Expropriation</option>
                                </select>
                            </div>

                            <div className="input-group full-width">
                                <label>Valeur foncière (€)</label>
                                <input 
                                    type="number" 
                                    name="valeur_fonciere" 
                                    value={formData.valeur_fonciere} 
                                    onChange={handleChange} 
                                    placeholder="Ex: 250000" 
                                    required 
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="input-group">
                                <label>Mutations</label>
                                <input 
                                    type="number" 
                                    name="nombre_mutation" 
                                    value={formData.nombre_mutation} 
                                    onChange={handleChange} 
                                    required 
                                    min="1"
                                />
                            </div>

                            <div className="input-group">
                                <label>Année</label>
                                <input 
                                    type="number" 
                                    name="annee" 
                                    value={formData.annee} 
                                    onChange={handleChange} 
                                    required 
                                    min="1990"
                                    max="2050"
                                />
                            </div>

                            <div className="input-group full-width">
                                <label>Code Postal</label>
                                <input 
                                    type="text" 
                                    name="code_postal" 
                                    value={formData.code_postal} 
                                    onChange={handleChange} 
                                    placeholder="Ex: 75001" 
                                    required 
                                    pattern="[0-9]{5}"
                                    title="5 chiffres requis"
                                />
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? 'Traitement...' : 'Enregistrer la transaction'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}

