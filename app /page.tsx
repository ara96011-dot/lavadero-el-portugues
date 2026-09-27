'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://hupddvumcivspbckevjiy.supabase.co',
  'sb_publishable_pf6Q1Dp2OrUi_YHX9q8Quw_wRH3APMj'
)

export default function Lavadero(){
  const [ordenes,setOrdenes]=useState<any[]>([])
  const [patente,setPatente]=useState(''); const [servicio,setServicio]=useState('Lavado Básico')
  const estados = ['En espera','En proceso','Listo','Entregado']

  const cargar = async()=>{
    const { data } = await supabase.from('ordenes').select('*').order('created_at',{ascending:false})
    if(data) setOrdenes(data)
  }
  useEffect(()=>{cargar()},[])

  const nuevo = async()=>{
    if(!patente) return alert('Patente')
    await supabase.from('ordenes').insert({ patente: patente.toUpperCase(), servicio, estado:'En espera' })
    setPatente(''); cargar()
  }

  const mover = async(id:string, nuevoEstado:string)=>{
    await supabase.from('ordenes').update({ estado:nuevoEstado }).eq('id',id)
    cargar()
    if(nuevoEstado==='Entregado'){
      // sumar a caja
      const ord = ordenes.find(o=>o.id===id)
      await supabase.from('caja').insert({ orden_id:id, monto: ord?.precio || 5000 })
    }
  }

  return (
    <div style={{background:'#0a0a0a',color:'#fff',minHeight:'100vh',padding:'12px',fontFamily:'Arial'}}>
      <h1 style={{textAlign:'center'}}>🇵🇹 Lavadero El Portugués</h1>
      <div style={{display:'flex',gap:'8px',margin:'10px 0'}}>
        <input value={patente} onChange={e=>setPatente(e.target.value)} placeholder="Patente AB123CD" style={{flex:1,padding:'12px',borderRadius:'8px',color:'#000'}}/>
        <select value={servicio} onChange={e=>setServicio(e.target.value)} style={{padding:'12px',borderRadius:'8px',color:'#000'}}>
          <option>Lavado Básico</option><option>Lavado Completo</option><option>Premium + Cera</option><option>Detailing</option>
        </select>
        <button onClick={nuevo} style={{padding:'12px 18px',background:'#d4a356',color:'#000',fontWeight:900,borderRadius:'8px',border:'none'}}>+</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'8px'}}>
        {estados.map(est=>(
          <div key={est} style={{background:'#1a1a1a',borderRadius:'10px',padding:'8px'}}>
            <h3 style={{textAlign:'center',fontSize:'12px'}}>{est} ({ordenes.filter(o=>o.estado===est).length})</h3>
            {ordenes.filter(o=>o.estado===est).map(o=>(
              <div key={o.id} style={{background:'#2a2a2a',margin:'6px 0',padding:'8px',borderRadius:'8px',fontSize:'12px'}}>
                <b>{o.patente}</b><br/>{o.servicio}
                <div style={{display:'flex',gap:'4px',marginTop:'6px'}}>
                  {est!=='Entregado' && <button onClick={()=>mover(o.id, estados[estados.indexOf(est)+1])} style={{flex:1,background:'#fff',color:'#000',border:'none',borderRadius:'6px',padding:'4px'}}>→</button>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{marginTop:'20px',textAlign:'center',fontSize:'12px',opacity:0.6}}>Caja hoy: {ordenes.filter(o=>o.estado==='Entregado').length} autos</div>
    </div>
  )
}
