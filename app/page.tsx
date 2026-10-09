'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Car,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Search,
  MessageCircle,
  ChevronRight,
  MapPin,
  Phone,
  LayoutDashboard,
  Award,
  ArrowRight
} from 'lucide-react'
import { getTurnos, saveTurno, Turno } from '@/lib/db'

const serviciosInfo = [
  {
    id: 'carroceria-interior',
    nombre: 'Carrocería + Interior',
    precio: '$12.000',
    tiempo: '60 min',
    popular: true,
    imagen: '/images/hero.png',
    descripcion: 'Lavado artesanal exterior con shampoo pH neutro, secado con microfibra de alta densidad y aspirado profundo interior.',
    incluye: ['Shampoo Neutro de alta espuma', 'Aspirado completo de alfombras y asientos', 'Limpieza de cristales por dentro y fuera', 'Acondicionado de neumáticos']
  },
  {
    id: 'lavado-completo-motor',
    nombre: 'Lavado Completo + Motor a Vapor',
    precio: '$15.000',
    tiempo: '90 min',
    popular: false,
    imagen: '/images/detailing.png',
    descripcion: 'Limpieza detallada de carrocería, habitáculo completo y desengrasado técnico del vano motor con vapor controlado.',
    incluye: ['Lavado exterior + interior premium', 'Desengrasado y lavado de motor a vapor', 'Protector plastificante para plásticos de motor', 'Perfumado especial']
  },
  {
    id: 'encerado-abrillantado',
    nombre: 'Encerado & Abrillantado',
    precio: '$18.000',
    tiempo: '120 min',
    popular: false,
    imagen: '/images/interior.png',
    descripcion: 'Aplicación de cera sintética de alta durabilidad para restaurar el brillo profundo y crear hidrofobia repelente al agua.',
    incluye: ['Lavado de descontaminación', 'Encerado con Carnauba o Sintético', 'Brillo espejo y protección UV (3 meses)', 'Acondicionamiento de gomas y baguetas']
  },
  {
    id: 'tratamiento-ceramico',
    nombre: 'Tratamiento Cerámico / Grafeno',
    precio: '$45.000',
    tiempo: '1 Día',
    popular: true,
    imagen: '/images/detailing.png',
    descripcion: 'Corrección de laca (pulido técnico de rayones) y protección cerámica multicapa con dureza 9H.',
    incluye: ['Corrección de pintura en 2 o 3 pasos', 'Protección cerámica por 12 a 24 meses', 'Efecto superhidrofóbico y dureza 9H', 'Certificado de garantía']
  },
  {
    id: 'tapizados-interior',
    nombre: 'Descontaminación de Tapizados',
    precio: '$28.000',
    tiempo: '4 a 6hs',
    popular: false,
    imagen: '/images/interior.png',
    descripcion: 'Inyección y extracción de manchas en asientos, alfombras y techos con secado rápido e higienización por ozono.',
    incluye: ['Lavado por inyección y extracción', 'Eliminación de bacterias y malos olores', 'Higienización integral con ozono', 'Nutrición de plásticos y cueros']
  },
  {
    id: 'restauracion-opticas',
    nombre: 'Restauración de Ópticas',
    precio: '$14.000',
    tiempo: '45 min',
    popular: false,
    imagen: '/images/hero.png',
    descripcion: 'Lijado al agua de capas opacas y barnizado o sellado cerámico para devolver la transparencia de fábrica.',
    incluye: ['Lijado progresivo microfino', 'Pulido y abrillantado de policarbonato', 'Sellador UV protector', 'Mejora del 100% en potencia lumínica']
  }
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
    const match = turnos.find(t => t.patente.replace(/[-\s]/g, '') === cleanPatente)
    setResultadoBusqueda(match || null)
    setBuscado(true)
  }

  const handleReservar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre ||!patente ||!telefono ||!fecha ||!hora) {
      alert('Por favor completá todos los campos del formulario.')
      return
    }
    setCargando(true)
    try {
      const srvObj = serviciosInfo.find(s => s.nombre === servicioSeleccionado)
      const precio = srvObj? parseInt(srvObj.precio.replace(/[^0-9]/g, '')) : 12000
      const nuevaPatente = patente.toUpperCase().trim()

      const turnoData = {
        nombre,
        patente: nuevaPatente,
        telefono,
        servicio: servicioSeleccionado,
        precio,
        fecha,
        hora,
        estado: 'En espera' as const
      }

      // Guarda local (PC y celu)
      saveTurno(turnoData)

      // Guarda Supabase
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
        const { error } = await supa.from('reservas').insert([turnoData])
        if(error) console.log('Supabase error:', error.message)
      } catch {}

      setReservaExito(true)
      const mensaje = encodeURIComponent(
        `Hola Lavadero El Portugues!\nQuiero confirmar mi turno:\nCliente: ${nombre}\nPatente: ${nuevaPatente}\nServicio: ${servicioSeleccionado}\nFecha: ${fecha}\nHora: ${hora}\nTel: ${telefono}`
      )
      window.open('https://wa.me/5493865859894?text=' + mensaje, '_blank')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      {/* Header RESPONSIVE */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(11, 15, 23, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '12px 16px'
      }}>
        <div className="header-inner">
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #d4a356, #b88536)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(212, 163, 86, 0.3)'
            }}>
              <Car size={24} color="#0b0f17" />
            </div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>EL PORTUGUÉS</span>
              <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                Detailing & Lavado Profesional
              </span>
            </div>
          </Link>

          <nav className="nav-menu">
            <a href="#servicios" className="nav-link">Servicios</a>
            <a href="#estado" className="nav-link">Estado</a>
            <a href="#turnos" className="nav-link">Reservar</a>
            <Link href="/admin" className="btn-dark" style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}>
              <LayoutDashboard size={14} /> Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={{
        position: 'relative',
        padding: '60px 16px 80px',
        background: 'radial-gradient(circle at 50% 20%, rgba(212, 163, 86, 0.12) 0%, rgba(11, 15, 23, 1) 70%)',
        overflow: 'hidden'
      }}>
        <div className="hero-grid">
          <div className="animate-fade-in">
            <div className="badge badge-gold" style={{ marginBottom: '16px' }}>
              <Sparkles size={14} /> Estética Automotriz Premium
            </div>
            <h1 className="hero-title">
              Artesanos del <span style={{ color: 'var(--accent-gold)', background: 'linear-gradient(135deg, #d4a356, #f3c98b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lavado</span>.
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.6 }}>
              En <b>Lavadero El Portugués</b> combinamos pasión artesanal, tecnología en vapor y productos de marcas líderes.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
              <a href="#turnos" className="btn-gold"><Calendar size={16} /> Reservar Turno</a>
              <a href="https://wa.me/5493865859894" target="_blank" rel="noopener noreferrer" className="btn-dark">
                <MessageCircle size={16} color="var(--accent-green)" /> WhatsApp
              </a>
            </div>
          </div>
          <div style={{ position: 'relative', width: '100%' }}>
            <div className="glass-card" style={{ padding: '10px', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: '14px', overflow: 'hidden' }}>
                <img src="/images/hero.png" alt="Lavadero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(11,15,23,0.95), transparent)', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={22} color="var(--accent-gold)" />
                    <div><h4 style={{ fontSize: '14px', fontWeight: 700 }}>Tratamientos de alta gama</h4><p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Secado a mano sin rayas</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ESTADO */}
      <section id="estado" style={{ padding: '50px 16px', background: 'var(--bg-panel)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '10px' }}>Consultá el Estado de tu Vehículo</h2>
          <form onSubmit={handleBuscarPatente} className="search-form">
            <input type="text" placeholder="Patente Ej: AB123CD" value={patenteBuscar} onChange={e => setPatenteBuscar(e.target.value.toUpperCase())} style={{ flex: 1, padding: '14px 16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '15px', fontWeight: 700, textAlign: 'center' }} />
            <button type="submit" className="btn-gold"><Search size={16} /> Consultar</button>
          </form>
          {buscado && (
            <div className="glass-card" style={{ padding: '20px', textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
              {resultadoBusqueda? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--accent-gold)' }}>{resultadoBusqueda.patente}</span>
                    <span className="badge badge-espera">{resultadoBusqueda.estado}</span>
                  </div>
                  <p style={{ fontSize: '13px' }}>{resultadoBusqueda.nombre} - {resultadoBusqueda.servicio}</p>
                </div>
              ) : <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>No se encontró patente <b>{patenteBuscar}</b></p>}
            </div>
          )}
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" style={{ padding: '60px 16px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 900 }}>Nuestros Servicios</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {serviciosInfo.map(srv => (
            <div key={srv.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: '160px', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                <img src={srv.imagen} alt={srv.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {srv.popular && <span className="badge badge-gold" style={{ position: 'absolute', top: '10px', right: '10px' }}>Más Solicitado</span>}
              </div>
              <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><h3 style={{ fontSize: '16px', fontWeight: 800 }}>{srv.nombre}</h3><span style={{ fontWeight: 900, color: 'var(--accent-gold)' }}>{srv.precio}</span></div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>{srv.descripcion}</p>
                <a href="#turnos" onClick={() => setServicioSeleccionado(srv.nombre)} className="btn-dark" style={{ width: '100%', marginTop: 'auto' }}>Agendar <ChevronRight size={14} /></a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TURNOS */}
      <section id="turnos" style={{ padding: '60px 16px', background: 'var(--bg-panel)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 900 }}>Reservá tu Turno</h2>
            </div>
            {reservaExito? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <CheckCircle2 size={40} color="#22c55e" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>¡Reserva Registrada!</h3>
                <button onClick={() => setReservaExito(false)} className="btn-gold" style={{ marginTop: '16px' }}>Otra Reserva</button>
              </div>
            ) : (
              <form onSubmit={handleReservar} className="form-grid">
                <div><label className="label">Nombre *</label><input required value={nombre} onChange={e => setNombre(e.target.value)} className="input" placeholder="Juan Pérez" /></div>
                <div><label className="label">Patente *</label><input required value={patente} onChange={e => setPatente(e.target.value.toUpperCase())} className="input" placeholder="AF123BK" style={{ textTransform: 'uppercase', fontWeight: 700 }} /></div>
                <div><label className="label">Teléfono *</label><input required value={telefono} onChange={e => setTelefono(e.target.value)} className="input" placeholder="3865..." /></div>
                <div><label className="label">Servicio *</label><select value={servicioSeleccionado} onChange={e => setServicioSeleccionado(e.target.value)} className="input">{serviciosInfo.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}</select></div>
                <div><label className="label">Fecha *</label><input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} className="input" /></div>
                <div><label className="label">Hora *</label><select value={hora} onChange={e => setHora(e.target.value)} className="input"><option>08:30</option><option>09:30</option><option>10:30</option><option>11:30</option><option>14:30</option><option>15:30</option><option>16:30</option><option>17:30</option></select></div>
                <div style={{ gridColumn: 'span 2' }}><button type="submit" disabled={cargando} className="btn-gold" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>{cargando? 'Guardando...' : 'Confirmar Reserva'} <ArrowRight size={16} /></button></div>
              </form>
            )}
          </div>
        </div>
      </section>

      <a href="https://wa.me/5493865859894" target="_blank" className="whatsapp-float"><MessageCircle size={28} /></a>

      <footer style={{ borderTop: '1px solid var(--border-color)', background: '#080b11', padding: '40px 16px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>© {new Date().getFullYear()} Lavadero El Portugués</p>
      </footer>

      <style>{`
       .header-inner{ max-width:1200px; margin:0 auto; display:flex; flex-direction:column; gap:12px; align-items:center; }
       .nav-menu{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; justify-content:center; width:100%; }
       .nav-link{ color:var(--text-secondary); text-decoration:none; font-size:13px; font-weight:600; padding:6px 10px; background:rgba(255,255,255,0.05); border-radius:8px; }
       .hero-grid{ max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1fr; gap:32px; align-items:center; }
       .hero-title{ font-size:32px; font-weight:900; line-height:1.1; margin-bottom:16px; }
       .form-grid{ display:grid; grid-template-columns:1fr; gap:16px; }
       .search-form{ display:flex; flex-direction:column; gap:10px; max-width:500px; margin:0 auto 20px; }
       .input{ width:100%; padding:12px; border-radius:8px; background:var(--bg-main); border:1px solid var(--border-color); color:#fff; font-size:14px; box-sizing:border-box; }
       .label{ display:block; font-size:12px; font-weight:700; margin-bottom:6px; color:var(--text-secondary); }
        @media(min-width:768px){
         .header-inner{ flex-direction:row; justify-content:space-between; }
         .nav-menu{ width:auto; gap:20px; }
         .nav-link{ background:transparent; padding:0; font-size:14px; }
         .hero-grid{ grid-template-columns:1fr 1fr; gap:48px; }
         .hero-title{ font-size:48px; }
         .form-grid{ grid-template-columns:1fr 1fr; }
         .search-form{ flex-direction:row; }
        }
      `}</style>
    </div>
  )
}
