
"use client";
// Tela que tapa una sección: al llegar a ella, unas tijeras la cortan por en medio
// y las dos mitades se abren para mostrar el contenido

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import "./corte-tijeras.css";

// Una mitad de las tijeras: hoja de metal y mango verde
function MitadTijeras({ className, transform }) {
  return (
    <g className={className}>
      <g transform={transform}>
        <path
          d="M50 25.5 C72 25, 100 27, 117 30 C100 30.5, 72 31.5, 50 32.5 Z"
          fill="url(#tijeras-metal)"
        />
        <path
          d="M52 26 C74 25.6, 100 27.4, 116 29.6"
          stroke="#fff"
          strokeOpacity=".8"
          strokeWidth=".8"
          fill="none"
        />
        <path
          d="M53 28 C45 25, 39 21, 34 18"
          stroke="url(#tijeras-mango)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse
          cx="22"
          cy="13"
          rx="12"
          ry="8"
          fill="none"
          stroke="url(#tijeras-mango)"
          strokeWidth="6"
        />
        <ellipse
          cx="21"
          cy="11"
          rx="9"
          ry="5"
          fill="none"
          stroke="#fff"
          strokeOpacity=".25"
          strokeWidth="1.2"
        />
      </g>
    </g>
  );
}

function Tijeras() {
  return (
    <svg viewBox="0 0 120 60" className="size-full" aria-hidden="true">
      <defs>
        <linearGradient id="tijeras-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f6f9" />
          <stop offset=".45" stopColor="#b8c0cc" />
          <stop offset=".55" stopColor="#8a94a3" />
          <stop offset="1" stopColor="#dfe3ea" />
        </linearGradient>
        <linearGradient id="tijeras-mango" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9be07c" />
          <stop offset="1" stopColor="#3f8a24" />
        </linearGradient>
        <radialGradient id="tijeras-tornillo">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#7c8594" />
        </radialGradient>
      </defs>
      <MitadTijeras
        className="hoja-abajo"
        transform="matrix(1 0 0 -1 0 59)"
      />
      <MitadTijeras className="hoja-arriba" />
      <circle
        cx="55"
        cy="29.5"
        r="3.2"
        fill="url(#tijeras-tornillo)"
        stroke="#5b6475"
        strokeWidth=".6"
      />
    </svg>
  );
}

export function CorteTijeras({ titulo, className, children }) {
  const caja = useRef(null);
  const [cortando, setCortando] = useState(false);
  const [quitada, setQuitada] = useState(false);

  useEffect(() => {
    let observador;

    function vigilar() {
      observador = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setCortando(true);
            observador.disconnect();
          }
        },
        { rootMargin: "0px 0px -15% 0px" },
      );
      observador.observe(caja.current);
    }

    // Si se está mostrando la entrada del logo, espera a que termine
    if (document.getElementById("entrada-logo")) {
      window.addEventListener("alitachs:entrada-lista", vigilar, {
        once: true,
      });
    } else {
      vigilar();
    }

    return () => {
      window.removeEventListener("alitachs:entrada-lista", vigilar);
      observador?.disconnect();
    };
  }, []);

  // Al terminar de abrirse, la tela se quita
  useEffect(() => {
    if (!cortando) return;
    const t = setTimeout(() => setQuitada(true), 2300);
    return () => clearTimeout(t);
  }, [cortando]);

  return (
    <div ref={caja} className={cn("relative", className)}>
      {children}

      {!quitada && (
        <div
          aria-hidden="true"
          className={cn(
            "tela pointer-events-none absolute -inset-2 z-10 overflow-hidden rounded-2xl",
            cortando && "cortando",
          )}
        >
          <div className="mitad mitad-arriba absolute inset-0 rounded-2xl">
            <span className="absolute top-5 left-6 text-xl font-bold tracking-tight text-white/90">
              {titulo}
            </span>
          </div>
          <div className="mitad mitad-abajo absolute inset-0 rounded-2xl" />
          <span
            className={cn(
              "guia absolute inset-x-3.5 top-1/2 border-t-2 border-dashed",
              "border-white/60",
            )}
          />
          <span className="abertura absolute top-[calc(50%-2px)] left-0 h-1 w-0 bg-background" />
          <span
            className={cn(
              "tijeras absolute top-1/2 -left-12 z-[2] h-12 w-24 -translate-y-1/2",
              "opacity-0",
            )}
          >
            <Tijeras />
          </span>
        </div>
      )}
    </div>
  );
}
