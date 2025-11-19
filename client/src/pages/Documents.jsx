import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default function Documents(){
  const [docs, setDocs] = useState([])
  const [file, setFile] = useState(null)
  const [tenantId, setTenantId] = useState('')

  useEffect(()=> load(), [])
  function load(){ axios.get(`${API}/documents`).then(r=>setDocs(r.data)).catch(()=>{}) }

  function upload(e){
    e.preventDefault()
    if(!file) return alert('Choose a file')
    const fd = new FormData();
    fd.append('file', file);
    fd.append('tenantId', tenantId);
    axios.post(`${API}/documents/upload`, fd, { headers: {'Content-Type':'multipart/form-data'} }).then(()=>{ setFile(null); setTenantId(''); load() })
  }

  return (
    <div>
      <h2>Documents</h2>
      <div className="columns">
        <form onSubmit={upload} className="form-column">
          <div><label>Tenant ID<br/><input value={tenantId} onChange={e=>setTenantId(e.target.value)} /></label></div>
          <div style={{marginTop:8}}>
            <input type="file" onChange={e=>setFile(e.target.files[0])} />
          </div>
          <div style={{marginTop:8}}><button type="submit">Upload</button></div>
        </form>

        <div className="list-column">
          <h3>All Documents</h3>
          <ul>
            {docs.map(d=> (
              <li key={d.id}><a href={`${API.replace('/api','')}/uploads/${d.filename}`} target="_blank" rel="noreferrer">{d.original}</a> — tenant: {d.tenantId || '-'} — {new Date(d.uploadedAt).toLocaleString()}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
