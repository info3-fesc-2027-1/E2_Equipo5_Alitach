// Piezas de interfaz que se repiten en varias pantallas

import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Encabezado de página: título, descripción y acciones a la derecha
export function EncabezadoPagina({ titulo, descripcion, children }) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
                {descripcion && <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>}
            </div>
            {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
        </div>
    );
}

// Contenedor de cada pantalla
export function Pagina({ children, className }) {
    return (
        <main className={cn("mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8", className)}>
            {children}
        </main>
    );
}

const COLORES_ESTADO = {
    Pendiente: "bg-amber-100 text-amber-800 border-amber-200",
    "En proceso": "bg-blue-100 text-blue-800 border-blue-200",
    Entregado: "bg-green-100 text-green-800 border-green-200",
    Cancelado: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

// Insignia de color según el estado del pedido
export function EstadoBadge({ estado }) {
    return (
        <Badge
            variant="outline"
            className={cn("rounded-full font-medium", COLORES_ESTADO[estado])}
        >
            {estado}
        </Badge>
    );
}

export function AtrasadoBadge() {
    return (
        <Badge
            variant="outline"
            className="rounded-full border-red-200 bg-red-100 font-medium text-red-700"
        >
            Atrasado
        </Badge>
    );
}

// Tarjeta de indicador: número grande con su etiqueta
export function Kpi({ etiqueta, valor, nota, tono, onClick, activo }) {
    return (
        <Card
            onClick={onClick}
            className={cn(
                 "gap-0 border-2 border-dashed border-primary/25 py-0 shadow-none",
                 "transition hover:-translate-y-1 hover:border-primary/60",
                onClick && "cursor-pointer transition-colors hover:border-primary/40",
                activo && "border-primary ring-1 ring-primary",
            )}
        >
            <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{etiqueta}</p>
                <p
                    className={cn(
                        "mt-1 text-2xl font-semibold tabular-nums",
                        tono === "rojo" && "text-red-600",
                    )}
                >
                    {valor}
                </p>
                {nota && <p className="mt-1 text-xs text-muted-foreground">{nota}</p>}
            </CardContent>
        </Card>
    );
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
export function fechaCorta(texto) {
    if (!texto) return "-";
    const [a, m, d] = String(texto).slice(0, 10).split("-").map(Number);
    return new Date(a, m - 1, d).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}