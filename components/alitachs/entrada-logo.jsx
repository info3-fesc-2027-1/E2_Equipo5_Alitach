"use client";
// Entrada del sistema con una línea de tiempo de GSAP:
// 1) se dibuja el sello del logo (círculos, letras, «AL», aguja e hilo verde)
// 2) el sello se desvanece
// 3) aparece la portada «Taller Alitachs» con los objetos de costura en 3D (Three.js)
// Al picar «Entrar al sistema» las letras suben, los objetos se alejan y se descubre el Panel.
// Solo se muestra una vez por pestaña.

import { useEffect, useRef, useState } from "react";
import { Abril_Fatface, Caveat, Cormorant_Garamond, Playfair_Display } from "next/font/google";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { iniciarCostura } from "./costura3d";
import "./entrada-logo.css";

gsap.registerPlugin(SplitText, DrawSVGPlugin);

const abril = Abril_Fatface({ weight: "400", subsets: ["latin"] });
const playfair = Playfair_Display({ weight: "700", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({ weight: "500", subsets: ["latin"] });
// Portada: títulos de figurín y nota a mano
const figurin = Playfair_Display({ weight: "800", style: "italic", subsets: ["latin"] });
const mano = Caveat({ weight: "700", subsets: ["latin"] });

const PRENDAS = ["Uniformes", "Chamarras", "Chalecos", "Bordado", "Serigrafía"];

// Cada letra del sello va en su propio <tspan> para aparecer una por una
function Letras({ texto }) {
    return texto.split("").map((letra, i) => (
        <tspan key={i} className="e-letra">
            {letra}
        </tspan>
    ));
}

// Si el navegador bloquea sessionStorage, la entrada se muestra y el sistema sigue funcionando
function leerVista() {
    try {
        return sessionStorage.getItem("entrada-vista");
    } catch {
        return null;
    }
}

function guardarVista() {
    try {
        sessionStorage.setItem("entrada-vista", "si");
    } catch {
        // Sin sessionStorage solo se vuelve a ver la entrada al recargar
    }
}

export function EntradaLogo() {
    // "decidiendo": todavía no sabemos si ya se vio (cubre la pantalla sin contenido)
    // "mostrando": corre la animación · "oculta": ya no se pinta nada
    const [fase, setFase] = useState("decidiendo");
    const raiz = useRef(null);
    const tela = useRef(null);
    const acciones = useRef({ saltar: () => {}, entrar: () => {} });

    // ¿Ya se vio la entrada en esta pestaña?
    useEffect(() => {
        if (leerVista()) {
            window.dispatchEvent(new Event("alitachs:entrada-lista"));
            setFase("oculta");
        } else {
            setFase("mostrando");
        }
    }, []);

    // La animación completa
    useEffect(() => {
        if (fase !== "mostrando") return;
        document.body.style.overflow = "hidden";
        let quitarTela = null;
        let ctx = null;
        let cancelado = false;

        let cerrada = false;
        let respaldo = null;
        function cerrar() {
            if (cerrada) return;
            cerrada = true;
            clearTimeout(respaldo);
            guardarVista();
            document.body.style.overflow = "";
            window.dispatchEvent(new Event("alitachs:entrada-lista"));
            setFase("oculta");
        }

        // Espera a que carguen las letras para que no brinquen al animarse
        document.fonts.ready.then(() => {
            if (cancelado) return;
            ctx = gsap.context(() => {
                // Por palabras y sin máscara: así las letras inclinadas nunca se recortan
                const titulo = SplitText.create(".titulo", { type: "words" });
                const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

                // ---------- 1) El sello del logo ----------
                tl.set(".paso-logo", { autoAlpha: 1 })
                    .from(".e-c1", { drawSVG: 0, duration: 1.3, ease: "power2.inOut" }, 0.3)
                    .from(".e-c2", { drawSVG: 0, duration: 1.3, ease: "power2.inOut" }, 0.55)
                    .from(
                        ".letras-arriba .e-letra",
                        { opacity: 0, duration: 0.35, stagger: 0.11 },
                        1,
                    )
                    .from(".e-monograma", { opacity: 0, y: 24, duration: 1 }, 1.9)
                    .from(
                        ".e-aguja",
                        { opacity: 0, x: -150, y: -350, duration: 0.9, ease: "back.out(1.3)" },
                        2.5,
                    )
                    .from(".e-hilo", { drawSVG: 0, duration: 2, ease: "power2.inOut" }, 3.25)
                    .from(".e-hilo-ojo", { opacity: 0, duration: 0.2 }, 3.4)
                    .from(
                        ".letras-abajo .e-letra",
                        { opacity: 0, duration: 0.35, stagger: 0.04 },
                        4.1,
                    )

                    // ---------- 2) Se va el sello ----------
                    .addLabel("portada", "+=0.8")
                    .to(
                        ".paso-logo",
                        { autoAlpha: 0, scale: 0.96, duration: 0.6, ease: "power2.in" },
                        "portada",
                    )
                    .set(".saltar", { display: "none" })

                    // ---------- 3) Portada con los objetos 3D ----------
                    .set(".revista", { autoAlpha: 1 })
                    .call(() => {
                        if (!quitarTela && tela.current) quitarTela = iniciarCostura(tela.current);
                    })
                    .from(".cabeza > *", { y: -12, autoAlpha: 0, duration: 0.6, stagger: 0.08 })
                    .from(
                        titulo.words,
                        {
                            yPercent: 45,
                            autoAlpha: 0,
                            duration: 1.2,
                            stagger: 0.18,
                            ease: "expo.out",
                        },
                        "<",
                    )
                    .from(
                        ".tela",
                        { autoAlpha: 0, y: 40, scale: 0.92, duration: 1.4, ease: "expo.out" },
                        "<0.2",
                    )
                    .from(
                        ".nota-mano",
                        {
                            autoAlpha: 0,
                            y: 12,
                            rotation: -10,
                            duration: 0.8,
                            ease: "back.out(1.8)",
                        },
                        "<0.5",
                    )
                    .from(
                        ".texto > *",
                        { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.12 },
                        "<0.1",
                    )
                    .from(".pie > *", { autoAlpha: 0, duration: 0.6, stagger: 0.1 }, "<0.2");

                // Saltar: brinca directo a la portada
                acciones.current.saltar = () => tl.seek("portada", false);

                // Entrar: las letras se van hacia arriba, los objetos se alejan y aparece el Panel
                let saliendo = false;
                acciones.current.entrar = () => {
                    if (saliendo) return; // por si pican dos veces
                    saliendo = true;
                    tl.progress(1); // si la portada aún se está armando, la termina antes de irse
                    // Respaldo: en computadoras lentas la animación puede tardar; a los 2.5 s se cierra de todos modos
                    respaldo = setTimeout(cerrar, 2500);
                    gsap.timeline({ onComplete: cerrar })
                        .to(titulo.words, {
                            yPercent: -40,
                            autoAlpha: 0,
                            duration: 0.5,
                            stagger: 0.08,
                            ease: "power2.in",
                        })
                        .to(
                            ".tela",
                            { autoAlpha: 0, scale: 0.9, y: -30, duration: 0.6, ease: "power2.in" },
                            "<",
                        )
                        .to(
                            ".cabeza, .texto, .pie, .nota-mano",
                            { autoAlpha: 0, duration: 0.4 },
                            "<",
                        )
                        .to(raiz.current, { autoAlpha: 0, duration: 0.6 }, "-=0.15");
                };

                // Accesibilidad: si el usuario activó «Reducir movimiento», se muestra la portada sin animación
                if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
                    tl.progress(1, false);
            }, raiz);
        });

        return () => {
            cancelado = true;
            clearTimeout(respaldo);
            quitarTela?.();
            ctx?.revert();
            document.body.style.overflow = "";
        };
    }, [fase]);

    if (fase === "oculta") return null;

    return (
        <div
            id="entrada"
            ref={raiz}
            style={{
                "--entrada-titulo": figurin.style.fontFamily,
                "--entrada-mano": mano.style.fontFamily,
            }}
        >
            {fase === "mostrando" && (
                <>
                    <div className="paso-logo">
                        <svg
                            className="e-sello"
                            viewBox="300 300 1000 1000"
                            role="img"
                            aria-label="Alitachs, confección y costura"
                        >
                            <defs>
                                <path
                                    id="entrada-arco-arriba"
                                    d="M 410 800 A 390 390 0 0 1 1190 800"
                                />
                                <path
                                    id="entrada-arco-abajo"
                                    d="M 360 800 A 440 440 0 0 0 1240 800"
                                />
                            </defs>
                            <circle
                                className="e-circulo e-c1"
                                cx="800"
                                cy="800"
                                r="467"
                                transform="rotate(-90 800 800)"
                            />
                            <circle
                                className="e-circulo e-c2"
                                cx="800"
                                cy="800"
                                r="365"
                                transform="rotate(-90 800 800)"
                            />
                            <text
                                fontFamily={abril.style.fontFamily}
                                fontSize="74"
                                fill="#3A5F9A"
                                letterSpacing="34"
                            >
                                <textPath
                                    href="#entrada-arco-arriba"
                                    startOffset="50%"
                                    textAnchor="middle"
                                    className="letras-arriba"
                                >
                                    <Letras texto="ALITACHS" />
                                </textPath>
                            </text>
                            <path
                                className="e-hilo"
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
                                <path
                                    d="M 737 1083 L 525.5 614 A 9.5 9.5 0 0 1 543 606.5 Z"
                                    fill="#071733"
                                />
                                <path
                                    d="M 540 622 L 561 671"
                                    stroke="#F0F0F0"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                />
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
                                <textPath
                                    href="#entrada-arco-abajo"
                                    startOffset="50%"
                                    textAnchor="middle"
                                    className="letras-abajo"
                                >
                                    <Letras texto="CONFECCIÓN Y COSTURA" />
                                </textPath>
                            </text>
                        </svg>
                        <button
                            type="button"
                            className="saltar"
                            onClick={() => acciones.current.saltar()}
                        >
                            Saltar
                        </button>
                    </div>

                    <div className="revista">
                        <header className="cabeza">
                            <span className="pills">
                                {PRENDAS.map((p) => (
                                    <span key={p} className="pill">
                                        {p}
                                    </span>
                                ))}
                            </span>
                        </header>

                        <main className="cuerpo">
                            <div className="izq">
                                <h1 className="titulo">
                                    <span className="ln">Taller</span>{" "}
                                    <span className="ln">Alitachs</span>
                                </h1>
                                <div className="texto">
                                    <p className="lema-sistema">
                                        Registro de clientes y pedidos del taller.
                                    </p>
                                    <button
                                        type="button"
                                        className="entrar"
                                        onClick={() => acciones.current.entrar()}
                                    >
                                        Entrar al sistema <span className="flecha">→</span>
                                    </button>
                                </div>
                            </div>
                            <div className="der">
                                <div
                                    ref={tela}
                                    className="tela"
                                    aria-label="Carretes, botones, agujas, tijeras y cinta métrica en 3D"
                                />
                                <p className="nota-mano">
                                    (Confección y costura
                                    <br />a la medida)
                                </p>
                            </div>
                        </main>

                        <footer className="pie">
                            <span>(Sistema de pedidos)</span>
                            <span className="punto">Equipo ASKI</span>
                        </footer>
                    </div>
                </>
            )}
        </div>
    );
}
