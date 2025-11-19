import React from 'react'
import { useEffect, useState } from 'react'
import api from '../api'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler)

function AnimatedNumber({value, prefix='₹', duration=800}){
  const [display, setDisplay] = useState(0)
  useEffect(()=>{
    let start = Date.now();
    const from = display
    const to = Number(value) || 0
    const tick = ()=>{
      const now = Date.now();
      const t = Math.min(1, (now-start)/duration)
      const v = Math.round(from + (to-from)*t)
      setDisplay(v)
      if(t<1) requestAnimationFrame(tick)
    }
    tick()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[value])
  return <div style={{fontSize:20,marginTop:8}}>{prefix}{display.toLocaleString()}</div>
}

function Sparkline({values, color='#0b5cff', height=48}){
  if(!values || values.length===0) return <div style={{height}} />
  const max = Math.max(...values,1)
  const w = Math.max(1, values.length*12)
  const points = values.map((v,i)=> `${i*(w/(values.length-1)||0)},${height - (v/max)*height}`).join(' ')
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.9" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export default function Dashboard({data}){
  const [payments, setPayments] = useState([])
  const [incomeSeries, setIncomeSeries] = useState([])
  const [labels, setLabels] = useState([])
  const [monthsRange, setMonthsRange] = useState(6)

  useEffect(()=>{
    // fetch series from server-side aggregation endpoint
    api.get(`/dashboard/income?months=${monthsRange}`).then(r=>{
      setIncomeSeries(r.data.series || [])
      setLabels(r.data.labels || [])
    }).catch(()=>{})
    api.get('/payments').then(r=>setPayments(r.data)).catch(()=>{})
  },[monthsRange])

  if(!data) return <div>Loading dashboard...</div>

  const chartData = {
    labels,
    datasets: [{
      label: 'Income',
      data: incomeSeries,
      fill: true,
      backgroundColor: 'rgba(11,92,255,0.08)',
      borderColor: '#0b5cff',
      tension: 0.35,
      pointRadius: 3
    }]
  }

  const chartOptions = {
    responsive:true,
    plugins:{legend:{display:false}},
    scales:{y:{beginAtZero:true}},
    interaction:{mode:'index',intersect:false}
  }

  return (
    <div className="grid-dashboard">
      <div>
        <div className="card-grid" style={{marginBottom:12}}>
          <div className="card">
            <div style={{fontSize:13,color:'#6b7280'}}>Total Rent Collected</div>
            <AnimatedNumber value={data.totalRentCollected} />
          </div>
          <div className="card">
            <div style={{fontSize:13,color:'#6b7280'}}>Pending Dues</div>
            <div style={{fontSize:20,marginTop:8}}>{data.pendingDuesCount}</div>
          </div>
          <div className="card">
            <div style={{fontSize:13,color:'#6b7280'}}>Security Held</div>
            <AnimatedNumber value={data.securityHeld} />
          </div>
        </div>

        <div className="card" style={{marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <strong>Monthly Income</strong>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <select value={monthsRange} onChange={e=>setMonthsRange(Number(e.target.value))}>
                <option value={3}>Last 3 months</option>
                <option value={6}>Last 6 months</option>
                <option value={12}>Last 12 months</option>
              </select>
            </div>
          </div>
          <div style={{marginTop:8}}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <strong>Properties Occupancy</strong>
          <div style={{marginTop:8}}>
            {data.occupancy.map(p=> (
              <div key={p.propertyId} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:600}}>{p.name}</div><div style={{color:'#6b7280'}}>{p.occupied}/{p.rooms}</div></div>
                <div style={{height:10,background:'#eef2f7',borderRadius:8,marginTop:6}}>
                  <div style={{width:`${(p.occupied/p.rooms)*100}%`,height:'100%',background:'linear-gradient(90deg,#0b5cff,#0a7cff)',borderRadius:8,transition:'width 600ms'}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside>
        <div className="card" style={{marginBottom:12}}>
          <strong>Quick Actions</strong>
          <div style={{marginTop:8,display:'grid',gap:8}}>
            <button onClick={()=>window.location.href='/tenants'}>Manage Tenants</button>
            <button onClick={()=>window.location.href='/payments'}>Record Payment</button>
            <button onClick={()=>window.location.href='/documents'}>Upload Document</button>
          </div>
        </div>

        <div className="card">
          <strong>Live Activity</strong>
          <div style={{marginTop:8,color:'#6b7280'}}>Recent payments</div>
          <ul style={{marginTop:8,paddingLeft:16}}>
            {payments.slice(-6).reverse().map(p=> (
              <li key={p.id} style={{marginBottom:6}}>{p.date} — ₹{p.amount} — {p.tenantId || 'unknown'}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
