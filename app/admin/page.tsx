// @ts-nocheck
"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const PIN_SECRETO = "1987"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const ESTADOS = ['En espera','En proceso','Listo','Entregado'] as const

export default function Admin(){
  const [auth,setAuth]=useState(false); const [pin,setPin]=useState(''); const [err,setErr]=useState(false); const [data,setData]=useState<any[]>([]); const [loading,setLoading]=useState(true)
  useEffect(()=>{ if(localStorage.getItem('admin_el_portugues')==='ok') setAuth(true); fetchData() },[])
  const fetchData=async()=>{ setLoading(true); const {data}=await supabase.from('reservas').select('*').order('created_at',{ascending:false}); if(data) setData(data); setLoading(false)}
  const check=(e:any)=>{ e.preventDefault(); if(pin===PIN_SECRETO){ localStorage.setItem('admin_el_portugues','ok'); setAuth(true)} else {setErr(true); setTimeout(()=>setErr(false),2000)}}

  if(!auth) return <div style={{minHeight:'100vh', background:'var(--bg-main)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}><form onSubmit={check} className="glass-panel" style={{padding:'32px 24px', width:'100%', maxWidth:'360px', textAlign:'center'}}><div style={{fontSize:'32px'}}>🔒</div><h2 style={{fontFamily:'Outfit'}}>Acceso Admin</h2><p style={{color:'var(--text-muted)', fontSize:'13px', margin:'8px 0 20px'}}>PIN del lavadero</p><input autoFocus type="password" inputMode="numeric" value={pin} onChange={e=>setPin(e.target.value)} placeholder="1987" style={{width:'100%', padding:'14px', borderRadius:'var(--radius-md)', background:'#0f172a', border:err?'1px solid #ef4444':'1px solid var(--border-color)', color:'#fff', textAlign:'center', fontSize:'20px', letterSpacing:'6px'}}/>{err&&<div style={{color:'#ef4444', fontSize:'12px', marginTop:'8px'}}>PIN incorrecto</div>}<button className="btn-gold" style={{width:'100%', marginTop:'16px'}}>Entrar</button></form></div>

  return(
    <div style={{minHeight:'100vh', background:'var(--bg-main)', padding:'16px'}}>
      <div className="glass-panel" style={{padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
        <b style={{fontFamily:'Outfit'}}>Panel <span style={{color:'var(--accent-gold)'}}>Reservas</span> ({data.length})</b>
        <div style={{display:'flex', gap:'8px'}}><button onClick={fetchData} className="btn-dark" style={{padding:'8px 12px', fontSize:'12px'}}>↻</button><Link href="/" className="btn-dark" style={{padding:'8px 12px', fontSize:'12px'}}>Web</Link><button onClick={()=>{localStorage.removeItem('admin_el_portugues'); setAuth(false)}} className="btn-dark" style={{padding:'8px 12px', fontSize:'12px', color:'#ef4444'}}>Salir</button></div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'16px'}}>
        {ESTADOS.map(est=>(
          <div key={est} className="glass-card" style={{padding:'12px', minHeight:'200px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px'}}><span className={`badge ${est==='En espera'?'badge-espera':est==='En proceso'?'badge-proceso':est==='Listo'?'badge-listo':'badge-entregado'}`}>{est}</span><span style={{fontSize:'12px', color:'var(--text-muted)'}}>({data.filter(r=>r.estado===est).length})</span></div>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              {data.filter(r=>r.estado===est).map(r=>(
                <div key={r.id} style={{background:'var(--bg-card)', border:'1px solid var(--border-color)', padding:'12px', borderRadius:'var(--radius-md)'}}>
                  <div style={{display:'flex', justifyContent:'space-between'}}><b style={{fontSize:'14px'}}>{r.patente}</b><span style={{color:'var(--accent-gold)', fontWeight:800, fontSize:'12px'}}>${Number(r.precio).toLocaleString()}</span></div>
                  <div style={{fontSize:'12px', color:'var(--text-secondary)'}}>{r.cliente_nombre} • {r.cliente_telefono}</div>
                  <div style={{fontSize:'11px', color:'var(--text-muted)'}}>{r.servicio} • {r.fecha} {r.hora?.slice(0,5)}</div>
                  <div style={{display:'flex', gap:'6px', marginTop:'10px', flexWrap:'wrap'}}>
                    {ESTADOS.filter(e=>e!==r.estado).map(e=><button key={e} onClick={async()=>{await supabase.from('reservas').update({estado:e}).eq('id',r.id); fetchData()}} className="btn-dark" style={{fontSize:'10px', padding:'6px 8px'}}>{e}</button>)}
                    <a href={`https://wa.me/${r.cliente_telefono?.replace(/\D/g,'')}?text=Hola ${r.cliente_nombre}!`} target="_blank" className="btn-gold" style={{fontSize:'10px', padding:'6px 8px'}}>WA</a>
                    <button onClick={async()=>{ if(confirm('¿Borrar?')){ await supabase.from('reservas').delete().eq('id',r.id); fetchData()}}} className="btn-dark" style={{fontSize:'10px', padding:'6px 8px', color:'#ef4444', marginLeft:'auto'}}>X</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
