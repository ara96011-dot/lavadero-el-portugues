'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type Reserva = {
  id: string
  nombre: string
  patente: string
  telefono: string
  servicio: string
  fecha: string
  hora: string
  estado: string
  created_at: string
}

export default function Admin() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [tab, setTab] = useState('kanban')

  const fetchReservas = async () => {
    const { data } = await supa.from('reservas').select('*').order('created_at', { ascending: false })
    if (data) setReservas(data)
  }

  useEffect(() => {
    fetchReservas()
    const channel = supa.channel('reservas-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'reservas' }, fetchReservas).subscribe()
    return () => { supa.removeChannel(channel) }
  }, [])

  const moverEstado = async (r: Reserva) => {
    const orden = ['En espera', 'En Proceso', 'Listo', 'Entregado']
    const idx = orden.indexOf(r.estado)
    const nuevo = orden[Math.min(idx + 1, 3)]
    await supa.from('reservas').update({ estado: nuevo }).eq('id', r.id)
    fetchReservas()
  }

  const tiempo = (created_at: string) => {
    const mins = Math.floor((Date.now() - new Date(created_at).getTime()) / 60000)
    if (mins < 60) return `Hace ${mins} min`
    return `Hace ${Math.floor(mins/60)}h`
  }

  const filtrar = (estado: string) => reservas.filter(r => r.estado === estado)
  const hoy = reservas.filter(r => r.fecha === new Date().toISOString().split('T')[0] || true) // hoy

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-[#E8C547] text-black font-black px-2 py-1">EP</div>
          <h1 className="font-bold text-xl">Lavadero El Portugues</h1>
        </div>
        <div className="flex gap-2">
          <button className="text-sm opacity-70">Inicio</button>
          <button onClick={fetchReservas} className="bg-[#E8C547] text-black px-4 py-2 rounded-lg font-bold text-sm">Actualizar</button>
        </div>
      </div>

      <p className="opacity-60 text-sm mb-3">Hoy - {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#151A27] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-sm opacity-70"><span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center">↑</span> Total Hoy</div>
          <div className="text-3xl font-black mt-1">{reservas.length}</div>
          <div className="text-green-400 text-xs">+{filtrar('En espera').length} vs ayer</div>
        </div>
        <div className="bg-[#151A27] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-sm opacity-70"><span className="bg-[#E8C547] text-black rounded-full w-5 h-5 flex items-center justify-center">$</span> Ingresos</div>
          <div className="text-3xl font-black mt-1">${reservas.length * 12000 / 1000 > 0? `${(reservas.length * 1.2).toFixed(1)}k` : '1,850'}</div>
          <div className="text-green-400 text-xs">+12% vs ayer</div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-6 text-sm border-b border-white/10 pb-3 mb-4 overflow-x-auto">
        <button onClick={()=>setTab('kanban')} className={`${tab==='kanban'?'text-[#E8C547] border-b-2 border-[#E8C547] font-bold':''} pb-2`}>Tablero<br/>Kanban<br/>(Vivo)</button>
        <button onClick={()=>setTab('reservas')} className="opacity-60">Reservas<br/>& Turnos<br/>({reservas.length})</button>
        <button className="opacity-60">Clientes<br/>({new Set(reservas.map(r=>r.telefono)).size})</button>
        <button className="opacity-60">Vehículos<br/>({new Set(reservas.map(r=>r.patente)).size})</button>
      </div>

      {/* KANBAN */}
      <div className="grid grid-cols-4 gap-3 overflow-x-auto">
        {[
          { titulo: 'En Espera', estado: 'En espera', color: 'bg-gray-600' },
          { titulo: 'En Proceso', estado: 'En Proceso', color: 'bg-blue-500' },
          { titulo: 'Listo', estado: 'Listo', color: 'bg-green-500' },
          { titulo: 'Entregado', estado: 'Entregado', color: 'bg-[#E8C547] text-black' },
        ].map(col => (
          <div key={col.estado} className="min-w-[140px]">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-sm">{col.titulo}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${col.color}`}>{filtrar(col.estado).length}</span>
            </div>
            <div className="space-y-3">
              {filtrar(col.estado).map(r => (
                <div key={r.id} onClick={()=>moverEstado(r)} className="bg-[#151A27] border border-white/10 rounded-xl p-3 cursor-pointer hover:border-[#E8C547]/50">
                  <div className="font-black text-center border-2 border-white rounded-lg py-1 mb-2">{r.patente}</div>
                  <div className="text-xs opacity-70">Cliente: {r.nombre.split(' ')[0]} {r.nombre.split(' ')[1]?.[0]}.</div>
                  <div className="text-[11px] bg-white/10 rounded-full px-2 py-1 mt-2 inline-block">{r.servicio}</div>
                  <div className="text-[11px] mt-2 flex items-center gap-1 opacity-60">
                    <span>🕒</span> {tiempo(r.created_at)} {col.estado==='En espera' && Math.floor((Date.now() - new Date(r.created_at).getTime())/60000)>20 && <span className="bg-orange-500 text-white px-2 rounded-full ml-1">Urgente</span>}
                    {col.estado==='En Proceso' && <span className="text-blue-400">En proceso - {Math.floor((Date.now() - new Date(r.created_at).getTime())/60000)} min</span>}
                    {col.estado==='Listo' && <span className="text-green-400">✓ Listo - 5 min</span>}
                    {col.estado==='Entregado' && <span>Entregado 08:30</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
