"use client"; 

// Portada del Panel: nombre gigante, logo al centro, cinta con servicios y botones 
import { useEffect, useState } from "react"; 
import Link from "next/link"; 
import { Archivo_Black } from "next/font/google"; 
import { Plus, Shirt } from "lucide-react"; 
import { Button } from "@/components/ui/button"; 
import { LogoAlitachs } from "@/components/alitachs/logo-svg"; 
import { cn } from "@/lib/utils"; 
import "./portada.css"; 

const archivo = Archivo_Black({ weight: "400", subsets: ["latin"] }); 

const SERVICIOS = [ 
  "Confección", 
  "Costura", 
  "Uniformes", 
  "Chalecos", 
  "Bordado", 
  "Pedidos a la medida", 
]; 

export function Portada() { 
  // "" = esperando, "directo" = sin entrada del logo, "entrada" = el logo llegó volando 
  const [inicio, setInicio] = useState(""); 
  
  useEffect(() => { 
    // Si se está mostrando la entrada del logo, la portada espera a que termine 
    const alTerminarEntrada = () => setInicio("entrada"); 
    if (document.getElementById("entrada-logo")) { 
      window.addEventListener("alitachs:entrada-lista", alTerminarEntrada, { 
        once: true, 
      }); 
      return () => 
        window.removeEventListener("alitachs:entrada-lista", alTerminarEntrada); 
    } 
    setInicio("directo");
   }, []); 
   
   const cinta = [...SERVICIOS, ...SERVICIOS, ...SERVICIOS, ...SERVICIOS]; 
   
   return ( 
    <section className={cn( 
      "portada-alitachs @container relative overflow-hidden rounded-2xl", 
      "bg-[#0b1733] pt-5 pb-7 text-white", 
      inicio && "iniciada", 
      inicio === "entrada" && "desde-entrada", 
    )} 
  > 
    <div className="flex items-center justify-between px-5 text-xs text-white/80"> 
      <span className="rounded-full border border-white/35 px-3 py-1"> 
        Panel 
      </span> 
      <span>Confección y costura</span> 
    </div> 
    {/* Hilo verde que se cose detrás de las letras */}      
    <svg        
      className={cn(          
        "hilo-fondo pointer-events-none absolute inset-x-0 top-[30px] z-0",          
        "h-[calc(16.5cqw+50px)] w-full overflow-visible",        
      )}        
      viewBox="0 0 1000 220"        
      preserveAspectRatio="none"        
      aria-hidden="true"      
    >        
      <path          
        pathLength="1"          
        d={            
          "M-20 170 C 100 40, 200 210, 320 110 S 500 10, 590 120 " +            
          "S 740 230, 820 90 C 860 20, 960 30, 940 110 " +            
          "C 925 170, 990 190, 1030 140"          
        }        
      />      
    </svg>      
    <h1        
      className={cn(          
        archivo.className,          
        "relative z-[1] mt-7 flex justify-center text-[16.5cqw] leading-[0.9] tracking-[-0.04em]",        
      )}      
    >        
      {"ALITACHS".split("").map((letra, i) => (          
        <span            
          key={i}            
          className="letra"            
          style={{ animationDelay: i * 60 + "ms" }}          
        >            
          {letra}          
        </span>        
      ))}      
    </h1>      
    {/* Cinta inclinada con los servicios, se desliza sola */}      
    <div        
      className={cn(          
        "absolute top-[calc(48px+14.5cqw)] -left-[5%] z-[2] w-[110%]",          
        "-translate-y-1/2 -rotate-4 overflow-hidden bg-[#82ce61] text-[#0b1733]",        
      )}      
    >        
    <div          
      className={cn(            
        "marquesina flex w-max gap-7 py-[clamp(3px,0.6cqw,7px)]",            
        "text-[clamp(9px,1.25cqw,13px)] font-semibold tracking-wider uppercase",          
      )}        
    >          
      {cinta.map((s, i) => (            
        <span key={i}>{s} ✦</span>          
      ))}        
    </div>      
  </div>      
<div        
  id="logo-portada"        
  className={cn(          
    "logo absolute top-[calc(48px+7.5cqw)] left-1/2 z-[3] aspect-square",          
    "w-[clamp(70px,17cqw,170px)] -translate-x-1/2 -translate-y-1/2",        
  )}      
>        
  <LogoAlitachs          
    className={cn(            
      "size-full rounded-full ring-[5px] ring-[#0b1733] transition-transform",            
      "duration-300 hover:scale-110 hover:-rotate-6",          
    )}        
  />      
  </div>      
  <p        
    className="aparece mt-11 text-center text-[clamp(15px,2.4cqw,22px)]"        
    style={{ animationDelay: "0.5s" }}      
  >        
    Confección y costura{" "}        
    <b className="font-semibold text-[#82ce61]">a la medida</b>      
  </p>      
  <div        
    className="aparece mt-5 flex flex-wrap justify-center gap-2.5"        
    style={{ animationDelay: "0.7s" }}      
  >        
    <Button          
      asChild          
      size="lg"          
      className={cn(            
        "bg-[#82ce61] font-semibold text-[#0b1733] transition",            
        "hover:-translate-y-0.5 hover:bg-[#97da7a]",          
      )}        
    >          
      <Link href="/nuevo-pedido">            
        <Plus /> Nuevo pedido          
      </Link>        
    </Button>        
    <Button          
      asChild          
      size="lg"          
      variant="outline"          
      className={cn(            
        "border-white/40 bg-transparent font-semibold text-white transition",            
        "hover:-translate-y-0.5 hover:bg-white/10 hover:text-white",          
      )}        
    >          
      <Link href="/catalogo">            
        <Shirt /> Ver catálogo         
      </Link>        
    </Button>      
  </div>   
</section>  
); 
}