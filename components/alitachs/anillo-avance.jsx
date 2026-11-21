"use client";
// Anillo que se llena según la etapa del pedido (Progress Ring).
// Si el pedido está atrasado se pinta de rojo (atrasado no es estado, se calcula: RC-01)
import { useEffect, useRef, useState } from "react";

export function AnilloAvance({ paso, total, atrasado }) {
    const meta = total > 0 ? paso / total : 0;
    const [avance, setAvance] = useState(0);
    const caja = useRef(null);

    // Empieza vacío y se llena cuando el anillo aparece en pantalla
    useEffect(() => {
        const vigia = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) setAvance(meta);
        }, { threshold: 0.6 });
        vigia.observe(caja.current);
        return () => vigia.disconnect();
    }, [meta]);

    const completo = meta === 1;

    return (
        <div ref={caja} className="relative size-20 shrink-0">
            <svg viewBox="0 0 80 80" className="size-full -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="7" className="text-muted" />
                <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    strokeWidth="7"
                    strokeLinecap="round"
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset={1 - avance}
                    stroke={completo ? "#3f9a2b" : atrasado ? "#dc2626" : "#3A5F9A"}
                    style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.65, 0, 0.35, 1)" }}
                />
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="text-lg font-semibold tabular-nums">{Math.round(meta * 100)}%</span>
                {atrasado && !completo ? (
                    <span className="mt-0.5 text-[10px] font-semibold text-red-600">Atrasado</span>
                ) : (
                    <span className="mt-0.5 text-[10px] text-muted-foreground">
                        {paso} de {total}
                    </span>
                )}
            </span>
        </div>
    );
}