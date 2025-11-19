import React, { useState, useEffect } from 'react'
import api from '../api'

export default function Payments(){
  const [payments, setPayments] = useState([])
  const [tenants, setTenants] = useState([])
  const [properties, setProperties] = useState([])
  const [form, setForm] = useState({ 
    tenantId: '', 
    propertyId: '', 
    amount: 0, 
    method: 'UPI',
    paymentType: 'rent',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadPayments()
    loadTenants()
    loadProperties()
  }, [])

  function loadPayments() {
    api.get('/payments').then(r => setPayments(r.data)).catch(() => {})
  }

  function loadTenants() {
    api.get('/tenants').then(r => setTenants(r.data)).catch(() => {})
  }

  function loadProperties() {
    api.get('/properties').then(r => setProperties(r.data)).catch(() => {})
  }

  function handleChange(e) {
    const value = e.target.type === 'number' ? Number(e.target.value) || 0 : e.target.value
    setForm({...form, [e.target.name]: value})
  }

  function handleTenantChange(e) {
    const tenantId = e.target.value
    const selectedTenant = tenants.find(t => t.id === tenantId)
    setForm({
      ...form,
      tenantId,
      propertyId: selectedTenant?.propertyId || '',
      amount: selectedTenant?.rent || 0
    })
  }

  function create(e){
    e.preventDefault()
    const payload = {
      ...form,
      amount: Number(form.amount) || 0,
      status: 'paid'
    }
    api.post('/payments', payload).then(() => {
      setForm({ 
        tenantId: '', 
        propertyId: '', 
        amount: 0, 
        method: 'UPI',
        paymentType: 'rent',
        date: new Date().toISOString().split('T')[0]
      })
      loadPayments()
    })
  }

  function remove(id){ 
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      api.delete(`/payments/${id}`).then(() => loadPayments())
    }
  }

  function getTenantPaymentSummary(tenantId) {
    const tenantPayments = payments.filter(p => p.tenantId === tenantId)
    const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0)
    const rentPayments = tenantPayments.filter(p => p.paymentType === 'rent').reduce((sum, p) => sum + p.amount, 0)
    const depositPayments = tenantPayments.filter(p => p.paymentType === 'deposit').reduce((sum, p) => sum + p.amount, 0)
    return { totalPaid, rentPayments, depositPayments, paymentCount: tenantPayments.length }
  }

  function getOutstandingRent(tenant) {
    const { rentPayments } = getTenantPaymentSummary(tenant.id)
    const expectedRent = tenant.rent || 0
    return Math.max(0, expectedRent - rentPayments)
  }

  function getPaymentTypeLabel(type) {
    switch(type) {
      case 'rent': return 'Rent'
      case 'deposit': return 'Security Deposit'
      case 'maintenance': return 'Maintenance'
      case 'other': return 'Other'
      default: return type
    }
  }

  return (
    <div>
      <h2>Payment Management</h2>
      
      <div className="columns">
        <form onSubmit={create} className="form-column">
          <h3>Record New Payment</h3>
          
          <div>
            <label>Select Tenant<br/>
              <select 
                name="tenantId" 
                value={form.tenantId} 
                onChange={handleTenantChange}
                required
              >
                <option value="">Choose a tenant...</option>
                {tenants.map(tenant => {
                  const property = properties.find(p => p.id === tenant.propertyId)
                  const outstanding = getOutstandingRent(tenant)
                  return (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} - {property?.name || 'Unknown'} (Room {tenant.room})
                      {outstanding > 0 ? ` - Outstanding: ₹${outstanding}` : ''}
                    </option>
                  )
                })}
              </select>
            </label>
          </div>
          
          <div>
            <label>Property<br/>
              <input 
                name="propertyId" 
                value={form.propertyId} 
                onChange={handleChange}
                disabled
                style={{background: '#f7fafc', cursor: 'not-allowed'}}
              />
              <small style={{display: 'block', color: '#666', marginTop: '2px'}}>
                Auto-filled based on tenant selection
              </small>
            </label>
          </div>
          
          <div>
            <label>Payment Type<br/>
              <select name="paymentType" value={form.paymentType} onChange={handleChange}>
                <option value="rent">Monthly Rent</option>
                <option value="deposit">Security Deposit</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
          
          <div>
            <label>Amount (₹)<br/>
              <input 
                type="number" 
                name="amount" 
                value={form.amount} 
                onChange={handleChange}
                min="0"
                required
              />
              {form.tenantId && form.paymentType === 'rent' && (
                <small style={{display: 'block', color: '#666', marginTop: '2px'}}>
                  Expected rent: ₹{tenants.find(t => t.id === form.tenantId)?.rent || 0}
                </small>
              )}
              {form.tenantId && form.paymentType === 'deposit' && (
                <small style={{display: 'block', color: '#666', marginTop: '2px'}}>
                  Expected deposit: ₹{tenants.find(t => t.id === form.tenantId)?.deposit || 0}
                </small>
              )}
            </label>
          </div>
          
          <div>
            <label>Payment Date<br/>
              <input 
                type="date" 
                name="date" 
                value={form.date} 
                onChange={handleChange}
                required
              />
            </label>
          </div>
          
          <div>
            <label>Payment Method<br/>
              <select name="method" value={form.method} onChange={handleChange}>
                <option value="UPI">UPI</option>
                <option value="Card">Credit/Debit Card</option>
                <option value="Netbanking">Net Banking</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </label>
          </div>
          
          <div style={{marginTop: 12}}>
            <button type="submit">Record Payment</button>
          </div>
        </form>

        <div className="list-column">
          <h3>Recent Payments</h3>
          {payments.length === 0 ? (
            <p style={{color: '#666', textAlign: 'center', padding: '20px'}}>
              No payments recorded yet.
            </p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Tenant</th>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Receipt</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 20)
                    .map(payment => {
                      const tenant = tenants.find(t => t.id === payment.tenantId)
                      const property = properties.find(p => p.id === payment.propertyId)
                      return (
                        <tr key={payment.id} style={{borderTop:'1px solid #eee'}}>
                          <td>{new Date(payment.date).toLocaleDateString()}</td>
                          <td>
                            {tenant ? (
                              <div>
                                <div>{tenant.name}</div>
                                <small style={{color: '#666'}}>Room {tenant.room}</small>
                              </div>
                            ) : (
                              <span style={{color: '#ed8936'}}>Unknown Tenant</span>
                            )}
                          </td>
                          <td>
                            {property ? property.name : 'Unknown Property'}
                          </td>
                          <td>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              background: payment.paymentType === 'rent' ? '#e6fffa' : 
                                          payment.paymentType === 'deposit' ? '#f0fff4' : '#fef5e7',
                              color: payment.paymentType === 'rent' ? '#234e52' : 
                                     payment.paymentType === 'deposit' ? '#22543d' : '#744210'
                            }}>
                              {getPaymentTypeLabel(payment.paymentType)}
                            </span>
                          </td>
                          <td style={{color: '#48bb78', fontWeight: 'bold'}}>
                            ₹{payment.amount.toLocaleString()}
                          </td>
                          <td>{payment.method}</td>
                          <td>
                            <a 
                              href={`${api.defaults.baseURL}/payments/${payment.id}/receipt`} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{color: '#0b5cff', textDecoration: 'none'}}
                            >
                              Download
                            </a>
                          </td>
                          <td>
                            <button 
                              onClick={() => remove(payment.id)}
                              style={{ 
                                color: '#e53e3e', 
                                padding: '2px 8px',
                                border: '1px solid #e53e3e',
                                background: 'white',
                                fontSize: '12px'
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

      <div className="card" style={{marginTop: '20px'}}>
        <h3>Payment Summary by Tenant</h3>
        {tenants.length === 0 ? (
          <p style={{color: '#666'}}>No tenants found</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Property</th>
                  <th>Total Paid</th>
                  <th>Rent Paid</th>
                  <th>Deposit Paid</th>
                  <th>Outstanding</th>
                  <th>Payment Count</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(tenant => {
                  const property = properties.find(p => p.id === tenant.propertyId)
                  const summary = getTenantPaymentSummary(tenant.id)
                  const outstanding = getOutstandingRent(tenant)
                  return (
                    <tr key={tenant.id}>
                      <td>
                        <div>{tenant.name}</div>
                        <small style={{color: '#666'}}>{tenant.phone}</small>
                      </td>
                      <td>{property?.name || 'Unknown'}</td>
                      <td style={{color: '#48bb78', fontWeight: 'bold'}}>
                        ₹{summary.totalPaid.toLocaleString()}
                      </td>
                      <td>₹{summary.rentPayments.toLocaleString()}</td>
                      <td>₹{summary.depositPayments.toLocaleString()}</td>
                      <td style={{color: outstanding > 0 ? '#ed8936' : '#48bb78', fontWeight: 'bold'}}>
                        ₹{outstanding.toLocaleString()}
                      </td>
                      <td>{summary.paymentCount}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
