"use client"
import { useState } from "react"

const servicios = [
  "Carrocería + interior (Sin motor) - $20",
  "Lavado completo (con motor a vapor) - $25",
  "Encerado - $15",
  "Abrillantado - $15",
  "Lustre - $10",
  "Pulido - $10",
  "Tratamiento con grafeno - $12",
  "Descontaminación de interiores - $14",
  "Restauración de llantas - $15",
  "Restauración de volantes - $18",
  "Tapizados de autos - $16",
  "Sillas - $12",
  "Sillones - $17",
  "Alfombras - $19",
  "Engrase - $20",
  "Restauración de ópticas - $13",
]

export default function Reserva() {
  const [nombre, setNombre] = useState("")
  const [patente, setPatente] = useState("")
  const [servicio, setServicio] = useState(servicios[0])
  const [tel, setTel] = useState("")

  const reservar = () => {
    if(!nombre ||!patente ||!tel) { alert("Completá todo"); return }
    const mensaje = `¡Nueva reserva El Portugués!%0ACliente: ${nombre}%0APatente: ${patente}%0AServicio: ${servicio}%0ATel: ${tel}`
    window.open(`https://wa.me/5493865859894?text=${mensaje}`, "_blank")
    alert("Te va a abrir WhatsApp")
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>🇵🇹 El Portugués</h1>
      <h3 style={{ textAlign: "center" }}>Reservá tu turno</h3>
      <input placeholder="Tu nombre" value={nombre} onChange={e=>setNombre(e.target.value)} style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 8, border: "1px solid #ccc" }} />
      <input placeholder="Patente" value={patente} onChange={e=>setPatente(e.target.value)} style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 8, border: "1px solid #ccc" }} />
      <input placeholder="Tu WhatsApp" value={tel} onChange={e=>setTel(e.target.value)} style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 8, border: "1px solid #ccc" }} />
      <select value={servicio} onChange={e=>setServicio(e.target.value)} style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 8, border: "1px solid #ccc" }}>
        {servicios.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <button onClick={reservar} style={{ width: "100%", padding: 14, marginTop: 12, background: "#25D366", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", fontSize: 16 }}>Reservar por WhatsApp</button>
    </div>
  )
}
