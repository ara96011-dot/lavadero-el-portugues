// @ts-nocheck
"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const PIN = "1987"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const ESTADOS = ['En espera','En proceso','Listo','Entregado'] as const

export default function Admin(){
  const [auth,setAuth]=useState(false); const [pin,setPin]=useState(''); const [data,setData]=useState<any[]>([]); const [tab,setTab]=useState('kanban')
  useEffect(()=>{ fetchData() },[])
  const fetchData=async()=>{ const {data} = await supabase.from('reservas').select('*').order('created_at',{ascending:false}); if(data) setData(data) }
  const check=(e:any)=>{ e.preventDefault(); if(pin===PIN) setAuth(true) }

  if(!auth) return <div style={{minHeight:'100vh', background:'var(--bg-main)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}><form onSubmit={check} className="glass-panel" style={{padding:'32px 24px', width:'100%', maxWidth:'360px', textAlign:'center'}}><div style={{fontSize:'32px'}}>🔒</div><h2 style={{fontFamily:'Outfit', marginTop:'8px'}}>Acceso Admin</h2><p style={{color:'var(--text-muted)', fontSize:'13px', margin:'8px 0 20px'}}>PIN del lavadero</p><input autoFocus type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="1987" style={{width:'100%', padding:'14px', borderRadius:'var(--radius-md)', background:'#0f172a', border:'1px solid var(--border-color)', color:'#fff', textAlign:'center', fontSize:'20px', letterSpacing:'6px'}}/><button className="btn-gold" style={{width:'100%', marginTop:'16px'}}>Entrar</button></form></div>

  const total = data.length
  const enLavadero = data.filter(r=>r.estado==='En proceso').length
  const paraHoy = data.filter(r=>r.fecha===new Date().toISOString().split('T')[0]).length

  return(
    <div style={{minHeight:'100vh', background:'var(--bg-main)', color:'var(--text-primary)'}}>
      {/* HEADER COMO EN TU CAPTURA */}
      <div style={{padding:'20px 16px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderBottom:'1px solid var(--border-color)', background:'#0e1420'}}>
        <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
          <div style={{width:'36px', height:'56px', background:'var(--accent-gold)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>🚗</div>
          <div>
            <h1 style={{fontSize:'28px', fontWeight:900, lineHeight:'1.1', fontFamily:'Outfit'}}>ADMINI<br/>STRACI<br/>ÓN | EL<br/>PORTU<br/>GUÉS</h1>
            <div style={{color:'var(--text-muted)', fontSize:'13px', marginTop:'6px'}}>Supabase<br/>conectado - {total}<br/>reservas<br/>reales</div>
          </div>
        </div>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
          <button onClick={fetchData} className="btn-dark" style={{borderRadius:'var(--radius-full)', padding:'12px 18px'}}>↻ Actualizar</button>
          <button className="btn-gold" style={{borderRadius:'var(--radius-lg)', padding:'12px 18px', lineHeight:'1.1'}}>+ Nueva<br/>Orden</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{display:'flex', gap:'12px', overflowX:'auto', padding:'16px', scrollbarWidth:'none'}}>
        {[
          {label:'Total\nClientes', val:total, sub:'✓ Desde\nSupabase', color:'#facc15'},
          {label:'Autos en\nLavadero', val:enLavadero, sub:`${enLavadero} en proceso\nactivo`, color:'#60a5fa'},
          {label:'Turnos\nPara Hoy', val:paraHoy, sub:'Reservas\npor cliente', color:'#4ade80'},
        ].map((c,i)=>(
          <div key={i} className="glass-card" style={{minWidth:'200px', padding:'18px', flex:'1'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><div style={{color:'var(--text-muted)', fontWeight:700, whiteSpace:'pre-line', fontSize:'15px'}}>{c.label}</div><div style={{width:'36px', height:'36px', background:'rgba(255,255,255,0.05)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center'}}>👥</div></div>
            <div style={{fontSize:'36px', fontWeight:900, marginTop:'12px'}}>{c.val}</div>
            <div style={{fontSize:'13px', color:c.color===' #facc15'?'#4ade80':'', marginTop:'8px', whiteSpace:'pre-line'}}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div style={{display:'flex', gap:'24px', overflowX:'auto', padding:'0 16px', borderBottom:'1px solid var(--border-color)'}}>
        {[
          {id:'kanban', label:'Tablero\nKanban\n(Vivo)', count:''},
          {id:'reservas', label:'Reservas\n& Turnos', count:`(${total})`},
          {id:'clientes', label:'Clientes', count:`(${total})`},
          {id:'vehiculos', label:'Vehículos', count:`(${total})`},
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'14px 8px', border:'none', background:'none', color:tab===t.id?'var(--accent-gold)':'var(--text-muted)', fontWeight:tab===t.id?800:600, borderBottom:tab===t.id?'2px solid var(--accent-gold)':'2px solid transparent', whiteSpace:'pre-line', textAlign:'left', fontSize:'14px'}}>{t.label} {t.count}</button>
        ))}
      </div>

      {/* KANBAN HORIZONTAL COMO EN LA FOTO */}
      <div style={{display:'flex', gap:'16px', overflowX:'auto', padding:'16px', alignItems:'flex-start'}}>
        {ESTADOS.map(est=>{
          const lista = data.filter(r=>r.estado===est)
          return(
            <div key={est} className="glass-card" style={{minWidth:'280px', width:'280px', padding:'14px'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px', paddingBottom:'12px', borderBottom:'1px solid var(--border-color)'}}>
                <b>{est}</b><span style={{background:est==='En espera'?'rgba(212,163,86,0.2)':'rgba(59,130,246,0.2)', color:est==='En espera'?'var(--accent-gold)':'#60a5fa', width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800}}>{lista.length}</span>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                {lista.map(r=>(
                  <div key={r.id} style={{background:'var(--bg-card)', border:'1px solid var(--border-color)', borderRadius:'var(--radius-md)', padding:'12px'}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}><b style={{color:'var(--accent-gold)', fontSize:'18px'}}>{r.patente}</b><span style={{fontSize:'12px', color:'var(--text-muted)'}}>{r.hora?.slice(0,5)}</span></div>
                    <div style={{fontWeight:600, marginTop:'4px'}}>{r.cliente_nombre}</div>
                    <div style={{fontSize:'13px', color:'var(--text-secondary)'}}>{r.servicio}</div>
                    <div style={{fontWeight:800, color:'var(--accent-gold)', marginTop:'8px'}}>${Number(r.precio).toLocaleString()}</div>
                    <div style={{display:'flex', gap:'6px', marginTop:'10px', flexWrap:'wrap'}}>
                      {ESTADOS.filter(e=>e!==r.estado).map(e=><button key={e} onClick={async()=>{await supabase.from('reservas').update({estado:e}).eq('id',r.id); fetchData()}} className="btn-dark" style={{fontSize:'10px', padding:'5px 7px'}}>{e}</button>)}
                      <button onClick={async()=>{if(confirm('¿Borrar?')){await supabase.from('reservas').delete().eq('id',r.id); fetchData()}}} className="btn-dark" style={{fontSize:'10px', padding:'5px 7px', color:'#ef4444', marginLeft:'auto'}}>X</button>
                    </div>
                  </div>
                ))}
                {lista.length===0 && <div style={{textAlign:'center', color:'var(--text-muted)', fontSize:'12px', padding:'20px'}}>Vacío</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
