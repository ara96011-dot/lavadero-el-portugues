"use client"
// @ts-nocheck
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Car, Clock, MapPin, Phone, Search, Calendar, Droplets, Sparkles, ShieldCheck, ArrowRight, MessageCircle, Wrench } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SERVICIOS = [
  { id: 'basico', nombre: 'Lavado Básico', precio: 8000, duracion: '30 min', desc: 'Exterior, interior aspirado, vidrios' },
  { id: 'completo', nombre: 'Lavado Completo', precio: 12000, duracion: '60 min', desc: 'Básico + encerado + detalles' },
  { id: 'premium', nombre: 'Lavado Premium', precio: 18000, duracion: '90 min', desc: 'Completo + motor + tapizados' },
  { id: 'detallado', nombre: 'Detallado Total', precio: 25000, duracion: '120 min', desc: 'Premium + pulido + sellado cerámico' },
]

export default function Home() {
  const [patente, setPatente] = useState('')
  const [consultaPatente, setConsultaPatente] = useState('')
  const [turno, setTurno] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ nombre: '', telefono: '', servicio: 'completo', fecha: '', hora: '09:00' })

  const handleReserva = async (e: any) => {
    e.preventDefault()
    if (!patente || !form.nombre || !form.telefono || !form.fecha) {
      setMsg('Completá todos los campos')
      return
    }
    setLoading(true)
    setMsg('')
    try {
      const servicioData = SERVICIOS.find(s => s.id === form.servicio)
      const { error } = await supabase.from('reservas').insert([{
        patente: patente.toUpperCase(),
        cliente_nombre: form.nombre,
        cliente_telefono: form.telefono,
        servicio: servicioData?.nombre,
        precio: servicioData?.precio,
        fecha: form.fecha,
        hora: form.hora,
        estado: 'En espera',
        created_at: new Date().toISOString()
      }])
      if (error) throw error
      setMsg('¡Reserva confirmada! Te contactamos por WhatsApp')
      setPatente('')
      setForm({ nombre: '', telefono: '', servicio: 'completo', fecha: '', hora: '09:00' })
    } catch (err: any) {
      console.log(err)
      setMsg('Error: ' + err.message)
    }
    setLoading(false)
  }

  const handleBuscar = async (e: any) => {
    e.preventDefault()
    if (!consultaPatente) return
    setLoading(true)
    const { data, error } = await supabase.from('reservas').select('*').ilike('patente', `%${consultaPatente}%`).order('created_at', { ascending: false }).limit(1)
    if (data && data[0]) setTurno(data[0])
    else setMsg('No encontramos esa patente')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f17' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(11,15,23,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px' }}>
        <div className="header-inner" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 18 }}><Car color="#d4a356" /> EL PORTUGUÉS</div>
          <nav style={{ display: 'flex', gap: 20, fontSize: 14 }}><a href="#servicios" style={{ color: '#94a3b8', textDecoration: 'none' }}>Servicios</a><a href="#estado" style={{ color: '#94a3b8', textDecoration: 'none' }}>Estado</a><a href="#reserva" style={{ color: '#94a3b8', textDecoration: 'none' }}>Reservar</a><Link href="/admin" style={{ color: '#d4a356', textDecoration: 'none', fontWeight: 700 }}>Admin</Link></nav>
        </div>
      </header>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }} className="hero-grid">
        <div><h1 style={{ fontSize: 52, lineHeight: 0.95, marginBottom: 16 }}>Tu auto <span style={{ color: '#d4a356' }}>impecable</span> en 30 minutos</h1><p style={{ color: '#94a3b8', fontSize: 18, marginBottom: 24 }}>Lavadero premium en Concepción, Tucumán. Reserva online y seguí el estado de tu vehículo.</p><div style={{ display: 'flex', gap: 12 }}><a href="#reserva" className="btn-gold">Reservar ahora <ArrowRight size={18} /></a><a href="#estado" className="btn-dark"><Search size={18} /> Consultar patente</a></div></div>
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={18} color="#d4a356" /> Horarios</h3><p style={{ color: '#94a3b8' }}>Lunes a Sábado: 8:00 - 18:00<br/>Domingos: 9:00 - 13:00</p><div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}><MapPin size={16} /> Rivadavia 1234, Concepción</div><div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}><Phone size={16} /> 3865-123456</div>
        </div>
      </section>

      <section id="servicios" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 60px' }}>
        <h2 style={{ fontSize: 32, marginBottom: 24 }}>Servicios</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
          {SERVICIOS.map(s => (
            <div key={s.id} className="glass-card" style={{ padding: 20 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><strong>{s.nombre}</strong><span style={{ color: '#d4a356', fontWeight: 800 }}>${s.precio}</span></div><p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>{s.desc}</p><span style={{ fontSize: 12, color: '#64748b' }}>{s.duracion}</span></div>
          ))}
        </div>
      </section>

      <section id="estado" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px' }}>
        <div className="glass-panel" style={{ padding: 24, maxWidth: 600 }}>
          <h2 style={{ fontSize: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Search size={20} color="#d4a356" /> Consultar estado por patente</h2>
          <form onSubmit={handleBuscar} style={{ display: 'flex', gap: 12 }}><input value={consultaPatente} onChange={e => setConsultaPatente(e.target.value)} placeholder="Ej: AA123BB" style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: '#131b29', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} /><button className="btn-gold" disabled={loading}>Buscar</button></form>
          {turno && (<div style={{ marginTop: 16, padding: 16, background: 'rgba(212,163,86,0.1)', borderRadius: 12, border: '1px solid rgba(212,163,86,0.2)' }}><p><strong>Patente:</strong> {turno.patente}</p><p><strong>Cliente:</strong> {turno.cliente_nombre}</p><p><strong>Servicio:</strong> {turno.servicio}</p><p><strong>Estado:</strong> <span className={`badge badge-${turno.estado === 'En espera' ? 'espera' : turno.estado === 'En proceso' ? 'proceso' : turno.estado === 'Listo' ? 'listo' : 'entregado'}`}>{turno.estado}</span></p><p><strong>Fecha:</strong> {turno.fecha} - {turno.hora}</p></div>)}
        </div>
      </section>

      <section id="reserva" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <div className="glass-panel" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 28, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}><Calendar size={22} color="#d4a356" /> Reservar turno</h2>
          <form onSubmit={handleReserva} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <input value={patente} onChange={e => setPatente(e.target.value.toUpperCase())} placeholder="Patente (AA123BB)" style={{ padding: 14, borderRadius: 12, background: '#131b29', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" style={{ padding: 14, borderRadius: 12, background: '#131b29', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="WhatsApp" style={{ padding: 14, borderRadius: 12, background: '#131b29', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            <select value={form.servicio} onChange={e => setForm({ ...form, servicio: e.target.value })} style={{ padding: 14, borderRadius: 12, background: '#131b29', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              {SERVICIOS.map(s => <option key={s.id} value={s.id}>{s.nombre} - ${s.precio}</option>)}
            </select>
            <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} style={{ padding: 14, borderRadius: 12, background: '#131b29', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            <input type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} style={{ padding: 14, borderRadius: 12, background: '#131b29', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            <div style={{ gridColumn: 'span 2' }}><button type="submit" className="btn-gold" style={{ width: '100%' }} disabled={loading}>{loading ? 'Guardando...' : 'Confirmar Reserva'}</button>{msg && <p style={{ marginTop: 12, color: msg.includes('Error') ? '#f87171' : '#4ade80', textAlign: 'center' }}>{msg}</p>}</div>
          </form>
        </div>
      </section>

      <a href="https://wa.me/5493865123456?text=Hola%20El%20Portugues%20quiero%20consultar%20por%20un%20lavado" className="whatsapp-float" target="_blank"><MessageCircle size={28} /><span className="pulse-ring"></span></a>

      <footer style={{ textAlign: 'center', padding: 24, color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.08)' }}>© 2026 Lavadero El Portugués - Concepción, Tucumán</footer>
    </div>
  )
}
