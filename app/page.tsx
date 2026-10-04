// @ts-nocheck
"use client"
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = url && key? createClient(url, key) : null

const SERVICIOS = [
  { id: 'basico', nombre: 'Lavado Básico', precio: 8000, desc: 'Carrocería exterior' },
  { id: 'completo', nombre: 'Lavado Completo', precio: 12000, desc: 'Exterior + Interior + Aspirado' },
  { id: 'premium', nombre: 'Premium + Encerado', precio: 18000, desc: 'Completo + Cera y detalles' },
]

export default function Home() {
  const [patente, setPatente] = useState('')
  const [nombre, setNombre] = useState('')
  const [tel, setTel] = useState('')
  const [servicio, setServicio] = useState('completo')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [hora, setHora] = useState('10:00')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)

  const handleReserva = async (e:any) => {
    e.preventDefault()
    setLoading(true)
    const sel = SERVICIOS.find(s=>s.id===servicio)
    const { error } = await supabase!.from('reservas').insert([{
      patente: patente.toUpperCase(),
      cliente_nombre: nombre,
      cliente_telefono: tel,
      servicio: sel?.nombre,
      precio: sel?.precio,
      fecha, hora,
      estado: 'En espera'
    }])
    setLoading(false)
    if(!error){ setOk(true); setPatente(''); setNombre(''); setTel('') }
    else { alert('Error: '+error.message) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
      <header style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222' }}>
        <b style={{ color: '#d4a356' }}>EL PORTUGUÉS</b>
        <Link href="/admin" style={{ background: '#222', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>Admin</Link>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        {/* ACA CAMBIAS EL TITULO QUE ME DECIAS */}
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <h1 style={{ fontSize: 'clamp(28px, 8vw, 48px)', fontWeight: 900, lineHeight: 1.1 }}>
            Artesanos <br/><span style={{ color: '#d4a356' }}>del lavado</span>
          </h1>
          <p style={{ color: '#888', marginTop: '12px', fontSize: '16px' }}>
            Servicio premium con productos de primera. Reservá por acá y retirá sin esperar.
          </p>
        </div>

        {ok? (
          <div style={{ background: '#1a2e1a', border: '1px solid #22c55e', padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#22c55e' }}>¡Reserva enviada!</h2>
            <p style={{ color: '#aaa', fontSize: '14px', marginTop: '8px' }}>Te confirmamos por WhatsApp.</p>
            <button onClick={()=>setOk(false)} style={{ marginTop: '16px', background: '#d4a356', color: '#000', padding: '10px 20px', borderRadius: '10px', fontWeight: 800 }}>Hacer otra reserva</button>
          </div>
        ) : (
          <form onSubmit={handleReserva} style={{ background: '#1a1a1a', padding: '20px', borderRadius: '16px', border: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input required placeholder="Patente (ABC123)" value={patente} onChange={e=>setPatente(e.target.value.toUpperCase())} style={inputStyle} />
              <input required placeholder="Tu nombre" value={nombre} onChange={e=>setNombre(e.target.value)} style={inputStyle} />
            </div>
            <input required placeholder="WhatsApp" value={tel} onChange={e=>setTel(e.target.value)} style={inputStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {SERVICIOS.map(s=>(
                <button type="button" key={s.id} onClick={()=>setServicio(s.id)} style={{ padding: '12px', borderRadius: '12px', border: servicio===s.id?'2px solid #d4a356':'1px solid #333', background: servicio===s.id?'#2a2212':'#111', textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px' }}>{s.nombre}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>{s.desc}</div>
                  <div style={{ fontWeight: 900, color: '#d4a356', marginTop: '4px' }}>${s.precio.toLocaleString()}</div>
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={inputStyle} />
              <input type="time" value={hora} onChange={e=>setHora(e.target.value)} style={inputStyle} />
            </div>
            <button disabled={loading} type="submit" style={{ background: '#d4a356', color: '#000', padding: '14px', borderRadius: '12px', fontWeight: 900, fontSize: '16px' }}>{loading?'Enviando...':'Reservar turno'}</button>
          </form>
        )}
      </main>
    </div>
  )
}

const inputStyle = { padding: '12px', borderRadius: '10px', background: '#0f0f0f', border: '1px solid #333', color: '#fff', width: '100%' } as any
