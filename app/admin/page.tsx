'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PIN = "1987"
const ESTADOS = ['En espera','En proceso','Listo','Entregado'] as const

export default function Admin(){
  const [auth,setAuth]=useState(false)
  const [pin,setPin]=useState('')
  const [turnos,setTurnos]=useState<any[]>([])
  const [q,setQ]=useState('')

  const load = async ()=>{
    const { data } = await supabase.from('reservas').select('*').order('created_at',{ascending:false})
    if(data) setTurnos(data)
  }
  useEffect(()=>{ if(auth) load() },[auth])

  const cambiarEstado = async (id:string, est:string)=>{
    await supabase.from('reservas').update({estado:est}).eq('id',id)
    load()
  }

  if(!auth){
    return (
      <div style={{minHeight:'100vh', background:'#0b0f17', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <form onSubmit={(e)=>{e.preventDefault(); if(pin===PIN) setAuth(true); else alert('PIN')}} style={{background:'#131b29', padding:'28px', borderRadius:'16px', width:'90%', maxWidth:'320px', textAlign:'center', border:'1px solid rgba(255,255,255,0.08)'}}>
          <h3 style={{color:'#fff', fontWeight:900}}>Acceso privado</h3>
          <input autoFocus type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="••••" style={{width:'100%', marginTop:'16px', padding:'14px', borderRadius:'10px', background:'#0f172a', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', textAlign:'center', fontSize:'20px', letterSpacing:'8px'}}/>
          <button type="submit" style={{width:'100%', marginTop:'14px', padding:'12px', borderRadius:'10px', background:'#d4a356', border:'none', fontWeight:800}}>Entrar</button>
        </form>
      </div>
    )
  }

  const filtered = turnos.filter(t=> t.patente?.toLowerCase().includes(q.toLowerCase()) || t.nombre?.toLowerCase().includes(q.toLowerCase()))

  return (
    <div style={{minHeight:'100vh', background:'#0b0f17', color:'#fff'}}>
      <header style={{display:'flex', justifyContent:'space-between', padding:'12px 16px', background:'#131b29', borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <b>Lavadero El Portugués - {turnos.length} turnos</b>
        <div style={{display:'flex', gap:'8px'}}><Link href="/" style={{padding:'6px 12px', background:'#0f172a', borderRadius:'8px', color:'#fff', textDecoration:'none', fontSize:'12px'}}>Inicio</Link><button onClick={load} style={{padding:'6px 12px', borderRadius:'8px', background:'#d4a356', border:'none', fontSize:'12px', fontWeight:800}}>Actualizar</button></div>
      </header>
      <div style={{padding:'16px'}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar patente..." style={{width:'100%', padding:'12px', borderRadius:'10px', background:'#131b29', border:'1px solid rgba(255,255,255,0.08)', color:'#fff', marginBottom:'16px'}}/>
        <div style={{display:'flex', gap:'12px', overflowX:'auto'}}>
          {ESTADOS.map(est=>{
            const col = filtered.filter((t:any)=>t.estado===est)
            return (
              <div key={est} style={{minWidth:'300px', background:'#131b29', borderRadius:'12px', padding:'12px', border:'1px solid rgba(255,255,255,0.06)'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', borderBottom:'1px solid rgba(255,255,255,0.06)', paddingBottom:'8px'}}><b>{est}</b><span style={{fontSize:'11px', background:'#d4a35622', color:'#d4a356', padding:'2px 8px', borderRadius:'10px'}}>{col.length}</span></div>
                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                  {col.map((t:any)=>(
                    <div key={t.id} style={{background:'#0f172a', borderRadius:'10px', padding:'10px'}}>
                      <b style={{color:'#d4a356'}}>{t.patente}</b> <span style={{fontSize:'11px', color:'#64748b'}}>{t.hora?.slice(0,5)}</span>
                      <div style={{fontSize:'13px', fontWeight:700}}>{t.nombre}</div>
                      <div style={{fontSize:'11px', color:'#94a3b8'}}>{t.servicio}</div>
                      <div style={{color:'#d4a356', fontWeight:800, margin:'6px 0'}}>${t.precio}</div>
                      <div style={{display:'flex', gap:'6px'}}>
                        {est==='En espera' && <button onClick={()=>cambiarEstado(t.id,'En proceso')} style={{flex:1, padding:'6px', borderRadius:'6px', background:'#1e293b', color:'#fff', border:'1px solid rgba(255,255,255,0.08)'}}>Iniciar</button>}
                        {est==='En proceso' && <button onClick={()=>cambiarEstado(t.id,'Listo')} style={{flex:1, padding:'6px', borderRadius:'6px', background:'#d4a356', border:'none', fontWeight:800}}>Listo</button>}
                        {est==='Listo' && <button onClick={()=>cambiarEstado(t.id,'Entregado')} style={{flex:1, padding:'6px', borderRadius:'6px', background:'#22c55e', border:'none', color:'#fff', fontWeight:800}}>Entregar</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
