import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, isAuthenticated } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>DVF Explorer</h1>
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink to="/auth" className={`nav-account-link ${isAuthenticated && user ? 'nav-avatar-link' : ''}`}>
            {isAuthenticated && user ? (
              <span className="nav-avatar">{(user.prenom || user.nom || user.email || '?').charAt(0).toUpperCase()}</span>
            ) : (
              'Compte'
            )}
          </NavLink>
        </li>
        <li>
          <NavLink to="/" end>
            HeatMap
          </NavLink>
        </li>
        <li>
          <NavLink to="/classement">
            Classement
          </NavLink>
        </li>
        {isAuthenticated && (
          <li>
            <NavLink to="/ajouter">
              Ajouter des données
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  )
}

export default Navbar
