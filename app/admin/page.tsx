'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

const PIN = "1987"
const ESTADOS = ['En espera','En proceso','Listo','Entregado'] as const

function safeGet(key:string){
  if(typeof window==='undefined') return []
  try{
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : []
  }catch{ return [] }
}
function safeSet(key:string, val:any){
  if(typeof window==='undefined') return
  localStorage.setItem(key, JSON.stringify(val))
}

export default function Admin(){
  const [auth,setAuth]=useState(false)
  const [pin,setPin]=useState('')
  const [tab,setTab]=useState<'kanban'|'turnos'|'clientes'>('kanban')
  const [turnos,setTurnos]=useState<any[]>([])
  const [clientes,setClientes]=useState<any[]>([])
  const [q,setQ]=useState('')

  const load = ()=>{
    setTurnos(safeGet('lavadero_turnos'))
    setClientes(safeGet('lavadero_clientes'))
  }
  useEffect(()=>{ load() }, [])

  const cambiarEstado = (id:string, est:string)=>{
    const all = safeGet('lavadero_turnos')
    const upd = all.map((t:any)=> t.id===id ? {...t, estado:est} : t)
    safeSet('lavadero_turnos', upd)
    setTurnos(upd)
  }

  const filtered = useMemo(()=>{
    const low = q.toLowerCase()
    return turnos.filter((t:any)=> 
      t.patente?.toLowerCase().includes(low) || 
      t.nombre?.toLowerCase().includes(low)
    )
  },[turnos,q])

  if(!auth){
    return (
      <div style={{minHeight:'100vh', background:'#0b0f17', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <form onSubmit={(e)=>{e.preventDefault(); if(pin===PIN) setAuth(true); else alert('PIN incorrecto')}} style={{background:'#131b29', padding:'28px', borderRadius:'16px', width:'90%', maxWidth:'320px', textAlign:'center', border:'1px solid rgba(255,255,255,0.08)'}}>
          <h3 style={{color:'#fff', fontWeight:900}}>Acceso privado</h3>
          <p style={{color:'#64748b', fontSize:'13px', marginTop:'6px'}}>PIN del lavadero</p>
          <input autoFocus type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="••••" style={{width:'100%', marginTop:'16px', padding:'14px', borderRadius:'10px', background:'#0f172a', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', textAlign:'center', fontSize:'20px', letterSpacing:'8px'}}/>
          <button type="submit" style={{width:'100%', marginTop:'14px', padding:'12px', borderRadius:'10px', background:'#d4a356', border:'none', fontWeight:800}}>Entrar</button>
        </form>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh', background:'#0b0f17', color:'#fff'}}>
      <header style={{display:'flex', justifyContent:'space-between', padding:'12px 16px', background:'#131b29', borderBottom:'1px solid rgba(255,255,255,0.08)', position:'sticky', top:0}}>
        <b>Lavadero El Portugués</b>
        <div style={{display:'flex', gap:'8px'}}>
          <Link href="/" style={{padding:'6px 12px', background:'#0f172a', borderRadius:'8px', color:'#fff', textDecoration:'none', fontSize:'12px', border:'1px solid rgba(255,255,255,0.08)'}}>Inicio</Link>
          <button onClick={()=>{localStorage.clear(); load(); alert('Datos limpiados')}} style={{padding:'6px 12px', borderRadius:'8px', background:'#0f172a', color:'#fff', border:'1px solid rgba(255,255,255,0.08)', fontSize:'12px'}}>Reset</button>
        </div>
      </header>

      <div style={{padding:'12px 16px', display:'flex', gap:'8px', borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <button onClick={()=>setTab('kanban')} style={{padding:'8px 14px', borderRadius:'8px', border:'none', background:tab==='kanban'?'#d4a356':'#1e293b', color:tab==='kanban'?'#000':'#fff', fontWeight:800, fontSize:'13px'}}>Kanban</button>
        <button onClick={()=>setTab('turnos')} style={{padding:'8px 14px', borderRadius:'8px', border:'none', background:tab==='turnos'?'#d4a356':'#1e293b', color:tab==='turnos'?'#000':'#fff', fontWeight:800, fontSize:'13px'}}>Reservas ({turnos.length})</button>
        <button onClick={()=>setTab('clientes')} style={{padding:'8px 14px', borderRadius:'8px', border:'none', background:tab==='clientes'?'#d4a356':'#1e293b', color:tab==='clientes'?'#000':'#fff', fontWeight:800, fontSize:'13px'}}>Clientes ({clientes.length})</button>
      </div>

      <div style={{padding:'16px'}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar patente o cliente..." style={{width:'100%', padding:'12px', borderRadius:'10px', background:'#131b29', border:'1px solid rgba(255,255,255,0.08)', color:'#fff', marginBottom:'16px'}}/>

        {tab==='kanban' && (
          <div style={{display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'20px'}}>
            {ESTADOS.map(est=>{
              const col = filtered.filter((t:any)=>t.estado===est)
              return (
                <div key={est} style={{minWidth:'300px', background:'#131b29', borderRadius:'12px', padding:'12px', border:'1px solid rgba(255,255,255,0.06)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.06)'}}><b style={{fontSize:'13px'}}>{est}</b><span style={{fontSize:'11px', background:'#d4a35622', color:'#d4a356', padding:'2px 8px', borderRadius:'10px'}}>{col.length}</span></div>
                  <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    {col.map((t:any)=>(
                      <div key={t.id} style={{background:'#0f172a', borderRadius:'10px', padding:'10px', border:'1px solid rgba(255,255,255,0.06)'}}>
                        <div style={{display:'flex', justifyContent:'space-between'}}><b style={{color:'#d4a356'}}>{t.patente}</b><span style={{fontSize:'11px', color:'#64748b'}}>{t.hora?.slice(0,5)}</span></div>
                        <div style={{fontSize:'13px', fontWeight:700}}>{t.nombre}</div>
                        <div style={{fontSize:'11px', color:'#94a3b8'}}>{t.servicio}</div>
                        <div style={{fontSize:'13px', color:'#d4a356', fontWeight:800, margin:'6px 0'}}>${t.precio?.toLocaleString?.() || t.precio}</div>
                        <div style={{display:'flex', gap:'6px'}}>
                          {est==='En espera' && <button onClick={()=>cambiarEstado(t.id,'En proceso')} style={{flex:1, padding:'6px', borderRadius:'6px', background:'#1e293b', color:'#fff', border:'1px solid rgba(255,255,255,0.08)', fontSize:'11px'}}>Iniciar</button>}
                          {est==='En proceso' && <button onClick={()=>cambiarEstado(t.id,'Listo')} style={{flex:1, padding:'6px', borderRadius:'6px', background:'#d4a356', border:'none', fontSize:'11px', fontWeight:800}}>Listo</button>}
                          {est==='Listo' && <button onClick={()=>cambiarEstado(t.id,'Entregado')} style={{flex:1, padding:'6px', borderRadius:'6px', background:'#22c55e', border:'none', color:'#fff', fontSize:'11px', fontWeight:800}}>Entregar</button>}
                        </div>
                      </div>
                    ))}
                    {col.length===0 && <div style={{textAlign:'center', color:'#475569', fontSize:'12px', padding:'20px', border:'1px dashed rgba(255,255,255,0.08)', borderRadius:'8px'}}>Sin vehículos</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab==='turnos' && (
          <div style={{background:'#131b29', borderRadius:'12px', padding:'12px', overflowX:'auto'}}>
            {filtered.map((t:any)=>(
              <div key={t.id} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                <div><b style={{color:'#d4a356'}}>{t.patente}</b><div style={{fontSize:'12px'}}>{t.nombre} - {t.servicio}</div><div style={{fontSize:'11px', color:'#64748b'}}>{t.fecha} {t.hora?.slice(0,5)}</div></div>
                <select value={t.estado} onChange={e=>cambiarEstado(t.id, e.target.value)} style={{height:'32px', background:'#0f172a', color:'#fff', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'6px'}}>
                  <option>En espera</option><option>En proceso</option><option>Listo</option><option>Entregado</option>
                </select>
              </div>
            ))}
          </div>
        )}

        {tab==='clientes' && (
          <div style={{background:'#131b29', borderRadius:'12px', padding:'12px'}}>
            {clientes.map((c:any)=>(
              <div key={c.id} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                <div><b>{c.nombre}</b><div style={{fontSize:'11px', color:'#94a3b8'}}>{c.patentePrincipal} - {c.telefono}</div></div>
                <div style={{fontSize:'12px', color:'#d4a356'}}>${c.gastoTotal?.toLocaleString() || 0}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
