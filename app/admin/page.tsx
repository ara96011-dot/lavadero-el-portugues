'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Car, Users, Calendar, DollarSign, Search, Plus, MessageCircle, RefreshCw, Home, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react'
import { getClientes, getVehiculos, getTurnos, getCaja, saveCliente, saveTurno, updateEstadoTurno, seedDatabase, Cliente, Vehiculo, Turno, CajaItem } from '@/lib/db'

const ESTADOS_LIST: Array<Turno['estado']> = ['En espera', 'En proceso', 'Listo', 'Entregado']
const PIN = "1987"

export default function AdminDashboard() {
  const [auth,setAuth]=useState(false)
  const [pin,setPin]=useState('')
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

  const loadData = () => { setClientes(getClientes()); setVehiculos(getVehiculos()); setTurnos(getTurnos()); setCaja(getCaja()) }
  useEffect(() => { loadData() }, [])
  const handleSeed = () => { if (confirm('¿Cargar 200+ clientes demo?')) { seedDatabase(true); loadData() } }
  const handleCambiarEstado = (id: string, nuevoEstadoStr: string) => { updateEstadoTurno(id, nuevoEstadoStr as Turno['estado']); loadData() }

  const login=(e:any)=>{e.preventDefault(); if(pin===PIN) setAuth(true); else {alert('PIN incorrecto'); setPin('')}}

  // PIN OCULTO - SIN QUE SE VEA 1987
  if(!auth) return (
    <div style={{minHeight:'100vh', background:'var(--bg-main)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
      <form onSubmit={login} className="glass-panel" style={{padding:'32px 24px', width:'100%', maxWidth:'360px', textAlign:'center'}}>
        <div style={{width:'56px', height:'56px', background:'var(--accent-gold)', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:'24px'}}>🔒</div>
        <h2 style={{fontFamily:'Outfit', fontWeight:800}}>Acceso privado</h2>
        <p style={{color:'var(--text-muted)', fontSize:'13px', margin:'8px 0 20px'}}>PIN del lavadero</p>
        <input autoFocus type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="••••" style={{width:'100%', padding:'16px', borderRadius:'12px', background:'#0f172a', border:'1px solid var(--border-color)', color:'#fff', textAlign:'center', fontSize:'22px', letterSpacing:'8px'}}/>
        <button className="btn-gold" style={{width:'100%', marginTop:'16px', padding:'14px'}}>Entrar</button>
      </form>
    </div>
  )

  const filteredClientes = useMemo(() => { return clientes.filter(c => { const q = searchClientes.toLowerCase(); return c.nombre.toLowerCase().includes(q) || c.telefono.includes(q) || c.patentePrincipal.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) }) }, [clientes, searchClientes])
  const totalPagesCliente = Math.ceil(filteredClientes.length / itemsPerPage) || 1
  const paginatedClientes = useMemo(() => { const start = (pageCliente - 1) * itemsPerPage; return filteredClientes.slice(start, start + itemsPerPage) }, [filteredClientes, pageCliente])
  const filteredTurnos = useMemo(() => { return turnos.filter(t => { const q = searchTurnos.toLowerCase(); const matchQuery = t.nombre.toLowerCase().includes(q) || t.patente.toLowerCase().includes(q); const matchEstado = filterEstadoTurno === 'Todos' || t.estado === filterEstadoTurno; return matchQuery && matchEstado }) }, [turnos, searchTurnos, filterEstadoTurno])
  const hoyStr = new Date().toISOString().split('T')[0]
  const turnosHoy = turnos.filter(t => t.fecha === hoyStr)
  const lavadosEnProceso = turnos.filter(t => t.estado === 'En proceso' || t.estado === 'En espera')
  const totalCajaHoy = caja.filter(c => c.fecha === hoyStr).reduce((acc, curr) => acc + curr.monto, 0)

  const handleCrearTurno = (e: React.FormEvent) => { e.preventDefault(); if (!nuevoPatente ||!nuevoNombre) return alert('Completa campos'); saveTurno({ nombre: nuevoNombre, patente: nuevoPatente.toUpperCase().trim(), telefono: nuevoTelefono || '3865000000', servicio: nuevoServicio, precio: parseInt(nuevoPrecio) || 12000, fecha: new Date().toISOString().split('T')[0], hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), estado: 'En espera' }); setShowModalNuevoTurno(false); setNuevoPatente(''); setNuevoNombre(''); setNuevoTelefono(''); loadData() }
  const handleCrearCliente = (e: React.FormEvent) => { e.preventDefault(); if (!cliNombre ||!cliPatente) return alert('Nombre y Patente obligatorios'); saveCliente({ nombre: cliNombre, telefono: cliTel, email: cliEmail, patentePrincipal: cliPatente.toUpperCase().trim(), fechaAlta: new Date().toISOString().split('T')[0], notas: cliNotas, totalLavados: 0, gastoTotal: 0 }); setShowModalNuevoCliente(false); setCliNombre(''); setCliTel(''); setCliEmail(''); setCliPatente(''); setCliNotas(''); loadData() }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', paddingBottom:'60px'}}>
      {/* HEADER SIN NAVBAR PESADO - COMO TE GUSTA */}
      <header style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-color)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position:'sticky', top:0, zIndex:100}}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #d4a356, #b88536)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Car size={22} color="#000" /></div>
          <h1 style={{ fontSize: '18px', fontWeight: 900 }}>Lavadero El Portugués</h1>
        </div>
        <div style={{ display: 'flex', gap:'8px'}}>
          <button onClick={handleSeed} className="btn-dark" style={{fontSize:'12px', padding:'8px 12px'}}><RefreshCw size={14}/> Demo</button>
          <button onClick={() => setShowModalNuevoTurno(true)} className="btn-gold" style={{fontSize:'12px', padding:'8px 12px'}}><Plus size={14}/> Nueva Orden</button>
          <Link href="/" className="btn-dark" style={{fontSize:'12px', padding:'8px 12px'}}><Home size={14}/></Link>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '24px auto', padding: '0 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="glass-card" style={{ padding: '16px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight:700}}>Total Clientes</span><Users size={18} color="var(--accent-gold)" /></div><span style={{ fontSize: '28px', fontWeight: 900 }}>{clientes.length}</span><p style={{ fontSize: '11px', color: 'var(--accent-green)' }}>✓ Local</p></div>
          <div className="glass-card" style={{ padding: '16px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight:700}}>Autos en Lavadero</span><Car size={18} color="#60a5fa" /></div><span style={{ fontSize: '28px', fontWeight: 900 }}>{lavadosEnProceso.length}</span><p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{turnos.filter(t=>t.estado==='En proceso').length} en proceso</p></div>
          <div className="glass-card" style={{ padding: '16px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight:700}}>Turnos Hoy</span><Calendar size={18} color="#facc15" /></div><span style={{ fontSize: '28px', fontWeight: 900 }}>{turnosHoy.length}</span></div>
          <div className="glass-card" style={{ padding: '16px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight:700}}>Caja Hoy</span><DollarSign size={18} color="#4ade80" /></div><span style={{ fontSize: '28px', fontWeight: 900, color:'var(--accent-gold)' }}>${totalCajaHoy.toLocaleString()}</span></div>
        </div>

        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', overflowX:'auto' }}>
          <button onClick={() => setActiveTab('kanban')} style={{ padding: '12px 16px', background: activeTab === 'kanban'? 'var(--bg-card)' : 'transparent', border:'none', borderBottom: activeTab==='kanban'?'2px solid var(--accent-gold)':'2px solid transparent', color: activeTab==='kanban'?'var(--accent-gold)':'var(--text-secondary)', fontWeight:800, fontSize:'13px'}}>Kanban (Vivo)</button>
          <button onClick={() => setActiveTab('turnos')} style={{ padding: '12px 16px', background: activeTab === 'turnos'? 'var(--bg-card)' : 'transparent', border:'none', borderBottom: activeTab==='turnos'?'2px solid var(--accent-gold)':'2px solid transparent', color: activeTab==='turnos'?'var(--accent-gold)':'var(--text-secondary)', fontWeight:800, fontSize:'13px'}}>Reservas ({turnos.length})</button>
          <button onClick={() => setActiveTab('clientes')} style={{ padding: '12px 16px', background: activeTab === 'clientes'? 'var(--bg-card)' : 'transparent', border:'none', borderBottom: activeTab==='clientes'?'2px solid var(--accent-gold)':'2px solid transparent', color: activeTab==='clientes'?'var(--accent-gold)':'var(--text-secondary)', fontWeight:800, fontSize:'13px'}}>Clientes ({clientes.length})</button>
          <button onClick={() => setActiveTab('vehiculos')} style={{ padding: '12px 16px', background: activeTab === 'vehiculos'? 'var(--bg-card)' : 'transparent', border:'none', borderBottom: activeTab==='vehiculos'?'2px solid var(--accent-gold)':'2px solid transparent', color: activeTab==='vehiculos'?'var(--accent-gold)':'var(--text-secondary)', fontWeight:800, fontSize:'13px'}}>Vehículos ({vehiculos.length})</button>
          <button onClick={() => setActiveTab('caja')} style={{ padding: '12px 16px', background: activeTab === 'caja'? 'var(--bg-card)' : 'transparent', border:'none', borderBottom: activeTab==='caja'?'2px solid var(--accent-gold)':'2px solid transparent', color: activeTab==='caja'?'var(--accent-gold)':'var(--text-secondary)', fontWeight:800, fontSize:'13px'}}>Caja</button>
        </div>

        {activeTab === 'kanban' && (
          <div style={{ display: 'flex', gap: '16px', overflowX:'auto', paddingBottom:'20px'}}>
            {ESTADOS_LIST.map(est => {
              const colTurnos = turnos.filter(t => t.estado === est)
              return (
                <div key={est} className="glass-panel" style={{ minWidth:'300px', width:'300px', padding: '14px', minHeight: '500px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom:'10px', borderBottom:'1px solid var(--border-color)'}}><h3 style={{ fontSize: '14px', fontWeight: 800 }}>{est}</h3><span className={est === 'En espera'? 'badge badge-espera' : est === 'En proceso'? 'badge badge-proceso' : est === 'Listo'? 'badge badge-listo' : 'badge badge-entregado'}>{colTurnos.length}</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {colTurnos.map(t => (
                      <div key={t.id} className="glass-card" style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--accent-gold)' }}>{t.patente}</span><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.hora}</span></div>
                        <p style={{ fontSize: '13px', fontWeight: 700 }}>{t.nombre}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin:'4px 0 8px'}}>{t.servicio}</p>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '8px' }}>${t.precio.toLocaleString()}</div>
                        {/* SIN X ROJA - SOLO BOTONES DE MOVER ESTADO Y WA */}
                        <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                          {est === 'En espera' && <button onClick={() => handleCambiarEstado(t.id, 'En proceso')} className="btn-dark" style={{ flex: 1, padding: '6px', fontSize: '11px' }}>Iniciar</button>}
                          {est === 'En proceso' && <button onClick={() => handleCambiarEstado(t.id, 'Listo')} className="btn-gold" style={{ flex: 1, padding: '6px', fontSize: '11px' }}>Listo</button>}
                          {est === 'Listo' && <button onClick={() => handleCambiarEstado(t.id, 'Entregado')} className="btn-gold" style={{ flex: 1, padding: '6px', fontSize: '11px', background:'linear-gradient(135deg, #22c55e, #16a34a)', color:'#fff'}}>Entregar</button>}
                          <a href={`https://wa.me/54${t.telefono.replace(/[^0-9]/g, '')}`} target="_blank" className="btn-dark" style={{ padding: '6px 8px' }}><MessageCircle size={14} color="var(--accent-green)" /></a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'turnos' && (
          <div className="glass-panel" style={{ padding: '16px', overflowX:'auto'}}>
            <div style={{display:'flex', gap:'12px', marginBottom:'16px'}}><div style={{position:'relative', flex:1}}><Search size={16} style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)'}}/><input placeholder="Buscar patente o cliente" value={searchTurnos} onChange={e=>setSearchTurnos(e.target.value)} style={{width:'100%', padding:'10px 10px 10px 34px', borderRadius:'8px', background:'var(--bg-main)', border:'1px solid var(--border-color)', color:'#fff'}}/></div><select value={filterEstadoTurno} onChange={e=>setFilterEstadoTurno(e.target.value)} style={{padding:'10px', borderRadius:'8px', background:'var(--bg-main)', border:'1px solid var(--border-color)', color:'#fff'}}><option value="Todos">Todos</option><option value="En espera">En espera</option><option value="En proceso">En proceso</option><option value="Listo">Listo</option><option value="Entregado">Entregado</option></select></div>
            <table className="admin-table"><thead><tr><th>Patente</th><th>Cliente</th><th>Servicio</th><th>Fecha</th><th>Estado</th><th>WA</th></tr></thead><tbody>{filteredTurnos.map(t=><tr key={t.id}><td><b style={{color:'var(--accent-gold)'}}>{t.patente}</b></td><td>{t.nombre}</td><td>{t.servicio}</td><td>{t.fecha} {t.hora}</td><td><select value={t.estado} onChange={e=>handleCambiarEstado(t.id, e.target.value)} style={{background:'rgba(255,255,255,0.08)', border:'1px solid var(--border-color)', color:'#fff', borderRadius:'6px', padding:'4px 8px', fontSize:'12px'}}><option value="En espera">En espera</option><option value="En proceso">En proceso</option><option value="Listo">Listo</option><option value="Entregado">Entregado</option></select></td><td><a href={`https://wa.me/54${t.telefono.replace(/[^0-9]/g,'')}`} target="_blank" className="btn-dark" style={{padding:'6px'}}><MessageCircle size={14} color="#22c55e"/></a></td></tr>)}</tbody></table>
          </div>
        )}

        {activeTab === 'clientes' && (
          <div className="glass-panel" style={{ padding: '16px', overflowX:'auto'}}>
            <div style={{display:'flex', gap:'12px', marginBottom:'16px'}}><div style={{position:'relative', flex:1}}><Search size={16} style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)'}}/><input placeholder="Buscar cliente" value={searchClientes} onChange={e=>{setSearchClientes(e.target.value); setPageCliente(1)}} style={{width:'100%', padding:'10px 10px 10px 34px', borderRadius:'8px', background:'var(--bg-main)', border:'1px solid var(--border-color)', color:'#fff'}}/></div><button onClick={()=>setShowModalNuevoCliente(true)} className="btn-gold"><Plus size={14}/> Nuevo</button></div>
            <table className="admin-table"><thead><tr><th>Cliente</th><th>Patente</th><th>Tel</th><th>Lavados</th><th>Gasto</th><th>Acciones</th></tr></thead><tbody>{paginatedClientes.map(cli=><tr key={cli.id}><td><b>{cli.nombre}</b></td><td><span className="badge badge-gold">{cli.patentePrincipal}</span></td><td>{cli.telefono}</td><td style={{textAlign:'center'}}>{cli.totalLavados}</td><td style={{color:'var(--accent-gold)'}}>${cli.gastoTotal.toLocaleString()}</td><td><button onClick={()=>setClienteSeleccionado(cli)} className="btn-dark" style={{padding:'6px 10px', fontSize:'12px'}}><Eye size={14}/> Ver</button></td></tr>)}</tbody></table>
            <div style={{display:'flex', justifyContent:'space-between', marginTop:'16px'}}><span style={{fontSize:'12px', color:'var(--text-muted)'}}>Pág {pageCliente} de {totalPagesCliente}</span><div style={{display:'flex', gap:'8px'}}><button disabled={pageCliente===1} onClick={()=>setPageCliente(p=>Math.max(1,p-1))} className="btn-dark"><ChevronLeft size={14}/> Ant</button><button disabled={pageCliente>=totalPagesCliente} onClick={()=>setPageCliente(p=>Math.min(totalPagesCliente,p+1))} className="btn-dark">Sig <ChevronRight size={14}/></button></div></div>
          </div>
        )}

        {activeTab === 'vehiculos' && (<div className="glass-panel" style={{padding:'16px'}}><table className="admin-table"><thead><tr><th>Patente</th><th>Marca</th><th>Modelo</th><th>Color</th></tr></thead><tbody>{vehiculos.map(v=><tr key={v.id}><td><b style={{color:'var(--accent-gold)'}}>{v.patente}</b></td><td>{v.marca}</td><td>{v.modelo}</td><td>{v.color}</td></tr>)}</tbody></table></div>)}
        {activeTab === 'caja' && (<div className="glass-panel" style={{padding:'16px'}}><table className="admin-table"><thead><tr><th>Fecha</th><th>Patente</th><th>Servicio</th><th>Monto</th></tr></thead><tbody>{caja.map(c=><tr key={c.id}><td>{c.fecha}</td><td><b style={{color:'var(--accent-gold)'}}>{c.patente}</b></td><td>{c.servicio}</td><td style={{color:'#4ade80', fontWeight:900}}>+${c.monto.toLocaleString()}</td></tr>)}</tbody></table></div>)}

      </main>

      {showModalNuevoTurno && (<div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}><div className="glass-card" style={{width:'100%', maxWidth:'480px', padding:'20px', borderRadius:'16px'}}><div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px'}}><h3 style={{fontWeight:900}}>Nueva Orden</h3><button onClick={()=>setShowModalNuevoTurno(false)} style={{background:'none', border:'none', color:'#fff'}}><X size={20}/></button></div><form onSubmit={handleCrearTurno} style={{display:'flex', flexDirection:'column', gap:'10px'}}><input required placeholder="Patente" value={nuevoPatente} onChange={e=>setNuevoPatente(e.target.value.toUpperCase())} style={{padding:'10px', borderRadius:'8px', background:'var(--bg-main)', border:'1px solid var(--border-color)', color:'#fff'}}/><input required placeholder="Nombre cliente" value={nuevoNombre} onChange={e=>setNuevoNombre(e.target.value)} style={{padding:'10px', borderRadius:'8px', background:'var(--bg-main)', border:'1px solid var(--border-color)', color:'#fff'}}/><input placeholder="Tel" value={nuevoTelefono} onChange={e=>setNuevoTelefono(e.target.value)} style={{padding:'10px', borderRadius:'8px', background:'var(--bg-main)', border:'1px solid var(--border-color)', color:'#fff'}}/><select value={nuevoServicio} onChange={e=>setNuevoServicio(e.target.value)} style={{padding:'10px', borderRadius:'8px', background:'var(--bg-main)', border:'1px solid var(--border-color)', color:'#fff'}}><option>Carrocería + Interior</option><option>Lavado Completo con Motor</option><option>Encerado & Abrillantado</option><option>Tratamiento Cerámico</option><option>Descontaminación + Tapizados</option></select><input type="number" value={nuevoPrecio} onChange={e=>setNuevoPrecio(e.target.value)} style={{padding:'10px', borderRadius:'8px', background:'var(--bg-main)', border:'1px solid var(--border-color)', color:'#fff'}}/><button type="submit" className="btn-gold">Guardar</button></form></div></div>)}
      {showModalNuevoCliente && (<div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}><div className="glass-card" style={{width:'100%', maxWidth:'480px', padding:'20px', borderRadius:'16px'}}><div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px'}}><h3 style={{fontWeight:900}}>Nuevo Cliente</h3><button onClick={()=>setShowModalNuevoCliente(false)} style={{background:'none', border:'none', color:'#fff'}}><X size={20}/></button></div><form onSubmit={handleCrearCliente} style={{display:'flex', flexDirection:'column', gap:'10px'}}><input required placeholder="Nombre" value={cliNombre} onChange={e=>setCliNombre(e.target.value)} style={{padding:'10px', borderRadius:'8px', background:'var(--bg-main)', border:'1px solid var(--border-color)', color:'#fff'}}/><input required placeholder="Patente" value={cliPatente} onChange={e=>setCliPatente(e.target.value.toUpperCase())} style={{padding:'10px', borderRadius:'8px', background:'var(--bg-main)', border:'1px solid var(--border-color)', color:'#fff'}}/><input placeholder="Tel" value={cliTel} onChange={e=>setCliTel(e.target.value)} style={{padding:'10px', borderRadius:'8px', background:'var(--bg-main)', border:'1px solid var(--border-color)', color:'#fff'}}/><input placeholder="Email" value={cliEmail} onChange={e=>setCliEmail(e.target.value)} style={{padding:'10px', borderRadius:'8px', background:'var(--bg-main)', border:'1px solid var(--border-color)', color:'#fff'}}/><button type="submit" className="btn-gold">Guardar</button></form></div></div>)}
      {clienteSeleccionado && (<div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}><div className="glass-card" style={{width:'100%', maxWidth:'500px', padding:'20px', borderRadius:'16px'}}><div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px'}}><h3 style={{fontWeight:900}}>{clienteSeleccionado.nombre}</h3><button onClick={()=>setClienteSeleccionado(null)} style={{background:'none', border:'none', color:'#fff'}}><X size={20}/></button></div><p style={{fontSize:'13px', color:'var(--text-secondary)'}}>Tel: {clienteSeleccionado.telefono} | Patente: {clienteSeleccionado.patentePrincipal}</p><div style={{display:'flex', gap:'8px', marginTop:'16px'}}><a href={`https://wa.me/54${clienteSeleccionado.telefono.replace(/[^0-9]/g,'')}`} target="_blank" className="btn-gold" style={{flex:1, justifyContent:'center'}}><MessageCircle size={16}/> WhatsApp</a><button onClick={()=>setClienteSeleccionado(null)} className="btn-dark">Cerrar</button></div></div></div>)}
    </div>
  )
}
