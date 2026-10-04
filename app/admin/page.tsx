// @ts-nocheck
"use client"
import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Car, Users, Calendar, DollarSign, Search, Plus, MessageCircle, Trash2, RefreshCw, Home, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type Turno = { id:string, nombre:string, patente:string, telefono:string, servicio:string, precio:number, fecha:string, hora:string, estado:'En espera'|'En proceso'|'Listo'|'Entregado' }
type Cliente = { id:string, nombre:string, telefono:string, email:string, patentePrincipal:string, fechaAlta:string, notas:string, totalLavados:number, gastoTotal:number }
type Vehiculo = { id:string, patente:string, marca:string, modelo:string, tipo:string, color:string, clienteId:string }
type CajaItem = { id:string, fecha:string, patente:string, servicio:string, medioPago:string, monto:number }

const ESTADOS_LIST: Array<Turno['estado']> = ['En espera', 'En proceso', 'Listo', 'Entregado']

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'kanban' | 'turnos' | 'clientes' | 'vehiculos' | 'caja'>('kanban')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [caja, setCaja] = useState<CajaItem[]>([])
  const [searchClientes, setSearchClientes] = useState('')
  const [pageCliente, setPageCliente] = useState(1)
  const itemsPerPage = 15
  const [searchTurnos, setSearchTurnos] = useState('')
  const [filterEstadoTurno, setFilterEstadoTurno] = useState<string>('Todos')
  const [showModalNuevoTurno, setShowModalNuevoTurno] = useState(false)
  const [showModalNuevoCliente, setShowModalNuevoCliente] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [nuevoPatente, setNuevoPatente] = useState('')
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoTelefono, setNuevoTelefono] = useState('')
  const [nuevoServicio, setNuevoServicio] = useState('Carrocería + Interior')
  const [nuevoPrecio, setNuevoPrecio] = useState('12000')
  const [cliNombre, setCliNombre] = useState('')
  const [cliTel, setCliTel] = useState('')
  const [cliEmail, setCliEmail] = useState('')
  const [cliPatente, setCliPatente] = useState('')
  const [cliNotas, setCliNotas] = useState('')

  const loadData = async () => {
    const { data } = await supabase.from('reservas').select('*').order('created_at', { ascending: false })
    const reservas = data || []
    const turnosMapped: Turno[] = reservas.filter((r:any)=>!['BBB111','AAA111','123ABC','AAAA','BBBB'].includes(r.patente)).map((r:any)=>({
      id: r.id, nombre: r.cliente_nombre, patente: r.patente, telefono: r.cliente_telefono||'', servicio: r.servicio||'Lavado', precio: r.precio||0, fecha: r.fecha || new Date().toISOString().split('T')[0], hora: r.hora || '', estado: r.estado || 'En espera'
    }))
    setTurnos(turnosMapped)
    const mapClientes = new Map<string, Cliente>()
    turnosMapped.forEach((r)=>{
      if(!mapClientes.has(r.patente)){
        mapClientes.set(r.patente, { id: r.patente, nombre: r.nombre, telefono: r.telefono, email: '', patentePrincipal: r.patente, fechaAlta: r.fecha, notas: '', totalLavados: turnosMapped.filter(x=>x.patente===r.patente).length, gastoTotal: turnosMapped.filter(x=>x.patente===r.patente && x.estado==='Entregado').reduce((a,b)=>a+(b.precio||0),0) })
      }
    })
    setClientes(Array.from(mapClientes.values()))
    setVehiculos(Array.from(mapClientes.values()).map(c=>({ id: c.patentePrincipal, patente: c.patentePrincipal, marca: 'Registrado', modelo: '-', tipo: 'Auto', color: '-', clienteId: c.id })))
    setCaja(turnosMapped.filter(r=>r.estado==='Entregado').map(r=>({ id: r.id, fecha: r.fecha, patente: r.patente, servicio: r.servicio, medioPago: 'Efectivo', monto: r.precio })))
  }

  useEffect(()=>{ loadData(); const i=setInterval(loadData,4000); return()=>clearInterval(i) },[])
  const handleCambiarEstado = async (id: string, nuevoEstadoStr: string) => { await supabase.from('reservas').update({ estado: nuevoEstadoStr }).eq('id', id); loadData() }
  const handleCrearTurno = async (e: React.FormEvent) => { e.preventDefault(); await supabase.from('reservas').insert([{ patente: nuevoPatente.toUpperCase().trim(), cliente_nombre: nuevoNombre, cliente_telefono: nuevoTelefono, servicio: nuevoServicio, precio: parseInt(nuevoPrecio)||12000, fecha: new Date().toISOString().split('T')[0], hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), estado: 'En espera' }]); setShowModalNuevoTurno(false); setNuevoPatente(''); setNuevoNombre(''); loadData() }
  const handleCrearCliente = async (e: React.FormEvent) => { e.preventDefault(); await supabase.from('reservas').insert([{ patente: cliPatente.toUpperCase().trim(), cliente_nombre: cliNombre, cliente_telefono: cliTel, servicio: 'Alta Cliente', precio: 0, fecha: new Date().toISOString().split('T')[0], hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), estado: 'En espera' }]); setShowModalNuevoCliente(false); loadData() }
  const handleEliminarCliente = async (id: string) => { if (confirm('¿Borrar todas las reservas de esta patente?')) { await supabase.from('reservas').delete().eq('patente', id); loadData() } }

  const filteredClientes = useMemo(() => clientes.filter(c => c.nombre.toLowerCase().includes(searchClientes.toLowerCase()) || c.patentePrincipal.toLowerCase().includes(searchClientes.toLowerCase())), [clientes, searchClientes])
  const paginatedClientes = useMemo(() => filteredClientes.slice((pageCliente-1)*itemsPerPage, pageCliente*itemsPerPage), [filteredClientes, pageCliente])
  const filteredTurnos = useMemo(() => turnos.filter(t => (t.nombre.toLowerCase().includes(searchTurnos.toLowerCase()) || t.patente.toLowerCase().includes(searchTurnos.toLowerCase())) && (filterEstadoTurno==='Todos'||t.estado===filterEstadoTurno)), [turnos, searchTurnos, filterEstadoTurno])
  const hoyStr = new Date().toISOString().split('T')[0]
  const turnosHoy = turnos.filter(t => t.fecha === hoyStr)
  const lavadosEnProceso = turnos.filter(t => t.estado === 'En proceso' || t.estado === 'En espera')
  const totalCajaHoy = caja.filter(c => c.fecha === hoyStr).reduce((acc, curr) => acc + curr.monto, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', paddingBottom: '60px' }}>
      {/* HEADER FIX CELULAR */}
      <header style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-color)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #d4a356, #b88536)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Car size={18} color="#000" /></div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '14px', fontWeight: 900, lineHeight: '1.1', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>ADMIN | EL PORTUGUÉS</h1>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>{turnos.length} reservas reales</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button onClick={loadData} className="btn-dark" style={{ padding: '8px 10px' }}><RefreshCw size={14} /></button>
          <button onClick={() => setShowModalNuevoTurno(true)} className="btn-gold" style={{ fontSize: '12px', padding: '8px 12px' }}><Plus size={14} /> Orden</button>
          <Link href="/" className="btn-dark" style={{ fontSize: '12px', padding: '8px 12px' }}><Home size={14} /></Link>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '12px auto', padding: '0 12px' }}>
        {/* CARDS CON SCROLL HORIZONTAL EN CELU */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }} className="max-md:!flex max-md:overflow-x-auto max-md:pb-2 max-md:snap-x">
          <div className="glass-card max-md:!min-w-[150px] max-md:snap-start" style={{ padding: '14px' }}><span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Total Clientes</span><div style={{ fontSize: '28px', fontWeight: 900 }}>{clientes.length}</div><span style={{ fontSize: '11px', color: '#22c55e' }}>✓ Supabase</span></div>
          <div className="glass-card max-md:!min-w-[150px] max-md:snap-start" style={{ padding: '14px' }}><span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>En Lavadero</span><div style={{ fontSize: '28px', fontWeight: 900 }}>{lavadosEnProceso.length}</div><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{turnos.filter(t=>t.estado==='En proceso').length} activo</span></div>
          <div className="glass-card max-md:!min-w-[150px] max-md:snap-start" style={{ padding: '14px' }}><span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Turnos Hoy</span><div style={{ fontSize: '28px', fontWeight: 900 }}>{turnosHoy.length}</div></div>
          <div className="glass-card max-md:!min-w-[150px] max-md:snap-start" style={{ padding: '14px' }}><span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Caja Hoy</span><div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--accent-gold)' }}>${totalCajaHoy.toLocaleString()}</div></div>
        </div>

        {/* TABS CON SCROLL */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {[
            {k:'kanban', l:`Kanban (${turnos.length})`},
            {k:'turnos', l:'Reservas'},
            {k:'clientes', l:`Clientes (${clientes.length})`},
            {k:'vehiculos', l:'Vehículos'},
            {k:'caja', l:'Caja'},
          ].map(t=>(
            <button key={t.k} onClick={() => setActiveTab(t.k as any)} style={{ padding: '10px 14px', whiteSpace: 'nowrap', background: activeTab===t.k? 'var(--bg-card)' : 'transparent', border: 'none', borderBottom: activeTab===t.k? '2px solid var(--accent-gold)' : '2px solid transparent', color: activeTab===t.k? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: 800, fontSize: '13px', cursor: 'pointer', flexShrink: 0 }}>{t.l}</button>
          ))}
        </div>

        {/* KANBAN CON SCROLL HORIZONTAL EN CELU */}
        {activeTab === 'kanban' && (
          <div style={{ overflowX: 'auto', paddingBottom: '20px', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', minWidth: '900px' }}>
              {ESTADOS_LIST.map(est => {
                const colTurnos = turnos.filter(t => t.estado === est)
                return (
                  <div key={est} className="glass-panel" style={{ padding: '12px', minHeight: '500px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}><h3 style={{ fontSize: '13px', fontWeight: 800 }}>{est}</h3><span className="badge badge-gold" style={{ fontSize: '11px' }}>{colTurnos.length}</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {colTurnos.map(t => (
                        <div key={t.id} className="glass-card" style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--accent-gold)' }}>{t.patente}</span><span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.hora}</span></div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{t.nombre}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.servicio}</p>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-gold)', margin: '6px 0' }}>${t.precio.toLocaleString()}</div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {est === 'En espera' && <button onClick={() => handleCambiarEstado(t.id, 'En proceso')} className="btn-dark" style={{ flex: 1, padding: '6px', fontSize: '11px' }}>Iniciar</button>}
                            {est === 'En proceso' && <button onClick={() => handleCambiarEstado(t.id, 'Listo')} className="btn-gold" style={{ flex: 1, padding: '6px', fontSize: '11px' }}>Listo</button>}
                            {est === 'Listo' && <button onClick={() => handleCambiarEstado(t.id, 'Entregado')} className="btn-gold" style={{ flex: 1, padding: '6px', fontSize: '11px', background: '#22c55e', color: '#fff' }}>Entregar</button>}
                            {est === 'Entregado' && <span style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>✓ Cobrado</span>}
                            <a href={`https://wa.me/54${t.telefono.replace(/[^0-9]/g, '')}`} target="_blank" className="btn-dark" style={{ padding: '6px 8px' }}><MessageCircle size={12} color="#22c55e" /></a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* LAS OTRAS TABS QUEDAN IGUAL */}
        {activeTab === 'turnos' && (
          <div className="glass-panel" style={{ padding: '12px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}><input placeholder="Buscar patente o cliente" value={searchTurnos} onChange={e=>setSearchTurnos(e.target.value)} style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} /><select value={filterEstadoTurno} onChange={e=>setFilterEstadoTurno(e.target.value)} style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }}><option value="Todos">Todos</option><option>En espera</option><option>En proceso</option><option>Listo</option><option>Entregado</option></select></div>
            <table className="admin-table" style={{ minWidth: '600px' }}><thead><tr><th>Patente</th><th>Cliente</th><th>Servicio</th><th>Monto</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{filteredTurnos.map(t=><tr key={t.id}><td><b style={{ color: 'var(--accent-gold)' }}>{t.patente}</b></td><td>{t.nombre}</td><td>{t.servicio}</td><td>${t.precio}</td><td><select value={t.estado} onChange={e=>handleCambiarEstado(t.id, e.target.value)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '6px', padding: '4px' }}><option>En espera</option><option>En proceso</option><option>Listo</option><option>Entregado</option></select></td><td><a href={`https://wa.me/54${t.telefono.replace(/[^0-9]/g, '')}`} target="_blank" className="btn-dark" style={{ padding: '4px 8px' }}>WA</a></td></tr>)}</tbody></table>
          </div>
        )}
        {activeTab === 'clientes' && (<div className="glass-panel" style={{ padding: '12px', overflowX: 'auto' }}><table className="admin-table" style={{ minWidth: '500px' }}><thead><tr><th>Patente</th><th>Cliente</th><th>Lavados</th><th>Gasto</th><th></th></tr></thead><tbody>{paginatedClientes.map(c=><tr key={c.id}><td><b>{c.patentePrincipal}</b></td><td>{c.nombre}</td><td>{c.totalLavados}</td><td>${c.gastoTotal.toLocaleString()}</td><td><button onClick={()=>handleEliminarCliente(c.id)} className="btn-dark" style={{ padding: '4px 8px', color: '#ef4444' }}><Trash2 size={12} /></button></td></tr>)}</tbody></table></div>)}
        {activeTab === 'vehiculos' && (<div className="glass-panel" style={{ padding: '12px' }}><p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{vehiculos.length} vehículos registrados en Supabase</p><div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>{vehiculos.map(v=><div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-card)', borderRadius: '8px' }}><b>{v.patente}</b><span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{v.clienteId}</span></div>)}</div></div>)}
        {activeTab === 'caja' && (<div className="glass-panel" style={{ padding: '16px' }}><h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '12px' }}>Caja Hoy: ${totalCajaHoy.toLocaleString()}</h3>{caja.filter(c=>c.fecha===hoyStr).map(c=><div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}><span>{c.patente} - {c.servicio}</span><b style={{ color: '#22c55e' }}>${c.monto.toLocaleString()}</b></div>)}</div>)}
      </main>

      {showModalNuevoTurno && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}><div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '20px', borderRadius: '16px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><h3 style={{ fontWeight: 900 }}>Nueva Orden</h3><button onClick={()=>setShowModalNuevoTurno(false)}><X size={18} /></button></div><form onSubmit={handleCrearTurno} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}><input required placeholder="Patente" value={nuevoPatente} onChange={e=>setNuevoPatente(e.target.value.toUpperCase())} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} /><input required placeholder="Nombre" value={nuevoNombre} onChange={e=>setNuevoNombre(e.target.value)} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} /><input placeholder="Tel" value={nuevoTelefono} onChange={e=>setNuevoTelefono(e.target.value)} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} /><button type="submit" className="btn-gold" style={{ padding: '10px' }}>Guardar en Supabase</button></form></div></div>)}
    </div>
  )
}
