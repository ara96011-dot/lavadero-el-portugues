// @ts-nocheck
"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const PIN_SECRETO = "1987"
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(url, key)

const ESTADOS = ['En espera', 'En proceso', 'Listo', 'Entregado'] as const
const COLORES: any = { 'En espera': '#f59e0b', 'En proceso': '#3b82f6', 'Listo': '#22c55e', 'Entregado': '#666' }

export default function Admin() {
  const [autenticado, setAutenticado] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [errorPin, setErrorPin] = useState(false)
  const [reservas, setReservas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('admin_el_portugues') === 'ok') setAutenticado(true)
    fetchReservas()
  }, [])

  const fetchReservas = async () => {
    setLoading(true)
    const { data } = await supabase.from('reservas').select('*').order('created_at', { ascending: false })
    if (data) setReservas(data)
    setLoading(false)
  }

  const checkPin = (e: any) => {
    e.preventDefault()
    if (pinInput === PIN_SECRETO) {
      localStorage.setItem('admin_el_portugues', 'ok')
      setAutenticado(true)
    } else {
      setErrorPin(true)
      setTimeout(() => setErrorPin(false), 2000)
    }
  }

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    await supabase.from('reservas').update({ estado: nuevoEstado }).eq('id', id)
    fetchReservas()
  }

  const borrar = async (id: string) => {
    if (!confirm('¿Borrar esta reserva?')) return
    await supabase.from('reservas').delete().eq('id', id)
    fetchReservas()
  }

  const logout = () => {
    localStorage.removeItem('admin_el_portugues')
    setAutenticado(false)
    setPinInput('')
  }

  if (!autenticado) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <form onSubmit={checkPin} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', padding: '32px 24px', borderRadius: '20px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>Acceso Admin</h1>
          <p style={{ color: '#666', fontSize: '13px', margin: '8px 0 20px' }}>Ingresá el PIN del lavadero</p>
          <input autoFocus type="password" inputMode="numeric" value={pinInput} onChange={e => setPinInput(e.target.value)} placeholder="PIN" style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#0f0f0f', border: errorPin? '1px solid #ef4444' : '1px solid #333', color: '#fff', textAlign: 'center', fontSize: '20px', letterSpacing: '6px' }} />
          {errorPin && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>PIN incorrecto</div>}
          <button type="submit" style={{ width: '100%', marginTop: '16px', background: '#d4a356', color: '#000', padding: '14px', borderRadius: '12px', fontWeight: 900 }}>Entrar</button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontWeight: 900, fontSize: '18px' }}>Panel <span style={{ color: '#d4a356' }}>Reservas</span> - {reservas.length}</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={fetchReservas} style={{ background: '#222', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>↻</button>
          <Link href="/" style={{ background: '#222', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>Ver web</Link>
          <button onClick={logout} style={{ background: '#2a1a1a', color: '#ef4444', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>Salir</button>
        </div>
      </div>

      {loading? <div style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>Cargando...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {ESTADOS.map(estado => (
            <div key={estado} style={{ background: '#171717', borderRadius: '16px', padding: '12px', border: '1px solid #222', minHeight: '200px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORES[estado], display: 'inline-block' }}></span>
                {estado.toUpperCase()} ({reservas.filter(r => r.estado === estado).length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {reservas.filter(r => r.estado === estado).map(r => (
                  <div key={r.id} style={{ background: '#1f1f1f', border: '1px solid #2a2a2a', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <b style={{ fontSize: '14px' }}>{r.patente}</b>
                      <span style={{ fontSize: '11px', color: '#d4a356', fontWeight: 800 }}>${Number(r.precio).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#aaa', margin: '4px 0' }}>{r.cliente_nombre} • {r.cliente_telefono}</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>{r.servicio} • {r.fecha} {r.hora?.slice(0, 5)}</div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                      {ESTADOS.filter(e => e!== r.estado).map(e => (
                        <button key={e} onClick={() => cambiarEstado(r.id, e)} style={{ fontSize: '10px', background: '#222', padding: '6px 8px', borderRadius: '6px' }}>{e}</button>
                      ))}
                      <a href={`https://wa.me/${r.cliente_telefono?.replace(/\D/g, '')}?text=Hola ${r.cliente_nombre}! Tu ${r.patente} - ${r.servicio} esta ${r.estado}`} target="_blank" style={{ fontSize: '10px', background: '#25D366', color: '#000', padding: '6px 8px', borderRadius: '6px', fontWeight: 800 }}>WA</a>
                      <button onClick={() => borrar(r.id)} style={{ fontSize: '10px', background: '#2a1a1a', color: '#ef4444', padding: '6px 8px', borderRadius: '6px', marginLeft: 'auto' }}>X</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
