"use client"; 
// Número que da un saltito cuando sube (como el carrito al agregar algo) 
import { useEffect, useRef, useState } from "react"; 
import { cn } from "@/lib/utils"; 
import "./numero-salta.css"; 

export function NumeroSalta({ valor, className }) {  
    const anterior = useRef(valor);  
    const [salto, setSalto] = useState(0);  
    
    useEffect(() => {    
        if (valor > anterior.current) setSalto((s) => s + 1);    
        anterior.current = valor;  
    }, [valor]);  
    
    return (    
        <span key={salto} className={cn("inline-block tabular-nums", salto > 0 && "numero-salta", className)}>      
            {valor}    
        </span>  
    ); 
}