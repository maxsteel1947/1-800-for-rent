import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Tenants from './pages/Tenants'
import TenantDetail from './pages/TenantDetail'
import { useParams } from 'react-router-dom'
import Payments from './pages/Payments'
import Documents from './pages/Documents'
import Maintenance from './pages/Maintenance'
import Login from './pages/Login'
import Nav from './components/Nav'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import api from './api'

export default function App(){
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AuthenticatedApp />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

function AuthenticatedApp() {
  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  )
}

function DashboardWrapper(){
  const [dashboard, setDashboard] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  
  React.useEffect(()=>{
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const response = await api.get('/dashboard')
        setDashboard(response.data)
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '18px', color: '#e53e3e' }}>Error: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            marginTop: '16px', 
            padding: '8px 16px', 
            background: '#667eea', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return <Dashboard data={dashboard} />
}

function TenantDetailWrapper(){
  const { id } = useParams();
  return <TenantDetail id={id} />
}
