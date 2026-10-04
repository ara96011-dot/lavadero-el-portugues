// @ts-nocheck
"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Admin() {
  const [reservas, setReservas] = useState<any[]>([])
  const [tab, setTab] = useState('reservas')
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
    if (!confirm('¿Borrar?')) return
    await supabase.from('reservas').delete().eq('id', id)
    cargar()
  }

  const filtradas = filtro === 'Todos'? reservas : reservas.filter(r => r.estado === filtro)
  const enEspera = reservas.filter(r=>r.estado==='En espera')
  const enProceso = reservas.filter(r=>r.estado==='En proceso')
  const listos = reservas.filter(r=>r.estado==='Listo')
  const entregados = reservas.filter(r=>r.estado==='Entregado')
  const cajaHoy = entregados.reduce((a,b)=>a+(b.precio||0),0)

  return (
    <div className="min-h-screen bg-[#080b12] text-white flex">
      {/* SIDEBAR */}
      <div className="w-[260px] bg-[#0f1623] border-r border-[#1c273a] p-6 hidden md:flex flex-col">
        <h2 className="font-black text-xl tracking-tight">EL PORTUGUÉS</h2>
        <p className="text-[11px] tracking-[0.3em] text-[#d4a356] mb-8">LAVADERO PREMIUM</p>

        <nav className="flex flex-col gap-2">
          <button onClick={()=>setTab('reservas')} className={`text-left px-4 py-3 rounded-xl font-bold text-sm ${tab==='reservas'? 'bg-[#d4a356] text-black' : 'bg-[#131b29] text-slate-400'}`}>📋 Reservas ({reservas.length})</button>
          <button onClick={()=>setTab('caja')} className={`text-left px-4 py-3 rounded-xl font-bold text-sm ${tab==='caja'? 'bg-[#d4a356] text-black' : 'bg-[#131b29] text-slate-400'}`}>💰 Caja</button>
          <button onClick={()=>setTab('clientes')} className={`text-left px-4 py-3 rounded-xl font-bold text-sm ${tab==='clientes'? 'bg-[#d4a356] text-black' : 'bg-[#131b29] text-slate-400'}`}>👥 Clientes</button>
        </nav>

        <div className="mt-auto">
          <Link href="/" className="block text-center bg-[#131b29] border border-[#1e293b] py-3 rounded-xl text-sm font-bold hover:bg-white hover:text-black transition">← Volver a Principal</Link>
          <p className="text-[10px] text-slate-500 mt-3 text-center">Conectado a Supabase en vivo</p>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex md:hidden gap-2 mb-4">
          <Link href="/" className="bg-[#131b29] border border-[#1e293b] px-4 py-2 rounded-xl text-sm">← Principal</Link>
          <button onClick={cargar} className="bg-[#d4a356] text-black px-4 py-2 rounded-xl text-sm font-bold">Actualizar</button>
        </div>

        {tab==='reservas' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#131b29] border border-[#1e293b] p-5 rounded-2xl"><p className="text-xs text-slate-400">EN ESPERA</p><p className="text-3xl font-black text-amber-400">{enEspera.length}</p></div>
              <div className="bg-[#131b29] border border-[#1e293b] p-5 rounded-2xl"><p className="text-xs text-slate-400">EN PROCESO</p><p className="text-3xl font-black text-sky-400">{enProceso.length}</p></div>
              <div className="bg-[#131b29] border border-[#1e293b] p-5 rounded-2xl"><p className="text-xs text-slate-400">LISTOS</p><p className="text-3xl font-black text-emerald-400">{listos.length}</p></div>
              <div className="bg-[#131b29] border border-[#1e293b] p-5 rounded-2xl"><p className="text-xs text-slate-400">ENTREGADOS</p><p className="text-3xl font-black">{entregados.length}</p></div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto">
              {['Todos','En espera','En proceso','Listo','Entregado'].map(e=>(
                <button key={e} onClick={()=>setFiltro(e)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border ${filtro===e?'bg-white text-black':'bg-[#131b29] border-[#1e293b] text-slate-400'}`}>{e}</button>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtradas.map(r=>(
                <div key={r.id} className="bg-[#111827] border border-[#1e293b] rounded-[20px] p-6">
                  <div className="flex justify-between"><span className="font-black tracking-widest text-lg">{r.patente}</span><span className="text-xs bg-[#1e293b] px-3 py-1 rounded-full text-slate-300">{r.fecha} {r.hora}</span></div>
                  <p className="mt-2 font-bold">{r.cliente_nombre} <span className="text-slate-400 font-normal text-sm">- {r.cliente_telefono}</span></p>
                  <p className="text-sm text-slate-300 mt-1">{r.servicio}</p>
                  <p className="text-[#d4a356] font-black mt-1">${r.precio}</p>
                  <div className="flex gap-2 mt-4">
                    <select value={r.estado} onChange={e=>updateEstado(r.id,e.target.value)} className="flex-1 bg-[#080b12] border border-[#1e293b] rounded-xl p-3 text-sm">
                      <option>En espera</option><option>En proceso</option><option>Listo</option><option>Entregado</option>
                    </select>
                    <button onClick={()=>eliminar(r.id)} className="bg-red-950/50 border border-red-900/50 px-4 rounded-xl">🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab==='caja' && (
          <div className="bg-[#131b29] border border-[#1e293b] rounded-2xl p-8">
            <h2 className="text-2xl font-black mb-2">Caja del día</h2>
            <p className="text-5xl font-black text-[#d4a356]">${cajaHoy.toLocaleString()}</p>
            <p className="text-slate-400 text-sm mt-2">Suma de todos los Entregados</p>
            <div className="mt-6">
              {entregados.map(r=><div key={r.id} className="flex justify-between py-2 border-b border-[#1e293b] text-sm"><span>{r.patente} - {r.cliente_nombre}</span><span className="font-bold">${r.precio}</span></div>)}
            </div>
          </div>
        )}

        {tab==='clientes' && (
          <div className="bg-[#131b29] border border-[#1e293b] rounded-2xl p-8">
            <h2 className="text-2xl font-black mb-6">Clientes ({[...new Set(reservas.map(r=>r.patente))].length} patentes)</h2>
            {[...new Map(reservas.map(r=>[r.patente,r])).values()].map(r=>(
              <div key={r.patente} className="flex justify-between py-3 border-b border-[#1e293b]"><span className="font-bold tracking-widest">{r.patente}</span><span className="text-slate-400">{r.cliente_nombre} - {r.cliente_telefono}</span></div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
