import { NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>DVF Explorer</h1>
      </div>
      <ul className="navbar-links">
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
        <li>
          <NavLink to="/admin">
            Admin
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
