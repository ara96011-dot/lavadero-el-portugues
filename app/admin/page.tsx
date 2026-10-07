// @ts-nocheck
"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const PIN = "1987"
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const ESTADOS = ['En Espera','En Proceso','Listo','Entregado']

export default function Admin(){
  const [auth,setAuth]=useState(false)
  const [pin,setPin]=useState('')
  const [data,setData]=useState<any[]>([])

  useEffect(()=>{ get() },[])
  const get=async()=>{ const {data}=await supa.from('reservas').select('*').order('created_at',{ascending:false}); if(data) setData(data) }
  const login=(e:any)=>{ e.preventDefault(); if(pin===PIN) setAuth(true); else { alert('PIN incorrecto'); setPin('') } }

  if(!auth) return (
    <div style={{minHeight:'100vh', background:'#0b0f17', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
      <form onSubmit={login} style={{background:'#131b29', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'32px 24px', width:'100%', maxWidth:'360px', textAlign:'center'}}>
        <div style={{width:'56px', height:'56px', background:'#d4a356', borderRadius:'16px', margin:'0 auto 12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>🔒</div>
        <h2 style={{fontFamily:'Outfit'}}>Acceso privado</h2>
        <p style={{color:'#64748b', fontSize:'13px', margin:'8px 0 20px'}}>Ingresa tu PIN</p>
        <input autoFocus type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="••••" style={{width:'100%', padding:'16px', borderRadius:'12px', background:'#0f172a', border:'1px solid rgba(255,255,255,0.08)', color:'#fff', textAlign:'center', fontSize:'22px', letterSpacing:'8px'}}/>
        <button style={{width:'100%', marginTop:'16px', padding:'14px', borderRadius:'12px', background:'linear-gradient(135deg,#d4a356,#f3c98b)', border:'none', fontWeight:800}}>Entrar</button>
      </form>
    </div>
  )

  const hoy = new Date().toISOString().split('T')[0]
  const hoyCount = data.filter(r=>r.fecha===hoy).length

  return(
    <div style={{minHeight:'100vh', background:'#0b0f17', padding:'12px', paddingBottom:'90px'}}>
      <div style={{background:'#131b29', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
          <div style={{width:'44px', height:'44px', background:'#d4a356', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}>💧</div>
          <b style={{fontFamily:'Outfit'}}>Lavadero El Portugues</b>
        </div>
        <button onClick={get} style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', width:'40px', height:'40px'}}>↻</button>
      </div>

      <div style={{color:'#64748b', fontSize:'14px', margin:'14px 6px'}}>Hoy - {new Date().toLocaleDateString('es-AR',{day:'2-digit',month:'short',year:'numeric'})}</div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
        <div style={{background:'#131b29', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'14px'}}><div style={{color:'#94a3b8', fontSize:'13px'}}>Total Hoy</div><div style={{fontSize:'28px', fontWeight:900}}>{hoyCount}</div><div style={{color:'#4ade80', fontSize:'12px'}}>+3 vs ayer</div></div>
        <div style={{background:'#131b29', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'14px'}}><div style={{color:'#94a3b8', fontSize:'13px'}}>Ingresos</div><div style={{fontSize:'28px', fontWeight:900}}>${(data.length*1500).toLocaleString()}</div><div style={{color:'#4ade80', fontSize:'12px'}}>+12% vs ayer</div></div>
        <div style={{background:'#131b29', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'14px'}}><div style={{color:'#94a3b8', fontSize:'13px'}}>Tiempo Prom.</div><div style={{fontSize:'28px', fontWeight:900}}>45 min</div><div style={{color:'#4ade80', fontSize:'12px'}}>-5min vs ayer</div></div>
        <div style={{background:'#131b29', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'14px'}}><div style={{color:'#94a3b8', fontSize:'13px'}}>Satisfaccion</div><div style={{fontSize:'28px', fontWeight:900}}>4.8★</div><div style={{color:'#64748b', fontSize:'12px'}}>12 reseñas</div></div>
      </div>

      <div style={{display:'flex', gap:'12px', overflowX:'auto', marginTop:'20px'}}>
        {ESTADOS.map(est=>{
          const lista=data.filter(r=>r.estado===est || (est==='En Espera'&&!r.estado))
          return(
            <div key={est} style={{minWidth:'210px', flex:1}}>
              <div style={{display:'flex', gap:'8px', alignItems:'center', marginBottom:'10px'}}><b style={{fontSize:'13px'}}>{est}</b><span style={{background:'rgba(212,163,86,0.2)', color:'#d4a356', borderRadius:'99px', padding:'2px 8px', fontSize:'12px', fontWeight:700}}>{lista.length}</span></div>
              <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                {lista.map(r=>(
                  <div key={r.id} style={{background:'#131b29', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'12px'}}>
                    <div style={{fontWeight:800, border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'4px 8px', display:'inline-block'}}>{r.patente}</div>
                    <div style={{fontSize:'12px', color:'#94a3b8', marginTop:'6px'}}>Cliente: {r.cliente_nombre}</div>
                    <div style={{fontSize:'11px', marginTop:'8px', background:'rgba(212,163,86,0.15)', color:'#d4a356', borderRadius:'99px', padding:'4px 8px', display:'inline-block'}}>{r.servicio}</div>
                    <div style={{display:'flex', gap:'4px', marginTop:'10px', flexWrap:'wrap'}}>
                      {ESTADOS.filter(e=>e!==r.estado).map(e=><button key={e} onClick={async()=>{await supa.from('reservas').update({estado:e}).eq('id',r.id); get()}} style={{fontSize:'9px', padding:'4px 6px', borderRadius:'6px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#fff'}}>{e}</button>)}
                      <button onClick={async()=>{if(confirm('Borrar?')){await supa.from('reservas').delete().eq('id',r.id); get()}}} style={{fontSize:'9px', padding:'4px 6px', borderRadius:'6px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#ef4444', marginLeft:'auto'}}>X</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{position:'fixed', bottom:'12px', left:'12px', right:'12px', background:'#131b29', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', display:'flex', justifyContent:'space-around', padding:'10px'}}>
        <span style={{color:'#d4a356', fontSize:'12px', fontWeight:700}}>📋 Tablero</span>
        <button onClick={()=>setAuth(false)} style={{background:'none', border:'none', color:'#64748b', fontSize:'12px'}}>🔒 Bloquear</button>
        <a href="/" style={{color:'#64748b', fontSize:'12px', textDecoration:'none'}}>🏠 Web</a>
      </div>
    </div>
  )
}
