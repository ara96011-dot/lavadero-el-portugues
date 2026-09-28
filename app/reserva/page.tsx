"use client"
import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const servicios = [
  { nombre: "Carrocería + interior (Sin motor)", precio: "$20" },
  { nombre: "Lavado completo (con motor a vapor)", precio: "$25" },
  { nombre: "Encerado", precio: "$15" },
  { nombre: "Abrillantado", precio: "$15" },
  { nombre: "Lustre", precio: "$10" },
  { nombre: "Pulido", precio: "$10" },
  { nombre: "Tratamiento con grafeno", precio: "$12" },
  { nombre: "Descontaminación de interiores", precio: "$14" },
  { nombre: "Restauración de llantas", precio: "$15" },
  { nombre: "Restauración de volantes", precio: "$18" },
  { nombre: "Tapizados de autos", precio: "$16" },
  { nombre: "Sillas", precio: "$12" },
  { nombre: "Sillones", precio: "$17" },
  { nombre: "Alfombras", precio: "$19" },
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
    await supabase.from("autos").insert([{
      patente: patente.toUpperCase(),
      cliente: nombre,
      servicio: servicio,
      estado: "En espera",
      telefono: tel
    }])
    const mensaje = `¡Nueva reserva El Portugués!%0A%0ACliente: ${nombre}%0APatente: ${patente}%0AServicio: ${servicio}%0ATel: ${tel}`
    window.open(`https://wa.me/5493865859894?text=${mensaje}`, "_blank")
    setEnviando(false)
    alert("¡Reserva enviada! Te confirman por WhatsApp.")
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>🇵🇹 El Portugués</h1>
      <h3 style={{ textAlign: "center" }}>Reservá tu turno</h3>
      <input placeholder="Tu nombre" value={nombre} onChange={e=>setNombre(e.target.value)} style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 8, border: "1px solid #ccc" }} />
      <input placeholder="Patente (ej: AB123CD)" value={patente} onChange={e=>setPatente(e.target.value)} style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 8, border: "1px solid #ccc" }} />
      <input placeholder="Tu WhatsApp" value={tel} onChange={e=>setTel(e.target.value)} style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 8, border: "1px solid #ccc" }} />
      <select value={servicio} onChange={e=>setServicio(e.target.value)} style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 8, border: "1px solid #ccc" }}>
        {servicios.map(s => <option key={s.nombre} value={s.nombre}>{s.nombre} - {s.precio}</option>)}
      </select>
      <button onClick={reservar} disabled={enviando} style={{ width: "100%", padding: 14, marginTop: 12, background: "#25D366", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", fontSize: 16 }}>
        {enviando? "Enviando..." : "Reservar por WhatsApp"}
      </button>
    </div>
  )
}
