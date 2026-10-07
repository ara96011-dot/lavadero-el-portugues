'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Car, Users, Calendar, DollarSign, Search, Plus, MessageCircle, RefreshCw, Home, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react'
import { getClientes, getVehiculos, getTurnos, getCaja, saveCliente, saveTurno, updateEstadoTurno, seedDatabase } from '@/lib/db'

const ESTADOS_LIST = ['En espera','En proceso','Listo','Entregado'] as const
const PIN = "1987"

export default function AdminDashboard() {
  const [auth,setAuth]=useState(false)
  const [pin,setPin]=useState('')
  const [activeTab,setActiveTab]=useState<'kanban'|'turnos'|'clientes'|'vehiculos'|'caja'>('kanban')
  const [clientes,setClientes]=useState<any[]>([])
  const [vehiculos,setVehiculos]=useState<any[]>([])
  const [turnos,setTurnos]=useState<any[]>([])
  const [caja,setCaja]=useState<any[]>([])
  const [searchClientes,setSearchClientes]=useState('')
  const [pageCliente,setPageCliente]=useState(1)
  const [searchTurnos,setSearchTurnos]=useState('')
  const [filterEstadoTurno,setFilterEstadoTurno]=useState('Todos')
  const [showModalNuevoTurno,setShowModalNuevoTurno]=useState(false)
  const [showModalNuevoCliente,setShowModalNuevoCliente]=useState(false)
  const [clienteSeleccionado,setClienteSeleccionado]=useState<any>(null)
  const [nuevoPatente,setNuevoPatente]=useState('')
  const [nuevoNombre,setNuevoNombre]=useState('')
  const [nuevoTelefono,setNuevoTelefono]=useState('')
  const [nuevoServicio,setNuevoServicio]=useState('Carrocería + Interior')
  const [nuevoPrecio,setNuevoPrecio]=useState('12000')
  const [cliNombre,setCliNombre]=useState('')
  const [cliTel,setCliTel]=useState('')
  const [cliEmail,setCliEmail]=useState('')
  const [cliPatente,setCliPatente]=useState('')

  const loadData = () => {
    try {
      setClientes(getClientes() || [])
      setVehiculos(getVehiculos() || [])
      setTurnos(getTurnos() || [])
      setCaja(getCaja() || [])
    } catch(e){ console.log(e) }
  }
  useEffect(()=>{ loadData() }, [])

  if(!auth){
    return (
      <div style={{minHeight:'100vh', background:'#0b0f17', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
        <form onSubmit={(e)=>{e.preventDefault(); if(pin===PIN) setAuth(true); else alert('PIN incorrecto')}} style={{background:'#131b29', border:'1px solid rgba(255,255,255,0.08)', padding:'32px', borderRadius:'20px', width:'100%', maxWidth:'340px', textAlign:'center'}}>
          <h2 style={{fontWeight:900, color:'#fff'}}>Acceso privado</h2>
          <p style={{color:'#94a3b8', fontSize:'13px', margin:'8px 0 20px'}}>PIN del lavadero</p>
          <input autoFocus type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="••••" style={{width:'100%', padding:'16px', borderRadius:'12px', background:'#0f172a', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', textAlign:'center', fontSize:'22px', letterSpacing:'8px'}}/>
          <button type="submit" style={{width:'100%', marginTop:'16px', padding:'14px', borderRadius:'12px', background:'#d4a356', border:'none', fontWeight:800}}>Entrar</button>
        </form>
      </div>
    )
  }

  const filteredClientes = useMemo(()=> clientes.filter((c:any)=> c.nombre.toLowerCase().includes(searchClientes.toLowerCase()) || c.patentePrincipal.toLowerCase().includes(searchClientes.toLowerCase()) ), [clientes,searchClientes])
  const paginatedClientes = useMemo(()=> { const start=(pageCliente-1)*15; return filteredClientes.slice(start,start+15)}, [filteredClientes,pageCliente])
  const totalPagesCliente = Math.ceil(filteredClientes.length/15) || 1
  const filteredTurnos = useMemo(()=> turnos.filter((t:any)=> (t.nombre.toLowerCase().includes(searchTurnos.toLowerCase()) || t.patente.toLowerCase().includes(searchTurnos.toLowerCase())) && (filterEstadoTurno==='Todos' || t.estado===filterEstadoTurno) ), [turnos,searchTurnos,filterEstadoTurno])
  const hoyStr = new Date().toISOString().split('T')[0]
  const totalCajaHoy = caja.filter((c:any)=>c.fecha===hoyStr).reduce((a:any,b:any)=>a+b.monto,0)

  const handleCambiarEstado = (id:string, est:string)=>{ updateEstadoTurno(id,est as any); loadData() }

  return (
    <div style={{minHeight:'100vh', background:'#0b0f17', color:'#fff'}}>
      <header style={{background:'#131b29', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'12px 20px', display:'flex', justifyContent:'space-between', position:'sticky', top:0, zIndex:50}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}><div style={{width:'36px', height:'36px', borderRadius:'10px', background:'#d4a356', display:'flex', alignItems:'center', justifyContent:'center'}}><Car size={18} color="#000"/></div><b>Lavadero El Portugués</b></div>
        <div style={{display:'flex', gap:'8px'}}><button onClick={()=>{if(confirm('Cargar demo?')){seedDatabase(true); loadData()}}} style={{padding:'6px 10px', borderRadius:'8px', background:'#0f172a', border:'1px solid rgba(255,255,255,0.08)', color:'#fff', fontSize:'12px'}}><RefreshCw size={14}/> Demo</button><button onClick={()=>setShowModalNuevoTurno(true)} style={{padding:'6px 10px', borderRadius:'8px', background:'#d4a356', border:'none', fontSize:'12px', fontWeight:800}}><Plus size={14}/> Orden</button><Link href="/" style={{padding:'6px 10px', borderRadius:'8px', background:'#0f172a', border:'1px solid rgba(255,255,255,0.08)', color:'#fff'}}><Home size={14}/></Link></div>
      </header>

      <main style={{maxWidth:'1400px', margin:'20px auto', padding:'0 16px'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px'}}>
          <div style={{background:'#131b29', border:'1px solid rgba(255,255,255,0.06)', padding:'14px', borderRadius:'12px'}}><div style={{fontSize:'11px', color:'#94a3b8'}}>Clientes</div><div style={{fontSize:'24px', fontWeight:900}}>{clientes.length}</div></div>
          <div style={{background:'#131b29', border:'1px solid rgba(255,255,255,0.06)', padding:'14px', borderRadius:'12px'}}><div style={{fontSize:'11px', color:'#94a3b8'}}>En Lavadero</div><div style={{fontSize:'24px', fontWeight:900}}>{turnos.filter((t:any)=>t.estado!=='Entregado').length}</div></div>
          <div style={{background:'#131b29', border:'1px solid rgba(255,255,255,0.06)', padding:'14px', borderRadius:'12px'}}><div style={{fontSize:'11px', color:'#94a3b8'}}>Hoy</div><div style={{fontSize:'24px', fontWeight:900}}>{turnos.filter((t:any)=>t.fecha===hoyStr).length}</div></div>
          <div style={{background:'#131b29', border:'1px solid rgba(255,255,255,0.06)', padding:'14px', borderRadius:'12px'}}><div style={{fontSize:'11px', color:'#94a3b8'}}>Caja Hoy</div><div style={{fontSize:'24px', fontWeight:900, color:'#d4a356'}}>${totalCajaHoy.toLocaleString()}</div></div>
        </div>

        <div style={{display:'flex', gap:'8px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'16px', overflowX:'auto'}}>
          <button onClick={()=>setActiveTab('kanban')} style={{padding:'10px', background:'transparent', border:'none', borderBottom:activeTab==='kanban'?'2px solid #d4a356':'none', color:activeTab==='kanban'?'#d4a356':'#94a3b8', fontWeight:800}}>Kanban</button>
          <button onClick={()=>setActiveTab('turnos')} style={{padding:'10px', background:'transparent', border:'none', borderBottom:activeTab==='turnos'?'2px solid #d4a356':'none', color:activeTab==='turnos'?'#d4a356':'#94a3b8', fontWeight:800}}>Reservas ({turnos.length})</button>
          <button onClick={()=>setActiveTab('clientes')} style={{padding:'10px', background:'transparent', border:'none', borderBottom:activeTab==='clientes'?'2px solid #d4a356':'none', color:activeTab==='clientes'?'#d4a356':'#94a3b8', fontWeight:800}}>Clientes</button>
          <button onClick={()=>setActiveTab('vehiculos')} style={{padding:'10px', background:'transparent', border:'none', borderBottom:activeTab==='vehiculos'?'2px solid #d4a356':'none', color:activeTab==='vehiculos'?'#d4a356':'#94a3b8', fontWeight:800}}>Vehículos</button>
          <button onClick={()=>setActiveTab('caja')} style={{padding:'10px', background:'transparent', border:'none', borderBottom:activeTab==='caja'?'2px solid #d4a356':'none', color:activeTab==='caja'?'#d4a356':'#94a3b8', fontWeight:800}}>Caja</button>
        </div>

        {activeTab==='kanban' && (
          <div style={{display:'flex', gap:'14px', overflowX:'auto', paddingBottom:'20px'}}>
            {ESTADOS_LIST.map(est=>{
              const col=turnos.filter((t:any)=>t.estado===est)
              return (
                <div key={est} style={{minWidth:'300px', width:'300px', background:'#131b29', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'12px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)', paddingBottom:'8px', marginBottom:'10px'}}><b style={{fontSize:'13px'}}>{est}</b><span style={{background:'rgba(212,163,86,0.15)', color:'#d4a356', padding:'2px 8px', borderRadius:'20px', fontSize:'11px'}}>{col.length}</span></div>
                  <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    {col.map((t:any)=>(
                      <div key={t.id} style={{background:'#0f172a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'10px', padding:'12px'}}>
                        <div style={{display:'flex', justifyContent:'space-between'}}><b style={{color:'#d4a356'}}>{t.patente}</b><span style={{fontSize:'11px', color:'#64748b'}}>{t.hora}</span></div>
                        <div style={{fontSize:'13px', fontWeight:700}}>{t.nombre}</div>
                        <div style={{fontSize:'11px', color:'#94a3b8', margin:'4px 0'}}>{t.servicio}</div>
                        <div style={{fontWeight:800, color:'#d4a356', marginBottom:'8px'}}>${t.precio?.toLocaleString()}</div>
                        <div style={{display:'flex', gap:'6px'}}>
                          {est==='En espera' && <button onClick={()=>handleCambiarEstado(t.id,'En proceso')} style={{flex:1, padding:'6px', borderRadius:'6px', background:'#1e293b', border:'1px solid rgba(255,255,255,0.08)', color:'#fff', fontSize:'11px'}}>Iniciar</button>}
                          {est==='En proceso' && <button onClick={()=>handleCambiarEstado(t.id,'Listo')} style={{flex:1, padding:'6px', borderRadius:'6px', background:'#d4a356', border:'none', fontSize:'11px', fontWeight:800}}>Listo</button>}
                          {est==='Listo' && <button onClick={()=>handleCambiarEstado(t.id,'Entregado')} style={{flex:1, padding:'6px', borderRadius:'6px', background:'#22c55e', border:'none', color:'#fff', fontSize:'11px', fontWeight:800}}>Entregar</button>}
                          <a href={`https://wa.me/54${t.telefono?.replace(/[^0-9]/g,'')}`} target="_blank" style={{padding:'6px 8px', borderRadius:'6px', background:'#1e293b', border:'1px solid rgba(255,255,255,0.08)'}}><MessageCircle size={14} color="#22c55e"/></a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
