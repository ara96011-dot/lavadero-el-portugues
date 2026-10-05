// @ts-nocheck
"use client"
import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Droplets, Clock, Star } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const SERVICIOS = [
  { id: 'basico', nombre: 'Lavado Básico', desc: 'Carrocería exterior', precio: 8000 },
  { id: 'completo', nombre: 'Lavado Completo', desc: 'Exterior + Interior + Aspirado', precio: 12000 },
  { id: 'premium', nombre: 'Premium + Encerado', desc: 'Completo + Cera y detalles', precio: 18000 },
]

export default function Home(){
  const [patente,setPatente]=useState(''); const [nombre,setNombre]=useState(''); const [tel,setTel]=useState(''); const [servicio,setServicio]=useState('completo'); const [fecha,setFecha]=useState(new Date().toISOString().split('T')[0]); const [hora,setHora]=useState('10:00'); const [ok,setOk]=useState(false); const [loading,setLoading]=useState(false)
  const reservar=async(e:any)=>{e.preventDefault(); setLoading(true); const s=SERVICIOS.find(x=>x.id===servicio); const {error}=await supabase.from('reservas').insert([{patente:patente.toUpperCase(),cliente_nombre:nombre,cliente_telefono:tel,servicio:s?.nombre,precio:s?.precio,fecha,hora,estado:'En espera'}]); setLoading(false); if(!error){setOk(true); setPatente(''); setNombre(''); setTel('')} else alert(error.message)}

  return(
    <div style={{background:'var(--bg-main)', minHeight:'100vh'}}>
      <header className="glass-panel" style={{position:'sticky',top:0,zIndex:10, margin:'12px', padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <b style={{color:'var(--accent-gold)', fontFamily:'Outfit'}}>EL PORTUGUÉS</b>
        <Link href="/admin" className="btn-dark" style={{padding:'8px 14px', fontSize:'13px'}}>Admin</Link>
      </header>

      <main style={{maxWidth:'560px', margin:'0 auto', padding:'32px 16px 80px'}}>
        <div style={{textAlign:'center', marginBottom:'28px'}} className="animate-fade-in">
          <div className="badge badge-gold" style={{marginBottom:'12px'}}><Droplets size={12}/> Detailing Premium</div>
          <h1 style={{fontSize:'48px', lineHeight:'0.9'}}>Artesanos<br/><span style={{color:'var(--accent-gold)'}}>del lavado</span></h1>
          <p style={{color:'var(--text-secondary)', marginTop:'16px'}}>Servicio premium con productos de primera. Reservá por acá y retirá sin esperar.</p>
        </div>

        {ok? <div className="glass-card" style={{padding:'24px', textAlign:'center', borderColor:'var(--accent-gold)'}}><h3>¡Reserva enviada!</h3><p style={{color:'var(--text-muted)', fontSize:'13px', marginTop:'6px'}}>Te confirmamos por WhatsApp</p><button onClick={()=>setOk(false)} className="btn-gold" style={{width:'100%', marginTop:'16px'}}>Nueva reserva</button></div> :
        <form onSubmit={reservar} className="glass-card" style={{padding:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            <input required value={patente} onChange={e=>setPatente(e.target.value.toUpperCase())} placeholder="Patente (ABC123)" style={{padding:'14px', borderRadius:'var(--radius-md)', background:'#0f172a', border:'1px solid var(--border-color)', color:'var(--text-primary)', width:'100%'}}/>
            <input required value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Tu nombre" style={{padding:'14px', borderRadius:'var(--radius-md)', background:'#0f172a', border:'1px solid var(--border-color)', color:'var(--text-primary)', width:'100%'}}/>
          </div>
          <input required value={tel} onChange={e=>setTel(e.target.value)} placeholder="WhatsApp" style={{padding:'14px', borderRadius:'var(--radius-md)', background:'#0f172a', border:'1px solid var(--border-color)', color:'var(--text-primary)', width:'100%'}}/>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            {SERVICIOS.map(s=>(
              <button type="button" key={s.id} onClick={()=>setServicio(s.id)} className={servicio===s.id? 'glass-card' : ''} style={{textAlign:'left', padding:'14px', borderRadius:'var(--radius-md)', background:servicio===s.id?'var(--bg-panel)':'rgba(255,255,255,0.02)', border:servicio===s.id?'1px solid var(--border-glow)':'1px solid var(--border-color)'}}>
                <div style={{fontWeight:800, fontSize:'14px'}}>{s.nombre}</div><div style={{fontSize:'11px', color:'var(--text-muted)'}}>{s.desc}</div><div style={{fontWeight:900, color:'var(--accent-gold)', marginTop:'4px'}}>${s.precio.toLocaleString()}</div>
              </button>
            ))}
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={{padding:'14px', borderRadius:'var(--radius-md)', background:'#0f172a', border:'1px solid var(--border-color)', color:'var(--text-primary)', width:'100%'}}/>
            <input type="time" value={hora} onChange={e=>setHora(e.target.value)} style={{padding:'14px', borderRadius:'var(--radius-md)', background:'#0f172a', border:'1px solid var(--border-color)', color:'var(--text-primary)', width:'100%'}}/>
          </div>
          <button disabled={loading} className="btn-gold" style={{width:'100%', padding:'16px'}}><Clock size={16}/>{loading?'Enviando...':'Reservar turno'}</button>
        </form>}
      </main>

      <footer style={{maxWidth:'560px', margin:'0 auto', padding:'0 16px 24px', textAlign:'center'}}>
        <Link href="/admin" className="btn-dark" style={{width:'100%'}}><LayoutDashboard size={16}/> Entrar a Panel Admin</Link>
        <div style={{borderTop:'1px solid var(--border-color)', marginTop:'24px', paddingTop:'24px', fontSize:'13px', color:'var(--text-muted)'}}>© {new Date().getFullYear()} Lavadero El Portugués. Todos los derechos reservados.</div>
      </footer>

      <a href="https://wa.me/5493810000000" className="whatsapp-float" target="_blank"><span className="pulse-ring"></span>💬</a>
    </div>
  )
}
