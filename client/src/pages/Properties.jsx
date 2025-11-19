import React, { useState, useEffect } from 'react'
import api from '../api'

export default function Properties(){
  const [properties, setProperties] = useState([])
  const [tenants, setTenants] = useState([])
  const [form, setForm] = useState({ 
    name: '', 
    address: '', 
    rooms: 0, 
    amenities: [],
    rentPerRoom: 0,
    depositPerRoom: 0
  })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    loadProperties()
    loadTenants()
  }, [])

  function loadProperties() {
    api.get('/properties').then(r => setProperties(r.data)).catch(() => {})
  }

  function loadTenants() {
    api.get('/tenants').then(r => setTenants(r.data)).catch(() => {})
  }

  function handleChange(e) {
    if (e.target.name === 'amenities') {
      const amenities = Array.from(e.target.selectedOptions, option => option.value)
      setForm({...form, amenities})
    } else {
      setForm({
        ...form, 
        [e.target.name]: e.target.type === 'number' ? Number(e.target.value) || 0 : e.target.value
      })
    }
  }

  function create(e) {
    e.preventDefault()
    const payload = {
      ...form,
      rooms: Number(form.rooms) || 0,
      rentPerRoom: Number(form.rentPerRoom) || 0,
      depositPerRoom: Number(form.depositPerRoom) || 0
    }
    api.post('/properties', payload).then(() => {
      setForm({ 
        name: '', 
        address: '', 
        rooms: 0, 
        amenities: [],
        rentPerRoom: 0,
        depositPerRoom: 0
      })
      loadProperties()
    })
  }

  function startEdit(property) {
    setForm({
      name: property.name,
      address: property.address,
      rooms: property.rooms || 0,
      amenities: property.amenities || [],
      rentPerRoom: property.rentPerRoom || 0,
      depositPerRoom: property.depositPerRoom || 0
    })
    setEditingId(property.id)
  }

  function save(e) {
    e.preventDefault()
    const payload = {
      ...form,
      rooms: Number(form.rooms) || 0,
      rentPerRoom: Number(form.rentPerRoom) || 0,
      depositPerRoom: Number(form.depositPerRoom) || 0
    }
    api.put(`/properties/${editingId}`, payload).then(() => {
      setForm({ 
        name: '', 
        address: '', 
        rooms: 0, 
        amenities: [],
        rentPerRoom: 0,
        depositPerRoom: 0
      })
      setEditingId(null)
      loadProperties()
    })
  }

  function remove(id) {
    if (window.confirm('Are you sure you want to delete this property?')) {
      api.delete(`/properties/${id}`).then(() => loadProperties())
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ 
      name: '', 
      address: '', 
      rooms: 0, 
      amenities: [],
      rentPerRoom: 0,
      depositPerRoom: 0
    })
  }

  function getOccupancyStats(propertyId) {
    const propertyTenants = tenants.filter(t => t.propertyId === propertyId)
    const occupiedRooms = propertyTenants.length
    const totalRooms = properties.find(p => p.id === propertyId)?.rooms || 0
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms * 100).toFixed(1) : 0
    return { occupiedRooms, totalRooms, occupancyRate }
  }

  const amenityOptions = [
    'WiFi', 'AC', 'Parking', 'Food', 'Laundry', 'Gym', 
    'Security', 'Power Backup', 'Water Supply', 'Housekeeping',
    'Reception', 'CCTV', 'Lift', 'RO Water', 'Common Area'
  ]

  return (
    <div>
      <h2>Properties Management</h2>
      
      <div className="columns">
        <form onSubmit={editingId ? save : create} className="form-column">
          <h3>{editingId ? 'Edit Property' : 'Add New Property'}</h3>
          
          <div>
            <label>Property Name<br/>
              <input 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="Sunrise PG"
                required 
              />
            </label>
          </div>
          
          <div>
            <label>Address<br/>
              <input 
                name="address" 
                value={form.address} 
                onChange={handleChange} 
                placeholder="123 Main Street, City"
                required 
              />
            </label>
          </div>
          
          <div>
            <label>Total Rooms<br/>
              <input 
                type="number" 
                name="rooms" 
                value={form.rooms} 
                onChange={handleChange} 
                placeholder="10"
                min="1"
                required 
              />
            </label>
          </div>
          
          <div>
            <label>Rent per Room (₹)<br/>
              <input 
                type="number" 
                name="rentPerRoom" 
                value={form.rentPerRoom} 
                onChange={handleChange} 
                placeholder="8000"
                min="0"
              />
            </label>
          </div>
          
          <div>
            <label>Deposit per Room (₹)<br/>
              <input 
                type="number" 
                name="depositPerRoom" 
                value={form.depositPerRoom} 
                onChange={handleChange} 
                placeholder="10000"
                min="0"
              />
            </label>
          </div>
          
          <div>
            <label>Amenities<br/>
              <select 
                name="amenities" 
                multiple 
                value={form.amenities} 
                onChange={handleChange} 
                style={{height: '120px', width: '100%'}}
              >
                {amenityOptions.map(amenity => (
                  <option key={amenity} value={amenity}>{amenity}</option>
                ))}
              </select>
              <small style={{display: 'block', marginTop: '4px', color: '#666'}}>
                Hold Ctrl/Cmd to select multiple amenities
              </small>
            </label>
          </div>
          
          <div style={{ marginTop: 12 }}>
            <button type="submit">
              {editingId ? 'Update Property' : 'Add Property'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={cancelEdit}
                style={{ marginLeft: 8 }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="list-column">
          <h3>Property List</h3>
          {properties.length === 0 ? (
            <p style={{color: '#666', textAlign: 'center', padding: '20px'}}>
              No properties added yet. Add your first property to get started.
            </p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Address</th>
                    <th>Rooms</th>
                    <th>Rent/Room</th>
                    <th>Occupancy</th>
                    <th>Amenities</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(property => {
                    const stats = getOccupancyStats(property.id)
                    return (
                      <tr key={property.id}>
                        <td>
                          <strong>{property.name}</strong>
                        </td>
                        <td>{property.address}</td>
                        <td>{property.rooms}</td>
                        <td>₹{property.rentPerRoom || 0}</td>
                        <td>
                          <div style={{fontSize: '12px'}}>
                            {stats.occupiedRooms}/{stats.totalRooms} rooms
                            <div style={{color: stats.occupancyRate > 80 ? '#48bb78' : '#ed8936'}}>
                              {stats.occupancyRate}%
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{maxWidth: '150px', fontSize: '12px'}}>
                            {property.amenities && property.amenities.length > 0 
                              ? property.amenities.slice(0, 3).join(', ') + 
                                (property.amenities.length > 3 ? '...' : '')
                              : '-'
                            }
                          </div>
                        </td>
                        <td>
                          <button 
                            onClick={() => startEdit(property)}
                            style={{ marginRight: 4, padding: '2px 8px' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => remove(property.id)}
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
