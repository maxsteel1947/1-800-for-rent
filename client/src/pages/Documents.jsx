import React, { useState, useEffect } from 'react'
import api from '../api'

export default function Documents(){
  const [documents, setDocuments] = useState([])
  const [tenants, setTenants] = useState([])
  const [properties, setProperties] = useState([])
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState({ 
    tenantId: '', 
    propertyId: '',
    documentType: '',
    description: ''
  })

  useEffect(() => {
    loadDocuments()
    loadTenants()
    loadProperties()
  }, [])

  function loadDocuments() {
    api.get('/documents').then(r => setDocuments(r.data)).catch(() => {})
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

  function handleTenantChange(e) {
    const tenantId = e.target.value
    const selectedTenant = tenants.find(t => t.id === tenantId)
    setForm({
      ...form,
      tenantId,
      propertyId: selectedTenant?.propertyId || ''
    })
  }

  function handleFileChange(e) {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    
    // Create preview for images
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(selectedFile)
    } else if (selectedFile && selectedFile.type === 'application/pdf') {
      setPreview('pdf')
    } else {
      setPreview(null)
    }
  }

  function upload(e){
    e.preventDefault()
    if(!file) return alert('Please select a file to upload')
    
    const fd = new FormData();
    fd.append('file', file);
    fd.append('tenantId', form.tenantId);
    fd.append('propertyId', form.propertyId);
    fd.append('documentType', form.documentType);
    fd.append('description', form.description);
    
    api.post('/documents/upload', fd, { 
      headers: {'Content-Type': 'multipart/form-data'} 
    }).then(() => {
      setFile(null)
      setPreview(null)
      setForm({ 
        tenantId: '', 
        propertyId: '',
        documentType: '',
        description: ''
      })
      loadDocuments()
    }).catch(err => {
      alert('Upload failed: ' + (err.response?.data?.message || err.message))
    })
  }

  function remove(id) {
    if (window.confirm('Are you sure you want to delete this document?')) {
      api.delete(`/documents/${id}`).then(() => loadDocuments())
    }
  }

  function getDocumentTypeLabel(type) {
    switch(type) {
      case 'agreement': return 'Rental Agreement'
      case 'id_proof': return 'ID Proof'
      case 'police_verification': return 'Police Verification'
      case 'address_proof': return 'Address Proof'
      case 'photo': return 'Photo'
      case 'other': return 'Other'
      default: return type || 'Uncategorized'
    }
  }

  function getDocumentTypeColor(type) {
    switch(type) {
      case 'agreement': return '#4299e1'
      case 'id_proof': return '#48bb78'
      case 'police_verification': return '#ed8936'
      case 'address_proof': return '#9f7aea'
      case 'photo': return '#38b2ac'
      case 'other': return '#718096'
      default: return '#666'
    }
  }

  function getFileIcon(filename) {
    const extension = filename?.split('.').pop()?.toLowerCase()
    switch(extension) {
      case 'pdf': return '📄'
      case 'doc':
      case 'docx': return '📝'
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️'
      default: return '📎'
    }
  }

  const getDocumentPreview = (doc) => {
    const ext = doc.filename.split('.').pop().toLowerCase()
    const uploadsUrl = api.defaults.baseURL.replace('/api', '') + '/uploads'
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      return (
        <img
          src={`${uploadsUrl}/${doc.filename}`}
          alt={doc.original}
          style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px'}}
          onError={(e) => {
            e.target.style.display = 'none'
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'flex'
            }
          }}
        />
      )
    }
    return (
      <div style={{
        width: '60px', 
        height: '60px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f7fafc',
        borderRadius: '4px',
        fontSize: '24px'
      }}>
        {getFileIcon(doc.original)}
      </div>
    )
  }

  return (
    <div>
      <h2>Document Management</h2>
      
      <div className="columns">
        <form onSubmit={upload} className="form-column">
          <h3>Upload New Document</h3>
          
          <div>
            <label>Select Tenant<br/>
              <select 
                name="tenantId" 
                value={form.tenantId} 
                onChange={handleTenantChange}
              >
                <option value="">Choose a tenant...</option>
                {tenants.map(tenant => {
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
            <label>Property<br/>
              <input 
                name="propertyId" 
                value={form.propertyId} 
                onChange={handleChange}
                disabled
                style={{background: '#f7fafc', cursor: 'not-allowed'}}
              />
            </label>
          </div>
          
          <div>
            <label>Document Type<br/>
              <select name="documentType" value={form.documentType} onChange={handleChange}>
                <option value="">Select document type...</option>
                <option value="agreement">Rental Agreement</option>
                <option value="id_proof">ID Proof</option>
                <option value="police_verification">Police Verification</option>
                <option value="address_proof">Address Proof</option>
                <option value="photo">Photo</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
          
          <div>
            <label>Description<br/>
              <input 
                name="description" 
                value={form.description} 
                onChange={handleChange}
                placeholder="Brief description of the document"
              />
            </label>
          </div>
          
          <div style={{marginTop: 8}}>
            <input 
              type="file" 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <small style={{display: 'block', color: '#666', marginTop: '2px'}}>
              Supported formats: PDF, DOC, DOCX, JPG, PNG
            </small>
          </div>
          
          {preview && (
            <div style={{marginTop: 12, textAlign: 'center'}}>
              <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Preview:</div>
              {preview === 'pdf' ? (
                <div style={{
                  width: '100px', 
                  height: '100px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: '#f7fafc',
                  borderRadius: '4px',
                  fontSize: '48px',
                  margin: '0 auto'
                }}>
                  📄
                </div>
              ) : (
                <img 
                  src={preview} 
                  alt="Preview" 
                  style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px'}}
                />
              )}
            </div>
          )}
          
          <div style={{marginTop: 12}}>
            <button type="submit" disabled={!file}>
              Upload Document
            </button>
          </div>
        </form>

        <div className="list-column">
          <h3>All Documents ({documents.length})</h3>
          {documents.length === 0 ? (
            <p style={{color: '#666', textAlign: 'center', padding: '20px'}}>
              No documents uploaded yet.
            </p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Preview</th>
                    <th>Document</th>
                    <th>Tenant</th>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents
                    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
                    .map(doc => {
                      const tenant = tenants.find(t => t.id === doc.tenantId)
                      const property = properties.find(p => p.id === doc.propertyId)
                      return (
                        <tr key={doc.id} style={{borderTop:'1px solid #eee'}}>
                          <td>
                            {getDocumentPreview(doc)}
                          </td>
                          <td>
                            <div style={{maxWidth: '150px'}}>
                              <a 
                                href={`${api.defaults.baseURL.replace('/api', '')}/uploads/${doc.filename}`}
                                target="_blank" 
                                rel="noreferrer"
                                style={{color: '#0b5cff', textDecoration: 'none', fontSize: '12px'}}
                              >
                                {doc.original}
                              </a>
                              {doc.description && (
                                <div style={{fontSize: '11px', color: '#666', marginTop: '2px'}}>
                                  {doc.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {tenant ? (
                              <div style={{minWidth: '120px'}}>
                                <div style={{fontWeight: 'bold', fontSize: '13px'}}>{tenant.name}</div>
                                <div style={{fontSize: '11px', color: '#666'}}>Room {tenant.room}</div>
                                <div style={{fontSize: '11px', color: '#666'}}>{tenant.phone}</div>
                              </div>
                            ) : (
                              <span style={{color: '#ed8936', fontSize: '12px'}}>Unknown Tenant</span>
                            )}
                          </td>
                          <td>
                            {property ? (
                              <div style={{fontSize: '12px'}}>
                                <div>{property.name}</div>
                                <div style={{color: '#666', fontSize: '11px'}}>{property.address}</div>
                              </div>
                            ) : (
                              <span style={{color: '#ed8936', fontSize: '12px'}}>Unknown Property</span>
                            )}
                          </td>
                          <td>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              background: getDocumentTypeColor(doc.documentType) + '20',
                              color: getDocumentTypeColor(doc.documentType)
                            }}>
                              {getDocumentTypeLabel(doc.documentType)}
                            </span>
                          </td>
                          <td style={{fontSize: '11px'}}>
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </td>
                          <td>
                            <button 
                              onClick={() => remove(doc.id)}
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
        <h3>Document Summary by Tenant</h3>
        {tenants.length === 0 ? (
          <p style={{color: '#666'}}>No tenants found</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Property</th>
                  <th>Documents</th>
                  <th>Agreement</th>
                  <th>ID Proof</th>
                  <th>Police Verification</th>
                  <th>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(tenant => {
                  const property = properties.find(p => p.id === tenant.propertyId)
                  const tenantDocs = documents.filter(d => d.tenantId === tenant.id)
                  const agreements = tenantDocs.filter(d => d.documentType === 'agreement').length
                  const idProofs = tenantDocs.filter(d => d.documentType === 'id_proof').length
                  const policeVerifications = tenantDocs.filter(d => d.documentType === 'police_verification').length
                  const isCompliant = agreements > 0 && idProofs > 0 && policeVerifications > 0
                  
                  return (
                    <tr key={tenant.id}>
                      <td>
                        <div style={{fontWeight: 'bold'}}>{tenant.name}</div>
                        <div style={{fontSize: '11px', color: '#666'}}>{tenant.phone}</div>
                        <div style={{fontSize: '11px', color: '#666'}}>Room {tenant.room}</div>
                      </td>
                      <td>
                        <div style={{fontSize: '12px'}}>
                          <div>{property?.name || 'Unknown'}</div>
                          <div style={{color: '#666', fontSize: '11px'}}>{property?.address || ''}</div>
                        </div>
                      </td>
                      <td style={{fontWeight: 'bold'}}>{tenantDocs.length}</td>
                      <td style={{color: agreements > 0 ? '#48bb78' : '#ed8936'}}>
                        {agreements > 0 ? '✓' : '✗'}
                      </td>
                      <td style={{color: idProofs > 0 ? '#48bb78' : '#ed8936'}}>
                        {idProofs > 0 ? '✓' : '✗'}
                      </td>
                      <td style={{color: policeVerifications > 0 ? '#48bb78' : '#ed8936'}}>
                        {policeVerifications > 0 ? '✓' : '✗'}
                      </td>
                      <td>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          background: isCompliant ? '#c6f6d5' : '#fed7d7',
                          color: isCompliant ? '#22543d' : '#742a2a',
                          fontWeight: 'bold'
                        }}>
                          {isCompliant ? 'COMPLIANT' : 'INCOMPLETE'}
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
