// lib/db.ts - versión final a prueba de fallas
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
  created_at?: string
}

const KEY = 'lavadero_turnos'

export function getTurnos(): Turno[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveTurno(data: Omit<Turno, 'id'>): Turno {
  const nuevo: Turno = {
   ...data,
    id: `tur_${Date.now()}`,
    created_at: new Date().toISOString()
  }
  try {
    const actuales = getTurnos()
    actuales.unshift(nuevo)
    localStorage.setItem(KEY, JSON.stringify(actuales))
    console.log('Guardado local OK', nuevo)
  } catch (e) {
    console.error('Error localStorage', e)
  }
  return nuevo
}

export function updateTurnoEstado(id: string, estado: Turno['estado']) {
  const turnos = getTurnos()
  const idx = turnos.findIndex(t => t.id === id)
  if (idx >= 0) {
    turnos[idx].estado = estado
    localStorage.setItem(KEY, JSON.stringify(turnos))
  }
}

export function deleteTurno(id: string) {
  const turnos = getTurnos().filter(t => t.id!== id)
  localStorage.setItem(KEY, JSON.stringify(turnos))
}
