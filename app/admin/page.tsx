'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Car,
  Users,
  Calendar,
  DollarSign,
  Search,
  Plus,
  MessageCircle,
  Trash2,
  RefreshCw,
  Home,
  ChevronLeft,
  ChevronRight,
  Eye,
  X
} from 'lucide-react'
import {
  getClientes,
  getVehiculos,
  getTurnos,
  getCaja,
  saveCliente,
  deleteCliente,
  saveTurno,
  updateEstadoTurno,
  seedDatabase,
  Cliente,
  Vehiculo,
  Turno,
  CajaItem
} from '@/lib/db'

const ESTADOS_LIST: Array<Turno['estado']> = ['En espera', 'En proceso', 'Listo', 'Entregado']

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'kanban' | 'turnos' | 'clientes' | 'vehiculos' | 'caja'>('kanban')

  // State
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [caja, setCaja] = useState<CajaItem[]>([])

  // Search & Pagination States
  const [searchClientes, setSearchClientes] = useState('')
  const [pageCliente, setPageCliente] = useState(1)
  const itemsPerPage = 15

  const [searchTurnos, setSearchTurnos] = useState('')
  const [filterEstadoTurno, setFilterEstadoTurno] = useState<string>('Todos')

  // Modals
  const [showModalNuevoTurno, setShowModalNuevoTurno] = useState(false)
  const [showModalNuevoCliente, setShowModalNuevoCliente] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)

  // Form states
  const [nuevoPatente, setNuevoPatente] = useState('')
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoTelefono, setNuevoTelefono] = useState('')
  const [nuevoServicio, setNuevoServicio] = useState('Carrocería + Interior')
  const [nuevoPrecio, setNuevoPrecio] = useState('12000')

  // Client form
  const [cliNombre, setCliNombre] = useState('')
  const [cliTel, setCliTel] = useState('')
  const [cliEmail, setCliEmail] = useState('')
  const [cliPatente, setCliPatente] = useState('')
  const [cliNotas, setCliNotas] = useState('')

  const loadData = () => {
    setClientes(getClientes())
    setVehiculos(getVehiculos())
    setTurnos(getTurnos())
    setCaja(getCaja())
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSeed = () => {
    if (confirm('¿Cargar base de datos con 200+ clientes y turnos de demostración?')) {
      seedDatabase(true)
      loadData()
    }
  }

  const handleCambiarEstado = (id: string, nuevoEstadoStr: string) => {
    updateEstadoTurno(id, nuevoEstadoStr as Turno['estado'])
    loadData()
  }

  const handleCrearTurno = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoPatente || !nuevoNombre) return alert('Completa los campos obligatorios')

    saveTurno({
      nombre: nuevoNombre,
      patente: nuevoPatente.toUpperCase().trim(),
      telefono: nuevoTelefono || '3865000000',
      servicio: nuevoServicio,
      precio: parseInt(nuevoPrecio) || 12000,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estado: 'En espera'
    })

    setShowModalNuevoTurno(false)
    setNuevoPatente('')
    setNuevoNombre('')
    setNuevoTelefono('')
    loadData()
  }

  const handleCrearCliente = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cliNombre || !cliPatente) return alert('Nombre y Patente obligatorios')

    saveCliente({
      nombre: cliNombre,
      telefono: cliTel,
      email: cliEmail,
      patentePrincipal: cliPatente.toUpperCase().trim(),
      fechaAlta: new Date().toISOString().split('T')[0],
      notas: cliNotas,
      totalLavados: 0,
      gastoTotal: 0
    })

    setShowModalNuevoCliente(false)
    setCliNombre('')
    setCliTel('')
    setCliEmail('')
    setCliPatente('')
    setCliNotas('')
    loadData()
  }

  const handleEliminarCliente = (id: string) => {
    if (confirm('¿Eliminar este cliente y sus vehículos asociados?')) {
      deleteCliente(id)
      loadData()
    }
  }

  const filteredClientes = useMemo(() => {
    return clientes.filter(c => {
      const q = searchClientes.toLowerCase()
      return (
        c.nombre.toLowerCase().includes(q) ||
        c.telefono.includes(q) ||
        c.patentePrincipal.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
    })
  }, [clientes, searchClientes])

  const totalPagesCliente = Math.ceil(filteredClientes.length / itemsPerPage) || 1
  const paginatedClientes = useMemo(() => {
    const start = (pageCliente - 1) * itemsPerPage
    return filteredClientes.slice(start, start + itemsPerPage)
  }, [filteredClientes, pageCliente])

  const filteredTurnos = useMemo(() => {
    return turnos.filter(t => {
      const q = searchTurnos.toLowerCase()
      const matchQuery = t.nombre.toLowerCase().includes(q) || t.patente.toLowerCase().includes(q)
      const matchEstado = filterEstadoTurno === 'Todos' || t.estado === filterEstadoTurno
      return matchQuery && matchEstado
    })
  }, [turnos, searchTurnos, filterEstadoTurno])

  const hoyStr = new Date().toISOString().split('T')[0]
  const turnosHoy = turnos.filter(t => t.fecha === hoyStr)
  const lavadosEnProceso = turnos.filter(t => t.estado === 'En proceso' || t.estado === 'En espera')
  const totalCajaHoy = caja.filter(c => c.fecha === hoyStr).reduce((acc, curr) => acc + curr.monto, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', paddingBottom: '60px' }}>
      {/* Top Navbar */}
      <header style={{
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #d4a356, #b88536)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Car size={22} color="#000" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 900 }}>ADMINISTRACIÓN | EL PORTUGUÉS</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gestión de lavadero, turnos y 200+ clientes</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={handleSeed} className="btn-dark" style={{ fontSize: '13px', padding: '8px 14px' }}>
            <RefreshCw size={15} /> Recargar 200+ Clientes Demo
          </button>
          <button onClick={() => setShowModalNuevoTurno(true)} className="btn-gold" style={{ fontSize: '13px', padding: '8px 14px' }}>
            <Plus size={16} /> Nueva Orden / Turno
          </button>
          <Link href="/" className="btn-dark" style={{ fontSize: '13px', padding: '8px 14px' }}>
            <Home size={15} /> Ir a la Landing
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '32px auto', padding: '0 24px' }}>
        
        {/* DASHBOARD SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Clientes</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(212, 163, 86, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color="var(--accent-gold)" />
              </div>
            </div>
            <span style={{ fontSize: '32px', fontWeight: 900, color: '#fff' }}>{clientes.length}</span>
            <p style={{ fontSize: '12px', color: 'var(--accent-green)', marginTop: '4px' }}>✓ Soporta 200+ en localStorage</p>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Autos en Lavadero</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Car size={20} color="#60a5fa" />
              </div>
            </div>
            <span style={{ fontSize: '32px', fontWeight: 900, color: '#fff' }}>{lavadosEnProceso.length}</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{turnos.filter(t => t.estado === 'En proceso').length} en proceso activo</p>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Turnos Para Hoy</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} color="#facc15" />
              </div>
            </div>
            <span style={{ fontSize: '32px', fontWeight: 900, color: '#fff' }}>{turnosHoy.length}</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Reservados por clientes</p>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Caja Recaudada Hoy</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={20} color="#4ade80" />
              </div>
            </div>
            <span style={{ fontSize: '32px', fontWeight: 900, color: 'var(--accent-gold)' }}>
              ${totalCajaHoy.toLocaleString()}
            </span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{caja.filter(c => c.fecha === hoyStr).length} ventas cerradas</p>
          </div>

        </div>

        {/* NAVIGATION TABS */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('kanban')}
            style={{
              padding: '12px 20px',
              background: activeTab === 'kanban' ? 'var(--bg-card)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'kanban' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              color: activeTab === 'kanban' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Tablero Kanban (Lavados en Vivo)
          </button>
          
          <button
            onClick={() => setActiveTab('turnos')}
            style={{
              padding: '12px 20px',
              background: activeTab === 'turnos' ? 'var(--bg-card)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'turnos' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              color: activeTab === 'turnos' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Reservas & Turnos ({turnos.length})
          </button>

          <button
            onClick={() => setActiveTab('clientes')}
            style={{
              padding: '12px 20px',
              background: activeTab === 'clientes' ? 'var(--bg-card)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'clientes' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              color: activeTab === 'clientes' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Clientes ({clientes.length})
          </button>

          <button
            onClick={() => setActiveTab('vehiculos')}
            style={{
              padding: '12px 20px',
              background: activeTab === 'vehiculos' ? 'var(--bg-card)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'vehiculos' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              color: activeTab === 'vehiculos' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Vehículos ({vehiculos.length})
          </button>

          <button
            onClick={() => setActiveTab('caja')}
            style={{
              padding: '12px 20px',
              background: activeTab === 'caja' ? 'var(--bg-card)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'caja' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              color: activeTab === 'caja' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Caja & Reportes
          </button>
        </div>

        {/* TAB 1: TABLERO KANBAN */}
        {activeTab === 'kanban' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {ESTADOS_LIST.map(est => {
              const colTurnos = turnos.filter(t => t.estado === est)
              return (
                <div key={est} className="glass-panel" style={{ padding: '16px', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800 }}>{est}</h3>
                    <span className={
                      est === 'En espera' ? 'badge badge-espera' :
                      est === 'En proceso' ? 'badge badge-proceso' :
                      est === 'Listo' ? 'badge badge-listo' : 'badge badge-entregado'
                    }>
                      {colTurnos.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    {colTurnos.map(t => (
                      <div key={t.id} className="glass-card" style={{ padding: '14px', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--accent-gold)' }}>{t.patente}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.hora}</span>
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{t.nombre}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 10px' }}>{t.servicio}</p>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '10px' }}>${t.precio.toLocaleString()}</div>

                        <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                          {est === 'En espera' && (
                            <button onClick={() => handleCambiarEstado(t.id, 'En proceso')} className="btn-dark" style={{ flex: 1, padding: '6px', fontSize: '11px' }}>
                              Iniciar Lavado
                            </button>
                          )}
                          {est === 'En proceso' && (
                            <button onClick={() => handleCambiarEstado(t.id, 'Listo')} className="btn-gold" style={{ flex: 1, padding: '6px', fontSize: '11px' }}>
                              Marcar Listo
                            </button>
                          )}
                          {est === 'Listo' && (
                            <button onClick={() => handleCambiarEstado(t.id, 'Entregado')} className="btn-gold" style={{ flex: 1, padding: '6px', fontSize: '11px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff' }}>
                              Entregar & Cobrar
                            </button>
                          )}
                          <a
                            href={`https://wa.me/54${t.telefono.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(t.nombre)},%20tu%20vehículo%20${t.patente}%20está%20${encodeURIComponent(est)}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-dark"
                            style={{ padding: '6px 8px' }}
                            title="Enviar WhatsApp al cliente"
                          >
                            <MessageCircle size={14} color="var(--accent-green)" />
                          </a>
                        </div>
                      </div>
                    ))}

                    {colTurnos.length === 0 && (
                      <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                        Sin vehículos en {est.toLowerCase()}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* TAB 2: GESTION DE TURNOS & RESERVAS */}
        {activeTab === 'turnos' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Buscar por cliente o patente..."
                    value={searchTurnos}
                    onChange={e => setSearchTurnos(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 10px 10px 38px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <select
                  value={filterEstadoTurno}
                  onChange={e => setFilterEstadoTurno(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                >
                  <option value="Todos">Todos los Estados</option>
                  <option value="En espera">En espera</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Listo">Listo</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </div>

              <button onClick={() => setShowModalNuevoTurno(true)} className="btn-gold">
                <Plus size={16} /> Agregar Turno Directo
              </button>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Patente</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Servicio</th>
                  <th>Fecha / Hora</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTurnos.map(t => (
                  <tr key={t.id}>
                    <td><b style={{ color: 'var(--accent-gold)' }}>{t.patente}</b></td>
                    <td>{t.nombre}</td>
                    <td>{t.telefono}</td>
                    <td>{t.servicio}</td>
                    <td>{t.fecha} {t.hora}</td>
                    <td><b>${t.precio.toLocaleString()}</b></td>
                    <td>
                      <select
                        value={t.estado}
                        onChange={e => handleCambiarEstado(t.id, e.target.value)}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid var(--border-color)',
                          color: '#fff',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '12px'
                        }}
                      >
                        <option value="En espera">En espera</option>
                        <option value="En proceso">En proceso</option>
                        <option value="Listo">Listo</option>
                        <option value="Entregado">Entregado</option>
                      </select>
                    </td>
                    <td>
                      <a
                        href={`https://wa.me/54${t.telefono.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(t.nombre)},%20te%20contactamos%20desde%20Lavadero%20El%20Portugués`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-dark"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        <MessageCircle size={14} color="var(--accent-green)" /> WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: BASE DE DATOS DE CLIENTES (200+ CLIENTES) */}
        {activeTab === 'clientes' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar entre 200+ clientes por Nombre, Teléfono o Patente..."
                  value={searchClientes}
                  onChange={e => { setSearchClientes(e.target.value); setPageCliente(1) }}
                  style={{
                    width: '100%',
                    padding: '10px 10px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowModalNuevoCliente(true)} className="btn-gold">
                  <Plus size={16} /> Nuevo Cliente
                </button>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Mostrando {paginatedClientes.length} de {filteredClientes.length} clientes encontrados
            </p>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Patente Principal</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Lavados Realizados</th>
                  <th>Gasto Acumulado</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClientes.map(cli => (
                  <tr key={cli.id}>
                    <td><b>{cli.nombre}</b></td>
                    <td><span className="badge badge-gold">{cli.patentePrincipal}</span></td>
                    <td>{cli.telefono}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{cli.email}</td>
                    <td style={{ textAlign: 'center' }}><b>{cli.totalLavados}</b></td>
                    <td style={{ color: 'var(--accent-gold)' }}><b>${cli.gastoTotal.toLocaleString()}</b></td>
                    <td>{cli.fechaAlta}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setClienteSeleccionado(cli)} className="btn-dark" style={{ padding: '6px 10px', fontSize: '12px' }}>
                          <Eye size={14} /> Detalle
                        </button>
                        <button onClick={() => handleEliminarCliente(cli.id)} className="btn-dark" style={{ padding: '6px 10px', fontSize: '12px', color: '#ef4444' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Página {pageCliente} de {totalPagesCliente}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={pageCliente === 1}
                  onClick={() => setPageCliente(p => Math.max(1, p - 1))}
                  className="btn-dark"
                  style={{ padding: '8px 16px', opacity: pageCliente === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <button
                  disabled={pageCliente >= totalPagesCliente}
                  onClick={() => setPageCliente(p => Math.min(totalPagesCliente, p + 1))}
                  className="btn-dark"
                  style={{ padding: '8px 16px', opacity: pageCliente >= totalPagesCliente ? 0.5 : 1 }}
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VEHICULOS */}
        {activeTab === 'vehiculos' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Directorio de Vehículos Registrados</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Patente</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Tipo</th>
                  <th>Color</th>
                  <th>ID Cliente</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.map(v => (
                  <tr key={v.id}>
                    <td><b style={{ color: 'var(--accent-gold)' }}>{v.patente}</b></td>
                    <td>{v.marca}</td>
                    <td>{v.modelo}</td>
                    <td><span className="badge badge-gold">{v.tipo}</span></td>
                    <td>{v.color}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{v.clienteId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: CAJA Y REPORTES */}
        {activeTab === 'caja' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '20px' }}>Historial de Movimientos de Caja</h3>
            
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Patente</th>
                  <th>Servicio</th>
                  <th>Medio de Pago</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {caja.map(c => (
                  <tr key={c.id}>
                    <td>{c.fecha}</td>
                    <td><b style={{ color: 'var(--accent-gold)' }}>{c.patente}</b></td>
                    <td>{c.servicio}</td>
                    <td><span className="badge badge-gold">{c.medioPago}</span></td>
                    <td style={{ color: '#4ade80', fontWeight: 900 }}>+${c.monto.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* MODAL NUEVO TURNO */}
      {showModalNuevoTurno && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '28px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 900 }}>Crear Nueva Orden de Lavado</h3>
              <button onClick={() => setShowModalNuevoTurno(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCrearTurno} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Patente *</label>
                <input required placeholder="Ej. AB123CD" value={nuevoPatente} onChange={e => setNuevoPatente(e.target.value.toUpperCase())} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Nombre del Cliente *</label>
                <input required placeholder="Ej. Carlos Rodríguez" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Teléfono</label>
                <input placeholder="Ej. 3865123456" value={nuevoTelefono} onChange={e => setNuevoTelefono(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Servicio</label>
                <select value={nuevoServicio} onChange={e => setNuevoServicio(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }}>
                  <option value="Carrocería + Interior">Carrocería + Interior ($12.000)</option>
                  <option value="Lavado Completo con Motor">Lavado Completo con Motor ($15.000)</option>
                  <option value="Encerado & Abrillantado">Encerado & Abrillantado ($18.000)</option>
                  <option value="Tratamiento Cerámico">Tratamiento Cerámico ($45.000)</option>
                  <option value="Descontaminación + Tapizados">Descontaminación + Tapizados ($28.000)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Monto a Cobrar ($)</label>
                <input type="number" value={nuevoPrecio} onChange={e => setNuevoPrecio(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>

              <button type="submit" className="btn-gold" style={{ marginTop: '10px', padding: '12px' }}>
                Guardar Orden en Kanban
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVO CLIENTE */}
      {showModalNuevoCliente && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '28px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 900 }}>Agregar Nuevo Cliente</h3>
              <button onClick={() => setShowModalNuevoCliente(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCrearCliente} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Nombre y Apellido *</label>
                <input required placeholder="Ej. Ana María Sosa" value={cliNombre} onChange={e => setCliNombre(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Patente Principal *</label>
                <input required placeholder="Ej. AA123CD" value={cliPatente} onChange={e => setCliPatente(e.target.value.toUpperCase())} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Teléfono</label>
                <input placeholder="Ej. 3865444555" value={cliTel} onChange={e => setCliTel(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Email</label>
                <input type="email" placeholder="cliente@gmail.com" value={cliEmail} onChange={e => setCliEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>

              <button type="submit" className="btn-gold" style={{ marginTop: '10px', padding: '12px' }}>
                Guardar Cliente
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLE CLIENTE */}
      {clienteSeleccionado && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '550px', padding: '28px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 900 }}>Ficha de Cliente: {clienteSeleccionado.nombre}</h3>
              <button onClick={() => setClienteSeleccionado(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px', background: 'var(--bg-main)', padding: '16px', borderRadius: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Teléfono</span>
                <p style={{ fontSize: '14px', fontWeight: 700 }}>{clienteSeleccionado.telefono}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email</span>
                <p style={{ fontSize: '14px', fontWeight: 700 }}>{clienteSeleccionado.email}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Patente Registrada</span>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-gold)' }}>{clienteSeleccionado.patentePrincipal}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Lavados / Gasto</span>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#4ade80' }}>{clienteSeleccionado.totalLavados} lavados (${clienteSeleccionado.gastoTotal.toLocaleString()})</p>
              </div>
            </div>

            {clienteSeleccionado.notas && (
              <div style={{ padding: '12px', background: 'rgba(212, 163, 86, 0.1)', border: '1px solid var(--accent-gold-glow)', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
                <b>Notas especiales:</b> {clienteSeleccionado.notas}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <a
                href={`https://wa.me/54${clienteSeleccionado.telefono.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(clienteSeleccionado.nombre)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <MessageCircle size={16} /> Contactar por WhatsApp
              </a>
              <button onClick={() => setClienteSeleccionado(null)} className="btn-dark">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
