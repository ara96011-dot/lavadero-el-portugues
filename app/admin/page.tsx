// @ts-nocheck
"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const PIN_SECRETO = "1987"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const ESTADOS = ['En Espera','En Proceso','Listo','Entregado'] as const

export default function Admin(){
  const [auth,setAuth]=useState(false); const [pin,setPin]=useState(''); const [data,setData]=useState<any[]>([]);
  useEffect(()=>{ fetchData() },[])
  const fetchData=async()=>{ const {data} = await supabase.from('reservas').select('*').order('created_at',{ascending:false}); if(data) setData(data) }
  const check=(e:any)=>{ e.preventDefault(); if(pin===PIN_SECRETO) setAuth(true); else { alert('PIN incorrecto'); setPin('') } }

  if(!auth) return (
    <div style={{minHeight:'100vh', background:'var(--bg-main)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
      <form onSubmit={check} className="glass-panel" style={{padding:'32px 24px', width:'100%', maxWidth:'360px', textAlign:'center'}}>
        <div style={{width:'56px', height:'56px', background:'var(--accent-gold)', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:'24px'}}>🔒</div>
        <h2 style={{fontFamily:'Outfit', fontWeight:800}}>Acceso privado</h2>
        <p style={{color:'var(--text-muted)', fontSize:'13px', margin:'8px 0 20px'}}>Ingresá tu PIN para continuar</p>
        {/* PIN OCULTO - NO SE VE 1987 */}
        <input autoFocus type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="••••" style={{width:'100%', padding:'16px', borderRadius:'var(--radius-md)', background:'#0f172a', border:'1px solid var(--border-color)', color:'#fff', textAlign:'center', fontSize:'22px', letterSpacing:'8px'}}/>
        <button className="btn-gold" style={{width:'100%', marginTop:'16px', padding:'14px'}}>Entrar</button>
      </form>
    </div>
  )

  const hoy = new Date().toISOString().split('T')[0]
  const hoyCount = data.filter(r=>r.fecha===hoy).length

  return(
    <div style={{minHeight:'100vh', background:'var(--bg-main)', padding:'12px', paddingBottom:'90px'}}>
      {/* HEADER IGUAL A TU FOTO - SIN SUPABASE */}
      <div className="glass-panel" style={{padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', borderRadius:'20px'}}>
        <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
          <div style={{width:'44px', height:'44px', background:'var(--accent-gold)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}>💧</div>
          <b style={{fontFamily:'Outfit', fontSize:'18px'}}>Lavadero El Portugues</b>
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          <button className="btn-dark" style={{width:'40px', height:'40px', padding:'0', borderRadius:'12px'}}>🔔</button>
          <button onClick={fetchData} className="btn-dark" style={{width:'40px', height:'40px', padding:'0', borderRadius:'12px'}}>↻</button>
        </div>
      </div>

      <div style={{color:'var(--text-muted)', fontSize:'14px', margin:'14px 6px'}}>Hoy - {new Date().toLocaleDateString('es-AR', {day:'2-digit', month:'short', year:'numeric'})}</div>

      {/* STATS COMO EN TU FOTO */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
        <div className="glass-card" style={{padding:'14px'}}><div style={{display:'flex', gap:'8px', alignItems:'center', color:'var(--text-muted)', fontSize:'13px'}}><span style={{background:'#22c55e', color:'#fff', borderRadius:'50%', width:'22px', height:'22px', display:'flex', alignItems:'center', justifyContent:'center'}}>↑</span>Total Hoy</div><div style={{fontSize:'28px', fontWeight:900, marginTop:'4px'}}>{hoyCount}</div><div style={{color:'#4ade80', fontSize:'12px'}}>+3 vs ayer</div></div>
        <div className="glass-card" style={{padding:'14px'}}><div style={{display:'flex', gap:'8px', alignItems:'center', color:'var(--text-muted)', fontSize:'13px'}}><span style={{background:'#d4a356', color:'#000', borderRadius:'50%', width:'22px', height:'22px', display:'flex', alignItems:'center', justifyContent:'center'}}>$</span>Ingresos</div><div style={{fontSize:'28px', fontWeight:900, marginTop:'4px'}}>${(data.length*1850).toLocaleString()}</div><div style={{color:'#4ade80', fontSize:'12px'}}>+12% vs ayer</div></div>
        <div className="glass-card" style={{padding:'14px'}}><div style={{display:'flex', gap:'8px', alignItems:'center', color:'var(--text-muted)', fontSize:'13px'}}><span style={{background:'#3b82f6', borderRadius:'50%', width:'22px', height:'22px', display:'flex', alignItems:'center', justifyContent:'center'}}>◷</span>Tiempo Prom.</div><div style={{fontSize:'28px', fontWeight:900, marginTop:'4px'}}>45 min</div><div style={{color:'#4ade80', fontSize:'12px'}}>-5min vs ayer</div></div>
        <div className="glass-card" style={{padding:'14px'}}><div style={{display:'flex', gap:'8px', alignItems:'center', color:'var(--text-muted)', fontSize:'13px'}}><span style={{background:'#d4a356', borderRadius:'50%', width:'22px', height:'22px', display:'flex', alignItems:'center', justifyContent:'center'}}>★</span>Satisfacción</div><div style={{fontSize:'28px', fontWeight:900, marginTop:'4px'}}>4.8★</div><div style={{color:'var(--text-muted)', fontSize:'12px'}}>12 reseñas</div></div>
      </div>

      {/* KANBAN HORIZONTAL */}
      <div style={{display:'flex', gap:'12px', overflowX:'auto', marginTop:'20px', paddingBottom:'10px'}}>
        {ESTADOS.map(est=>{
          const lista=data.filter(r=>r.estado===est || (est==='En Espera' &&!r.estado))
          return(
            <div key={est} style={{minWidth:'220px', flex:'1'}}>
              <div style={{display:'flex', gap:'8px', alignItems:'center', marginBottom:'10px'}}><b style={{fontSize:'14px'}}>{est}</b><span className={`badge ${est==='En Espera'?'badge-espera':est==='En Proceso'?'badge-proceso':est==='Listo'?'badge-listo':'badge-entregado'}`} style={{padding:'2px 8px'}}>{lista.length}</span></div>
              <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                {lista.map(r=>(
                  <div key={r.id} className="glass-card" style={{padding:'12px'}}>
                    <div style={{fontWeight:800, border:'1px solid var(--border-color)', borderRadius:'8px', padding:'4px 8px', display:'inline-block'}}>{r.patente}</div>
                    <div style={{fontSize:'12px', color:'var(--text-secondary)', marginTop:'6px'}}>Cliente: {r.cliente_nombre}</div>
                    <div className={`badge ${r.servicio?.includes('Básico')?'badge-gold':''}`} style={{marginTop:'8px', fontSize:'10px', background:est==='En Proceso'?'rgba(59,130,246,0.15)':'rgba(212,163,86,0.15)', color:est==='En Proceso'?'#60a5fa':'var(--accent-gold)'}}>{r.servicio}</div>
                    <div style={{display:'flex', gap:'4px', marginTop:'10px', flexWrap:'wrap'}}>
                      {ESTADOS.filter(e=>e!==r.estado).map(e=><button key={e} onClick={async()=>{await supabase.from('reservas').update({estado:e}).eq('id',r.id); fetchData()}} className="btn-dark" style={{fontSize:'9px', padding:'4px 6px'}}>{e}</button>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* BOTTOM NAV SIN TEXTO SUPABASE */}
      <div className="glass-panel" style={{position:'fixed', bottom:'12px', left:'12px', right:'12px', display:'flex', justifyContent:'space-around', padding:'10px', borderRadius:'20px'}}>
        <button className="btn-gold" style={{background:'transparent', color:'var(--accent-gold)', boxShadow:'none', flexDirection:'column', fontSize:'11px'}}>📋 Tablero</button>
        <button onClick={()=>setAuth(false)} className="btn-dark" style={{border:'none', background:'transparent', flexDirection:'column', fontSize:'11px', color:'var(--text-muted)'}}>👤 Bloquear</button>
