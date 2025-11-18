import React from 'react'
import { NavLink } from 'react-router-dom'

function classFor({isActive}){
  return isActive ? 'nav-link active' : 'nav-link'
}

export default function Nav(){
  return (
    <aside className="card sidebar">
      <div className="brand">1-800-for-rent</div>
      <ul className="nav-list">
        <li><NavLink to="/" className={classFor}>Dashboard</NavLink></li>
        <li><NavLink to="/tenants" className={classFor}>Tenants</NavLink></li>
        <li><NavLink to="/payments" className={classFor}>Payments</NavLink></li>
        <li><NavLink to="/documents" className={classFor}>Documents</NavLink></li>
        <li><NavLink to="/maintenance" className={classFor}>Maintenance</NavLink></li>
      </ul>
    </aside>
  )
}
