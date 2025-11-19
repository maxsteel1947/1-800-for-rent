import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Nav.css'

function classFor({isActive}){
  return isActive ? 'nav-link active' : 'nav-link'
}

export default function Nav(){
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="card sidebar">
      <div className="brand">
        <div className="brand-logo">🏢</div>
        <div className="brand-text">
          <div className="brand-name">RentManager Pro</div>
          <div className="brand-subtitle">Property Management</div>
        </div>
      </div>
      
      <div className="user-info">
        <div className="user-avatar">
          {user?.fullName?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="user-details">
          <div className="user-name">{user?.fullName || 'User'}</div>
          <div className="user-company">{user?.companyName || 'Personal Account'}</div>
        </div>
      </div>

      <ul className="nav-list">
        <li><NavLink to="/" className={classFor}>📊 Dashboard</NavLink></li>
        <li><NavLink to="/tenants" className={classFor}>👥 Tenants</NavLink></li>
        <li><NavLink to="/properties" className={classFor}>🏠 Properties</NavLink></li>
        <li><NavLink to="/payments" className={classFor}>💳 Payments</NavLink></li>
        <li><NavLink to="/documents" className={classFor}>📁 Documents</NavLink></li>
        <li><NavLink to="/maintenance" className={classFor}>🔧 Maintenance</NavLink></li>
        <li><NavLink to="/reports" className={classFor}>📈 Reports</NavLink></li>
      </ul>

      <div className="nav-footer">
        <button onClick={handleLogout} className="logout-button">
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}
