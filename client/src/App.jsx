import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Tenants from './pages/Tenants'
import TenantDetail from './pages/TenantDetail'
import { useParams } from 'react-router-dom'
import Payments from './pages/Payments'
import Documents from './pages/Documents'
import Maintenance from './pages/Maintenance'
import Nav from './components/Nav'

export default function App(){
  return (
    <BrowserRouter>
      <div className="app-container">
        <Nav />
        <main className="main">
          <div className="header">
            <h1>Dashboard — 1-800-for-rent</h1>
          </div>
          <div className="card">
            <Routes>
              <Route path="/" element={<DashboardWrapper/>} />
              <Route path="/tenants" element={<Tenants/>} />
              <Route path="/tenants/:id" element={<TenantDetailWrapper/>} />
              <Route path="/payments" element={<Payments/>} />
              <Route path="/documents" element={<Documents/>} />
              <Route path="/maintenance" element={<Maintenance/>} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}

function DashboardWrapper(){
  const [dashboard, setDashboard] = React.useState(null)
  React.useEffect(()=>{
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api/dashboard')
      .then(r=>r.json()).then(d=>setDashboard(d)).catch(()=>{})
  },[])

  return <Dashboard data={dashboard} />
}

function TenantDetailWrapper(){
  const { id } = useParams();
  return <TenantDetail id={id} />
}
