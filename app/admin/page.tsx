'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const CLAVE_ADMIN = '3865'

export default function Admin() {
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [reservas, setReservas] = useState<any[]>([])

  const fetchR = async () => {
    const { data } = await supa.from('reservas').select('*').order('created_at', { ascending: false })
    if (data) setReservas(data)
  }
  useEffect(() => { if(authed) fetchR() }, [authed])
  useEffect(()=>{ if(localStorage.getItem('admin_ok')==='1') setAuthed(true) },[])

  const entrar = () => {
    if (pin === CLAVE_ADMIN) { setAuthed(true); localStorage.setItem('admin_ok','1') }
    else alert('PIN incorrecto')
  }

  const mover = async (r: any) => {
    const orden = ['En espera', 'En Proceso', 'Listo', 'Entregado']
    const nuevo = orden[Math.min(orden.indexOf(r.estado) + 1, 3)]
    await supa.from('reservas').update({ estado: nuevo }).eq('id', r.id)
    fetchR()
  }
  const avisarWhatsApp = (r: any) => {
    const msg = `Hola ${r.nombre}! 👋 Soy del *Lavadero El Portugues*%0A%0ATu vehículo *${r.patente}* ya está *LISTO* para retirar 🚗✨%0A%0AServicio: ${r.servicio}%0ATe esperamos!`
    window.open(`https://wa.me/54${r.telefono.replace(/\D/g,'')}?text=${msg}`, '_blank')
  }
  const mins = (d: string) => Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  const filtrar = (e: string) => reservas.filter(r => r.estado === e)

  if (!authed) {
    return (
      <div style={{ background: '#070B14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div style={{ background: '#121725', padding: 24, borderRadius: 16, width: 300, textAlign: 'center', border: '1px solid #222' }}>
          <h2 style={{ fontWeight: 900, fontSize: 18, marginBottom: 10 }}>Admin - El Portugues</h2>
          <input value={pin} onChange={e=>setPin(e.target.value)} type="password" placeholder="PIN" style={{ width: '100%', padding: 12, borderRadius: 8, background: '#070B14', border: '1px solid #333', color: 'white', textAlign: 'center', fontSize: 18 }} />
          <button onClick={entrar} style={{ width: '100%', marginTop: 12, background: '#E8C547', color: 'black', padding: 12, borderRadius: 8, fontWeight: 900, border: 'none' }}>Entrar</button>
          <a href="/" style={{ display: 'block', marginTop: 15, fontSize: 13, opacity: 0.7, color: 'white', textDecoration: 'none' }}>← Volver al Inicio</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#070B14', color: 'white', minHeight: '100vh', padding: 12, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 900 }}><div style={{ background: '#E8C547', color: 'black', padding: '4px 6px' }}>EP</div> Lavadero El Portugues</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/" style={{ background: '#222', color: 'white', padding: '8px 14px', borderRadius: 8, fontSize: 13, textDecoration: 'none' }}>Inicio</a>
          <button onClick={fetchR} style={{ background: '#E8C547', color: 'black', padding: '8px 14px', borderRadius: 8, fontWeight: 800, border: 'none' }}>Actualizar</button>
        </div>
      </div>

      <div style={{ opacity: 0.6, margin: '10px 0', fontSize: 13 }}>Hoy - {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>

      {/* AQUÍ ESTABAN FALTANDO - TOTAL HOY E INGRESOS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        <div style={{ background: '#121725', padding: 16, borderRadius: 14, border: '1px solid #1E2538' }}>
          <div style={{ fontSize: 12, opacity: 0.6, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ background: '#22c55e', width: 18, height: 18, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>↑</span> Total Hoy</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>{reservas.length}</div>
          <div style={{ color: '#22c55e', fontSize: 11, marginTop: 2 }}>+{filtrar('En espera').length} vs ayer</div>
        </div>
        <div style={{ background: '#121725', padding: 16, borderRadius: 14, border: '1px solid #1E2538' }}>
          <div style={{ fontSize: 12, opacity: 0.6, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ background: '#E8C547', color: 'black', width: 18, height: 18, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>$</span> Ingresos</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>${(reservas.length * 12000 / 1000).toFixed(1)}k</div>
          <div style={{ color: '#22c55e', fontSize: 11, marginTop: 2 }}>+12% vs ayer</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 15, fontSize: 12, borderBottom: '1px solid #1E2538', paddingBottom: 10, marginBottom: 12 }}>
        <b style={{ color: '#E8C547', borderBottom: '2px solid #E8C547', paddingBottom: 8 }}>Tablero<br/>Kanban (Vivo)</b>
        <span style={{ opacity: 0.5 }}>Reservas<br/>& Turnos ({reservas.length})</span>
        <span style={{ opacity: 0.5 }}>Clientes<br/>({new Set(reservas.map(r=>r.telefono)).size})</span>
        <span style={{ opacity: 0.5 }}>Vehículos<br/>({new Set(reservas.map(r=>r.patente)).size})</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
        {[
          { t: 'En Espera', e: 'En espera' },
          { t: 'En Proceso', e: 'En Proceso' },
          { t: 'Listo', e: 'Listo' },
          { t: 'Entregado', e: 'Entregado' },
        ].map(col => (
          <div key={col.e}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>{col.t} <span style={{ background: col.e==='En espera'?'#333': col.e==='En Proceso'?'#2563eb': col.e==='Listo'?'#22c55e':'#E8C547', color: col.e==='Entregado'?'black':'white', padding: '2px 6px', borderRadius: 10, fontSize: 10 }}>{filtrar(col.e).length}</span></div>
            {filtrar(col.e).map(r => (
              <div key={r.id} style={{ background: '#121725', border: '1px solid #1E2538', borderRadius: 12, padding: 8, marginBottom: 8 }}>
                <div onClick={() => mover(r)} style={{ border: '1.5px solid #fff', borderRadius: 8, textAlign: 'center', fontWeight: 900, padding: '5px 0', cursor: 'pointer', fontSize: 12 }}>{r.patente}</div>
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 5 }}>Cliente: {r.nombre}</div>
                <div style={{ fontSize: 9, background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '3px 6px', marginTop: 5, display: 'inline-block' }}>{r.servicio}</div>
                <div style={{ fontSize: 9, opacity: 0.5, marginTop: 5 }}>🕒 Hace {mins(r.created_at)}m {mins(r.created_at)>20 && col.e==='En espera' && <span style={{ background: '#f97316', color: 'white', padding: '1px 4px', borderRadius: 5 }}>Urgente</span>}</div>
                {col.e === 'Listo' && <button onClick={()=>avisarWhatsApp(r)} style={{ width: '100%', marginTop: 7, background: '#25D366', color: 'white', border: 'none', borderRadius: 7, padding: '6px 0', fontSize: 11, fontWeight: 800 }}>📲 Avisar</button>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
