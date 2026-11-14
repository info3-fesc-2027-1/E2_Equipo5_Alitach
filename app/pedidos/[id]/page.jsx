"use client"; 
// Detalle del pedido (RF4): cliente, prendas, fechas, historial y cambio de estado 
import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; 
import { obtenerPedido, obtenerHistorial } from "../../../lib/datos"; 
import CambiarEstado from "./CambiarEstado"; 
// Francisca: aquí va el import de CancelarPedido 
import { calcularTotal, esAtrasado } from "../../../lib/logica"; 
// Achtli: aquí va el import de CambiarFecha 

export default function DetallePedido() {  
    const { id } = useParams();  
    const [pedido, setPedido] = useState(null);  
    const [historial, setHistorial] = useState([]);  
    const [cargando, setCargando] = useState(true);  
    const [error, setError] = useState("");  

    // Trae el pedido y su historial de Supabase  
    async function cargar() {    
        try {      
            const datos = await obtenerPedido(id);      
            setPedido(datos);      
            if (datos) {        
                setHistorial(await obtenerHistorial(datos.id));      
            }    
        } catch (e) {      
            setError("Error al cargar el pedido: " + e.message);    
        } finally {      
            setCargando(false);    
        }  
    }  

    useEffect(() => {    
        cargar();  
    }, [id]);  
    
    if (cargando) {    
        return (      
        <main>        
            <p>Cargando pedido...</p>      
        </main>    
        );  
    }  if (error) {    
        return (      
        <main>        
            <p>{error}</p>      
        </main>    
        );  
    }  
    if (!pedido) {    
        return (      
        <main>        
            <p>No existe el pedido #{id}.</p>        
            <a href="/pedidos">Volver a pedidos</a>      
            </main>    
        );
        }  
        
        const prendas = pedido.prenda_pedido || [];  
        
        return (    
            <main>      
                <a href="/pedidos">← Volver a pedidos</a>      
                <h1>Pedido #{pedido.id}</h1>      
                <p>        
                    Estado: <b>{pedido.estado}</b>        
                    {esAtrasado(pedido) && <b style={{ color: "#B42318" }}> · ATRASADO</b>}      
                </p>      
                {pedido.estado === "Cancelado" && (        
                    <p>Motivo de cancelación: {pedido.motivo_cancelacion}</p>      
                )}      
                
                <h2>Cliente</h2>      
                <p>        
                    {pedido.cliente?.nombre}        
                    <br />        
                    {pedido.cliente?.telefono} {pedido.cliente?.correo}      
                    </p>      
                    
                <h2>Fechas</h2>      
                <p>        
                    Creado: {String(pedido.fecha_creacion).slice(0, 10)}        
                    <br />        
                    Fecha compromiso: <b>{pedido.fecha_compromiso}</b>        
                    {pedido.fecha_compromiso_original !== pedido.fecha_compromiso && (          
                        <span> (original: {pedido.fecha_compromiso_original})</span>        
                    )}      
                    </p>      
                    
                    <h2>Prendas</h2>      
                    <ul>        
                        {prendas.map((p) => (          
                            <li key={p.id}>            
                                {p.piezas} × {p.producto?.tipo_prenda} {p.producto?.modelo}            
                                {p.opcion_personalizacion && (              
                                    <span>                
                                        {" "}                
                                        · {p.opcion_personalizacion.tipo}:{" "}                
                                        {p.opcion_personalizacion.descripcion}              
                                    </span>            
                                )}{" "}            
                                · Talla {p.talla || "-"} · Color {p.color || "-"} · ${p.precio_unitario} c/u          
                            </li>        
                        ))}      
                    </ul>      
                <p>        
                    <b>Total: ${calcularTotal(prendas).toFixed(2)}</b>      
                </p>
                <h2>Cambiar estado</h2>      
                <CambiarEstado pedido={pedido} alCambiar={cargar} />      
                
                {/* Francisca: aquí va <CancelarPedido /> */}      
                
                <h2>Historial</h2>      
                {historial.length === 0 ? (        
                    <p>Todavía no hay cambios de estado.</p>      
                ) : (        
                    <ul>          
                        {historial.map((c) => (            
                            <li key={c.id}>              
                                {new Date(c.fecha_hora).toLocaleString("es-MX")}: {c.estado_anterior} →{" "}              
                                {c.estado_nuevo}, por {c.usuario?.nombre || "?"}            
                            </li>          
                        ))}        
                    </ul>      
                    )}     
                    
                    {/* Achtli: aquí va <CambiarFecha /> */}    
                </main>  
            ); 
        }