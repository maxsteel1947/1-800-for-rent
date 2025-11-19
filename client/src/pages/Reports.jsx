import React, { useState, useEffect } from 'react'
import api from '../api'

export default function Reports() {
  const [properties, setProperties] = useState([])
  const [tenants, setTenants] = useState([])
  const [payments, setPayments] = useState([])
  const [selectedProperty, setSelectedProperty] = useState('')
  const [dateRange, setDateRange] = useState('current-month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (properties.length > 0 && tenants.length > 0 && payments.length > 0) {
      setLoading(false)
    }
  }, [properties, tenants, payments])

  function loadData() {
    Promise.all([
      api.get('/properties').then(r => setProperties(r.data)),
      api.get('/tenants').then(r => setTenants(r.data)),
      api.get('/payments').then(r => setPayments(r.data))
    ]).catch(() => {
      setLoading(false)
    })
  }

  function getDateRangeFilter() {
    const now = new Date()
    let startDate, endDate

    switch(dateRange) {
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'last-3-months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'current-year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }

    return { startDate, endDate }
  }

  function getFilteredPayments() {
    const { startDate, endDate } = getDateRangeFilter()
    return payments.filter(payment => {
      const paymentDate = new Date(payment.date)
      return paymentDate >= startDate && paymentDate <= endDate
    })
  }

  function getPropertyReport(propertyId) {
    const propertyTenants = tenants.filter(t => t.propertyId === propertyId)
    const propertyPayments = payments.filter(p => p.propertyId === propertyId)
    const { startDate, endDate } = getDateRangeFilter()
    const filteredPayments = propertyPayments.filter(p => {
      const paymentDate = new Date(p.date)
      return paymentDate >= startDate && paymentDate <= endDate
    })

    const totalRentCollected = filteredPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0)

    const pendingRent = propertyTenants.reduce((sum, tenant) => {
      const tenantPayments = filteredPayments.filter(p => p.tenantId === tenant.id)
      const expectedRent = tenant.rent || 0
      const collected = tenantPayments.reduce((sum, p) => sum + p.amount, 0)
      return sum + Math.max(0, expectedRent - collected)
    }, 0)

    const totalDeposits = propertyTenants.reduce((sum, tenant) => sum + (tenant.deposit || 0), 0)

    return {
      property: properties.find(p => p.id === propertyId),
      tenants: propertyTenants,
      totalRentCollected,
      pendingRent,
      totalDeposits,
      occupancyRate: properties.find(p => p.id === propertyId)?.rooms > 0 
        ? (propertyTenants.length / properties.find(p => p.id === propertyId).rooms * 100).toFixed(1)
        : 0
    }
  }

  function getTenantReport() {
    return tenants.map(tenant => {
      const tenantPayments = payments.filter(p => p.tenantId === tenant.id)
      const { startDate, endDate } = getDateRangeFilter()
      const filteredPayments = tenantPayments.filter(p => {
        const paymentDate = new Date(p.date)
        return paymentDate >= startDate && paymentDate <= endDate
      })

      const totalPaid = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
      const expectedRent = tenant.rent || 0
      const pending = Math.max(0, expectedRent - totalPaid)

      return {
        ...tenant,
        property: properties.find(p => p.id === tenant.propertyId),
        totalPaid,
        pending,
        paymentCount: filteredPayments.length,
        lastPaymentDate: filteredPayments.length > 0 
          ? new Date(Math.max(...filteredPayments.map(p => new Date(p.date)))).toLocaleDateString()
          : 'No payments'
      }
    })
  }

  function getOverallStats() {
    const { startDate, endDate } = getDateRangeFilter()
    const filteredPayments = payments.filter(p => {
      if (!p.date) return false
      const paymentDate = new Date(p.date)
      return paymentDate >= startDate && paymentDate <= endDate
    })
    
    // Match Dashboard logic: only count paid payments
    const totalRentCollected = filteredPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0)
    
    const totalTenants = tenants.length
    const totalProperties = properties.length
    const totalDeposits = tenants.reduce((sum, t) => sum + (t.deposit || 0), 0)
    const occupiedRooms = tenants.length
    const totalRooms = properties.reduce((sum, p) => sum + (p.rooms || 0), 0)
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms * 100).toFixed(1) : 0

    return {
      totalRentCollected,
      totalTenants,
      totalProperties,
      totalDeposits,
      occupancyRate,
      totalRooms,
      occupiedRooms
    }
  }

  if (loading) {
    return <div>Loading reports...</div>
  }

  const overallStats = getOverallStats()
  const filteredPayments = getFilteredPayments()

  return (
    <div>
      <h2>Property Management Reports</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>Date Range:</label>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
          <option value="current-month">Current Month</option>
          <option value="last-month">Last Month</option>
          <option value="last-3-months">Last 3 Months</option>
          <option value="current-year">Current Year</option>
        </select>
      </div>

      <div className="card-grid" style={{marginBottom: '20px'}}>
        <div className="card">
          <div style={{fontSize: '13px', color: '#6b7280'}}>Total Rent Collected</div>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: '#48bb78'}}>
            ₹{overallStats.totalRentCollected.toLocaleString()}
          </div>
        </div>
        <div className="card">
          <div style={{fontSize: '13px', color: '#6b7280'}}>Total Properties</div>
          <div style={{fontSize: '24px', fontWeight: 'bold'}}>{overallStats.totalProperties}</div>
        </div>
        <div className="card">
          <div style={{fontSize: '13px', color: '#6b7280'}}>Total Tenants</div>
          <div style={{fontSize: '24px', fontWeight: 'bold'}}>{overallStats.totalTenants}</div>
        </div>
        <div className="card">
          <div style={{fontSize: '13px', color: '#6b7280'}}>Occupancy Rate</div>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: overallStats.occupancyRate > 80 ? '#48bb78' : '#ed8936'}}>
            {overallStats.occupancyRate}%
          </div>
        </div>
        <div className="card">
          <div style={{fontSize: '13px', color: '#6b7280'}}>Security Deposits Held</div>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: '#4299e1'}}>
            ₹{overallStats.totalDeposits.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
        <div className="card">
          <h3>Property-wise Report</h3>
          {properties.length === 0 ? (
            <p style={{color: '#666'}}>No properties found</p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Tenants</th>
                    <th>Rent Collected</th>
                    <th>Pending</th>
                    <th>Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(property => {
                    const report = getPropertyReport(property.id)
                    return (
                      <tr key={property.id}>
                        <td>
                          <div>{property.name}</div>
                          <small style={{color: '#666'}}>{property.address}</small>
                        </td>
                        <td>{report.tenants.length}</td>
                        <td style={{color: '#48bb78'}}>₹{report.totalRentCollected.toLocaleString()}</td>
                        <td style={{color: '#ed8936'}}>₹{report.pendingRent.toLocaleString()}</td>
                        <td>
                          <div style={{fontSize: '12px'}}>
                            {report.tenants.length}/{property.rooms} rooms
                            <div style={{color: report.occupancyRate > 80 ? '#48bb78' : '#ed8936'}}>
                              {report.occupancyRate}%
                            </div>
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

        <div className="card">
          <h3>Tenant Payment Status</h3>
          {tenants.length === 0 ? (
            <p style={{color: '#666'}}>No tenants found</p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Property</th>
                    <th>Room</th>
                    <th>Paid</th>
                    <th>Pending</th>
                    <th>Last Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {getTenantReport().map(tenant => (
                    <tr key={tenant.id}>
                      <td>
                        <div>{tenant.name}</div>
                        <small style={{color: '#666'}}>{tenant.phone}</small>
                      </td>
                      <td>{tenant.property?.name || '-'}</td>
                      <td>{tenant.room}</td>
                      <td style={{color: '#48bb78'}}>₹{tenant.totalPaid.toLocaleString()}</td>
                      <td style={{color: tenant.pending > 0 ? '#ed8936' : '#48bb78'}}>
                        ₹{tenant.pending.toLocaleString()}
                      </td>
                      <td style={{fontSize: '12px'}}>{tenant.lastPaymentDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{marginTop: '20px'}}>
        <h3>Recent Payment History</h3>
        {filteredPayments.length === 0 ? (
          <p style={{color: '#666'}}>No payments found in selected period</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tenant</th>
                  <th>Property</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10)
                  .map(payment => {
                    const tenant = tenants.find(t => t.id === payment.tenantId)
                    const property = properties.find(p => p.id === payment.propertyId)
                    return (
                      <tr key={payment.id}>
                        <td>{new Date(payment.date).toLocaleDateString()}</td>
                        <td>{tenant?.name || 'Unknown'}</td>
                        <td>{property?.name || 'Unknown'}</td>
                        <td style={{color: '#48bb78', fontWeight: 'bold'}}>
                          ₹{payment.amount.toLocaleString()}
                        </td>
                        <td>{payment.method}</td>
                        <td>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            background: payment.status === 'paid' ? '#c6f6d5' : '#fed7d7',
                            color: payment.status === 'paid' ? '#22543d' : '#742a2a'
                          }}>
                            {payment.status}
                          </span>
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
  )
}
