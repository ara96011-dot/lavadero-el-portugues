'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Admin() {
  const [reservas, setReservas] = useState<any[]>([])

  const fetchR = async () => {
    const { data } = await supa.from('reservas').select('*').order('created_at', { ascending: false })
    if (data) setReservas(data)
  }
  useEffect(() => { fetchR() }, [])

  const mover = async (r: any) => {
    const orden = ['En espera', 'En Proceso', 'Listo', 'Entregado']
    const nuevo = orden[Math.min(orden.indexOf(r.estado) + 1, 3)]
    await supa.from('reservas').update({ estado: nuevo }).eq('id', r.id)
    fetchR()
  }

  const filtrar = (e: string) => reservas.filter(r => r.estado === e)
  const mins = (d: string) => Math.floor((Date.now() - new Date(d).getTime()) / 60000)

  return (
    <div style={{ background: '#070B14', color: 'white', minHeight: '100vh', padding: 12, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 900 }}> <div style={{ background: '#E8C547', color: 'black', padding: '4px 6px' }}>EP</div> Lavadero El Portugues</div>
        <button onClick={fetchR} style={{ background: '#E8C547', color: 'black', padding: '8px 14px', borderRadius: 8, fontWeight: 800, border: 'none' }}>Actualizar</button>
      </div>

      <div style={{ opacity: 0.6, margin: '10px 0', fontSize: 14 }}>Hoy - {new Date().toLocaleDateString('es-AR')}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 15 }}>
        <div style={{ background: '#121725', padding: 14, borderRadius: 12, border: '1px solid #222' }}>
          <div style={{ fontSize: 13, opacity: 0.7 }}>↗ Total Hoy</div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{reservas.length}</div>
          <div style={{ color: '#22c55e', fontSize: 12 }}>+{filtrar('En espera').length} vs ayer</div>
        </div>
        <div style={{ background: '#121725', padding: 14, borderRadius: 12, border: '1px solid #222' }}>
          <div style={{ fontSize: 13, opacity: 0.7 }}>$ Ingresos</div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>${(reservas.length * 12000).toLocaleString()}</div>
          <div style={{ color: '#22c55e', fontSize: 12 }}>+12% vs ayer</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 15, fontSize: 13, borderBottom: '1px solid #222', paddingBottom: 10, marginBottom: 10 }}>
        <b style={{ color: '#E8C547', borderBottom: '2px solid #E8C547' }}>Tablero<br/>Kanban (Vivo)</b>
        <span style={{ opacity: 0.5 }}>Reservas & Turnos ({reservas.length})</span>
        <span style={{ opacity: 0.5 }}>Clientes ({new Set(reservas.map(r=>r.telefono)).size})</span>
        <span style={{ opacity: 0.5 }}>Vehículos ({new Set(reservas.map(r=>r.patente)).size})</span>
      </div>

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
              <div key={r.id} onClick={() => mover(r)} style={{ background: '#151A27', border: '1px solid #2A3147', borderRadius: 12, padding: 8, marginBottom: 8 }}>
                <div style={{ border: '1.5px solid white', borderRadius: 8, textAlign: 'center', fontWeight: 900, padding: '4px 0', letterSpacing: 1 }}>{r.patente}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>Cliente: {r.nombre}</div>
                <div style={{ fontSize: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 6px', marginTop: 6, display: 'inline-block' }}>{r.servicio}</div>
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 6 }}>🕒 Hace {mins(r.created_at)}m {mins(r.created_at) > 20 && col.e === 'En espera' && <span style={{ background: '#f97316', color: 'white', padding: '2px 4px', borderRadius: 6, marginLeft: 4 }}>Urgente</span>}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
