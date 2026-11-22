"use client"; 
// Hace temblar lo que tenga adentro cada vez que cambia "veces" (Error Shake) 

import "./sacudir.css"; 

export function Sacudir({ veces, children, className }) {  
    // Al cambiar la key, React vuelve a crear el div y la animación se repite  
    return (    
        <div key={veces} className={veces > 0 ? "sacudir " + (className || "") : className}>      
            {children}    
        </div>  
    ); 
}