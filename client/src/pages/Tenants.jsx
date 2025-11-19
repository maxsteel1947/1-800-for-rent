import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function Tenants(){
  const [tenants, setTenants] = useState([])
  const [properties, setProperties] = useState([])
  const [queryPhone, setQueryPhone] = useState('')
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    propertyId: '', 
    room: '', 
    rent: 0, 
    deposit: 0,
    moveIn: '',
    moveOut: '',
    rentDueDate: '',
    emergencyContact: '',
    idProofType: '',
    idNumber: ''
  })

  useEffect(() => {
    loadTenants()
    loadProperties()
  }, [])

  function loadTenants() {
    api.get('/tenants').then(r => setTenants(r.data)).catch(() => {})
  }

  function loadProperties() {
    api.get('/properties').then(r => setProperties(r.data)).catch(() => {})
  }

  function searchByPhone(e){
    e.preventDefault()
    if(!queryPhone) return loadTenants()
    api.get(`/tenants/phone/${encodeURIComponent(queryPhone)}`).then(r=>setTenants([r.data])).catch(()=>setTenants([]))
  }

  function handleChange(e){
    const value = e.target.type === 'number' ? Number(e.target.value) || 0 : e.target.value
    setForm({...form, [e.target.name]: value})
  }

  function handlePropertyChange(e) {
    const propertyId = e.target.value
    const selectedProperty = properties.find(p => p.id === propertyId)
    setForm({
      ...form,
      propertyId,
      rent: selectedProperty?.rentPerRoom || 0,
      deposit: selectedProperty?.depositPerRoom || 0
    })
  }

  function create(e){
    e.preventDefault()
    const payload = {
      ...form,
      rent: Number(form.rent) || 0,
      deposit: Number(form.deposit) || 0
    }
    api.post('/tenants', payload).then(() => {
      setForm({ 
        name: '', 
        phone: '', 
        propertyId: '', 
        room: '', 
        rent: 0, 
        deposit: 0,
        moveIn: '',
        moveOut: '',
        rentDueDate: '',
        emergencyContact: '',
        idProofType: '',
        idNumber: ''
      })
      loadTenants()
    })
  }

  function remove(id){ 
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      api.delete(`/tenants/${id}`).then(() => loadTenants())
    }
  }

  function getAvailableRooms(propertyId) {
    if (!propertyId) return []
    const property = properties.find(p => p.id === propertyId)
    if (!property) return []
    
    const occupiedRooms = tenants
      .filter(t => t.propertyId === propertyId && t.id !== form.id)
      .map(t => t.room)
    
    const allRooms = Array.from({length: property.rooms}, (_, i) => i + 1)
    return allRooms.filter(roomNum => !occupiedRooms.includes(roomNum.toString()))
  }

  function getTenantStatus(tenant) {
    const today = new Date()
    const moveOutDate = tenant.moveOut ? new Date(tenant.moveOut) : null
    if (moveOutDate && moveOutDate < today) return 'Vacated'
    if (tenant.moveIn && new Date(tenant.moveIn) > today) return 'Upcoming'
    return 'Active'
  }

  function getStatusColor(status) {
    switch(status) {
      case 'Active': return '#48bb78'
      case 'Vacated': return '#718096'
      case 'Upcoming': return '#4299e1'
      default: return '#666'
    }
  }

  return (
    <div>
      <h2>Tenant Management</h2>
      
      <div className="columns">
        <form onSubmit={create} className="form-column">
          <h3>Add New Tenant</h3>
          
          <div>
            <label>Full Name<br/>
              <input 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                required
              />
            </label>
          </div>
          
          <div>
            <label>Phone Number<br/>
              <input 
                name="phone" 
                value={form.phone} 
                onChange={handleChange}
                placeholder="+919876543210"
              />
            </label>
          </div>
          
          <div>
            <label>Select Property<br/>
              <select 
                name="propertyId" 
                value={form.propertyId} 
                onChange={handlePropertyChange}
                required
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
          
          {form.propertyId && (
            <div>
              <label>Room Number<br/>
                <select 
                  name="room" 
                  value={form.room} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Select room...</option>
                  {getAvailableRooms(form.propertyId).map(room => (
                    <option key={room} value={room.toString()}>
                      Room {room}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
            <div>
              <label>Rent (₹/month)<br/>
                <input 
                  type="number" 
                  name="rent" 
                  value={form.rent} 
                  onChange={handleChange}
                  min="0"
                />
              </label>
            </div>
            <div>
              <label>Deposit (₹)<br/>
                <input 
                  type="number" 
                  name="deposit" 
                  value={form.deposit} 
                  onChange={handleChange}
                  min="0"
                />
              </label>
            </div>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
            <div>
              <label>Move In Date<br/>
                <input 
                  type="date" 
                  name="moveIn" 
                  value={form.moveIn} 
                  onChange={handleChange}
                />
              </label>
            </div>
            <div>
              <label>Move Out Date<br/>
                <input 
                  type="date" 
                  name="moveOut" 
                  value={form.moveOut} 
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>
          
          <div>
            <label>Rent Due Date (each month)<br/>
              <input 
                type="date" 
                name="rentDueDate" 
                value={form.rentDueDate} 
                onChange={handleChange}
              />
            </label>
          </div>
          
          <div>
            <label>Emergency Contact<br/>
              <input 
                name="emergencyContact" 
                value={form.emergencyContact} 
                onChange={handleChange}
                placeholder="+919876543211"
              />
            </label>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
            <div>
              <label>ID Proof Type<br/>
                <select name="idProofType" value={form.idProofType} onChange={handleChange}>
                  <option value="">Select ID type...</option>
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="PAN">PAN</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </label>
            </div>
            <div>
              <label>ID Number<br/>
                <input 
                  name="idNumber" 
                  value={form.idNumber} 
                  onChange={handleChange}
                  placeholder="1234-5678-9012"
                />
              </label>
            </div>
          </div>
          
          <div style={{marginTop: 12}}>
            <button type="submit">Add Tenant</button>
          </div>
        </form>

        <div className="list-column">
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <form onSubmit={searchByPhone} style={{display:'flex',gap:8, flex: 1}}>
              <input 
                placeholder="Search by phone..." 
                value={queryPhone} 
                onChange={e=>setQueryPhone(e.target.value)} 
                style={{flex: 1}}
              />
              <button type="submit">Search</button>
              <button type="button" onClick={()=>{ setQueryPhone(''); loadTenants() }}>Clear</button>
            </form>
          </div>
          
          <h3>All Tenants ({tenants.length})</h3>
          {tenants.length === 0 ? (
            <p style={{color: '#666', textAlign: 'center', padding: '20px'}}>
              No tenants added yet. Add your first tenant to get started.
            </p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Property</th>
                    <th>Room</th>
                    <th>Rent</th>
                    <th>Deposit</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(tenant => {
                    const property = properties.find(p => p.id === tenant.propertyId)
                    const status = getTenantStatus(tenant)
                    return (
                      <tr key={tenant.id} style={{borderTop:'1px solid #eee'}}>
                        <td>
                          <Link to={`/tenants/${tenant.id}`} style={{color: '#0b5cff', textDecoration: 'none'}}>
                            {tenant.name}
                          </Link>
                          <div style={{fontSize: '12px', color: '#666'}}>{tenant.phone}</div>
                        </td>
                        <td>
                          {property ? (
                            <div>
                              <div>{property.name}</div>
                              <small style={{color: '#666'}}>{property.address}</small>
                            </div>
                          ) : (
                            <span style={{color: '#ed8936'}}>Unknown Property</span>
                          )}
                        </td>
                        <td>{tenant.room || '-'}</td>
                        <td>₹{tenant.rent.toLocaleString()}</td>
                        <td>₹{tenant.deposit.toLocaleString()}</td>
                        <td>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            background: status === 'Active' ? '#c6f6d5' : status === 'Vacated' ? '#e2e8f0' : '#bee3f8',
                            color: getStatusColor(status)
                          }}>
                            {status}
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => remove(tenant.id)}
                            style={{ 
                              color: '#e53e3e', 
                              padding: '2px 8px',
                              border: '1px solid #e53e3e',
                              background: 'white'
                            }}
                          >
                            Delete
                          </button>
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
    </div>
  )
}
