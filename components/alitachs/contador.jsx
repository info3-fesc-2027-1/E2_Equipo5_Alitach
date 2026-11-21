"use client"; 
// Botones − y + para cambiar las piezas (Number Stepper) 

import { useRef } from "react"; 
import { Minus, Plus } from "lucide-react"; 
import { Button } from "@/components/ui/button"; 
import "./contador.css"; 

export function Contador({ valor, alCambiar, min = 1 }) {  
    const numero = useRef(null);  
    
    function cambiar(nuevo) {    
        if (nuevo < min) return;    
        // Reinicia la animación: entra desde abajo si subió, desde arriba si bajó    
        const el = numero.current;    
        el.classList.remove("sube", "baja");    
        void el.offsetWidth;    
        el.classList.add(nuevo > valor ? "sube" : "baja");   
        alCambiar(nuevo);  
    }  
    
    return (    
        <div className="flex h-9 items-center justify-between rounded-md border bg-card">      
            <Button        
                type="button" 
                variant="ghost"        
                size="icon"        
                className="size-9 active:scale-90"        
                onClick={() => cambiar(valor - 1)}        
                disabled={valor <= min}        
                aria-label="Quitar una pieza"     
            >        
                <Minus />      
            </Button>      
            <input        
                ref={numero}        
                type="number"        
                min={min}        
                value={valor}        
                onChange={(e) => alCambiar(Number(e.target.value))}        
                className="contador-numero w-12 bg-transparent text-center text-sm font-semibold tabular-nums outline-none"        
                aria-label="Piezas"      
            />      
            <Button        
                type="button"        
                variant="ghost"        
                size="icon"        
                className="size-9 text-[#3f9a2b] active:scale-90"        
                onClick={() => cambiar(valor + 1)}        
                aria-label="Agregar una pieza"      
            >        
                <Plus />      
            </Button>    
        </div>  
    ); 
}