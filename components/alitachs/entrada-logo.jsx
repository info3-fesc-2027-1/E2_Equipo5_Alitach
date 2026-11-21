"use client";
// Entrada del logo: se dibuja el sello, se clava la aguja, se cose el hilo
// y al final el logo "vuela# a su lugar en la portada del Panel ^^

import { useEffect, useRef, useState } from "react";
import { Abril_Fatface, Cormorant_Garamond, Playfair_Display } from "next/font/google";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "./entrada-logo.css";

const abril = Abril_Fatface({ weight: "400", subsets: ["latin"] });
const playfair = Playfair_Display({ weight: "700", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({ weight: "500", subsets: ["latin"] });

// Cada letra aparece un poco después de la anterior
function Letras({ texto, inicio, paso }) {
    return texto.split("").map((letra, i) => (
        <tspan key={i} className="e-letra" style={{ animationDelay: inicio + i * paso + "s" }}>
            {letra}
        </tspan>
    ));
}

export function EntradaLogo() {
    const [visible, setVisible] = useState(true);
    const [saliendo, setSaliendo] = useState(false);
    const sello = useRef(null);
    const terminar = useRef(() => { });

    useEffect(() => {
        // Avisa a la portada (y a las demás animaciones) que ya pueden empezar
        const avisar = () => window.dispatchEvent(new Event("alitachs:entrada-lista"));

        // Solo se muestra una vez por pestaña
        if (sessionStorage.getItem("entrada-vista")) {
            avisar();
            setVisible(false);
            return;
        }

        document.body.style.overflow = "hidden";
        let listo = false;

        terminar.current = () => {
            if (listo) return;
            listo = true;
            sessionStorage.setItem("entrada-vista", "si");

            // El logo se encoge y vuela al lugar del logo de la portada (si existe)
            const destino = document.getElementById("logo-portada");
            if (destino && sello.current) {
                const r = sello.current.getBoundingClientRect();
                const d = destino.getBoundingClientRect();
                const tam = destino.offsetWidth;
                const x = d.left + d.width / 2 - tam / 2 - r.left;
                const y = d.top + d.height / 2 - tam / 2 - r.top;
                sello.current.style.transform = `translate(${x}px, ${y}px) scale(${tam / r.width})`;
            }
            setSaliendo(true);

            setTimeout(() => {
                document.body.style.overflow = "";
                avisar();
                setVisible(false);
            }, 1000);
        };

        const tiempo = setTimeout(() => terminar.current(), 6000);
        return () => {
            clearTimeout(tiempo);
            document.body.style.overflow = "";
        };
    }, []);

    if (!visible) return null;

    return (
        <div
            id="entrada-logo"
            className={cn(
                "fixed inset-0 z-[100] flex items-center justify-center bg-[#F0F0F0]",
                "transition-colors duration-900",
                saliendo && "bg-transparent",
            )}
        >
            <svg
                ref={sello}
                viewBox="300 300 1000 1000"
                className="e-sello block h-auto w-[min(440px,80vw,70vh)] origin-top-left"
                role="img"
                aria-label="Alitachs, confección y costura"
            >
                <defs>
                    <path id="entrada-arco-arriba" d="M 410 800 A 390 390 0 0 1 1190 800" />
                    <path id="entrada-arco-abajo" d="M 360 800 A 440 440 0 0 0 1240 800" />
                </defs>
                <circle className={cn("e-fondo", saliendo && "opacity-100")} cx="800" cy="800" r="498" />
                <circle
                    className="e-circulo e-c1"
                    cx="800"
                    cy="800"
                    r="467"
                    pathLength="1"
                    transform="rotate(-90 800 800)"
                />
                <circle
                    className="e-circulo e-c2"
                    cx="800"
                    cy="800"
                    r="365"
                    pathLength="1"
                    transform="rotate(-90 800 800)"
                />
                <text fontFamily={abril.style.fontFamily} fontSize="74" fill="#3A5F9A" letterSpacing="34">
                    <textPath href="#entrada-arco-arriba" startOffset="50%" textAnchor="middle">
                        <Letras texto="ALITACHS" inicio={1} paso={0.11} />
                    </textPath>
                </text>
                <path
                    className="e-hilo"
                    pathLength="1"
                    d={
                        "M 483 632 C 500 662, 535 668, 560 640 C 590 606, 640 576, 690 600 " +
                        "C 760 640, 820 760, 870 815 C 920 845, 990 830, 1015 770 " +
                        "C 1050 680, 1035 560, 975 553 C 915 548, 915 640, 950 700 " +
                        "C 985 765, 1040 852, 1115 840"
                    }
                />
                <g
                    className="e-monograma"
                    fontFamily={playfair.style.fontFamily}
                    fontWeight="700"
                    fill="#3A5F9A"
                >
                    <text x="728" y="862" fontSize="440" textAnchor="middle">
                        A
                    </text>
                    <text x="905" y="965" fontSize="430" textAnchor="middle">
                        L
                    </text>
                </g>
                <g className="e-aguja">
                    <path d="M 737 1083 L 525.5 614 A 9.5 9.5 0 0 1 543 606.5 Z" fill="#071733" />
                    <path d="M 540 622 L 561 671" stroke="#F0F0F0" strokeWidth="5" strokeLinecap="round" />
                </g>
                <path
                    className="e-hilo-ojo"
                    d="M 536 662 C 548 660, 556 650, 560 640 C 566 630, 572 624, 578 620"
                />
                <text
                    fontFamily={cormorant.style.fontFamily}
                    fontWeight="500"
                    fontSize="84"
                    fill="#3A5F9A"
                    letterSpacing="9"
                >
                    <textPath href="#entrada-arco-abajo" startOffset="50%" textAnchor="middle">
                        <Letras texto="CONFECCIÓN Y COSTURA" inicio={4.1} paso={0.04} />
                    </textPath>
                </text>
            </svg>

            <Button
                variant="outline"
                size="sm"
                onClick={() => terminar.current()}
                className={cn(
                    "absolute right-5 bottom-5 rounded-full border-[#386098] bg-transparent",
                    "text-[#386098] hover:bg-[#386098] hover:text-white",
                    saliendo && "opacity-0",
                )}
            >
                Saltar
            </Button>
        </div>
    );
}