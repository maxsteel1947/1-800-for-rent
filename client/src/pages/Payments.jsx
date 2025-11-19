import React, { useEffect, useState } from 'react'
import api from '../api'
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default function Payments(){
  const [payments, setPayments] = useState([])
  const [form, setForm] = useState({ tenantId:'', propertyId:'', amount:0, method:'UPI' })

  useEffect(()=> load(), [])
  function load(){ api.get('/payments').then(r=>setPayments(r.data)).catch(()=>{}) }

  function handle(e){ setForm({...form, [e.target.name]: e.target.value }) }

  function create(e){
    e.preventDefault()
    api.post('/payments', form).then(()=>{ setForm({ tenantId:'', propertyId:'', amount:0, method:'UPI' }); load() })
  }

  return (
    <div>
      <h2>Payments</h2>
      <div className="columns">
        <form onSubmit={create} className="form-column">
          <div><label>Tenant ID<br/><input name="tenantId" value={form.tenantId} onChange={handle} /></label></div>
          <div><label>Property ID<br/><input name="propertyId" value={form.propertyId} onChange={handle} /></label></div>
          <div><label>Amount<br/><input type="number" name="amount" value={form.amount} onChange={handle} /></label></div>
          <div><label>Method<br/><select name="method" value={form.method} onChange={handle}><option>UPI</option><option>Card</option><option>Netbanking</option></select></label></div>
          <div style={{marginTop:8}}><button type="submit">Record Payment</button></div>
        </form>

        <div className="list-column">
          <h3>Recent Payments</h3>
          <div className="table-responsive"><table>
            <thead><tr><th>Date</th><th>Tenant</th><th>Property</th><th>Amount</th><th>Method</th><th></th></tr></thead>
            <tbody>
              {payments.map(p=> (
                <tr key={p.id} style={{borderTop:'1px solid #eee'}}>
                  <td>{p.date}</td>
                  <td>{p.tenantId}</td>
                  <td>{p.propertyId}</td>
                  <td>₹{p.amount}</td>
                  <td>{p.method}</td>
                  <td><a href={`${API}/payments/${p.id}/receipt`} target="_blank" rel="noreferrer">Download Receipt</a></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  )
}
