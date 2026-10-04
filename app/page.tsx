// @ts-nocheck
"use client"
import { useState } from 'react'
import Link from 'next/link'
import { Car, Clock, MapPin, Phone, Search, Calendar, ArrowRight, MessageCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = url && key ? createClient(url, key) : null

const SERVICIOS = [
  { id: 'basico', nombre: 'Lavado Básico', precio: 8000, desc: 'Exterior, interior, vidrios' },
  { id: 'completo', nombre: 'Lavado Completo', precio: 12000, desc: 'Básico + encerado' },
  { id: 'premium', nombre: 'Lavado Premium', precio: 18000, desc: 'Completo + motor' },
  { id: 'detallado', nombre: 'Detallado Total', precio: 25000, desc: 'Premium + pulido' },
]

export default function Home(){
  const [patente,setPatente]=useState(''); const [consulta,setConsulta]=useState(''); const [turno,setTurno]=useState<any>(null); const [loading,setLoading]=useState(false); const [msg,setMsg]=useState(''); const [error,setError]=useState(''); const [form,setForm]=useState({nombre:'',telefono:'',servicio:'completo',fecha:'',hora:'09:00'})

  const reservar = async(e:any)=>{
    e.preventDefault(); setError(''); setMsg('')
    if(!supabase){ setError('FALTA CONFIGURAR SUPABASE EN VERCEL: NEXT_PUBLIC_SUPABASE_URL / ANON_KEY'); return }
    if(!patente||!form.nombre||!form.fecha){ setError('Falta patente, nombre o fecha'); return }
    setLoading(true)
    try{
      const s = SERVICIOS.find(x=>x.id===form.servicio)
      const { data, error } = await supabase.from('reservas').insert([{ patente: patente.toUpperCase(), cliente_nombre: form.nombre, cliente_telefono: form.telefono, servicio: s?.nombre, precio: s?.precio, fecha: form.fecha, hora: form.hora, estado: 'En espera' }]).select()
      if(error) throw error
      setMsg('✅ ¡Guardado! Ya está en Supabase y en la App'); setPatente(''); setForm({nombre:'',telefono:'',servicio:'completo',fecha:'',hora:'09:00'})
    }catch(err:any){ setError('ERROR REAL DE SUPABASE: ' + (err.message||JSON.stringify(err))) }
    setLoading(false)
  }

  const buscar = async(e:any)=>{
    e.preventDefault(); setLoading(true); setError(''); setTurno(null)
    if(!supabase){ setError('Falta config Supabase'); setLoading(false); return }
    const { data, error } = await supabase.from('reservas').select('*').ilike('patente',`%${consulta}%`).order('created_at',{ascending:false}).limit(1)
    if(error) setError(error.message)
    if(data?.[0]) setTurno(data[0]); else setMsg('No se encontró'); setLoading(false)
  }

  return (
    <div style={{background:'#0b0f17', minHeight:'100vh', color:'white'}}>
      {!url && <div style={{background:'red', padding:12, textAlign:'center', fontWeight:700}}>ERROR: NO TENES NEXT_PUBLIC_SUPABASE_URL EN VERCEL - POR ESO NO GUARDA</div>}
      <header style={{padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', justifyContent:'space-between'}}><div style={{display:'flex', gap:8, fontWeight:800}}><Car color="#d4a356"/> EL PORTUGUÉS</div><nav style={{display:'flex', gap:12, fontSize:13}}><a href="#servicios" style={{color:'#94a3b8', textDecoration:'none'}}>Servicios</a><a href="#estado" style={{color:'#94a3b8', textDecoration:'none'}}>Estado</a><Link href="/admin" style={{color:'#d4a356', textDecoration:'none'}}>Admin</Link></nav></header>

      <section style={{maxWidth:1100, margin:'0 auto', padding:'40px 20px', display:'grid', gap:24, gridTemplateColumns:'1fr'}}>
        <div><h1 style={{fontSize:'clamp(32px,8vw,56px)', fontWeight:900, lineHeight:0.9}}>Tu auto <span style={{color:'#d4a356'}}>impecable</span> en 30 min</h1><p style={{color:'#94a3b8', marginTop:12}}>Lavadero premium Concepción - Reserva online</p></div>
        <div style={{background:'#131b29', border:'1px solid #1e293b', borderRadius:16, padding:20}}><div style={{display:'flex', gap:8}}><Clock color="#d4a356"/> Horarios</div><p style={{color:'#94a3b8', fontSize:14, marginTop:8}}>Lun a Sab 8-18hs<br/>Dom 9-13hs<br/>Rivadavia 1234 - 3865-123456</p></div>
      </section>

      <section id="servicios" style={{maxWidth:1100, margin:'0 auto', padding:'0 20px 30px'}}><h2 style={{fontSize:24, fontWeight:700, marginBottom:16}}>Servicios</h2><div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:12}}>{SERVICIOS.map(s=><div key={s.id} style={{background:'#131b29', padding:16, borderRadius:12, border:'1px solid #1e293b'}}><div style={{display:'flex', justifyContent:'space-between'}}><b>{s.nombre}</b><span style={{color:'#d4a356', fontWeight:800}}>${s.precio}</span></div><p style={{color:'#94a3b8', fontSize:13}}>{s.desc}</p></div>)}</div></section>

      <section id="estado" style={{maxWidth:1100, margin:'0 auto', padding:'0 20px 30px'}}><div style={{background:'#131b29', padding:20, borderRadius:16, maxWidth:500}}><h3 style={{fontWeight:700, marginBottom:12, display:'flex', gap:8}}><Search size={18}/> Consultar patente</h3><form onSubmit={buscar} style={{display:'flex', gap:8}}><input value={consulta} onChange={e=>setConsulta(e.target.value)} placeholder="AA123BB" style={{flex:1, background:'#0b0f17', border:'1px solid #334155', borderRadius:10, padding:10, color:'white'}}/><button style={{background:'#d4a356', color:'black', fontWeight:800, padding:'10px 16px', borderRadius:10}}>Buscar</button></form>{turno && <div style={{marginTop:12, background:'#d4a35622', padding:12, borderRadius:10, fontSize:14}}><p>Patente: {turno.patente}</p><p>Estado: {turno.estado}</p><p>Servicio: {turno.servicio}</p></div>}</div></section>

      <section id="reserva" style={{maxWidth:1100, margin:'0 auto', padding:'0 20px 80px'}}><div style={{background:'#131b29', padding:20, borderRadius:16}}><h3 style={{fontWeight:700, fontSize:20, marginBottom:16, display:'flex', gap:8}}><Calendar color="#d4a356"/> Reservar</h3><form onSubmit={reservar} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:12}}><input value={patente} onChange={e=>setPatente(e.target.value.toUpperCase())} placeholder="PATENTE" style={{background:'#0b0f17', border:'1px solid #334155', borderRadius:10, padding:12, color:'white'}}/><input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Nombre" style={{background:'#0b0f17', border:'1px solid #334155', borderRadius:10, padding:12, color:'white'}}/><input value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} placeholder="WhatsApp" style={{background:'#0b0f17', border:'1px solid #334155', borderRadius:10, padding:12, color:'white'}}/><select value={form.servicio} onChange={e=>setForm({...form,servicio:e.target.value})} style={{background:'#0b0f17', border:'1px solid #334155', borderRadius:10, padding:12, color:'white'}}>{SERVICIOS.map(s=><option key={s.id} value={s.id}>{s.nombre} - ${s.precio}</option>)}</select><input type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})} style={{background:'#0b0f17', border:'1px solid #334155', borderRadius:10, padding:12, color:'white'}}/><input type="time" value={form.hora} onChange={e=>setForm({...form,hora:e.target.value})} style={{background:'#0b0f17', border:'1px solid #334155', borderRadius:10, padding:12, color:'white'}}/><div style={{gridColumn:'1/-1'}}><button type="submit" style={{width:'100%', background:'#d4a356', color:'black', fontWeight:900, padding:14, borderRadius:12}}>{loading?'Guardando...':'CONFIRMAR RESERVA'}</button>{msg && <p style={{color:'#22c55e', textAlign:'center', marginTop:10}}>{msg}</p>}{error && <p style={{color:'#ef4444', background:'#450a0a', padding:10, borderRadius:8, marginTop:10, fontSize:13, whiteSpace:'pre-wrap'}}>{error}</p>}</div></form></div></section>

      <a href="https://wa.me/5493865123456" target="_blank" style={{position:'fixed', bottom:20, right:20, background:'#25D366', width:60, height:60, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}><MessageCircle size={28} color="white"/></a>
    </div>
  )
}
