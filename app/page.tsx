'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Car, Sparkles, Calendar, Clock, CheckCircle2, ShieldCheck,
  Search, MessageCircle, ChevronRight, MapPin, Phone,
  LayoutDashboard, Award, ArrowRight
} from 'lucide-react'

type Turno = any
const getTurnos = () => {
  if(typeof window==='undefined') return []
  try { return JSON.parse(localStorage.getItem('lavadero_turnos') || '[]') } catch { return [] }
}

const serviciosInfo = [
  { id: 'carroceria-interior', nombre: 'Carrocería + Interior', precio: '$12.000', tiempo: '60 min', popular: true, imagen: '/images/hero.png', descripcion: 'Lavado artesanal exterior con shampoo pH neutro y aspirado profundo.', incluye: ['Shampoo Neutro', 'Aspirado completo', 'Limpieza de cristales', 'Acondicionado de neumáticos'] },
  { id: 'lavado-completo-motor', nombre: 'Lavado Completo + Motor a Vapor', precio: '$15.000', tiempo: '90 min', popular: false, imagen: '/images/detailing.png', descripcion: 'Limpieza detallada y desengrasado técnico del motor a vapor.', incluye: ['Lavado exterior + interior', 'Motor a vapor', 'Protector plastificante', 'Perfumado'] },
  { id: 'encerado-abrillantado', nombre: 'Encerado & Abrillantado', precio: '$18.000', tiempo: '120 min', popular: false, imagen: '/images/interior.png', descripcion: 'Cera sintética de alta durabilidad.', incluye: ['Lavado descontaminación', 'Encerado Carnauba', 'Protección UV', 'Acondicionamiento'] },
  { id: 'tratamiento-ceramico', nombre: 'Tratamiento Cerámico / Grafeno', precio: '$45.000', tiempo: '1 Día', popular: true, imagen: '/images/detailing.png', descripcion: 'Corrección de laca y protección cerámica 9H.', incluye: ['Corrección 2 pasos', 'Protección 12 meses', 'Hidrofóbico', 'Garantía'] },
  { id: 'tapizados-interior', nombre: 'Descontaminación de Tapizados', precio: '$28.000', tiempo: '4 a 6hs', popular: false, imagen: '/images/interior.png', descripcion: 'Inyección y extracción de manchas.', incluye: ['Inyección extracción', 'Elimina olores', 'Ozonización', 'Nutrición'] },
  { id: 'restauracion-opticas', nombre: 'Restauración de Ópticas', precio: '$14.000', tiempo: '45 min', popular: false, imagen: '/images/hero.png', descripcion: 'Devolver transparencia de fábrica.', incluye: ['Lijado fino', 'Pulido', 'Sellador UV', 'Mejora luz'] }
]

export default function Home() {
  const [patenteBuscar, setPatenteBuscar] = useState('')
  const [resultadoBusqueda, setResultadoBusqueda] = useState<Turno | null>(null)
  const [buscado, setBuscado] = useState(false)
  const [nombre, setNombre] = useState('')
  const [patente, setPatente] = useState('')
  const [telefono, setTelefono] = useState('')
  const [servicioSeleccionado, setServicioSeleccionado] = useState(serviciosInfo[0].nombre)
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [cargando, setCargando] = useState(false)
  const [reservaExito, setReservaExito] = useState(false)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setFecha(today)
    setHora('10:00')
  }, [])

  const handleBuscarPatente = (e: React.FormEvent) => {
    e.preventDefault()
    if (!patenteBuscar.trim()) return
    const turnos = getTurnos()
    const cleanPatente = patenteBuscar.trim().toUpperCase().replace(/[-\s]/g, '')
    const match = turnos.find((t: any) => t.patente.replace(/[-\s]/g, '') === cleanPatente)
    setResultadoBusqueda(match || null)
    setBuscado(true)
  }

  const handleReservar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre ||!patente ||!telefono ||!fecha ||!hora) {
      alert('Completá todos los campos')
      return
    }
    setCargando(true)
    try {
      const srvObj = serviciosInfo.find(s => s.nombre === servicioSeleccionado)
      const precio = srvObj? parseInt(srvObj.precio.replace(/[^0-9]/g, '')) : 12000
      const nuevaPatente = patente.toUpperCase().trim()

      const nuevoTurno = {
        id: `tur_${Date.now()}`,
        nombre, patente: nuevaPatente, telefono,
        servicio: servicioSeleccionado, precio, fecha, hora,
        estado: 'En espera', created_at: new Date().toISOString()
      }

      const guardados = JSON.parse(localStorage.getItem('lavadero_turnos') || '[]')
      guardados.unshift(nuevoTurno)
      localStorage.setItem('lavadero_turnos', JSON.stringify(guardados))

      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!url ||!key) {
        console.log('Sin env de Supabase, solo local')
      } else {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(url, key)
        const { error } = await supabase.from('reservas').insert([{
          nombre, patente: nuevaPatente, telefono,
          servicio: servicioSeleccionado, precio, fecha, hora, estado: 'En espera'
        }])
        if (error) alert('Error Supabase: ' + error.message)
      }

      setReservaExito(true)
      const mensaje = encodeURIComponent(`Hola Lavadero El Portugues! Turno: ${nombre} - ${nuevaPatente} - ${servicioSeleccionado} - ${fecha} ${hora}`)
      window.open('https://wa.me/5493865859894?text=' + mensaje, '_blank')
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(11, 15, 23, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #d4a356, #b88536)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Car size={24} color="#0b0f17" /></div>
            <div><span style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>EL PORTUGUÉS</span><span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Detailing & Lavado Profesional</span></div>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#servicios" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Servicios</a>
            <a href="#estado" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Estado</a>
            <a href="#turnos" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Reservar</a>
            <Link href="/admin" className="btn-dark" style={{ padding: '8px 16px', fontSize: '13px' }}><LayoutDashboard size={16} /> Panel Admin</Link>
          </nav>
        </div>
      </header>

      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 900 }}>Tu auto en manos de <span style={{ color: '#d4a356' }}>especialistas</span>.</h1>
        <a href="#turnos" className="btn-gold" style={{ marginTop: '24px', display: 'inline-flex' }}><Calendar size={18} /> Reservar Turno Online</a>
      </section>

      <section id="estado" style={{ padding: '60px 24px', background: 'var(--bg-panel)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>Consultá el Estado de tu Vehículo</h2>
          <form onSubmit={handleBuscarPatente} style={{ display: 'flex', gap: '12px', maxWidth: '500px', margin: '0 auto 24px' }}>
            <input type="text" placeholder="Patente" value={patenteBuscar} onChange={e => setPatenteBuscar(e.target.value.toUpperCase())} style={{ flex: 1, padding: '14px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: '#fff', fontWeight: 700, textAlign: 'center' }} />
            <button type="submit" className="btn-gold"><Search size={18} /> Consultar</button>
          </form>
          {buscado && <div className="glass-card" style={{ padding: '16px' }}>{resultadoBusqueda? <><b style={{ color: '#d4a356' }}>{resultadoBusqueda.patente}</b> - {resultadoBusqueda.nombre} - {resultadoBusqueda.estado}</> : <span>No encontrado {patenteBuscar}</span>}</div>}
        </div>
      </section>

      <section id="servicios" style={{ padding: '60px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {serviciosInfo.map(s => (
            <div key={s.id} className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ fontWeight: 800 }}>{s.nombre}</h3><p style={{ color: '#d4a356', fontWeight: 900 }}>{s.precio}</p><p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.descripcion}</p>
              <a href="#turnos" onClick={() => setServicioSeleccionado(s.nombre)} className="btn-dark" style={{ width: '100%', marginTop: '12px' }}>Agendar</a>
            </div>
          ))}
        </div>
      </section>

      <section id="turnos" style={{ padding: '60px 24px', background: 'var(--bg-panel)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: '28px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 900, textAlign: 'center', marginBottom: '20px' }}>Reservá tu Turno</h2>
            {reservaExito? (
              <div style={{ textAlign: 'center' }}><CheckCircle2 size={40} color="#22c55e" style={{ margin: '0 auto' }} /><h3>¡Reserva guardada!</h3><p style={{ color: 'var(--text-secondary)' }}>Se abrió WhatsApp y ya está en el sistema.</p><button onClick={() => setReservaExito(false)} className="btn-gold" style={{ marginTop: '16px' }}>Otra reserva</button></div>
            ) : (
              <form onSubmit={handleReservar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 1' }}><label>Nombre *</label><input required value={nombre} onChange={e => setNombre(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} /></div>
                <div style={{ gridColumn: 'span 1' }}><label>Patente *</label><input required value={patente} onChange={e => setPatente(e.target.value.toUpperCase())} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff', textTransform: 'uppercase' }} /></div>
                <div style={{ gridColumn: 'span 1' }}><label>Teléfono *</label><input required value={telefono} onChange={e => setTelefono(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} /></div>
                <div style={{ gridColumn: 'span 1' }}><label>Servicio *</label><select value={servicioSeleccionado} onChange={e => setServicioSeleccionado(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }}>{serviciosInfo.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}</select></div>
                <div style={{ gridColumn: 'span 1' }}><label>Fecha *</label><input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} /></div>
                <div style={{ gridColumn: 'span 1' }}><label>Hora *</label><select value={hora} onChange={e => setHora(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }}><option>08:30</option><option>09:30</option><option>10:30</option><option>11:30</option><option>14:30</option><option>15:30</option><option>16:30</option><option>17:30</option></select></div>
                <div style={{ gridColumn: 'span 2' }}><button type="submit" disabled={cargando} className="btn-gold" style={{ width: '100%', padding: '14px' }}>{cargando? 'Guardando...' : 'Confirmar Reserva por WhatsApp'}</button></div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
