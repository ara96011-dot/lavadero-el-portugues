import { createClient } from '@supabase/supabase-js'

export interface Cliente {
  id: string
  nombre: string
  telefono: string
  email: string
  patentePrincipal: string
  fechaAlta: string
  notas: string
  totalLavados: number
  gastoTotal: number
}

export interface Vehiculo {
  id: string
  clienteId: string
  patente: string
  marca: string
  modelo: string
  tipo: 'Auto' | 'SUV / Camioneta' | 'Moto' | 'Utilitario'
  color: string
}

export interface Turno {
  id: string
  clienteId?: string
  nombre: string
  patente: string
  telefono: string
  servicio: string
  precio: number
  fecha: string
  hora: string
  estado: 'En espera' | 'En proceso' | 'Listo' | 'Entregado' | 'Cancelado'
  created_at: string
  notas?: string
}

export interface CajaItem {
  id: string
  turnoId?: string
  patente: string
  servicio: string
  monto: number
  fecha: string
  medioPago: 'Efectivo' | 'Transferencia' | 'Tarjeta'
}

// Fallback Supabase client (only runs if env variables exist)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hupddvumcivspbckevjiy.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_pf6Q1Dp2OrUi_YHX9q8Quw_wRH3APMj'
export const supabase = createClient(supabaseUrl, supabaseKey)

const KEYS = {
  CLIENTES: 'portugues_clientes_v2',
  VEHICULOS: 'portugues_vehiculos_v2',
  TURNOS: 'portugues_turnos_v2',
  CAJA: 'portugues_caja_v2'
}

// LocalStorage helpers with SSR safety
const isClient = () => typeof window !== 'undefined'

export function getClientes(): Cliente[] {
  if (!isClient()) return []
  const data = localStorage.getItem(KEYS.CLIENTES)
  if (!data) {
    const seeded = generate200Clients()
    localStorage.setItem(KEYS.CLIENTES, JSON.stringify(seeded.clientes))
    localStorage.setItem(KEYS.VEHICULOS, JSON.stringify(seeded.vehiculos))
    localStorage.setItem(KEYS.TURNOS, JSON.stringify(seeded.turnos))
    localStorage.setItem(KEYS.CAJA, JSON.stringify(seeded.caja))
    return seeded.clientes
  }
  return JSON.parse(data)
}

export function getVehiculos(): Vehiculo[] {
  if (!isClient()) return []
  const data = localStorage.getItem(KEYS.VEHICULOS)
  return data ? JSON.parse(data) : []
}

export function getTurnos(): Turno[] {
  if (!isClient()) return []
  const data = localStorage.getItem(KEYS.TURNOS)
  if (!data) {
    getClientes() // Will trigger seed
    const data2 = localStorage.getItem(KEYS.TURNOS)
    return data2 ? JSON.parse(data2) : []
  }
  return JSON.parse(data)
}

export function getCaja(): CajaItem[] {
  if (!isClient()) return []
  const data = localStorage.getItem(KEYS.CAJA)
  return data ? JSON.parse(data) : []
}

export function saveCliente(cliente: Omit<Cliente, 'id'> & { id?: string }): Cliente {
  const clientes = getClientes()
  const id = cliente.id || 'cli_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
  const nuevoCliente: Cliente = {
    ...cliente,
    id,
    fechaAlta: cliente.fechaAlta || new Date().toISOString().split('T')[0],
    totalLavados: cliente.totalLavados || 0,
    gastoTotal: cliente.gastoTotal || 0,
    notas: cliente.notas || ''
  }

  const existingIndex = clientes.findIndex(c => c.id === id)
  if (existingIndex >= 0) {
    clientes[existingIndex] = nuevoCliente
  } else {
    clientes.unshift(nuevoCliente)
  }

  if (isClient()) localStorage.setItem(KEYS.CLIENTES, JSON.stringify(clientes))
  return nuevoCliente
}

export function deleteCliente(id: string) {
  const clientes = getClientes().filter(c => c.id !== id)
  const vehiculos = getVehiculos().filter(v => v.clienteId !== id)
  if (isClient()) {
    localStorage.setItem(KEYS.CLIENTES, JSON.stringify(clientes))
    localStorage.setItem(KEYS.VEHICULOS, JSON.stringify(vehiculos))
  }
}

export function saveVehiculo(vehiculo: Omit<Vehiculo, 'id'> & { id?: string }): Vehiculo {
  const vehiculos = getVehiculos()
  const id = vehiculo.id || 'veh_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
  const nuevoVehiculo: Vehiculo = { ...vehiculo, id }
  const idx = vehiculos.findIndex(v => v.id === id)
  if (idx >= 0) vehiculos[idx] = nuevoVehiculo
  else vehiculos.unshift(nuevoVehiculo)

  if (isClient()) localStorage.setItem(KEYS.VEHICULOS, JSON.stringify(vehiculos))
  return nuevoVehiculo
}

export function saveTurno(turno: Omit<Turno, 'id' | 'created_at'> & { id?: string; created_at?: string }): Turno {
  const turnos = getTurnos()
  const id = turno.id || 'tur_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
  const nuevoTurno: Turno = {
    ...turno,
    id,
    created_at: turno.created_at || new Date().toISOString()
  }

  const idx = turnos.findIndex(t => t.id === id)
  if (idx >= 0) turnos[idx] = nuevoTurno
  else turnos.unshift(nuevoTurno)

  if (isClient()) localStorage.setItem(KEYS.TURNOS, JSON.stringify(turnos))

  // Try sync with Supabase async
  try {
    supabase.from('ordenes').insert({
      patente: nuevoTurno.patente,
      servicio: nuevoTurno.servicio,
      estado: nuevoTurno.estado
    }).then(() => {}, () => {})
  } catch (e) {}

  return nuevoTurno
}

export function updateEstadoTurno(id: string, nuevoEstado: Turno['estado']): Turno | null {
  const turnos = getTurnos()
  const turno = turnos.find(t => t.id === id)
  if (!turno) return null

  const estadoAnterior = turno.estado
  turno.estado = nuevoEstado
  if (isClient()) localStorage.setItem(KEYS.TURNOS, JSON.stringify(turnos))

  // If moved to Entregado and wasn't delivered before, sum to Caja & update Client stats
  if (nuevoEstado === 'Entregado' && estadoAnterior !== 'Entregado') {
    addCaja({
      turnoId: id,
      patente: turno.patente,
      servicio: turno.servicio,
      monto: turno.precio || 8000,
      fecha: new Date().toISOString().split('T')[0],
      medioPago: 'Efectivo'
    })

    // Increment client counters if clienteId or matching patente exists
    const clientes = getClientes()
    const cliente = clientes.find(c => c.id === turno.clienteId || c.patentePrincipal === turno.patente)
    if (cliente) {
      cliente.totalLavados += 1
      cliente.gastoTotal += (turno.precio || 8000)
      saveCliente(cliente)
    }
  }

  // Try sync with Supabase
  try {
    supabase.from('ordenes').update({ estado: nuevoEstado }).eq('id', id).then(() => {}, () => {})
  } catch (e) {}

  return turno
}

export function addCaja(item: Omit<CajaItem, 'id'>): CajaItem {
  const caja = getCaja()
  const newItem: CajaItem = {
    ...item,
    id: 'caj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
  }
  caja.unshift(newItem)
  if (isClient()) localStorage.setItem(KEYS.CAJA, JSON.stringify(caja))
  return newItem
}

export function seedDatabase(force: boolean = false) {
  if (!isClient()) return
  if (force || !localStorage.getItem(KEYS.CLIENTES)) {
    const data = generate200Clients()
    localStorage.setItem(KEYS.CLIENTES, JSON.stringify(data.clientes))
    localStorage.setItem(KEYS.VEHICULOS, JSON.stringify(data.vehiculos))
    localStorage.setItem(KEYS.TURNOS, JSON.stringify(data.turnos))
    localStorage.setItem(KEYS.CAJA, JSON.stringify(data.caja))
  }
}

// Generators for realistic 200+ clients dataset
function generate200Clients() {
  const nombres = ['Juan', 'Carlos', 'María', 'Ana', 'Gonzalo', 'Matías', 'Lucía', 'Sofía', 'Agustín', 'Esteban', 'Ramiro', 'Florencia', 'Camila', 'Santiago', 'Nicolás', 'Ignacio', 'Facundo', 'Valentina', 'Martín', 'Diego', 'Patricia', 'Fernando', 'Javier', 'Hernán', 'Sebastián', 'Lucas', 'Mariano', 'Joaquín', 'Tomas', 'Guillermo']
  const apellidos = ['González', 'Rodríguez', 'Pérez', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Romero', 'Sosa', 'Torres', 'Álvarez', 'Ruiz', 'Ramírez', 'Flores', 'Benítez', 'Acosta', 'Medina', 'Herrera', 'Aguirre', 'Castro', 'Giménez', 'Gutiérrez', 'Molina', 'Silva', 'Ríos', 'Vásquez', 'Carrizo', 'Peralta', 'Cáceres']
  
  const marcas = [
    { marca: 'Volkswagen', modelos: ['Gol Trend', 'Amarok', 'Vento', 'Nivus', 'T-Cross', 'Polo'], tipo: 'Auto' as const },
    { marca: 'Toyota', modelos: ['Hilux', 'Corolla', 'Yaris', 'Etios', 'Corolla Cross', 'SW4'], tipo: 'SUV / Camioneta' as const },
    { marca: 'Ford', modelos: ['Ranger', 'Focus', 'Fiesta', 'EcoSport', 'Territory', 'Ka'], tipo: 'SUV / Camioneta' as const },
    { marca: 'Chevrolet', modelos: ['Cruze', 'Onix', 'Tracker', 'S10', 'Spin', 'Prisma'], tipo: 'Auto' as const },
    { marca: 'Peugeot', modelos: ['208', '2008', '308', '408', '3008', 'Partner'], tipo: 'Auto' as const },
    { marca: 'Fiat', modelos: ['Cronos', 'Toro', 'Mobi', 'Strada', 'Argo', 'Uno'], tipo: 'Auto' as const },
    { marca: 'Renault', modelos: ['Sandero', 'Duster', 'Kwid', 'Alaskan', 'Kangoo', 'Logan'], tipo: 'Auto' as const },
    { marca: 'BMW', modelos: ['Serie 3', 'X3', 'Serie 1', 'X5'], tipo: 'Auto' as const },
    { marca: 'Honda', modelos: ['Civic', 'HR-V', 'CR-V', 'Fit'], tipo: 'SUV / Camioneta' as const }
  ]

  const colores = ['Negro', 'Blanco', 'Gris Plata', 'Gris Oscuro', 'Azul', 'Rojo', 'Verde', 'Bordo']
  const serviciosLista = [
    { nombre: 'Carrocería + Interior', precio: 12000 },
    { nombre: 'Lavado Completo con Motor', precio: 15000 },
    { nombre: 'Encerado & Abrillantado', precio: 18000 },
    { nombre: 'Tratamiento Cerámico', precio: 45000 },
    { nombre: 'Descontaminación + Tapizados', precio: 28000 },
    { nombre: 'Restauración de Ópticas', precio: 14000 }
  ]

  const clientes: Cliente[] = []
  const vehiculos: Vehiculo[] = []
  const turnos: Turno[] = []
  const caja: CajaItem[] = []

  const todayStr = new Date().toISOString().split('T')[0]

  // Generate 205 clients
  for (let i = 1; i <= 205; i++) {
    const nom = nombres[Math.floor(Math.random() * nombres.length)]
    const ape = apellidos[Math.floor(Math.random() * apellidos.length)]
    const nombreCompleto = `${nom} ${ape}`
    const cliId = `cli_${i}`
    
    // Generate patente MERCOSUR (e.g., AF 123 BK) or Old (e.g., AA 123 BB)
    const l1 = String.fromCharCode(65 + Math.floor(Math.random() * 26))
    const l2 = String.fromCharCode(65 + Math.floor(Math.random() * 26))
    const n1 = Math.floor(Math.random() * 900) + 100
    const l3 = String.fromCharCode(65 + Math.floor(Math.random() * 26))
    const l4 = String.fromCharCode(65 + Math.floor(Math.random() * 26))
    const patente = `${l1}${l2}${n1}${l3}${l4}`

    const brandObj = marcas[Math.floor(Math.random() * marcas.length)]
    const modelo = brandObj.modelos[Math.floor(Math.random() * brandObj.modelos.length)]
    const color = colores[Math.floor(Math.random() * colores.length)]
    const totalLavados = Math.floor(Math.random() * 15) + 1
    const srv = serviciosLista[Math.floor(Math.random() * serviciosLista.length)]
    const gastoTotal = totalLavados * srv.precio

    clientes.push({
      id: cliId,
      nombre: nombreCompleto,
      telefono: `3865${Math.floor(Math.random() * 899999) + 100000}`,
      email: `${nom.toLowerCase()}.${ape.toLowerCase()}@gmail.com`,
      patentePrincipal: patente,
      fechaAlta: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      notas: i % 5 === 0 ? 'Cliente VIP. Solicita siempre encerado especial.' : '',
      totalLavados,
      gastoTotal
    })

    const vehId = `veh_${i}`
    vehiculos.push({
      id: vehId,
      clienteId: cliId,
      patente,
      marca: brandObj.marca,
      modelo,
      tipo: brandObj.tipo,
      color
    })

    // Create 1 active or past turno for every few clients
    if (i <= 40) {
      const estados: Turno['estado'][] = ['En espera', 'En proceso', 'Listo', 'Entregado']
      const est = i <= 6 ? 'En espera' : i <= 12 ? 'En proceso' : i <= 20 ? 'Listo' : 'Entregado'
      const turId = `tur_${i}`
      const hr = `${String(8 + (i % 10)).padStart(2, '0')}:00`
      
      turnos.push({
        id: turId,
        clienteId: cliId,
        nombre: nombreCompleto,
        patente,
        telefono: clientes[i-1].telefono,
        servicio: srv.nombre,
        precio: srv.precio,
        fecha: todayStr,
        hora: hr,
        estado: est,
        created_at: new Date().toISOString(),
        notas: 'Turno generado automáticamente'
      })

      if (est === 'Entregado') {
        caja.push({
          id: `caj_${i}`,
          turnoId: turId,
          patente,
          servicio: srv.nombre,
          monto: srv.precio,
          fecha: todayStr,
          medioPago: i % 2 === 0 ? 'Efectivo' : 'Transferencia'
        })
      }
    }
  }

  return { clientes, vehiculos, turnos, caja }
}
