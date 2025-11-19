import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Maintenance(){
  const [tickets, setTickets] = useState([])
  const [form, setForm] = useState({ propertyId:'', room:'', issue:'' })

  useEffect(()=> load(), [])
  function load(){ api.get('/maintenance').then(r=>setTickets(r.data)).catch(()=>{}) }

  function handle(e){ setForm({...form, [e.target.name]: e.target.value }) }
  function create(e){ e.preventDefault(); api.post('/maintenance', form).then(()=>{ setForm({ propertyId:'', room:'', issue:'' }); load() }) }

  function setStatus(id, status){ api.put(`/maintenance/${id}`, { status }).then(()=>load()) }

  return (
    <div>
      <h2>Maintenance</h2>
      <div className="columns">
        <form onSubmit={create} className="form-column">
          <div><label>Property ID<br/><input name="propertyId" value={form.propertyId} onChange={handle} /></label></div>
          <div><label>Room<br/><input name="room" value={form.room} onChange={handle} /></label></div>
          <div><label>Issue<br/><textarea name="issue" value={form.issue} onChange={handle}></textarea></label></div>
          <div style={{marginTop:8}}><button type="submit">Create Ticket</button></div>
        </form>

        <div className="list-column">
          <h3>Tickets</h3>
          <div className="table-responsive"><table>
            <thead><tr><th>Id</th><th>Property</th><th>Room</th><th>Issue</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {tickets.map(t=> (
                <tr key={t.id} style={{borderTop:'1px solid #eee'}}>
                  <td>{t.id}</td>
                  <td>{t.propertyId}</td>
                  <td>{t.room}</td>
                  <td>{t.issue}</td>
                  <td>{t.status}</td>
                  <td>
                    {t.status !== 'closed' && <button onClick={()=>setStatus(t.id,'closed')}>Close</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  )
}
