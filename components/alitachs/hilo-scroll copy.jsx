"use client";
// Scroll suave con Lenis y un hilo con aguja que baja por la derecha
// conforme se avanza en la página
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { cn } from "@/lib/utils";
import "./hilo-scroll.css";

// Dibuja un hilo ondulado de arriba a abajo, con una vuelta de vez en cuando
function trazarHilo(ancho, alto) {
  const c = ancho * 0.55;
  let d = `M${c} -10`;
  let y = -10;
  let lado = 1;

  for (let n = 0; y < alto + 40; n++) {
    const y2 = y + alto / 5;
    if (n % 3 === 1) {
      // Vuelta del hilo
      const a = c + lado * ancho * 0.45;
      const b = c - lado * ancho * 0.4;
      d += ` C${a} ${y + alto / 14}, ${b} ${y + alto / 9}, ${c} ${y + alto / 12}`;
      d += ` S${c + lado * ancho * 0.4} ${y + alto / 7}, ${c} ${y2}`;
    } else {
      // Onda normal
      const a = c + lado * ancho * 0.4;
      const b = c - lado * ancho * 0.4;
      d += ` C${a} ${y + alto / 15}, ${b} ${y2 - alto / 15}, ${c} ${y2}`;
    }
    y = y2;
    lado = -lado;
  }
  return d;
}

export function HiloScroll() {
  const lienzo = useRef(null);
  const revela = useRef(null);
  const aguja = useRef(null);
  const pathname = usePathname();

  // Scroll suave en todo el sitio
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, autoRaf: true, allowNestedScroll: true });
    return () => lenis.destroy();
  }, []);

  // El hilo se vuelve a calcular en cada página
  useEffect(() => {
    const svg = lienzo.current;
    const capas = svg.querySelectorAll(".hilo-capa");

    function mover() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const avance = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      revela.current.style.strokeDashoffset = 1 - avance;

      // La aguja va en la punta del hilo, inclinada según la curva
      const largo = revela.current.getTotalLength();
      const punta = revela.current.getPointAtLength(Math.max(avance * largo, 1));
      const atras = revela.current.getPointAtLength(Math.max(avance * largo - 4, 0));
      const caja = svg.getBoundingClientRect();
      const angulo = (Math.atan2(punta.y - atras.y, punta.x - atras.x) * 180) / Math.PI - 90;

      aguja.current.style.opacity = avance > 0.01 ? 1 : 0;
      const x = caja.left + punta.x - 6;
      const y = caja.top + punta.y - 5;
      aguja.current.style.transform = `translate(${x}px, ${y}px) rotate(${angulo}deg)`;
    }

    function dibujar() {
      const ancho = svg.clientWidth;
      const alto = svg.clientHeight;
      const d = trazarHilo(ancho, alto);
      svg.setAttribute("viewBox", `0 0 ${ancho} ${alto}`);
      revela.current.setAttribute("d", d);
      capas.forEach((c) => c.setAttribute("d", d));
      mover();
    }

    dibujar();
    window.addEventListener("scroll", mover, { passive: true });
    window.addEventListener("resize", dibujar);

    // Cuando cargan los datos de Supabase la página crece
    const observador = new ResizeObserver(mover);
    observador.observe(document.body);

    return () => {
      window.removeEventListener("scroll", mover);
      window.removeEventListener("resize", dibujar);
      observador.disconnect();
    };
  }, [pathname]);

  return (
    <>
      <svg
        ref={lienzo}
        className={cn(
          "hilo-scroll pointer-events-none fixed top-14 right-0 z-40 hidden",
          "h-[calc(100vh-3.5rem)] w-11 overflow-visible md:block"
        )}
        aria-hidden="true"
      >
        <defs>
          <mask
            id="hilo-revela"
            maskUnits="userSpaceOnUse"
            x="-50"
            y="-50"
            width="300"
            height="5000"
          >
            <path ref={revela} className="hilo-mascara" pathLength="1" />
          </mask>
        </defs>
        <g mask="url(#hilo-revela)">
          <path className="hilo-capa sombra" />
          <path className="hilo-capa base" />
          <path className="hilo-capa torsion" />
          <path className="hilo-capa brillo" />
        </g>
      </svg>

      <svg
        ref={aguja}
        viewBox="0 0 12 60"
        className={cn(
          "aguja-scroll pointer-events-none fixed top-0 left-0 z-40 hidden",
          "h-[60px] w-3 opacity-0 md:block"
        )}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="aguja-acero" x1="0" x2="1">
            <stop offset="0" stopColor="#6b7480" />
            <stop offset=".35" stopColor="#f5f7fa" />
            <stop offset=".6" stopColor="#aab2bd" />
            <stop offset="1" stopColor="#5b6470" />
          </linearGradient>
        </defs>
        <path
          d="M6 0.5 C8.6 0.5 9 4 8.6 9 L6.2 59.5 L5.8 59.5 L3.4 9 C3 4 3.4 0.5 6 0.5Z"
          fill="url(#aguja-acero)"
          stroke="#4b5360"
          strokeWidth=".4"
        />
        <path
          d="M6 2.2 C7 2.2 7.1 4 7 8 C6.9 9.6 5.1 9.6 5 8 C4.9 4 5 2.2 6 2.2Z"
          fill="#f0f0f0"
          stroke="#4b5360"
          strokeWidth=".4"
        />
      </svg>
    </>
  );
}