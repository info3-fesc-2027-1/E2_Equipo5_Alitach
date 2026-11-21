"use client"; 
// Lleva la cuenta para las animaciones de los formularios: 
// "intentos" sube cada vez que falla la validación (para que tiemble) 
// y "listo" se prende 1.8 s cuando se guardó bien (para la palomita) 

import { useState } from "react"; 

export function useEnvio() {  
    const [intentos, setIntentos] = useState(0);  
    const [listo, setListo] = useState(false);  
    
    return {    
        intentos,    
        listo,    
        fallo: () => setIntentos((n) => n + 1),    
        exito: () => {      
            setListo(true);      
            setTimeout(() => setListo(false), 1800);    
        },  
    }; 
}