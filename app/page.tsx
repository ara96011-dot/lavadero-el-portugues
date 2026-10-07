// @ts-nocheck
"use client"
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const SERVICIOS = [
  { id:'basico', nombre:'Lavado Básico', precio:8000 },
  { id:'completo', nombre:'Lavado Completo', precio:12000 },
  { id:'tapizados', nombre:'Tapizados', precio:25000 },
  { id:'motor', nombre:'Motor', precio:15000 },
]

const HORARIOS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00']

export default function Home(){
  const [patente,setPatente]=useState(''); const [nombre,setNombre]=useState(''); const [tel,setTel]=useState(''); const [servicio,setServicio]=useState('completo'); const [fecha,setFecha]=useState(new Date().toISOString().split('T')[0]); const [hora,setHora]=useState('10:00'); const [ok,setOk]=useState(false)

  // PARA QUE EL CLIENTE VEA EL ESTADO
  const [consulta,setConsulta]=useState(''); const [estadoAuto,setEstadoAuto]=useState<any>(null)
  const buscarEstado=async(e:any)=>{
    e.preventDefault()
    const {data}=await supa.from('reservas').select('*').ilike('patente',`%${consulta}%`).order('created_at',{ascending:false}).limit(1).single()
    if(data) setEstadoAuto(data); else { setEstadoAuto(null); alert('Patente no encontrada') }
  }

  const reservar=async(e:any)=>{e.preventDefault(); const s=SERVICIOS.find(x=>x.id===servicio); const {error}=await supa.from('reservas').insert([{patente:patente.toUpperCase(),cliente_nombre:nombre,cliente_telefono:tel,servicio:s?.nombre,precio:s?.precio,fecha,hora,estado:'En Espera'}]); if(!error) setOk(true)}

  return(
    <div style={{background:'#0b0f17', minHeight:'100vh'}}>
      <header style={{background:'#131b29', border:'1px solid rgba(255,255,255,0.08)', margin:'12px', padding:'14px 20px', borderRadius:'16px', display:'flex', justifyContent:'space-between'}}>
        <b style={{color:'#d4a356', fontFamily:'Outfit'}}>EL PORTUGUÉS</b><Link href="/admin" style={{background:'rgba(255,255,255,0.05)', padding:'8px 12px', borderRadius:'8px', fontSize:'12px', color:'#fff', textDecoration:'none'}}>Admin</Link>
      </header>

      <main style={{maxWidth:'560px', margin:'0 auto', padding:'12px 16px 80px'}}>

        {/* BUSCAR ESTADO - NUEVO */}
        <div style={{background:'#131b29', border:'1px solid rgba(212,163,86,0.2)', borderRadius:'16px', padding:'16px', marginBottom:'16px'}}>
          <b style={{fontSize:'14px'}}>¿Dónde está mi auto? 🚗</b>
          <p style={{fontSize:'12px', color:'#94a3b8', margin:'4px 0 10px'}}>Poné tu patente y mirá el estado</p>
          <form onSubmit={buscarEstado} style={{display:'flex', gap:'8px'}}>
            <input value={consulta} onChange={e=>setConsulta(e.target.value.toUpperCase())} placeholder="ABC123" style={{flex:1, padding:'12px', borderRadius:'12px', background:'#0f172a', border:'1px solid rgba(255,255,255,0.08)', color:'#fff'}}/>
            <button style={{padding:'12px 16px', borderRadius:'12px', background:'#d4a356', border:'none', fontWeight:800}}>Ver</button>
          </form>
          {estadoAuto && (
            <div style={{marginTop:'12px', padding:'12px', background:'#0f172a', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.08)'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}><b>{estadoAuto.patente}</b><span style={{background:'#d4a356', color:'#000', borderRadius:'99px', padding:'2px 10px', fontSize:'12px', fontWeight:800}}>{estadoAuto.estado}</span></div>
              <div style={{fontSize:'12px', color:'#94a3b8', marginTop:'4px'}}>{estadoAuto.servicio} • {estadoAuto.fecha} {estadoAuto.hora?.slice(0,5)}</div>
            </div>
          )}
        </div>

        <div style={{borderRadius:'16px', overflow:'hidden', height:'220px', background:`linear-gradient(to top, rgba(11,15,23,0.9), rgba(11,15,23,0.1)), url('https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800') center/cover`, display:'flex', alignItems:'flex-end', padding:'20px', border:'1px solid rgba(255,255,255,0.08)'}}>
          <div><h1 style={{fontSize:'32px', lineHeight:'0.9', fontWeight:900, fontFamily:'Outfit'}}>Artesanos<br/><span style={{color:'#d4a356'}}>del lavado</span></h1></div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'16px'}}>
          {SERVICIOS.map(s=><button key={s.id} onClick={()=>setServicio(s.id)} style={{textAlign:'left', padding:'14px', borderRadius:'12px', background:servicio===s.id?'#1e293b':'#131b29', border:servicio===s.id?'1px solid #d4a356':'1px solid rgba(255,255,255,0.08)', color:'#fff'}}><div style={{fontWeight:700, fontSize:'13px'}}>{s.nombre}</div><div style={{color:'#d4a356', fontWeight:800, marginTop:'4px'}}>${s.precio.toLocaleString()}</div></button>)}
        </div>

        {!ok? (
        <form onSubmit={reservar} style={{marginTop:'16px', background:'#131b29', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
          <input required value={patente} onChange={e=>setPatente(e.target.value.toUpperCase())} placeholder="Patente" style={{padding:'14px', borderRadius:'12px', background:'#0f172a', border:'1px solid rgba(255,255,255,0.08)', color:'#fff'}}/>
          <input required value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Tu nombre" style={{padding:'14px', borderRadius:'12px', background:'#0f172a', border:'1px solid rgba(255,255,255,0.08)', color:'#fff'}}/>
          <input required value={tel} onChange={e=>setTel(e.target.value)} placeholder="WhatsApp" style={{padding:'14px', borderRadius:'12px', background:'#0f172a', border:'1px solid rgba(255,255,255,0.08)', color:'#fff'}}/>
          <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={{padding:'14px', borderRadius:'12px', background:'#0f172a', border:'1px solid rgba(255,255,255,0.08)', color:'#fff'}}/>

          {/* HORARIOS CON NÚMEROS - BÁSICO COMO ANTES */}
          <div>
            <div style={{fontSize:'12px', color:'#94a3b8', marginBottom:'8px'}}>Horarios disponibles hoy</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
              {HORARIOS.map(h=><button key={h} type="button" onClick={()=>setHora(h)} style={{padding:'8px 12px', borderRadius:'8px', border:hora===h?'1px solid #d4a356':'1px solid rgba(255,255,255,0.08)', background:hora===h?'#d4a356':'#0f172a', color:hora===h?'#000':'#fff', fontWeight:hora===h?800:400, fontSize:'13px'}}>{h}</button>)}
            </div>
          </div>

          <button style={{width:'100%', padding:'16px', borderRadius:'12px', background:'linear-gradient(135deg,#d4a356,#f3c98b)', border:'none', fontWeight:800}}>Reservar - {SERVICIOS.find(s=>s.id===servicio)?.nombre}</button>
        </form>
        ) : (
          <div style={{marginTop:'16px', background:'#131b29', borderRadius:'16px', padding:'32px', textAlign:'center'}}><h3 style={{color:'#d4a356'}}>¡Reserva enviada!</h3><p style={{color:'#94a3b8', fontSize:'13px', marginTop:'8px'}}>Podés seguir tu auto arriba con la patente</p><button onClick={()=>setOk(false)} style={{width:'100%', marginTop:'16px', padding:'12px', borderRadius:'12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#fff'}}>Nueva reserva</button></div>
        )}
      </main>
    </div>
  )
}
