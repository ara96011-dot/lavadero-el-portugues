'use client'

export type Cliente = {
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

export type Vehiculo = {
  id: string
  clienteId: string
  patente: string
  marca: string
  modelo: string
  tipo: string
  color: string
}

export type Turno = {
  id: string
  nombre: string
  patente: string
  telefono: string
  servicio: string
  precio: number
  fecha: string
  hora: string
  estado: 'En espera' | 'En proceso' | 'Listo' | 'Entregado'
}

export type CajaItem = {
  id: string
  turnoId: string
  patente: string
  servicio: string
  monto: number
  fecha: string
  medioPago: string
}

const KEY_CLIENTES = 'lavadero_clientes'
const KEY_VEHICULOS = 'lavadero_vehiculos'
const KEY_TURNOS = 'lavadero_turnos'
const KEY_CAJA = 'lavadero_caja'

function isBrowser() {
  return typeof window!== 'undefined'
}

function getLS<T>(key: string, def: T): T {
  if (!isBrowser()) return def
  try {
    const v = localStorage.getItem(key)
    return v? JSON.parse(v) as T : def
  } catch {
    return def
  }
}

function setLS(key: string, val: any) {
  if (!isBrowser()) return
  localStorage.setItem(key, JSON.stringify(val))
}

// --- GETS ---
export const getClientes = (): Cliente[] => getLS(KEY_CLIENTES, [])
export const getVehiculos = (): Vehiculo[] => getLS(KEY_VEHICULOS, [])
export const getTurnos = (): Turno[] => getLS(KEY_TURNOS, [])
export const getCaja = (): CajaItem[] => getLS(KEY_CAJA, [])

// --- SAVES ---
export const saveCliente = (c: Omit<Cliente, 'id'>) => {
  const all = getClientes()
  const nuevo: Cliente = {...c, id: `cli_${Date.now()}` }
  all.unshift(nuevo)
  setLS(KEY_CLIENTES, all)
  return nuevo
}

export const saveTurno = (t: Omit<Turno, 'id'>) => {
  const all = getTurnos()
  const nuevo: Turno = {...t, id: `tur_${Date.now()}` }
  all.unshift(nuevo)
  setLS(KEY_TURNOS, all)

  // actualizar cliente si existe, o crearlo rápido
  const clientes = getClientes()
  const cliIdx = clientes.findIndex(c => c.patentePrincipal === nuevo.patente)
  if (cliIdx >= 0) {
    clientes[cliIdx].totalLavados += 1
    clientes[cliIdx].gastoTotal += nuevo.precio
    setLS(KEY_CLIENTES, clientes)
  }

  return nuevo
}

export const updateEstadoTurno = (id: string, nuevoEstado: Turno['estado']) => {
  const turnos = getTurnos()
  const caja = getCaja()
  const idx = turnos.findIndex(t => t.id === id)
  if (idx === -1) return
  const turno = turnos[idx]
  turno.estado = nuevoEstado
  setLS(KEY_TURNOS, turnos)

  if (nuevoEstado === 'Entregado') {
    const existe = caja.find(c => c.turnoId === id)
    if (!existe) {
      caja.unshift({
        id: `caj_${Date.now()}`,
        turnoId: id,
        patente: turno.patente,
        servicio: turno.servicio,
        monto: turno.precio,
        fecha: new Date().toISOString().split('T')[0],
        medioPago: 'Efectivo'
      })
      setLS(KEY_CAJA, caja)
    }
  }
}

export const deleteCliente = (id: string) => {
  const clientes = getClientes().filter(c => c.id!== id)
  setLS(KEY_CLIENTES, clientes)
}

export const seedDatabase = (force = false) => {
  if (!isBrowser()) return
  if (!force && getClientes().length > 0) return

  const marcas = ['Toyota','Ford','VW','Fiat','Chevrolet','Renault']
  const modelos = ['Corolla','Focus','Gol','Cronos','Onix','Clio']
  const clientes: Cliente[] = []
  const vehiculos: Vehiculo[] = []
  const turnos: Turno[] = []
  const caja: CajaItem[] = []

  for (let i = 0; i < 200; i++) {
    const patente = `AA${String(i).padStart(3,'0')}BB`
    const idCli = `cli_${i}`
    clientes.push({
      id: idCli,
      nombre: `Cliente ${i+1}`,
      telefono: `3865${500000 + i}`,
      email: `cliente${i}@mail.com`,
      patentePrincipal: patente,
      fechaAlta: new Date().toISOString().split('T')[0],
      notas: '',
      totalLavados: Math.floor(Math.random()*10),
      gastoTotal: Math.floor(Math.random()*100000)
    })
    vehiculos.push({
      id: `veh_${i}`,
      clienteId: idCli,
      patente,
      marca: marcas[i % marcas.length],
      modelo: modelos[i % modelos.length],
      tipo: 'Auto',
      color: 'Gris'
    })
  }

  // algunos turnos de hoy para que veas el kanban vivo
  const todayStr = new Date().toISOString().split('T')[0]
  for (let i = 0; i < 8; i++) {
    turnos.push({
      id: `tur_demo_${i}`,
      nombre: `Cliente Demo ${i+1}`,
      patente: `AB${100+i}CD`,
      telefono: `3865${600000+i}`,
      servicio: 'Carrocería + Interior',
      precio: 12000,
      fecha: todayStr,
      hora: `${9+i}:00`,
      estado: ['En espera','En proceso','Listo','Entregado'][i%4] as any
    })
  }

  setLS(KEY_CLIENTES, clientes)
  setLS(KEY_VEHICULOS, vehiculos)
  setLS(KEY_TURNOS, turnos)
  setLS(KEY_CAJA, caja)
}
