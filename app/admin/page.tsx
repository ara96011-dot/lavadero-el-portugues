// @ts-nocheck
"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const PIN_SECRETO = "1987"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Admin() {
  const [auth, setAuth] = useState(false)
  const [pin, setPin] = useState('')
  const [err, setErr] = useState(false)
  const [data, setData] = useState<any[]>([])

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data } = await supabase.from('reservas').select('*').order('created_at', { ascending: false })
    if (data) setData(data)
  }

  const checkPin = (e: any) => {
    e.preventDefault()
    if (pin === PIN_SECRETO) {
      setAuth(true)
    } else {
      setErr(true)
      setTimeout(() => setErr(false), 2000)
    }
  }

  const cambiarEstado = async (id: string, estado: string) => {
    await supabase.from('reservas').update({ estado }).eq('id', id)
    fetchData()
  }

  const borrar = async (id: string) => {
    if (!confirm('¿Borrar?')) return
    await supabase.from('reservas').delete().eq('id', id)
    fetchData()
  }

  if (!auth) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <form onSubmit={checkPin} className="glass-panel" style={{ padding: '32px 24px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px' }}>🔒</div>
          <h2 style={{ fontFamily: 'Outfit', marginTop: '8px' }}>Acceso Admin</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '8px 0 20px' }}>Ingresá el PIN</p>
          <input autoFocus type="password" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN" style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: '#0f172a', border: err ? '1px solid #ef4444' : '1px solid var(--border-color)', color: '#fff', textAlign: 'center', fontSize: '20px', letterSpacing: '6px' }} />
          {err && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>PIN incorrecto</div>}
          <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '16px' }}>Entrar</button>
          <Link href="/" className="btn-dark" style={{ width: '100%', marginTop: '10px' }}>Volver a la web</Link>
        </form>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '16px' }}>
      <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <b style={{ fontFamily: 'Outfit' }}>Reservas <span style={{ color: 'var(--accent-gold)' }}>{data.length}</span></b>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={fetchData} className="btn-dark" style={{ padding: '8px 12px' }}>↻ Actualizar</button>
          <button onClick={() => setAuth(false)} className="btn-dark" style={{ padding: '8px 12px', color: '#ef4444' }}>Bloquear</button>
        </div>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto', padding: '0' }}>
        <table className="admin-table">
          <thead>
            <tr><th>Patente</th><th>Cliente</th><th>Servicio</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {data.map(r => (
              <tr key={r.id}>
                <td><b>{r.patente}</b><br /><span style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>${Number(r.precio).toLocaleString()}</span></td>
                <td>{r.cliente_nombre}<br /><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.cliente_telefono}</span></td>
                <td>{r.servicio}</td>
                <td>{r.fecha}<br /><span style={{ fontSize: '12px' }}>{r.hora?.slice(0, 5)}</span></td>
                <td><span className={`badge ${r.estado === 'En espera' ? 'badge-espera' : r.estado === 'En proceso' ? 'badge-proceso' : r.estado === 'Listo' ? 'badge-listo' : 'badge-entregado'}`}>{r.estado}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select value={r.estado} onChange={e => cambiarEstado(r.id, e.target.value)} style={{ background: '#0f172a', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px', fontSize: '12px' }}>
                      <option>En espera</option><option>En proceso</option><option>Listo</option><option>Entregado</option>
                    </select>
                    <a href={`https://wa.me/${r.cliente_telefono?.replace(/\D/g, '')}`} target="_blank" className="btn-gold" style={{ padding: '6px 10px', fontSize: '11px' }}>WA</a>
                    <button onClick={() => borrar(r.id)} className="btn-dark" style={{ padding: '6px 10px', fontSize: '11px', color: '#ef4444' }}>X</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay reservas</div>}
      </div>
    </div>
  )
}
