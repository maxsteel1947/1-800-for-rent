import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function Tenants(){
  const [tenants, setTenants] = useState([])
  const [queryPhone, setQueryPhone] = useState('')
  const [form, setForm] = useState({ name:'', phone:'', propertyId:'' , room:'', rent:0, deposit:0 })

  useEffect(()=>{ load() }, [])
  function load(){ api.get('/tenants').then(r=>setTenants(r.data)).catch(()=>{}) }

  function searchByPhone(e){
    e.preventDefault()
    if(!queryPhone) return load()
    api.get(`/tenants/phone/${encodeURIComponent(queryPhone)}`).then(r=>setTenants([r.data])).catch(()=>setTenants([]))
  }

  function handleChange(e){ setForm({...form, [e.target.name]: e.target.value }) }

  function create(e){
    e.preventDefault()
    const payload = {
      ...form,
      rent: Number(form.rent) || 0,
      deposit: Number(form.deposit) || 0
    }
    api.post('/tenants', payload).then(()=>{ setForm({ name:'', phone:'', propertyId:'', room:'', rent:0, deposit:0 }); load() })
  }

  function remove(id){ api.delete(`/tenants/${id}`).then(()=>load()) }

  return (
    <div>
      <h2>Tenants</h2>
      <div style={{display:'flex',gap:16}}>
        <form onSubmit={create} style={{minWidth:320}}>
          <div><label>Name<br/><input name="name" value={form.name} onChange={handleChange} required/></label></div>
          <div><label>Phone<br/><input name="phone" value={form.phone} onChange={handleChange} /></label></div>
          <div><label>Property ID<br/><input name="propertyId" value={form.propertyId} onChange={handleChange} /></label></div>
          <div><label>Room<br/><input name="room" value={form.room} onChange={handleChange} /></label></div>
          <div><label>Rent<br/><input type="number" name="rent" value={form.rent} onChange={handleChange} /></label></div>
          <div><label>Deposit<br/><input type="number" name="deposit" value={form.deposit} onChange={handleChange} /></label></div>
          <div><label>Move In<br/><input type="date" name="moveIn" value={form.moveIn||''} onChange={handleChange} /></label></div>
          <div><label>Move Out<br/><input type="date" name="moveOut" value={form.moveOut||''} onChange={handleChange} /></label></div>
          <div><label>Rent Due Date<br/><input type="date" name="rentDueDate" value={form.rentDueDate||''} onChange={handleChange} /></label></div>
          <div><label>Emergency Contact<br/><input name="emergencyContact" value={form.emergencyContact||''} onChange={handleChange} /></label></div>
          <div><label>ID Proof Type<br/><input name="idProofType" value={form.idProofType||''} onChange={handleChange} /></label></div>
          <div><label>ID Number<br/><input name="idNumber" value={form.idNumber||''} onChange={handleChange} /></label></div>
          <div style={{marginTop:8}}><button type="submit">Add Tenant</button></div>
        </form>

        <div style={{flex:1}}>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <form onSubmit={searchByPhone} style={{display:'flex',gap:8}}>
              <input placeholder="Search by phone" value={queryPhone} onChange={e=>setQueryPhone(e.target.value)} />
              <button type="submit">Search</button>
              <button type="button" onClick={()=>{ setQueryPhone(''); load() }}>Clear</button>
            </form>
          </div>
          <h3>All Tenants</h3>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr><th style={{textAlign:'left'}}>Name</th><th>Phone</th><th>Property</th><th>Room</th><th>Rent</th><th>Deposit</th><th></th></tr></thead>
            <tbody>
              {tenants.map(t=> (
                <tr key={t.id} style={{borderTop:'1px solid #eee'}}>
                  <td><Link to={`/tenants/${t.id}`}>{t.name}</Link></td>
                  <td>{t.phone}</td>
                  <td>{t.propertyId}</td>
                  <td>{t.room}</td>
                  <td>₹{t.rent}</td>
                  <td>₹{t.deposit}</td>
                  <td><button onClick={()=>remove(t.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
