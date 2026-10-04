// @ts-nocheck
"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

function tiempoDesde(created:any){
  if(!created) return 'Hace un rato'
  const diff = (Date.now() - new Date(created).getTime())/1000/60
  if(diff<60) return `Hace ${Math.round(diff)} min`
  return `Hace ${Math.floor(diff/60)}h ${Math.round(diff%60)}m`
}

export default function Admin(){
  const [reservas,setReservas]=useState<any[]>([])
  const cargar=async()=>{ const {data}=await supabase.from('reservas').select('*').order('created_at',{ascending:true}); setReservas(data||[]) }
  useEffect(()=>{cargar(); const id=setInterval(cargar,5000); return()=>clearInterval(id)},[])

  const mover=async(id:string, actual:string)=>{
    const orden=['En espera','En proceso','Listo','Entregado']
    const idx=orden.indexOf(actual)
    const siguiente=orden[(idx+1)%orden.length]
    await supabase.from('reservas').update({estado:siguiente}).eq('id',id)
    cargar()
  }

  const enEspera=reservas.filter(r=>r.estado==='En espera')
  const enProceso=reservas.filter(r=>r.estado==='En proceso')
  const listos=reservas.filter(r=>r.estado==='Listo')
  const entregados=reservas.filter(r=>r.estado==='Entregado')

  const ingresos=entregados.reduce((a,b)=>a+(b.precio||0),0)
  const hoy=new Date().toLocaleDateString('es-AR',{day:'numeric', month:'short', year:'numeric'})

  const Card=({r,color}:{r:any,color:string})=>(
    <div onClick={()=>mover(r.id,r.estado)} className="bg-[#23262e] border border-[#2f333d] rounded-2xl p-3 mb-3 cursor-pointer hover:border-white/20 transition">
      <div className="bg-[#1a1d24] border border-white/10 rounded-xl px-3 py-1.5 text-center font-black tracking-wider text-[15px]">{r.patente}</div>
      <p className="text-[12px] text-white/80 mt-2 text-center">Cliente: {r.cliente_nombre?.split(' ')[0]} {r.cliente_nombre?.split(' ')[1]?.[0]}.</p>
      <div className={`mt-2 text-[11px] font-bold px-2 py-1 rounded-full text-center ${color}`}>{r.servicio}</div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-white/60">
        <span>🕒</span><span>{tiempoDesde(r.created_at)}</span>
        {r.estado==='En espera' && (Date.now()-new Date(r.created_at).getTime())/1000/60>15 && <span className="ml-auto bg-[#8a4a1e] text-[#ffba7a] text-[9px] px-2 py-0.5 rounded-full font-bold">Urgente</span>}
        {r.estado==='En proceso' && <span className="text-sky-300/80">En proceso - {Math.round((Date.now()-new Date(r.created_at).getTime())/1000/60)} min</span>}
        {r.estado==='Listo' && <span className="text-emerald-300/80">✓ Listo - {Math.round((Date.now()-new Date(r.created_at).getTime())/1000/60)} min</span>}
        {r.estado==='Entregado' && <span className="text-white/60">✓ Entregado {new Date(r.created_at).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</span>}
      </div>
      {r.estado==='En proceso' && <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[#4a8de4] w-3/4"></div></div>}
    </div>
  )

  return(
    <div className="min-h-screen bg-[#121316] text-white p-2 pb-24 max-w-[1200px] mx-auto">
      {/* HEADER */}
      <div className="bg-[#1e2128] rounded-[24px] p-4 flex justify-between items-center border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#c9a46a] rounded-full flex items-center justify-center text-xl">💧</div>
          <h1 className="font-bold text-[18px]">Lavadero El Portugues</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="w-10 h-10 bg-[#2a2d36] rounded-full flex items-center justify-center">🏠</Link>
          <button onClick={cargar} className="w-10 h-10 bg-[#2a2d36] rounded-full flex items-center justify-center">↻</button>
        </div>
      </div>

      <p className="text-white/40 text-sm mt-4 px-2">Hoy - {hoy}</p>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-[#23262e] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm text-white/60"><span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">↑</span>Total Hoy</div>
          <p className="text-3xl font-black mt-1">{reservas.length}</p>
          <p className="text-emerald-400 text-xs font-bold">+{enEspera.length} en espera</p>
        </div>
        <div className="bg-[#23262e] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm text-white/60"><span className="w-6 h-6 bg-[#c9a46a] rounded-full flex items-center justify-center">$</span>Ingresos</div>
          <p className="text-3xl font-black mt-1">${ingresos.toLocaleString()}</p>
          <p className="text-emerald-400 text-xs font-bold">{entregados.length} entregados</p>
        </div>
        <div className="bg-[#23262e] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm text-white/60"><span className="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">◷</span>Tiempo Prom.</div>
          <p className="text-3xl font-black mt-1">45 min</p>
          <p className="text-emerald-400 text-xs font-bold">-5min vs ayer</p>
        </div>
        <div className="bg-[#23262e] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm text-white/60"><span className="w-6 h-6 bg-[#c9a46a] rounded-full flex items-center justify-center">☆</span>Satisfacción</div>
          <p className="text-3xl font-black mt-1">4.8<span className="text-[#c9a46a]">★</span></p>
          <p className="text-white/40 text-xs">{reservas.length} reseñas</p>
        </div>
      </div>

      {/* KANBAN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <div>
          <div className="flex items-center gap-2 mb-3 font-bold text-[13px]">En Espera <span className="bg-[#3a3d47] px-2 py-0.5 rounded-full text-xs">{enEspera.length}</span></div>
          {enEspera.map(r=><Card key={r.id} r={r} color="bg-[#3a3d47] text-white/70"/>)}
          {enEspera.length===0 && <p className="text-white/20 text-xs text-center py-6">Vacío</p>}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3 font-bold text-[13px]">En Proceso <span className="bg-[#4a8de4] px-2 py-0.5 rounded-full text-xs">{enProceso.length}</span></div>
          {enProceso.map(r=><Card key={r.id} r={r} color="bg-[#4a8de4]/20 text-[#7eb0ff] border border-[#4a8de4]/30"/>)}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3 font-bold text-[13px]">Listo <span className="bg-emerald-500 px-2 py-0.5 rounded-full text-xs">{listos.length}</span></div>
          {listos.map(r=><Card key={r.id} r={r} color="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"/>)}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3 font-bold text-[13px]">Entregado <span className="bg-[#8a6bc9] px-2 py-0.5 rounded-full text-xs">{entregados.length}</span></div>
          {entregados.map(r=><Card key={r.id} r={r} color="bg-[#8a6bc9]/30 text-[#c6b0ff]"/>)}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-2 left-2 right-2 bg-[#1e2128] border border-white/10 rounded-[24px] flex justify-around p-2">
        <button className="flex flex-col items-center text-[#c9a46a]"><span className="text-xl">🗂️</span><span className="text-[11px] font-bold">Tablero</span></button>
        <Link href="/" className="flex flex-col items-center text-white/40"><span className="text-xl">📊</span><span className="text-[11px]">Principal</span></Link>
        <button onClick={()=>{const p=prompt('Patente?'); if(p) mover(prompt('ID de reserva?')||'', 'En espera')}} className="flex flex-col items-center text-white/40"><span className="text-xl">➕</span><span className="text-[11px]">Nuevo</span></button>
        <button className="flex flex-col items-center text-white/40"><span className="text-xl">👤</span><span className="text-[11px]">Perfil</span></button>
      </div>
    </div>
  )
}
