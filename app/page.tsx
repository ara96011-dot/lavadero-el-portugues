// @ts-nocheck
"use client"
import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Droplets, Sparkles, Shield, Car, SprayCan, Star } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const SERVICIOS = [
  { id: 'basico', nombre: 'Lavado Básico', desc: 'Exterior + llantas + secado', precio: 8000, icon: Droplets },
  { id: 'completo', nombre: 'Lavado Completo', desc: 'Exterior + interior + aspirado', precio: 12000, icon: Car },
  { id: 'premium', nombre: 'Premium + Encerado', desc: 'Cera + siliconado + detalles', precio: 18000, icon: Sparkles },
  { id: 'detaling', nombre: 'Detailing Interior', desc: 'Tapizados + plásticos + olor', precio: 25000, icon: SprayCan },
  { id: 'ceramico', nombre: 'Tratamiento Cerámico', desc: 'Protección 12 meses', precio: 65000, icon: Shield },
  { id: 'motor', nombre: 'Lavado de Motor', desc: 'Desengrase + protección', precio: 15000, icon: Star },
]

export default function Home(){
  const [patente,setPatente]=useState(''); const [nombre,setNombre]=useState(''); const [tel,setTel]=useState(''); const [servicio,setServicio]=useState('completo'); const [fecha,setFecha]=useState(new Date().toISOString().split('T')[0]); const [hora,setHora]=useState('10:00'); const [ok,setOk]=useState(false); const [loading,setLoading]=useState(false)
  const reservar=async(e:any)=>{e.preventDefault(); setLoading(true); const s=SERVICIOS.find(x=>x.id===servicio); const {error}=await supabase.from('reservas').insert([{patente:patente.toUpperCase(),cliente_nombre:nombre,cliente_telefono:tel,servicio:s?.nombre,precio:s?.precio,fecha,hora,estado:'En espera'}]); setLoading(false); if(!error){setOk(true)} else alert(error.message)}

  return(
    <div style={{background:'var(--bg-main)', minHeight:'100vh'}}>
      <header className="glass-panel" style={{position:'sticky', top:0, zIndex:20, margin:'12px', padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <b style={{color:'var(--accent-gold)', fontFamily:'Outfit', letterSpacing:'1px'}}>EL PORTUGUÉS • DETAILING</b>
        <Link href="/admin" className="btn-dark" style={{padding:'8px 14px', fontSize:'13px'}}>Admin</Link>
      </header>

      {/* HERO ROBUSTO CON FOTO */}
      <section style={{maxWidth:'1200px', margin:'0 auto', padding:'40px 16px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'32px', alignItems:'center'}}>
        <div className="animate-fade-in">
          <div className="badge badge-gold" style={{marginBottom:'16px'}}><Sparkles size={12}/> Detailing Artesanal en Tucumán</div>
          <h1 style={{fontSize:'56px', lineHeight:'0.9', fontWeight:900, fontFamily:'Outfit'}}>Artesanos<br/><span style={{color:'var(--accent-gold)'}}>del lavado</span></h1>
          <p style={{color:'var(--text-secondary)', marginTop:'20px', fontSize:'18px', lineHeight:'1.5'}}>No es solo lavar. Es devolverle el brillo de fábrica. Productos premium, turnos online y entrega sin espera.</p>
          <div style={{display:'flex', gap:'12px', marginTop:'24px'}}>
            <a href="#reserva" className="btn-gold">Reservar turno</a>
            <div style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--text-muted)', fontSize:'13px'}}><Star size={14} color="var(--accent-gold)"/> +500 autos / mes</div>
          </div>
        </div>
        <div className="glass-card" style={{overflow:'hidden', padding:'0', height:'400px', position:'relative'}}>
          <img src="https://images.unsplash.com/photo-1552930294-6d0fe98b04b0?q=80&w=800" alt="Auto lavado premium" style={{width:'100%', height:'100%', objectFit:'cover', opacity:0.9}}/>
          <div style={{position:'absolute', bottom:'12px', left:'12px', right:'12px'}} className="glass-panel"><div style={{fontSize:'12px', color:'var(--text-muted)'}}>PRÓXIMO TURNO DISPONIBLE</div><b>Hoy - 16:30hs</b></div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section style={{maxWidth:'1200px', margin:'0 auto', padding:'0 16px 40px'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'12px'}}>
          {SERVICIOS.map(s=>{
            const Icon=s.icon; const active=servicio===s.id
            return <button key={s.id} onClick={()=>setServicio(s.id)} className="glass-card" style={{textAlign:'left', padding:'16px', border:active?'1px solid var(--border-glow)':'1px solid var(--border-color)', background:active?'var(--bg-panel)':'', transform:active?'translateY(-4px)':''}}><Icon size={18} color={active?'var(--accent-gold)':'var(--text-muted)'}/><div style={{fontWeight:700, marginTop:'8px', fontSize:'14px'}}>{s.nombre}</div><div style={{fontSize:'11px', color:'var(--text-muted)', height:'28px'}}>{s.desc}</div><div style={{fontWeight:900, color:'var(--accent-gold)', marginTop:'8px'}}>${s.precio.toLocaleString()}</div></button>
          })}
        </div>
      </section>

      {/* FORMULARIO */}
      <section id="reserva" style={{maxWidth:'560px', margin:'0 auto', padding:'0 16px 80px'}}>
        {ok? <div className="glass-card" style={{padding:'32px', textAlign:'center', borderColor:'var(--accent-gold)'}}><h2>¡Reserva confirmada!</h2><p style={{color:'var(--text-muted)', marginTop:'8px'}}>Te escribimos por WhatsApp</p><button onClick={()=>setOk(false)} className="btn-gold" style={{width:'100%', marginTop:'20px'}}>Nueva reserva</button></div> :
        <form onSubmit={reservar} className="glass-card" style={{padding:'20px', display:'flex', flexDirection:'column', gap:'12px'}}>
          <h3 style={{fontFamily:'Outfit'}}>Reservá tu turno</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            <input required value={patente} onChange={e=>setPatente(e.target.value.toUpperCase())} placeholder="Patente ABC123" style={{padding:'14px', borderRadius:'var(--radius-md)', background:'#0f172a', border:'1px solid var(--border-color)', color:'#fff', width:'100%'}}/>
            <input required value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Tu nombre" style={{padding:'14px', borderRadius:'var(--radius-md)', background:'#0f172a', border:'1px solid var(--border-color)', color:'#fff', width:'100%'}}/>
          </div>
          <input required value={tel} onChange={e=>setTel(e.target.value)} placeholder="WhatsApp" style={{padding:'14px', borderRadius:'var(--radius-md)', background:'#0f172a', border:'1px solid var(--border-color)', color:'#fff', width:'100%'}}/>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={{padding:'14px', borderRadius:'var(--radius-md)', background:'#0f172a', border:'1px solid var(--border-color)', color:'#fff', width:'100%'}}/>
            <input type="time" value={hora} onChange={e=>setHora(e.target.value)} style={{padding:'14px', borderRadius:'var(--radius-md)', background:'#0f172a', border:'1px solid var(--border-color)', color:'#fff', width:'100%'}}/>
          </div>
          <div style={{fontSize:'12px', color:'var(--text-muted)'}}>Servicio seleccionado: <b style={{color:'var(--accent-gold)'}}>{SERVICIOS.find(s=>s.id===servicio)?.nombre}</b></div>
          <button disabled={loading} className="btn-gold" style={{width:'100%', padding:'16px', fontSize:'16px'}}>{loading?'Enviando...':'Confirmar reserva'}</button>
        </form>}
        <Link href="/admin" className="btn-dark" style={{width:'100%', marginTop:'16px'}}><LayoutDashboard size={16}/> Entrar a Panel Admin</Link>
        <div style={{textAlign:'center', marginTop:'24px', fontSize:'13px', color:'var(--text-muted)'}}>© {new Date().getFullYear()} Lavadero El Portugués</div>
      </section>
    </div>
  )
}
