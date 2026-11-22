// Piezas de interfaz que se repiten en varias pantallas

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// Encabezado de página estilo cuaderno:
// (etiqueta) a mano, título con marcatextos verde y descripción en tinta azul
export function EncabezadoPagina({ etiqueta, titulo, descripcion, children }) {
    return (
        <div className="encabezado-hoja flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
                {etiqueta && <span className="nota-etiqueta">({etiqueta})</span>}
                <h1 className="titulo-hoja">{titulo}</h1>
                {descripcion && <p className="nota-desc">{descripcion}</p>}
            </div>
            {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
        </div>
    );
}

// Título de sección numerado, como nota a mano: "(01) Filtrar"
export function Seccion({ numero, children }) {
    return (
        <div className="seccion-nota">
            ({String(numero).padStart(2, "0")}) {children}
        </div>
    );
}

// Tarjeta grande que cambia de color al pasar el mouse (Panel y acciones del Detalle)
export function Acceso({
    href,
    onClick,
    numero,
    icono: Icono,
    titulo,
    texto,
    principal,
    peligro,
    elegida,
    disabled,
}) {
    const clases = cn(
        "acceso",
        principal && "principal",
        peligro && "peligro",
        elegida && "elegida",
    );
    const contenido = (
        <>
            <span className="n">
                {numero}
                {Icono && <Icono />}
            </span>
            <b>{titulo}</b>
            {texto && <small>{texto}</small>}
            <span className="flecha" aria-hidden="true">→</span>
        </>
    );
    if (href) {
        return (
            <Link href={href} className={clases}>
                {contenido}
            </Link>
        );
    }
    return (
        <button type="button" onClick={onClick} disabled={disabled} aria-pressed={elegida} className={clases}>
            {contenido}
        </button>
    );
}

// Contenedor de cada pantalla
export function Pagina({ children, className }) {
    return (
        <main className={cn("mx-auto flex w-full max-w-7xl flex-col gap-9 p-4 md:p-8", className)}>
            {children}
        </main>
    );
}

const CLASE_ESTADO = {
    Pendiente: "e-pendiente",
    "En proceso": "e-proceso",
    Entregado: "e-entregado",
    Cancelado: "e-cancelado",
};

// Insignia del estado del pedido: botón de tela cosido
export function EstadoBadge({ estado }) {
    return <span className={cn("estado-cosido", CLASE_ESTADO[estado])}>{estado}</span>;
}

export function AtrasadoBadge() {
    return <span className="estado-cosido e-atrasado">Atrasado</span>;
}

// Indicador como etiqueta colgante de prenda.
// Con href lleva a otra pantalla (ej. /pedidos?estado=Pendiente); sin href solo informa.
export function Kpi({ etiqueta, valor, nota, tono, href, onClick, activo }) {
    const contenido = (
        <>
            <span className="cuerda" aria-hidden="true" />
            <div
                className={cn(
                    "kpi-etiqueta",
                    tono === "rojo" && "rojo",
                    tono === "verde" && "verde",
                    activo && "activo",
                )}
            >
                <p className="et">{etiqueta}</p>
                <p className="val">{valor}</p>
                {nota && <p className="nota">{nota}</p>}
                {href && <span className="ir">Ver pedidos →</span>}
            </div>
        </>
    );
    if (href) {
        return (
            <Link href={href} className="colgante" aria-label={"Ver pedidos: " + etiqueta}>
                {contenido}
            </Link>
        );
    }
    if (onClick) {
        return (
            <button type="button" onClick={onClick} className="colgante">
                {contenido}
            </button>
        );
    }
    return <div className="colgante">{contenido}</div>;
}

// Lista de errores de validación o de Supabase
export function ListaErrores({ errores }) {
    if (!errores || errores.length === 0) return null;
    return (
        <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>
                {errores.length === 1
                    ? "Revisa lo siguiente"
                    : "Revisa lo siguiente (" + errores.length + ")"}
            </AlertTitle>
            <AlertDescription>
                <ul className="list-disc pl-4">
                    {errores.map((e) => (
                        <li key={e}>{e}</li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
}

// Formato de dinero en pesos
export function dinero(valor) {
    return Number(valor || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

// Fecha "2026-11-29" a "29 nov 2026" sin problemas de zona horaria
// Si trae hora (ej. fecha_creacion), se convierte a la hora local antes de mostrarla
export function fechaCorta(texto) {
    if (!texto) return "-";
    const cadena = String(texto);
    let fecha;
    if (cadena.length > 10) {
        fecha = new Date(cadena);
    } else {
        const [a, m, d] = cadena.split("-").map(Number);
        fecha = new Date(a, m - 1, d);
    }
    if (isNaN(fecha)) return "-";
    return fecha.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}