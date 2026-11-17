"use client";

// Cambiar la fecha compromiso (RF6): la fecha original se conserva

import { useState } from "react";
import { toast } from "sonner";
import { cambiarFechaCompromiso } from "../../../lib/datos";
import { puedeModificarFecha } from "../../../lib/logica";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListaErrores } from "@/components/comunes";

export default function CambiarFecha({ pedido, alCambiar }) {
    const [nuevaFecha, setNuevaFecha] = useState("");
    const [errores, setErrores] = useState([]);
    const [guardando, setGuardando] = useState(false);

    // Revisa RN-03 y RN-04 y, si se puede, guarda la nueva fecha
    async function cambiar(e) {
        e.preventDefault();

        const resultado = puedeModificarFecha(pedido, nuevaFecha);
        setErrores(resultado.errores);

        if (!resultado.valido) {
            return;
        }

        setGuardando(true);
        try {
            await cambiarFechaCompromiso(pedido.id, nuevaFecha);
            setNuevaFecha("");
            toast.success("Fecha cambiada. La fecha original se conserva.");
            await alCambiar();
        } catch (error) {
            setErrores(["Error al cambiar la fecha: " + error.message]);
        } finally {
            setGuardando(false);
        }
    }

    if (pedido.estado === "Entregado" || pedido.estado === "Cancelado") {
        return (
            <p className="text-sm text-muted-foreground">
                Solo se cambia la fecha de un pedido Pendiente o En proceso.
            </p>
        );
    }

    return (
        <form onSubmit={cambiar} className="space-y-3">
            <div className="grid gap-1.5">
                <Label htmlFor="nueva-fecha">Nueva fecha compromiso</Label>
                <Input
                    id="nueva-fecha"
                    type="date"
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                />
            </div>

            <Button type="submit" variant="outline" className="w-full" disabled={guardando}>
                {guardando ? "Guardando..." : "Cambiar fecha"}
            </Button>

            <ListaErrores errores={errores} />
        </form>
    );
}