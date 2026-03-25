import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './AuthPage.css'

function AuthPage() {
  const navigate = useNavigate()
  const [view, setView] = useState('login')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [formData, setFormData] = useState({
    username: 'Hakim',
    email: 'hakim@example.com',
    password: ''
  })

  // Redirect if "entering" the account
  const handleAuthSuccess = () => {
    setIsAuthenticating(true)
    setTimeout(() => {
      navigate('/')
    }, 1500)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    handleAuthSuccess()
  }

  const handleSignup = (e) => {
    e.preventDefault()
    handleAuthSuccess()
  }

  const handleLogout = () => {
    // For demo purposes, we stay on this page
    setView('login')
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

      <rect className="window w-1" x="400" y="80" width="15" height="20" fill="#FDE68A" />
      <rect className="window w-2" x="430" y="80" width="15" height="20" fill="#FDE68A" />
      <rect className="window w-3" x="460" y="80" width="15" height="20" fill="#FDE68A" />
      <rect className="window w-4" x="400" y="120" width="15" height="20" fill="#FDE68A" />
      <rect className="window w-5" x="250" y="130" width="12" height="15" fill="#FDE68A" />
      <rect className="window w-6" x="280" y="130" width="12" height="15" fill="#FDE68A" />
      <rect className="window w-7" x="540" y="160" width="15" height="20" fill="#FDE68A" />
    </svg>
  )

  return (
    <div className="auth-split-container">
      <section className="auth-hero">
        <div className="hero-content animate-slide-up">
          <h1>Explorez les données foncières, <span className="text-gradient">simplement.</span></h1>
          <p>
            Accédez aux prix de vente réels, analysez les tendances du marché et
            Zidou mn 3ndkoul a chkoupi.
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
              <h3>Connexion en cours...</h3>
              <p>Préparation de votre espace DVF Explorer</p>
            </div>
          ) : view === 'profile' ? (
            <div className="profile-view">
              <div className="profile-avatar">
                {formData.username.charAt(0)}
              </div>
              <div className="profile-header">
                <h2>Bienvenue, {formData.username}</h2>
                <p>{formData.email}</p>
              </div>
              <div className="profile-actions">
                <button className="btn-secondary" onClick={() => alert('Modification simulée !')}>Modifier le profil</button>
                <button className="btn-danger" onClick={handleLogout}>Se déconnecter</button>
                <button className="btn-text btn-delete" onClick={() => { if (window.confirm('Supprimer ce compte fictif ?')) handleLogout() }}>Supprimer le compte</button>
              </div>
            </div>
          ) : (
            <div className="auth-form-container">
              <div className="auth-tabs">
                <button className={view === 'login' ? 'active' : ''} onClick={() => setView('login')}>Connexion</button>
                <button className={view === 'signup' ? 'active' : ''} onClick={() => setView('signup')}>Inscription</button>
              </div>
              <form className="auth-form" onSubmit={view === 'login' ? handleLogin : handleSignup}>
                <h3>{view === 'login' ? 'Bon retour !' : 'Créer un compte'}</h3>
                <p className="auth-subtitle">
                  {view === 'login' ? 'Accédez à votre espace personnel.' : 'Rejoignez-nous dès maintenant.'}
                </p>
                <div className="form-group">
                  <label>Nom d'utilisateur</label>
                  <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Ex: Hakim" required />
                </div>
                {view === 'signup' && (
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="votre@email.com" required />
                  </div>
                )}
                <div className="form-group">
                  <label>Mot de passe</label>
                  <input type="password" placeholder="••••••••" required />
                </div>
                <button type="submit" className="btn-primary">{view === 'login' ? 'Se connecter' : "S'inscrire"}</button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default AuthPage
