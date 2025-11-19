import React, { useState, useEffect } from 'react'
import api from '../api'

export default function Maintenance(){
  const [tickets, setTickets] = useState([])
  const [tenants, setTenants] = useState([])
  const [properties, setProperties] = useState([])
  const [form, setForm] = useState({ 
    propertyId: '', 
    tenantId: '',
    room: '', 
    issue: '',
    priority: 'medium',
    category: 'general'
  })

  useEffect(() => {
    loadTickets()
    loadTenants()
    loadProperties()
  }, [])

  function loadTickets() {
    api.get('/maintenance').then(r => setTickets(r.data)).catch(() => {})
  }

  function loadTenants() {
    api.get('/tenants').then(r => setTenants(r.data)).catch(() => {})
  }

  function loadProperties() {
    api.get('/properties').then(r => setProperties(r.data)).catch(() => {})
  }

  function handleChange(e) {
    setForm({...form, [e.target.name]: e.target.value})
  }

  function handlePropertyChange(e) {
    const propertyId = e.target.value
    const selectedProperty = properties.find(p => p.id === propertyId)
    setForm({
      ...form,
      propertyId,
      tenantId: '',
      room: ''
    })
  }

  function handleTenantChange(e) {
    const tenantId = e.target.value
    const selectedTenant = tenants.find(t => t.id === tenantId)
    setForm({
      ...form,
      tenantId,
      propertyId: selectedTenant?.propertyId || form.propertyId,
      room: selectedTenant?.room || ''
    })
  }

  function create(e) {
    e.preventDefault()
    const payload = {
      ...form,
      status: 'open',
      createdAt: new Date().toISOString()
    }
    api.post('/maintenance', payload).then(() => {
      setForm({ 
        propertyId: '', 
        tenantId: '',
        room: '', 
        issue: '',
        priority: 'medium',
        category: 'general'
      })
      loadTickets()
    })
  }

  function setStatus(id, status) {
    api.put(`/maintenance/${id}`, { status }).then(() => loadTickets())
  }

  function remove(id) {
    if (window.confirm('Are you sure you want to delete this maintenance ticket?')) {
      api.delete(`/maintenance/${id}`).then(() => loadTickets())
    }
  }

  function getPriorityColor(priority) {
    switch(priority) {
      case 'high': return '#e53e3e'
      case 'medium': return '#ed8936'
      case 'low': return '#48bb78'
      default: return '#666'
    }
  }

  function getStatusColor(status) {
    switch(status) {
      case 'open': return '#e53e3e'
      case 'in_progress': return '#ed8936'
      case 'resolved': return '#48bb78'
      case 'closed': return '#718096'
      default: return '#666'
    }
  }

  function getCategoryLabel(category) {
    switch(category) {
      case 'electrical': return 'Electrical'
      case 'plumbing': return 'Plumbing'
      case 'carpentry': return 'Carpentry'
      case 'painting': return 'Painting'
      case 'cleaning': return 'Cleaning'
      case 'pest_control': return 'Pest Control'
      case 'security': return 'Security'
      case 'general': return 'General'
      default: return category
    }
  }

  function getAvailableRooms(propertyId) {
    if (!propertyId) return []
    const property = properties.find(p => p.id === propertyId)
    if (!property) return []
    
    return Array.from({length: property.rooms}, (_, i) => i + 1)
  }

  return (
    <div>
      <h2>Maintenance Management</h2>
      
      <div className="columns">
        <form onSubmit={create} className="form-column">
          <h3>Create Maintenance Ticket</h3>
          
          <div>
            <label>Select Property<br/>
              <select 
                name="propertyId" 
                value={form.propertyId} 
                onChange={handlePropertyChange}
              >
                <option value="">Choose a property...</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.name} - {property.address}
                  </option>
                ))}
              </select>
            </label>
          </div>
          
          <div>
            <label>Select Tenant (Optional)<br/>
              <select 
                name="tenantId" 
                value={form.tenantId} 
                onChange={handleTenantChange}
              >
                <option value="">Choose a tenant...</option>
                {tenants
                  .filter(tenant => !form.propertyId || tenant.propertyId === form.propertyId)
                  .map(tenant => {
                    const property = properties.find(p => p.id === tenant.propertyId)
                    return (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} - {property?.name || 'Unknown'} (Room {tenant.room})
                      </option>
                    )
                  })}
              </select>
            </label>
          </div>
          
          <div>
            <label>Room Number<br/>
              {form.tenantId ? (
                <input 
                  name="room" 
                  value={form.room} 
                  onChange={handleChange}
                  disabled
                  style={{background: '#f7fafc', cursor: 'not-allowed'}}
                />
              ) : (
                <select 
                  name="room" 
                  value={form.room} 
                  onChange={handleChange}
                >
                  <option value="">Select room...</option>
                  {getAvailableRooms(form.propertyId).map(room => (
                    <option key={room} value={room.toString()}>
                      Room {room}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
            <div>
              <label>Category<br/>
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="general">General</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="carpentry">Carpentry</option>
                  <option value="painting">Painting</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="pest_control">Pest Control</option>
                  <option value="security">Security</option>
                </select>
              </label>
            </div>
            <div>
              <label>Priority<br/>
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
          </div>
          
          <div>
            <label>Issue Description<br/>
              <textarea 
                name="issue" 
                value={form.issue} 
                onChange={handleChange}
                placeholder="Describe the maintenance issue in detail..."
                rows="4"
                required
              ></textarea>
            </label>
          </div>
          
          <div style={{marginTop: 12}}>
            <button type="submit">Create Ticket</button>
          </div>
        </form>

        <div className="list-column">
          <h3>Maintenance Tickets ({tickets.length})</h3>
          {tickets.length === 0 ? (
            <p style={{color: '#666', textAlign: 'center', padding: '20px'}}>
              No maintenance tickets created yet.
            </p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Property</th>
                    <th>Tenant</th>
                    <th>Room</th>
                    <th>Category</th>
                    <th>Issue</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map(ticket => {
                      const property = properties.find(p => p.id === ticket.propertyId)
                      const tenant = tenants.find(t => t.id === ticket.tenantId)
                      return (
                        <tr key={ticket.id} style={{borderTop:'1px solid #eee'}}>
                          <td style={{fontSize: '12px'}}>
                            #{ticket.id.slice(-6)}
                          </td>
                          <td>
                            {property ? property.name : 'Unknown Property'}
                          </td>
                          <td>
                            {tenant ? (
                              <div>
                                <div>{tenant.name}</div>
                                <small style={{color: '#666'}}>{tenant.phone}</small>
                              </div>
                            ) : (
                              <span style={{color: '#666'}}>-</span>
                            )}
                          </td>
                          <td>{ticket.room || '-'}</td>
                          <td>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              background: '#e2e8f0'
                            }}>
                              {getCategoryLabel(ticket.category)}
                            </span>
                          </td>
                          <td>
                            <div style={{maxWidth: '150px', fontSize: '12px'}}>
                              {ticket.issue}
                            </div>
                          </td>
                          <td>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              background: getPriorityColor(ticket.priority) + '20',
                              color: getPriorityColor(ticket.priority),
                              fontWeight: 'bold'
                            }}>
                              {ticket.priority.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              background: getStatusColor(ticket.status) + '20',
                              color: getStatusColor(ticket.status),
                              fontWeight: 'bold'
                            }}>
                              {ticket.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap'}}>
                              {ticket.status === 'open' && (
                                <button 
                                  onClick={() => setStatus(ticket.id, 'in_progress')}
                                  style={{ 
                                    padding: '2px 6px',
                                    fontSize: '11px',
                                    background: '#ed8936',
                                    color: 'white',
                                    border: 'none'
                                  }}
                                >
                                  Start
                                </button>
                              )}
                              {ticket.status === 'in_progress' && (
                                <button 
                                  onClick={() => setStatus(ticket.id, 'resolved')}
                                  style={{ 
                                    padding: '2px 6px',
                                    fontSize: '11px',
                                    background: '#48bb78',
                                    color: 'white',
                                    border: 'none'
                                  }}
                                >
                                  Resolve
                                </button>
                              )}
                              {ticket.status === 'resolved' && (
                                <button 
                                  onClick={() => setStatus(ticket.id, 'closed')}
                                  style={{ 
                                    padding: '2px 6px',
                                    fontSize: '11px',
                                    background: '#718096',
                                    color: 'white',
                                    border: 'none'
                                  }}
                                >
                                  Close
                                </button>
                              )}
                              <button 
                                onClick={() => remove(ticket.id)}
                                style={{ 
                                  color: '#e53e3e', 
                                  padding: '2px 6px',
                                  border: '1px solid #e53e3e',
                                  background: 'white',
                                  fontSize: '11px'
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{marginTop: '20px'}}>
        <h3>Maintenance Summary</h3>
        <div className="card-grid">
          <div className="card">
            <div style={{fontSize: '13px', color: '#6b7280'}}>Open Tickets</div>
            <div style={{fontSize: '24px', fontWeight: 'bold', color: '#e53e3e'}}>
              {tickets.filter(t => t.status === 'open').length}
            </div>
          </div>
          <div className="card">
            <div style={{fontSize: '13px', color: '#6b7280'}}>In Progress</div>
            <div style={{fontSize: '24px', fontWeight: 'bold', color: '#ed8936'}}>
              {tickets.filter(t => t.status === 'in_progress').length}
            </div>
          </div>
          <div className="card">
            <div style={{fontSize: '13px', color: '#6b7280'}}>Resolved</div>
            <div style={{fontSize: '24px', fontWeight: 'bold', color: '#48bb78'}}>
              {tickets.filter(t => t.status === 'resolved').length}
            </div>
          </div>
          <div className="card">
            <div style={{fontSize: '13px', color: '#6b7280'}}>High Priority</div>
            <div style={{fontSize: '24px', fontWeight: 'bold', color: '#e53e3e'}}>
              {tickets.filter(t => t.priority === 'high' && t.status !== 'closed').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
