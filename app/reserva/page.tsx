'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Car, ArrowLeft, CheckCircle2, MessageCircle } from 'lucide-react'
import { saveTurno } from '@/lib/db'

const servicios = [
  { nombre: 'Carrocería + interior (Sin motor)', precio: 12000 },
  { nombre: 'Lavado completo (con motor a vapor)', precio: 15000 },
  { nombre: 'Encerado & Abrillantado', precio: 18000 },
  { nombre: 'Tratamiento con grafeno / Cerámico', precio: 45000 },
  { nombre: 'Descontaminación de interiores y tapizados', precio: 28000 },
  { nombre: 'Restauración de llantas', precio: 15000 },
  { nombre: 'Restauración de ópticas', precio: 14000 }
]

export default function ReservaPage() {
  const [nombre, setNombre] = useState('')
  const [patente, setPatente] = useState('')
  const [tel, setTel] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [hora, setHora] = useState('10:00')
  const [servicioObj, setServicioObj] = useState(servicios[0])
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)

  const handleReservar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre || !patente || !tel || !fecha || !hora) {
      alert('Por favor completá todos los datos obligatorios.')
      return
    }

    setCargando(true)

    saveTurno({
      nombre,
      patente: patente.toUpperCase().trim(),
      telefono: tel,
      servicio: servicioObj.nombre,
      precio: servicioObj.precio,
      fecha,
      hora,
      estado: 'En espera'
    })

    setCargando(false)
    setExito(true)

    const mensaje = encodeURIComponent(
      'Hola Lavadero El Portugues!\nNueva Reserva:\n' +
      'Cliente: ' + nombre + '\n' +
      'Patente: ' + patente.toUpperCase() + '\n' +
      'Servicio: ' + servicioObj.nombre + '\n' +
      'Fecha: ' + fecha + '\n' +
      'Hora: ' + hora + '\n' +
      'Tel: ' + tel
    )
    window.open('https://wa.me/5493865859894?text=' + mensaje, '_blank')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '540px', margin: '0 auto' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Volver a la Landing
        </Link>

        <div className="glass-card" style={{ padding: '36px', borderRadius: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #d4a356, #b88536)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Car size={28} color="#000" />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 900 }}>Lavadero El Portugués</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Reserva tu turno online de forma rápida</p>
          </div>

          {exito ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle2 size={48} color="#4ade80" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>¡Reserva Guardada!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '12px 0 24px' }}>
                Tu turno quedó asentado en el sistema y se abrió WhatsApp para la confirmación.
              </p>
              <button onClick={() => setExito(false)} className="btn-gold" style={{ width: '100%' }}>
                Realizar Otra Reserva
              </button>
            </div>
          ) : (
            <form onSubmit={handleReservar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>Tu Nombre *</label>
                <input required placeholder="Ej. Carlos Rodríguez" value={nombre} onChange={e => setNombre(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>Patente de tu Auto *</label>
                <input required placeholder="Ej. AF123BK" value={patente} onChange={e => setPatente(e.target.value.toUpperCase())} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff', textTransform: 'uppercase', fontWeight: 700 }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>WhatsApp de Contacto *</label>
                <input required placeholder="Ej. 3865 123456" value={tel} onChange={e => setTel(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>Fecha *</label>
                  <input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>Hora *</label>
                  <input type="time" required value={hora} onChange={e => setHora(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>Servicio *</label>
                <select
                  value={servicioObj.nombre}
                  onChange={e => {
                    const found = servicios.find(s => s.nombre === e.target.value)
                    if (found) setServicioObj(found)
                  }}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }}
                >
                  {servicios.map(s => (
                    <option key={s.nombre} value={s.nombre}>
                      {s.nombre} (${s.precio.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={cargando} className="btn-gold" style={{ marginTop: '8px', padding: '14px', fontSize: '16px', background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff' }}>
                <MessageCircle size={20} /> {cargando ? 'Procesando...' : 'Reservar por WhatsApp'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
