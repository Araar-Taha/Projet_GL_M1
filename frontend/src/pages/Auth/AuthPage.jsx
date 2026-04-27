import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AuthPage.css'

function AuthPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading, login, register, logout, updateProfile, changePassword, deleteAccount } = useAuth()
  const [view, setView] = useState('login')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_pass: '',
  })
  const [passwordData, setPasswordData] = useState({
    ancien_mot_de_pass: '',
    nouveau_mot_de_pass: '',
  })
  const [editMode, setEditMode] = useState(false)
  const [passwordMode, setPasswordMode] = useState(false)
  const [editData, setEditData] = useState({ nom: '', prenom: '', email: '' })

  // Switch to profile view when authenticated
  useEffect(() => {
    if (isAuthenticated && !isAuthenticating) {
      setView('profile')
    }
  }, [isAuthenticated, isAuthenticating])

  // Pre-fill edit form when user changes
  useEffect(() => {
    if (user) {
      setEditData({ nom: user.nom || '', prenom: user.prenom || '', email: user.email || '' })
    }
  }, [user])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsAuthenticating(true)
    try {
      await login({ email: formData.email, mot_de_pass: formData.mot_de_pass })
      setTimeout(() => {
        setIsAuthenticating(false)
        navigate('/')
      }, 1200)
    } catch (err) {
      setIsAuthenticating(false)
      setError(err.response?.data?.error || 'Erreur de connexion')
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
        mot_de_pass: formData.mot_de_pass,
      })
      setTimeout(() => {
        setIsAuthenticating(false)
        navigate('/')
      }, 1200)
    } catch (err) {
      setIsAuthenticating(false)
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription')
    }
  }

  const handleLogout = () => {
    logout()
    setView('login')
    setFormData({ nom: '', prenom: '', email: '', mot_de_pass: '' })
    setSuccess('')
    setError('')
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await updateProfile(editData)
      setEditMode(false)
      setSuccess('Profil mis à jour !')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await changePassword(passwordData)
      setPasswordData({ ancien_mot_de_pass: '', nouveau_mot_de_pass: '' })
      setPasswordMode(false)
      setSuccess('Mot de passe modifié !')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du changement de mot de passe')
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return
    try {
      await deleteAccount()
      setView('login')
      setFormData({ nom: '', prenom: '', email: '', mot_de_pass: '' })
      setSuccess('Compte supprimé')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression')
    }
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

  if (loading) {
    return (
      <div className="auth-split-container">
        <section className="auth-form-wrapper" style={{ flex: 1 }}>
          <div className="auth-card">
            <div className="auth-loading">
              <div className="loader"></div>
              <h3>Chargement...</h3>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="auth-split-container">
      <section className="auth-hero">
        <div className="hero-content animate-slide-up">
          <h1>Explorez les données foncières, <span className="text-gradient">simplement.</span></h1>
          <p>
            Accédez aux prix de vente réels, analysez les tendances du marché et
            prenez des décisions éclairées.
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
          ) : view === 'profile' && user ? (
            <div className="profile-view">
              <div className="profile-avatar">
                {(user.prenom || user.nom || user.email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="profile-header">
                <h2>Bienvenue, {user.prenom || user.nom || 'Utilisateur'}</h2>
                <p>{user.email}</p>
              </div>

              {error && <div className="auth-error">{error}</div>}
              {success && <div className="auth-success">{success}</div>}

              {editMode ? (
                <form className="auth-form" onSubmit={handleUpdateProfile}>
                  <div className="form-group">
                    <label>Nom</label>
                    <input type="text" value={editData.nom} onChange={(e) => setEditData({ ...editData, nom: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Prénom</label>
                    <input type="text" value={editData.prenom} onChange={(e) => setEditData({ ...editData, prenom: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} required />
                  </div>
                  <div className="profile-actions-row">
                    <button type="submit" className="btn-primary">Sauvegarder</button>
                    <button type="button" className="btn-secondary" onClick={() => setEditMode(false)}>Annuler</button>
                  </div>
                </form>
              ) : passwordMode ? (
                  <form className="auth-form" onSubmit={handleChangePassword}>
                    <h4 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', textAlign: 'center' }}>Sécurité</h4>
                    <div className="form-group">
                      <label>Ancien mot de passe</label>
                      <input type="password" value={passwordData.ancien_mot_de_pass} onChange={(e) => setPasswordData({ ...passwordData, ancien_mot_de_pass: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Nouveau mot de passe</label>
                      <input type="password" value={passwordData.nouveau_mot_de_pass} onChange={(e) => setPasswordData({ ...passwordData, nouveau_mot_de_pass: e.target.value })} required />
                    </div>
                    <div className="profile-actions-row">
                      <button type="submit" className="btn-primary">Valider</button>
                      <button type="button" className="btn-secondary" onClick={() => setPasswordMode(false)}>Annuler</button>
                    </div>
                  </form>
              ) : (
                <div className="profile-details-card">
                  <div className="info-list">
                    <div className="info-item">
                      <span className="info-label">Nom</span>
                      <span className="info-value">{user.nom || <span className="text-muted">Non renseigné</span>}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Prénom</span>
                      <span className="info-value">{user.prenom || <span className="text-muted">Non renseigné</span>}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email</span>
                      <span className="info-value">{user.email}</span>
                    </div>
                  </div>

                  <div className="profile-actions-grid">
                    <button className="btn-secondary" onClick={() => setEditMode(true)}>Modifier le profil</button>
                    <button className="btn-secondary" onClick={() => setPasswordMode(true)}>Changer le mot de passe</button>
                    <button className="btn-outline-primary" onClick={handleLogout}>Se déconnecter</button>
                  </div>

                  <div className="profile-danger-zone">
                    <button className="btn-text btn-delete" onClick={handleDeleteAccount}>Supprimer mon compte</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-form-container">
              <div className="auth-tabs">
                <button className={view === 'login' ? 'active' : ''} onClick={() => { setView('login'); setError('') }}>Connexion</button>
                <button className={view === 'signup' ? 'active' : ''} onClick={() => { setView('signup'); setError('') }}>Inscription</button>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form className="auth-form" onSubmit={view === 'login' ? handleLogin : handleSignup}>
                <h3>{view === 'login' ? 'Bon retour !' : 'Créer un compte'}</h3>
                <p className="auth-subtitle">
                  {view === 'login' ? 'Accédez à votre espace personnel.' : 'Rejoignez-nous dès maintenant.'}
                </p>
                {view === 'signup' && (
                  <>
                    <div className="form-group">
                      <label>Nom</label>
                      <input type="text" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} placeholder="Votre nom" />
                    </div>
                    <div className="form-group">
                      <label>Prénom</label>
                      <input type="text" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} placeholder="Votre prénom" />
                    </div>
                  </>
                )}
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="votre@email.com" required />
                </div>
                <div className="form-group">
                  <label>Mot de passe</label>
                  <input type="password" value={formData.mot_de_pass} onChange={(e) => setFormData({ ...formData, mot_de_pass: e.target.value })} placeholder="••••••••" required />
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
