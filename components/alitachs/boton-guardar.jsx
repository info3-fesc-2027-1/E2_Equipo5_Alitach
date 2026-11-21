"use client"; 

// Botón que gira mientras guarda y luego se vuelve una palomita verde (Loading to Success) 

import { Loader2 } from "lucide-react"; 
import { Button } from "@/components/ui/button"; 
import { cn } from "@/lib/utils"; 
import "./boton-guardar.css"; 

export function BotonGuardar({  
    guardando,  
    listo,  
    children,  
    className,  
    variant,  
    type = "submit",  
    onClick,  
    textoGuardando = "Guardando...", 
}) {  
    return (    
        <Button      
            type={type}      
            onClick={onClick}      
            variant={listo ? "default" : variant}      
            disabled={guardando || listo}      
            className={cn(        
                "boton-guardar relative transition-colors duration-300",        
                listo && "bg-[#3f9a2b] text-white disabled:opacity-100",        
                className,      
            )}    
        >      
        {guardando && <Loader2 className="animate-spin" />}      
        {listo ? (        
            <>          
                <svg viewBox="0 0 24 24" className="palomita size-5" aria-hidden="true">            
                    <path d="M5 12.5 L10 17.5 L19 7" pathLength="1" />          
                </svg>          
                ¡Listo!        
            </>      
        ) : guardando ? (        
            textoGuardando      
        ) : (        
            children      
        )}    
    </Button>  
); 
}