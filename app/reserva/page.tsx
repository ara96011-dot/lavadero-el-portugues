"use client"
import { useState } from "react"
import { supabase } from "../supabaseClient"

const servicios = [
  { nombre: "Carrocería + interior (Sin motor)", precio: "$20" },
  { nombre: "Lavado completo (con motor a vapor)", precio: "$25" },
  { nombre: "Encerado", precio: "$15" },
  { nombre: "Abrillantado", precio: "$15" },
  { nombre: "Lustre", precio: "$10" },
  { nombre: "Pulido", precio: "$10" },
  { nombre: "Tratamiento con grafeno", precio: "$12" },
  { nombre: "Descontaminación de interiores", precio: "$14" },
  { nombre: "Restauración de llantas de aleación", precio: "$15" },
  { nombre: "Restauración de volantes", precio: "$18" },
  { nombre: "Limpieza de tapizados de autos", precio: "$16" },
  { nombre: "Limpieza de Sillas", precio: "$12" },
  { nombre: "Limpieza de Sillones", precio: "$17" },
  { nombre: "Limpieza de Alfombras", precio: "$19" },
  { nombre: "Engrase", precio: "$20" },
  { nombre: "Restauración de ópticas", precio: "$13" },
]

export default function Reserva() {
  const [nombre, setNombre] = useState("")
  const [patente, setPatente] = useState("")
  const [servicio, setServicio] = useState(servicios[0].nombre)
  const [tel, setTel] = useState("")
  const [enviando, setEnviando] = useState(false)

  const reservar = async () => {
    if(!nombre ||!patente ||!tel) { alert("Completá todos los datos"); return }
    setEnviando(true)

    // 1. Guardar en tu sistema
    const { error } = await supabase.from("autos").insert([{
      patente: patente.toUpperCase(),
      cliente: nombre,
      servicio: servicio,
      estado: "En espera",
      telefono: tel
    }])

    // 2. Mandar WhatsApp a tu número 3865859894
    const mensaje = `¡Nueva reserva El Portugués!%0A%0ACliente: ${nombre}%0APatente: ${patente}%0AServicio: ${servicio}%0ATel: ${tel}`
    const numeroLavadero = "5493865859894"
    window.open(`https://wa.me/${numeroLavadero}?text=${mensaje}`, "_blank")

    setEnviando(false)
    alert("¡Reserva enviada! Te van a confirmar por WhatsApp.")
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>🇵🇹 El Portugués</h1>
      <h3 style={{ textAlign: "center" }}>Reservá tu turno</h3>

      <input placeholder="Tu nombre" value={nombre} onChange={e=>setNombre(e.target.value)} style={inputStyle} />
      <input placeholder="Patente (ej: AB123CD)" value={patente} onChange={e=>setPatente(e.target.value)} style={inputStyle} />
      <input placeholder="Tu WhatsApp" value={tel} onChange={e=>setTel(e.target.value)} style={inputStyle} />

      <label style={{fontSize: 14}}>Servicio:</label>
      <select value={servicio} onChange={e=>setServicio(e.target.value)} style={inputStyle}>
        {servicios.map(s => <option key={s.nombre} value={s.nombre}>{s.nombre} - {s.precio}</option>)}
      </select>

      <button onClick={reservar} disabled={enviando} style={btnStyle}>
        {enviando? "Enviando..." : "Reservar por WhatsApp"}
      </button>
    </div>
  )
}

const inputStyle = { width: "100%", padding: 12, margin: "8px 0", borderRadius: 8, border: "1px solid #ccc" } as any
const btnStyle = { width: "100%", padding: 14, marginTop: 12, background: "#25D366", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", fontSize: 16 } as any
