
"use client";

// Filtro de estados con una pastilla que se desliza a la opción elegida (Segmented Control)
// Cada opción muestra cuántos pedidos tiene

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function FiltroEstados({ opciones, valor, alCambiar }) {
  const caja = useRef(null);
  const [pastilla, setPastilla] = useState({ left: 0, width: 0 });

  // Mide el botón elegido para mover la pastilla a su lugar
  useEffect(() => {
    function medir() {
      const boton = caja.current.querySelector(`[data-valor="${valor}"]`);
      if (boton) setPastilla({ left: boton.offsetLeft, width: boton.offsetWidth });
    }

    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [valor]);

  return (
    <div className="max-w-full overflow-x-auto">
      <div ref={caja} className="relative flex w-max rounded-full bg-muted p-1">
        <span
          className="absolute top-1 bottom-1 rounded-full bg-[#0b1733] shadow transition-all duration-300 ease-out"
          style={{ left: pastilla.left, width: pastilla.width }}
        />

        {opciones.map((o) => (
          <button
            key={o.valor}
            type="button"
            data-valor={o.valor}
            onClick={() => alCambiar(o.valor)}
            className={cn(
              "relative z-[1] rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-300",
              o.valor === valor
                ? "text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.texto}
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 text-xs tabular-nums",
                o.valor === valor ? "bg-white/20" : "bg-background",
              )}
            >
              {o.cantidad}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
