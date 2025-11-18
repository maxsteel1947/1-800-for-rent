import React, { useEffect, useState } from 'react'
import api from '../api'

export default function TenantDetail({ id }){
  const [tenant, setTenant] = useState(null)
  const [payments, setPayments] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})

  useEffect(()=>{
    if(!id) return
    api.get(`/tenants/${id}`).then(r=>{ setTenant(r.data); setForm(r.data) }).catch(()=>{})
    api.get(`/payments/tenant/${id}`).then(r=>setPayments(r.data)).catch(()=>{})
  },[id])

  function save(){
    api.put(`/tenants/${id}`, form).then(r=>{ setTenant(r.data); setEditing(false) })
  }

  return (
    <div>
      <h2>Tenant Details</h2>
      {!tenant ? <div>Loading...</div> : (
        <div style={{display:'flex',gap:16}}>
          <div style={{minWidth:360}}>
            {editing ? (
              <div>
                <div><label>Name<br/><input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/></label></div>
                <div><label>Phone<br/><input value={form.phone||''} onChange={e=>setForm({...form,phone:e.target.value})}/></label></div>
                <div><label>Room<br/><input value={form.room||''} onChange={e=>setForm({...form,room:e.target.value})}/></label></div>
                <div><label>Rent<br/><input type="number" value={form.rent||0} onChange={e=>setForm({...form,rent:parseInt(e.target.value||0)})}/></label></div>
                <div><label>Deposit<br/><input type="number" value={form.deposit||0} onChange={e=>setForm({...form,deposit:parseInt(e.target.value||0)})}/></label></div>
                <div><label>Move In<br/><input type="date" value={form.moveIn||''} onChange={e=>setForm({...form,moveIn:e.target.value})} /></label></div>
                <div><label>Move Out<br/><input type="date" value={form.moveOut||''} onChange={e=>setForm({...form,moveOut:e.target.value})} /></label></div>
                <div><label>Rent Due Date<br/><input type="date" value={form.rentDueDate||''} onChange={e=>setForm({...form,rentDueDate:e.target.value})} /></label></div>
                <div><label>Emergency Contact<br/><input value={form.emergencyContact||''} onChange={e=>setForm({...form,emergencyContact:e.target.value})}/></label></div>
                <div><label>ID Proof Type<br/><input value={form.idProofType||''} onChange={e=>setForm({...form,idProofType:e.target.value})}/></label></div>
                <div><label>ID Number<br/><input value={form.idNumber||''} onChange={e=>setForm({...form,idNumber:e.target.value})}/></label></div>
                <div style={{marginTop:8}}><button onClick={save}>Save</button> <button onClick={()=>setEditing(false)}>Cancel</button></div>
              </div>
            ) : (
              <div>
                <h3>{tenant.name}</h3>
                <div>Phone: {tenant.phone}</div>
                <div>Room: {tenant.room}</div>
                <div>Rent: ₹{tenant.rent}</div>
                <div>Deposit: ₹{tenant.deposit}</div>
                <div>Move In: {tenant.moveIn || '-'}</div>
                <div>Move Out: {tenant.moveOut || '-'}</div>
                <div>Rent Due Date: {tenant.rentDueDate || '-'}</div>
                <div>Emergency Contact: {tenant.emergencyContact || '-'}</div>
                <div>ID Proof: {tenant.idProofType ? `${tenant.idProofType} - ${tenant.idNumber}` : '-'}</div>
                <div style={{marginTop:8}}><button onClick={()=>setEditing(true)}>Edit Tenant</button></div>
              </div>
            )}
          </div>

          <div style={{flex:1}}>
            <h3>Payment History</h3>
            <table style={{width:'100%'}}>
              <thead><tr><th>Date</th><th>Amount</th><th>Method</th></tr></thead>
              <tbody>
                {payments.map(p=> (
                  <tr key={p.id} style={{borderTop:'1px solid #eee'}}>
                    <td>{p.date}</td>
                    <td>₹{p.amount}</td>
                    <td>{p.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
