import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createTransaction } from '../../services/transaction.service'
import '../Auth/AuthPage.css' // Reuse the nice forms styling

export default function AddTransactionPage() {
    const { isAuthenticated } = useAuth()
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
            <div className="auth-split-container" style={{ justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <h3>Accès refusé</h3>
                    <p>Vous devez être connecté pour ajouter des données.</p>
                    <button className="btn-primary" onClick={() => navigate('/auth')}>Se connecter</button>
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
            setStatus({ type: 'success', message: 'Saisie réussie ! La donnée foncière a bien été ajoutée au système.' })
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
                message: error.response?.data?.error || 'Une erreur est survenue lors de l\'enregistrement.'
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="auth-split-container" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <section className="auth-form-wrapper" style={{ flex: 1, margin: '0 auto', maxWidth: '600px' }}>
                <div className="auth-card">
                    <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>Ajouter une Transaction</h2>
                    <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>
                        Enregistrez une nouvelle donnée foncière dans la base de données.
                    </p>

                    {status.message && (
                        <div className={status.type === 'error' ? 'auth-error' : 'auth-success'}>
                            {status.message}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Type de transaction</label>
                            <select name="type_transaction" value={formData.type_transaction} onChange={handleChange} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '1rem' }}>
                                <option value="Vente">Vente</option>
                                <option value="Vente en l'état futur d'achèvement">Vente VEFA</option>
                                <option value="Echange">Echange</option>
                                <option value="Adjudication">Adjudication</option>
                                <option value="Expropriation">Expropriation</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Valeur foncière (€)</label>
                            <input 
                                type="number" 
                                name="valeur_fonciere" 
                                value={formData.valeur_fonciere} 
                                onChange={handleChange} 
                                placeholder="ex: 250000" 
                                required 
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="profile-actions-row">
                            <div className="form-group" style={{ flex: 1, marginTop: 0 }}>
                                <label>Nombre de mutations</label>
                                <input 
                                    type="number" 
                                    name="nombre_mutation" 
                                    value={formData.nombre_mutation} 
                                    onChange={handleChange} 
                                    required 
                                    min="1"
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1, marginTop: 0 }}>
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
                        </div>

                        <div className="form-group">
                            <label>Code Postal</label>
                            <input 
                                type="text" 
                                name="code_postal" 
                                value={formData.code_postal} 
                                onChange={handleChange} 
                                placeholder="ex: 75001" 
                                required 
                                pattern="[0-9]{5}"
                                title="Le code postal doit contenir exactement 5 chiffres."
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Enregistrement...' : 'Enregistrer la transaction'}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    )
}
