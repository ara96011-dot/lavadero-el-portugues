// @ts-nocheck
"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Admin(){
  const [reservas,setReservas]=useState<any[]>([])
  const cargar = async()=>{ const {data} = await supabase.from('reservas').select('*').order('created_at',{ascending:false}); setReservas(data||[]) }
  useEffect(()=>{cargar()},[])

  const cambiarEstado = async(id:string, estado:string)=>{ await supabase.from('reservas').update({estado}).eq('id',id); cargar() }
  const borrar = async(id:string)=>{ await supabase.from('reservas').delete().eq('id',id); cargar() }

  return(
    <div style={{padding:20, background:'#0b0f17', minHeight:'100vh', color:'white'}}>
      <h1 style={{fontSize:28, fontWeight:900}}>Admin - EL PORTUGUÉS</h1>
      <p style={{color:'#94a3b8'}}>Total reservas: {reservas.length}</p>
      <button onClick={cargar} style={{marginTop:10, background:'#d4a356', color:'black', fontWeight:800, padding:'8px 16px', borderRadius:8}}>Recargar</button>
      <div style={{marginTop:20, display:'grid', gap:12}}>
        {reservas.length===0 && <p style={{color:'#64748b'}}>No hay reservas todavía. Probá reservar desde el celu.</p>}
        {reservas.map(r=>(
          <div key={r.id} style={{background:'#131b29', border:'1px solid #1e293b', padding:16, borderRadius:12, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10}}>
            <div>
              <b style={{fontSize:18}}>{r.patente}</b> - {r.cliente_nombre} - {r.cliente_telefono}<br/>
              <span style={{color:'#94a3b8', fontSize:14}}>{r.servicio} - ${r.precio} - {r.fecha} {r.hora}</span><br/>
              <span style={{color: r.estado==='En espera'?'#fbbf24': r.estado==='En proceso'?'#38bdf8':'#22c55e', fontWeight:700}}>{r.estado}</span>
            </div>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <select value={r.estado} onChange={e=>cambiarEstado(r.id,e.target.value)} style={{background:'#0b0f17', color:'white', padding:8, borderRadius:8}}>
                <option>En espera</option><option>En proceso</option><option>Listo</option><option>Entregado</option>
              </select>
              <button onClick={()=>borrar(r.id)} style={{background:'#7f1d1d', padding:'8px 12px', borderRadius:8}}>Borrar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
