import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AuthPage.css'

function AuthPage() {
  const navigate = useNavigate()
  const { user, login, register, logout } = useAuth()
  const [tab, setTab] = useState('login') // 'login' ou 'signup', utilisé seulement si pas connecté
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: ''
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsAuthenticating(true)
    try {
      await login({ email: formData.email, mot_de_pass: formData.password })
      setTimeout(() => navigate('/'), 1000)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la connexion')
      setIsAuthenticating(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setIsAuthenticating(true)
    try {
      await register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        mot_de_pass: formData.password
      })
      setTimeout(() => navigate('/'), 1000)
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription")
      setIsAuthenticating(false)
    }
  }

  const handleLogout = () => {
    logout()
    setTab('login')
  }

  const BuildingsSVG = () => (
    <svg className="buildings-svg" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect className="b-bg b-slow b-1" x="50" y="300" width="40" height="100" fill="#CBD5E1" opacity="0.3" />
      <rect className="b-bg b-slow b-2" x="120" y="250" width="50" height="150" fill="#CBD5E1" opacity="0.4" />
      <rect className="b-bg b-slow b-3" x="650" y="280" width="60" height="120" fill="#CBD5E1" opacity="0.3" />
      <rect className="b-mg b-4" x="180" y="200" width="70" height="200" fill="#94A3B8" />
      <rect className="b-mg b-5" x="280" y="150" width="90" height="250" fill="#64748B" />
      <rect className="b-mg b-6" x="420" y="220" width="60" height="180" fill="#94A3B8" />
      <rect className="b-mg b-7" x="550" y="180" width="80" height="220" fill="#64748B" />
      <rect className="b-fg b-8" x="230" y="100" width="100" height="300" fill="#4F46E5" />
      <rect className="b-fg b-9" x="380" y="50" width="120" height="350" fill="#6366F1" />
      <rect className="b-fg b-10" x="520" y="130" width="80" height="270" fill="#4F46E5" />
    </svg>
  )

  return (
    <div className="auth-split-container">
      <section className="auth-hero">
        <div className="hero-content animate-slide-up">
          <h1>Explorez les données foncières, <span className="text-gradient">simplement.</span></h1>
          <p>
            Accédez aux prix de vente réels, analysez les tendances du marché et 
            optimisez vos décisions immobilières grâce à nos outils d'analyse avancés.
          </p>
        </div>
        <div className="hero-visual">
          <BuildingsSVG />
        </div>
      </section>

      <section className="auth-form-wrapper">
        <div className="auth-card">
          {isAuthenticating ? (
            <div className="auth-loading">
              <div className="loader"></div>
              <h3>Action en cours...</h3>
              <p>Préparation de votre espace DVF Explorer</p>
            </div>
          ) : user ? (
            <div className="profile-view">
              <div className="profile-avatar">
                {user.prenom?.charAt(0) || user.email.charAt(0)}
              </div>
              <div className="profile-header">
                <h2>{user.prenom} {user.nom}</h2>
                <p>{user.email}</p>
              </div>
              <div className="profile-actions">
                <button className="btn-secondary" onClick={() => navigate('/')}>Retour à la carte</button>
                <button className="btn-danger" onClick={handleLogout}>Se déconnecter</button>
              </div>
            </div>
          ) : (
            <div className="auth-form-container">
              <div className="auth-tabs">
                <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>Connexion</button>
                <button className={tab === 'signup' ? 'active' : ''} onClick={() => setTab('signup')}>Inscription</button>
              </div>
              <form className="auth-form" onSubmit={tab === 'login' ? handleLogin : handleSignup}>
                <h3>{tab === 'login' ? 'Bon retour !' : 'Créer un compte'}</h3>

                {error && <div className="auth-error">{error}</div>}

                {tab === 'signup' && (
                  <div className="filter-row">
                    <div className="form-group">
                      <label>Prénom</label>
                      <input type="text" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} placeholder="Prénom" required />
                    </div>
                    <div className="form-group">
                      <label>Nom</label>
                      <input type="text" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} placeholder="Nom" required />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="votre@email.com" required />
                </div>

                <div className="form-group">
                  <label>Mot de passe</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" required />
                </div>

                <button type="submit" className="btn-primary">
                  {tab === 'login' ? 'Se connecter' : "S'inscrire"}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default AuthPage
