'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const CLAVE_ADMIN = '3865' // <- CAMBIA ACÁ TU PIN

export default function Admin() {
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [reservas, setReservas] = useState<any[]>([])

  const fetchR = async () => {
    const { data } = await supa.from('reservas').select('*').order('created_at', { ascending: false })
    if (data) setReservas(data)
  }
  useEffect(() => { if(authed) fetchR() }, [authed])

  const entrar = () => {
    if (pin === CLAVE_ADMIN) {
      setAuthed(true)
      localStorage.setItem('admin_ok','1')
    } else alert('PIN incorrecto')
  }

  useEffect(()=>{
    if(localStorage.getItem('admin_ok')==='1') setAuthed(true)
  },[])

  const mover = async (r: any) => {
    const orden = ['En espera', 'En Proceso', 'Listo', 'Entregado']
    const nuevo = orden[Math.min(orden.indexOf(r.estado) + 1, 3)]
    await supa.from('reservas').update({ estado: nuevo }).eq('id', r.id)
    fetchR()
  }

  const avisarWhatsApp = (r: any) => {
    const msg = `Hola ${r.nombre}! 👋 Soy del *Lavadero El Portugues*%0A%0ATu vehículo *${r.patente}* ya está *LISTO* para retirar 🚗✨%0A%0AServicio: ${r.servicio}%0APrecio: $${r.precio || 12000}%0A%0ATe esperamos!`
    window.open(`https://wa.me/54${r.telefono.replace(/\D/g,'')}?text=${msg}`, '_blank')
  }

  const mins = (d: string) => Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  const filtrar = (e: string) => reservas.filter(r => r.estado === e)

  // PANTALLA DE CLAVE
  if (!authed) {
    return (
      <div style={{ background: '#070B14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div style={{ background: '#121725', padding: 24, borderRadius: 16, width: 300, textAlign: 'center', border: '1px solid #222' }}>
          <h2 style={{ fontWeight: 900, fontSize: 18, marginBottom: 10 }}>Admin - El Portugues</h2>
          <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 15 }}>Ingresá el PIN para entrar</p>
          <input value={pin} onChange={e=>setPin(e.target.value)} type="password" placeholder="PIN 4 dígitos" style={{ width: '100%', padding: 12, borderRadius: 8, background: '#070B14', border: '1px solid #333', color: 'white', textAlign: 'center', fontSize: 18, letterSpacing: 4 }} />
          <button onClick={entrar} style={{ width: '100%', marginTop: 12, background: '#E8C547', color: 'black', padding: 12, borderRadius: 8, fontWeight: 900, border: 'none' }}>Entrar</button>
          <a href="/" style={{ display: 'block', marginTop: 15, fontSize: 13, opacity: 0.7, textDecoration: 'none', color: 'white' }}>← Volver al Inicio</a>
        </div>
      </div>
    )
  }

  // PANEL KANBAN
  return (
    <div style={{ background: '#070B14', color: 'white', minHeight: '100vh', padding: 12, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 900 }}> <div style={{ background: '#E8C547', color: 'black', padding: '4px 6px' }}>EP</div> Lavadero El Portugues</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/" style={{ background: '#222', color: 'white', padding: '8px 14px', borderRadius: 8, fontSize: 13, textDecoration: 'none' }}>Inicio</a>
          <button onClick={fetchR} style={{ background: '#E8C547', color: 'black', padding: '8px 14px', borderRadius: 8, fontWeight: 800, border: 'none' }}>Actualizar</button>
        </div>
      </div>

      <div style={{ opacity: 0.6, margin: '10px 0', fontSize: 14 }}>Hoy - {new Date().toLocaleDateString('es-AR')} | Total: {reservas.length}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
        {[
          { t: 'En Espera', e: 'En espera' },
          { t: 'En Proceso', e: 'En Proceso' },
          { t: 'Listo', e: 'Listo' },
          { t: 'Entregado', e: 'Entregado' },
        ].map(col => (
          <div key={col.e}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>{col.t} <span style={{ background: '#333', padding: '2px 6px', borderRadius: 10, fontSize: 11, marginLeft: 4 }}>{filtrar(col.e).length}</span></div>
            {filtrar(col.e).map(r => (
              <div key={r.id} style={{ background: '#151A27', border: '1px solid #2A3147', borderRadius: 12, padding: 8, marginBottom: 8 }}>
                <div onClick={() => mover(r)} style={{ border: '1.5px solid white', borderRadius: 8, textAlign: 'center', fontWeight: 900, padding: '4px 0', cursor: 'pointer' }}>{r.patente}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>Cliente: {r.nombre}</div>
                <div style={{ fontSize: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 6px', marginTop: 6, display: 'inline-block' }}>{r.servicio}</div>
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 6 }}>🕒 Hace {mins(r.created_at)}m</div>

                {col.e === 'Listo' && (
                  <button onClick={()=>avisarWhatsApp(r)} style={{ width: '100%', marginTop: 8, background: '#25D366', color: 'white', border: 'none', borderRadius: 8, padding: '6px 0', fontSize: 12, fontWeight: 800 }}>
                    📲 Avisar por WhatsApp
                  </button>
                )}
                {col.e!== 'Listo' && col.e!== 'Entregado' && (
                  <button onClick={()=>mover(r)} style={{ width: '100%', marginTop: 8, background: '#222', color: 'white', border: '1px solid #333', borderRadius: 8, padding: '6px 0', fontSize: 11 }}>
                    Pasar a {col.e==='En espera'?'Proceso': col.e==='En Proceso'?'Listo':'Entregado'} →
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <button onClick={()=>{localStorage.removeItem('admin_ok'); setAuthed(false)}} style={{ marginTop: 20, opacity: 0.5, fontSize: 12, background: 'none', border: 'none', color: 'white' }}>Cerrar sesión</button>
    </div>
  )
}
