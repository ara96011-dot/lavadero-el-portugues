// @ts-nocheck
"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { Car, Clock, MapPin, Phone, Search, Calendar, ArrowRight, MessageCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const SERVICIOS = [
  { id: 'basico', nombre: 'Lavado Básico', precio: 8000, desc: 'Exterior, interior, vidrios' },
  { id: 'completo', nombre: 'Lavado Completo', precio: 12000, desc: 'Básico + encerado' },
  { id: 'premium', nombre: 'Lavado Premium', precio: 18000, desc: 'Completo + motor' },
  { id: 'detallado', nombre: 'Detallado Total', precio: 25000, desc: 'Premium + pulido cerámico' },
]

export default function Home() {
  const [patente, setPatente] = useState('')
  const [consultaPatente, setConsultaPatente] = useState('')
  const [turno, setTurno] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ nombre: '', telefono: '', servicio: 'completo', fecha: '', hora: '09:00' })

  const handleReserva = async (e: any) => {
    e.preventDefault()
    if (!patente || !form.nombre || !form.fecha) { setMsg('Completá patente, nombre y fecha'); return }
    setLoading(true); setMsg('')
    try {
      const serv = SERVICIOS.find(s => s.id === form.servicio)
      const { error } = await supabase.from('reservas').insert([{ patente: patente.toUpperCase(), cliente_nombre: form.nombre, cliente_telefono: form.telefono, servicio: serv?.nombre, precio: serv?.precio, fecha: form.fecha, hora: form.hora, estado: 'En espera' }])
      if (error) throw error
      setMsg('¡Reserva confirmada! Ya figura en Supabase'); setPatente(''); setForm({ nombre: '', telefono: '', servicio: 'completo', fecha: '', hora: '09:00' })
    } catch (err: any) { setMsg('Error: ' + err.message) }
    setLoading(false)
  }
  const handleBuscar = async (e: any) => {
    e.preventDefault(); setLoading(true); setTurno(null)
    const { data } = await supabase.from('reservas').select('*').ilike('patente', `%${consultaPatente}%`).order('created_at', { ascending: false }).limit(1)
    if (data?.[0]) setTurno(data[0]); else setMsg('No encontramos esa patente'); setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0b0f17]">
      <header className="sticky top-0 z-50 bg-[#0b0f17]/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center"><div className="flex items-center gap-2 font-extrabold"><Car color="#d4a356" /> EL PORTUGUÉS</div><nav className="flex gap-3 md:gap-6 text-xs md:text-sm"><a href="#servicios" className="text-slate-400">Servicios</a><a href="#estado" className="text-slate-400">Estado</a><Link href="/admin" className="text-[#d4a356] font-bold">Admin</Link></nav></div>
      </header>

      <section className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div><h1 className="text-4xl md:text-6xl font-black leading-[0.9]">Tu auto <span className="text-[#d4a356]">impecable</span> en 30 minutos</h1><p className="text-slate-400 mt-4 text-lg">Lavadero premium en Concepción, Tucumán. Reserva online y seguí el estado.</p><div className="flex flex-wrap gap-3 mt-6"><a href="#reserva" className="btn-gold">Reservar ahora <ArrowRight size={18} /></a><a href="#estado" className="btn-dark"><Search size={18} /> Consultar patente</a></div></div>
        <div className="glass-panel p-6"><h3 className="flex gap-2 font-bold mb-3"><Clock color="#d4a356" /> Horarios</h3><p className="text-slate-400 text-sm">Lunes a Sábado 8:00-18:00<br/>Domingos 9:00-13:00</p><div className="mt-4 text-sm text-slate-400 flex gap-2"><MapPin size={16}/> Rivadavia 1234</div><div className="mt-2 text-sm text-slate-400 flex gap-2"><Phone size={16}/> 3865-123456</div></div>
      </section>

      <section id="servicios" className="max-w-6xl mx-auto px-4 md:px-6 pb-12"><h2 className="text-3xl font-bold mb-6">Servicios</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{SERVICIOS.map(s => <div key={s.id} className="glass-card p-5"><div className="flex justify-between"><strong className="text-sm">{s.nombre}</strong><span className="text-[#d4a356] font-black">${s.precio}</span></div><p className="text-slate-400 text-xs mt-2">{s.desc}</p></div>)}</div></section>

      <section id="estado" className="max-w-6xl mx-auto px-4 md:px-6 pb-12"><div className="glass-panel p-6 max-w-xl"><h2 className="text-xl font-bold mb-4 flex gap-2"><Search color="#d4a356" /> Consultar estado</h2><form onSubmit={handleBuscar} className="flex gap-2"><input value={consultaPatente} onChange={e => setConsultaPatente(e.target.value)} placeholder="Ej: AA123BB" className="flex-1 bg-[#131b29] border border-white/10 rounded-xl px-4 py-3 text-sm" /><button className="btn-gold text-sm">Buscar</button></form>{turno && <div className="mt-4 bg-[#d4a356]/10 border border-[#d4a356]/20 rounded-xl p-4 text-sm"><p>Patente: <b>{turno.patente}</b></p><p>Estado: <span className={`badge badge-${turno.estado === 'En espera' ? 'espera' : turno.estado === 'En proceso' ? 'proceso' : 'listo'}`}>{turno.estado}</span></p><p>Servicio: {turno.servicio}</p></div>}</div></section>

      <section id="reserva" className="max-w-6xl mx-auto px-4 md:px-6 pb-20"><div className="glass-panel p-6 md:p-8"><h2 className="text-2xl font-bold mb-6 flex gap-2"><Calendar color="#d4a356" /> Reservar turno</h2><form onSubmit={handleReserva} className="grid grid-cols-1 md:grid-cols-2 gap-4"><input value={patente} onChange={e => setPatente(e.target.value.toUpperCase())} placeholder="Patente" className="bg-[#131b29] border border-white/10 rounded-xl px-4 py-3" /><input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className="bg-[#131b29] border border-white/10 rounded-xl px-4 py-3" /><input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="WhatsApp" className="bg-[#131b29] border border-white/10 rounded-xl px-4 py-3" /><select value={form.servicio} onChange={e => setForm({ ...form, servicio: e.target.value })} className="bg-[#131b29] border border-white/10 rounded-xl px-4 py-3">{SERVICIOS.map(s => <option key={s.id} value={s.id}>{s.nombre} - ${s.precio}</option>)}</select><input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} className="bg-[#131b29] border border-white/10 rounded-xl px-4 py-3" /><input type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} className="bg-[#131b29] border border-white/10 rounded-xl px-4 py-3" /><div className="md:col-span-2"><button type="submit" className="btn-gold w-full justify-center py-4" disabled={loading}>{loading ? 'Guardando...' : 'Confirmar Reserva'}</button>{msg && <p className="mt-3 text-center text-sm" style={{ color: msg.includes('Error') ? '#f87171' : '#4ade80' }}>{msg}</p>}</div></form></div></section>

      <a href="https://wa.me/5493865123456" className="whatsapp-float" target="_blank"><MessageCircle size={28} /></a>
      <footer className="text-center py-6 text-slate-500 text-sm border-t border-white/10">© 2026 Lavadero El Portugués - Concepción</footer>
    </div>
  )
}
