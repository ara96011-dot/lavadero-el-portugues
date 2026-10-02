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
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey? createClient(supabaseUrl, supabaseKey) : null

const serviciosInfo = [
  { id: 'carroceria-interior', nombre: 'Carrocería + Interior', precio: '$12.000', tiempo: '60 min', popular: true, imagen: '/images/hero.png', descripcion: 'Lavado artesanal exterior con shampoo pH neutro, secado con microfibra de alta densidad y aspirado profundo interior.', incluye: ['Shampoo Neutro de alta espuma', 'Aspirado completo de alfombras y asientos', 'Limpieza de cristales por dentro y fuera', 'Acondicionado de neumáticos'] },
  { id: 'lavado-completo-motor', nombre: 'Lavado Completo + Motor a Vapor', precio: '$15.000', tiempo: '90 min', popular: false, imagen: '/images/detailing.png', descripcion: 'Limpieza detallada de carrocería, habitáculo completo y desengrasado técnico del vano motor con vapor controlado.', incluye: ['Lavado exterior + interior premium', 'Desengrasado y lavado de motor a vapor', 'Protector plastificante para plásticos de motor', 'Perfumado especial'] },
  { id: 'encerado-abrillantado', nombre: 'Encerado & Abrillantado', precio: '$18.000', tiempo: '120 min', popular: false, imagen: '/images/interior.png', descripcion: 'Aplicación de cera sintética de alta durabilidad para restaurar el brillo profundo y crear hidrofobia repelente al agua.', incluye: ['Lavado de descontaminación', 'Encerado con Carnauba o Sintético', 'Brillo espejo y protección UV (3 meses)', 'Acondicionamiento de gomas y baguetas'] },
  { id: 'tratamiento-ceramico', nombre: 'Tratamiento Cerámico / Grafeno', precio: '$45.000', tiempo: '1 Día', popular: true, imagen: '/images/detailing.png', descripcion: 'Corrección de laca (pulido técnico de rayones) y protección cerámica multicapa con dureza 9H.', incluye: ['Corrección de pintura en 2 o 3 pasos', 'Protección cerámica por 12 a 24 meses', 'Efecto superhidrofóbico y dureza 9H', 'Certificado de garantía'] },
  { id: 'tapizados-interior', nombre: 'Descontaminación de Tapizados', precio: '$28.000', tiempo: '4 a 6hs', popular: false, imagen: '/images/interior.png', descripcion: 'Inyección y extracción de manchas en asientos, alfombras y techos con secado rápido e higienización por ozono.', incluye: ['Lavado por inyección y extracción', 'Eliminación de bacterias y malos olores', 'Higienización integral con ozono', 'Nutrición de plásticos y cueros'] },
  { id: 'restauracion-opticas', nombre: 'Restauración de Ópticas', precio: '$14.000', tiempo: '45 min', popular: false, imagen: '/images/hero.png', descripcion: 'Lijado al agua de capas opacas y barnizado o sellado cerámico para devolver la transparencia de fábrica.', incluye: ['Lijado progresivo microfino', 'Pulido y abrillantado de policarbonato', 'Sellador UV protector', 'Mejora del 100% en potencia lumínica'] }
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

  const handleBuscarPatente = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patenteBuscar.trim()) return
    const cleanPatente = patenteBuscar.trim().toUpperCase().replace(/[-\s]/g, '')
    if (supabase) {
      const { data } = await supabase.from('reservas').select('*').ilike('patente', '%' + cleanPatente + '%').limit(1)
      if (data && data.length > 0) {
        const r = data[0]
        setResultadoBusqueda({ patente: r.patente, nombre: r.nombre, telefono: r.telefono, servicio: r.servicio, precio: r.precio, fecha: r.fecha, hora: r.hora, estado: r.estado || 'En espera' } as Turno)
        setBuscado(true)
        return
      }
    }
    const turnos = getTurnos()
    const match = turnos.find(t => t.patente.replace(/[-\s]/g, '') === cleanPatente)
    setResultadoBusqueda(match || null)
    setBuscado(true)
  }

  const handleReservar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre ||!patente ||!telefono ||!fecha ||!hora) { alert('Por favor completá todos los campos del formulario.'); return }
    setCargando(true)
    const srvObj = serviciosInfo.find(s => s.nombre === servicioSeleccionado)
    const precio = srvObj? parseInt(srvObj.precio.replace(/[^0-9]/g, '')) : 12000
    const nuevoTurno = { nombre, patente: patente.toUpperCase().trim(), telefono, servicio: servicioSeleccionado, precio, fecha, hora, estado: 'En espera' as const }

    // 1. Guarda local (por si acaso)
    saveTurno(nuevoTurno)

    // 2. Guarda en Supabase en tu tabla reservas
    if (supabase) {
      const { error } = await supabase.from('reservas').insert([nuevoTurno])
      if (error) console.error('Error Supabase:', error)
    }

    setCargando(false)
    setReservaExito(true)
    const mensaje = encodeURIComponent('Hola Lavadero El Portugues!\nQuiero confirmar mi turno:\nCliente: ' + nombre + '\nPatente: ' + patente.toUpperCase() + '\nServicio: ' + servicioSeleccionado + '\nFecha: ' + fecha + '\nHora: ' + hora + '\nTel: ' + telefono)
    window.open('https://wa.me/5493865859894?text=' + mensaje, '_blank')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', overflowX: 'hidden', maxWidth: '100vw' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(11, 15, 23, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)', padding: '16px 24px' }}>
        <div className="header-inner">
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #d4a356, #b88536)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(212, 163, 86, 0.3)' }}><Car size={24} color="#0b0f17" /></div>
            <div><span style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>EL PORTUGUÉS</span><span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Detailing & Lavado Profesional</span></div>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <a href="#servicios" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Servicios</a>
            <a href="#estado" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Estado de Auto</a>
            <a href="#turnos" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Reservar Turno</a>
            <Link href="/admin" className="btn-dark" style={{ padding: '8px 16px', fontSize: '13px' }}><LayoutDashboard size={16} /> Panel Admin</Link>
          </nav>
        </div>
      </header>

      <section style={{ position: 'relative', padding: '80px 24px 100px', background: 'radial-gradient(circle at 50% 20%, rgba(212, 163, 86, 0.12) 0%, rgba(11, 15, 23, 1) 70%)', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
          <div className="animate-fade-in">
            <div className="badge badge-gold" style={{ marginBottom: '20px' }}><Sparkles size={14} /> Estética Automotriz Premium</div>
            <h1 style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px' }}>Tu auto en manos de <span style={{ color: 'var(--accent-gold)', background: 'linear-gradient(135deg, #d4a356, #f3c98b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>verdaderos especialistas</span>.</h1>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>En <b>Lavadero El Portugués</b> combinamos pasión artesanal, tecnología en vapor y productos de marcas líderes para que tu vehículo recupere el brillo y la elegancia de 0km.</p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}><a href="#turnos" className="btn-gold"><Calendar size={18} /> Reservar Turno Online</a><a href="https://wa.me/5493865859894" target="_blank" rel="noopener noreferrer" className="btn-dark"><MessageCircle size={18} color="var(--accent-green)" /> WhatsApp Directo</a></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}><div><span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent-gold)' }}>+5.000</span><span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Autos Lavados</span></div><div><span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent-gold)' }}>4.9</span><span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Satisfacción Clientes</span></div><div><span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent-gold)' }}>100%</span><span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Garantía de Calidad</span></div></div>
          </div>
          <div style={{ position: 'relative' }}><div className="glass-card" style={{ padding: '12px', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-main)' }}><div style={{ position: 'relative', width: '100%', height: '380px', borderRadius: '16px', overflow: 'hidden' }}><img src="/images/hero.png" alt="Lavadero El Portugués Detailing Studio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(11,15,23,0.95), transparent)', padding: '24px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ShieldCheck size={28} color="var(--accent-gold)" /><div><h4 style={{ fontSize: '16px', fontWeight: 700 }}>Tratamientos de alta gama</h4><p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Secado a mano sin rayas ni marcas con microfibra súper soft.</p></div></div></div></div></div></div>
        </div>
      </section>

      <section id="estado" style={{ padding: '60px 24px', background: 'var(--bg-panel)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div className="badge badge-gold" style={{ marginBottom: '12px' }}><Clock size={14} /> Seguimiento en Tiempo Real</div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>Consultá el Estado de tu Vehículo</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>¿Dejaste tu auto en nuestro lavadero? Ingresá tu patente a continuación para saber en qué etapa del lavado se encuentra.</p>
          <form onSubmit={handleBuscarPatente} style={{ display: 'flex', gap: '12px', maxWidth: '500px', margin: '0 auto 24px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Ej: AB123CD o AA123BB" value={patenteBuscar} onChange={e => setPatenteBuscar(e.target.value.toUpperCase())} style={{ flex: 1, minWidth: '200px', padding: '14px 18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '16px', fontWeight: 700, letterSpacing: '1px', textAlign: 'center', outline: 'none' }} />
            <button type="submit" className="btn-gold"><Search size={18} /> Consultar</button>
          </form>
          {buscado && (<div className="animate-fade-in glass-card" style={{ padding: '24px', textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>{resultadoBusqueda? (<div><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}><div><span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent-gold)' }}>{resultadoBusqueda.patente}</span><p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Cliente: {resultadoBusqueda.nombre}</p></div><span className={resultadoBusqueda.estado === 'En espera'? 'badge badge-espera' : resultadoBusqueda.estado === 'En proceso'? 'badge badge-proceso' : resultadoBusqueda.estado === 'Listo'? 'badge badge-listo' : 'badge badge-entregado'} style={{ padding: '8px 16px', fontSize: '13px' }}>{resultadoBusqueda.estado}</span></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}><div><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Servicio contratado</span><p style={{ fontSize: '13px', fontWeight: 700 }}>{resultadoBusqueda.servicio}</p></div><div><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fecha / Hora</span><p style={{ fontSize: '13px', fontWeight: 700 }}>{resultadoBusqueda.fecha} a las {resultadoBusqueda.hora}</p></div></div>{resultadoBusqueda.estado === 'Listo' && (<div style={{ marginTop: '16px', padding: '12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', color: '#4ade80', fontSize: '13px', textAlign: 'center' }}><b>¡Tu vehículo ya está listo para retirar!</b> Podés pasar por nuestro local cuando gustes.</div>)}</div>) : (<div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}><p>No se encontraron turnos activos para la patente <b>{patenteBuscar}</b>.</p><p style={{ fontSize: '12px', marginTop: '6px' }}>Verificá la patente o consulta por WhatsApp.</p></div>)}</div>)}
        </div>
      </section>

      <section id="servicios" style={{ padding: '90px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}><div className="badge badge-gold" style={{ marginBottom: '12px' }}><Award size={14} /> Catálogo Completo</div><h2 style={{ fontSize: '36px', fontWeight: 900 }}>Nuestros Servicios de Excelencia</h2><p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '12px auto 0' }}>Elegí el nivel de detalle y protección que necesita tu auto. Trabajamos con equipamiento profesional de última generación.</p></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>{serviciosInfo.map(srv => (<div key={srv.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}><div style={{ position: 'relative', height: '180px', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}><img src={srv.imagen} alt={srv.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />{srv.popular && (<span className="badge badge-gold" style={{ position: 'absolute', top: '12px', right: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>Más Solicitado</span>)}<div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(11,15,23,0.85)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)' }}>Tiempo: {srv.tiempo}</div></div><div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' }}><h3 style={{ fontSize: '20px', fontWeight: 800 }}>{srv.nombre}</h3><span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--accent-gold)' }}>{srv.precio}</span></div><p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>{srv.descripcion}</p><div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}><span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Incluye:</span><ul style={{ listStyle: 'none', margin: '8px 0 20px', padding: 0 }}>{srv.incluye.map((inc, idx) => (<li key={idx} style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}><CheckCircle2 size={15} color="var(--accent-gold)" /> {inc}</li>))}</ul><a href="#turnos" onClick={() => setServicioSeleccionado(srv.nombre)} className="btn-dark" style={{ width: '100%' }}>Agendar {srv.nombre} <ChevronRight size={16} /></a></div></div></div>))}</div>
      </section>

      <section id="turnos" style={{ padding: '90px 24px', background: 'linear-gradient(180deg, var(--bg-main) 0%, var(--bg-panel) 100%)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}><div className="badge badge-gold" style={{ marginBottom: '12px' }}><Calendar size={14} /> Reserva Inmediata</div><h2 style={{ fontSize: '32px', fontWeight: 900 }}>Reservá tu Turno en 1 Minuto</h2><p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Completá los datos a continuación para guardar tu turno en el sistema y confirmarlo al instante por WhatsApp.</p></div>
            {reservaExito? (<div style={{ textAlign: 'center', padding: '40px 20px' }}><div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', border: '2px solid #22c55e', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><CheckCircle2 size={36} /></div><h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>¡Reserva Registrada Exitosamente!</h3><p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Tu turno ha sido guardado. Se ha abierto una ventana de WhatsApp para enviar la confirmación al lavadero.</p><button onClick={() => setReservaExito(false)} className="btn-gold">Hacer Otra Reserva</button></div>) : (<form onSubmit={handleReservar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}><div style={{ gridColumn: 'span 1' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>Nombre y Apellido *</label><input type="text" required placeholder="Ej. Juan Pérez" value={nombre} onChange={e => setNombre(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '15px' }} /></div><div style={{ gridColumn: 'span 1' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>Patente del Vehículo *</label><input type="text" required placeholder="Ej. AF123BK" value={patente} onChange={e => setPatente(e.target.value.toUpperCase())} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '15px', textTransform: 'uppercase', fontWeight: 700 }} /></div><div style={{ gridColumn: 'span 1' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>Teléfono / WhatsApp *</label><input type="tel" required placeholder="Ej. 3865 123456" value={telefono} onChange={e => setTelefono(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '15px' }} /></div><div style={{ gridColumn: 'span 1' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>Servicio Deseado *</label><select value={servicioSeleccionado} onChange={e => setServicioSeleccionado(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '15px' }}>{serviciosInfo.map(s => (<option key={s.id} value={s.nombre}>{s.nombre} ({s.precio})</option>))}</select></div><div style={{ gridColumn: 'span 1' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>Fecha Deseada *</label><input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '15px' }} /></div><div style={{ gridColumn: 'span 1' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>Hora Estimada *</label><select value={hora} onChange={e => setHora(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '15px' }}><option value="08:30">08:30 hs</option><option value="09:30">09:30 hs</option><option value="10:30">10:30 hs</option><option value="11:30">11:30 hs</option><option value="14:30">14:30 hs</option><option value="15:30">15:30 hs</option><option value="16:30">16:30 hs</option><option value="17:30">17:30 hs</option></select></div><div style={{ gridColumn: 'span 2', marginTop: '12px' }}><button type="submit" disabled={cargando} className="btn-gold" style={{ width: '100%', padding: '16px', fontSize: '16px' }}>{cargando? 'Guardando turno...' : 'Confirmar Reserva por WhatsApp'} <ArrowRight size={18} /></button></div></form>)}
          </div>
        </div>
      </section>

      <a href="https://wa.me/5493865859894?text=Hola%20El%20Portugues!%20Quisiera%20consultar%20por%20un%20turno" target="_blank" rel="noopener noreferrer" className="whatsapp-float" title="Chateá con nosotros por WhatsApp"><div className="pulse-ring"></div><MessageCircle size={28} /></a>

      <footer style={{ borderTop: '1px solid var(--border-color)', background: '#080b11', padding: '60px 24px 30px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div><h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px', color: '#fff' }}>EL PORTUGUÉS</h3><p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Especialistas en estética y limpieza automotriz. Cuidamos cada detalle para ofrecer la mejor experiencia y durabilidad a tu coche.</p></div>
          <div><h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--accent-gold)' }}>Contacto & Ubicación</h4><div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} color="var(--accent-gold)" /> Av. Principal 1234, Tucumán</div><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} color="var(--accent-gold)" /> +54 9 3865 859894</div><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} color="var(--accent-gold)" /> Lunes a Sábado: 08:00 - 19:00 hs</div></div></div>
          <div><h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--accent-gold)' }}>Acceso Administrativo</h4><p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Gestión de clientes, turnos en vivo y caja diaria para el equipo del lavadero.</p><Link href="/admin" className="btn-dark" style={{ width: '100%' }}><LayoutDashboard size={16} /> Entrar a Panel Admin</Link></div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>© {new Date().getFullYear()} Lavadero El Portugués. Todos los derechos reservados.</div>
      </footer>
    </div>
  )
}
