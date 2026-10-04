// @ts-nocheck
"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Admin() {
  const [reservas, setReservas] = useState<any[]>([])
  const [filtro, setFiltro] = useState('Todos')

  const cargar = async () => {
    const { data } = await supabase.from('reservas').select('*').order('created_at', { ascending: false })
    setReservas(data || [])
  }
  useEffect(() => { cargar() }, [])

  const updateEstado = async (id: string, estado: string) => {
    await supabase.from('reservas').update({ estado }).eq('id', id)
    cargar()
  }
  const eliminar = async (id: string) => {
    if(!confirm('¿Borrar esta reserva?')) return
    await supabase.from('reservas').delete().eq('id', id)
    cargar()
  }

  const filtradas = filtro === 'Todos' ? reservas : reservas.filter(r => r.estado === filtro)
  const totalCaja = reservas.filter(r=>r.estado==='Entregado').reduce((acc,r)=>acc+(r.precio||0),0)

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">EL PORTUGUÉS <span className="text-[#d4a356]">ADMIN</span></h1>
            <p className="text-slate-400 text-sm">Panel en vivo - conectado a Supabase</p>
          </div>
          <button onClick={cargar} className="bg-[#d4a356] text-black font-bold px-4 py-2 rounded-lg">Actualizar</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#131b29] border border-[#1e293b] p-4 rounded-xl"><p className="text-slate-400 text-xs">TOTAL</p><p className="text-2xl font-bold">{reservas.length}</p></div>
          <div className="bg-[#131b29] border border-[#1e293b] p-4 rounded-xl"><p className="text-slate-400 text-xs">EN ESPERA</p><p className="text-2xl font-bold text-amber-400">{reservas.filter(r=>r.estado==='En espera').length}</p></div>
          <div className="bg-[#131b29] border border-[#1e293b] p-4 rounded-xl"><p className="text-slate-400 text-xs">EN PROCESO</p><p className="text-2xl font-bold text-sky-400">{reservas.filter(r=>r.estado==='En proceso').length}</p></div>
          <div className="bg-[#131b29] border border-[#1e293b] p-4 rounded-xl"><p className="text-slate-400 text-xs">CAJA (Entregados)</p><p className="text-2xl font-bold text-emerald-400">${totalCaja.toLocaleString()}</p></div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['Todos','En espera','En proceso','Listo','Entregado'].map(e=>(
            <button key={e} onClick={()=>setFiltro(e)} className={`px-4 py-2 rounded-full text-sm font-bold border ${filtro===e ? 'bg-[#d4a356] text-black border-[#d4a356]' : 'bg-[#131b29] border-[#1e293b] text-slate-300'}`}>{e}</button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.length===0 && <div className="col-span-3 text-center py-20 text-slate-500">No hay reservas en {filtro}. Hacé una reserva de prueba desde el celu.</div>}
          {filtradas.map(r=>(
            <div key={r.id} className="bg-[#131b29] border border-[#1e293b] rounded-2xl p-5 hover:border-[#d4a356]/50 transition">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-black text-xl tracking-widest">{r.patente}</h3>
                <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${r.estado==='En espera' ? 'bg-amber-500/20 text-amber-400' : r.estado==='En proceso' ? 'bg-sky-500/20 text-sky-400' : r.estado==='Listo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-300'}`}>{r.estado?.toUpperCase()}</span>
              </div>
              <p className="font-bold">{r.cliente_nombre}</p>
              <p className="text-slate-400 text-sm">{r.cliente_telefono || 'Sin tel'}</p>
              <div className="my-3 h-px bg-[#1e293b]"></div>
              <p className="text-sm text-slate-300">{r.servicio}</p>
              <p className="text-sm font-bold text-[#d4a356]">${r.precio} - {r.fecha} {r.hora}</p>
              
              <div className="flex gap-2 mt-4">
                <select value={r.estado} onChange={e=>updateEstado(r.id,e.target.value)} className="flex-1 bg-[#0a0e17] border border-[#1e293b] rounded-lg p-2 text-sm">
                  <option>En espera</option><option>En proceso</option><option>Listo</option><option>Entregado</option>
                </select>
                <button onClick={()=>eliminar(r.id)} className="bg-red-900/50 hover:bg-red-900 border border-red-900/50 px-3 rounded-lg text-sm">X</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
