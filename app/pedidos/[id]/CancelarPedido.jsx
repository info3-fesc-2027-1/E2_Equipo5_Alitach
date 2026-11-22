"use client";
// Cancelar un pedido con motivo (RF4, RC-01): solo Pendiente o En proceso
// Se abre en un panel lateral desde el botón "Cancelar pedido" del encabezado
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { obtenerUsuarios, guardarCambioEstado } from "../../../lib/datos";
import { validarCancelacion } from "../../../lib/logica";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ListaErrores } from "@/components/comunes";
import { BotonGuardar } from "@/components/alitachs/boton-guardar";
import { Sacudir } from "@/components/alitachs/sacudir";
import { useEnvio } from "@/components/alitachs/usar-envio";

export default function CancelarPedido({ pedido, alCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioId, setUsuarioId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [errores, setErrores] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const envio = useEnvio();
  const faltaMotivo = errores.some((e) => e.includes("motivo"));

  useEffect(() => {
    obtenerUsuarios()
      .then(setUsuarios)
      .catch((e) => setErrores(["Error al cargar usuarios: " + e.message]));
  }, []);

  // Revisa la regla RN-07 y si se puede, guarda la cancelación con su motivo
  async function cancelar(e) {
    e.preventDefault();
    const lista = [...validarCancelacion(pedido, motivo).errores];
    if (!usuarioId) {
      lista.push("Elige quién cancela");
    }
    setErrores(lista);
    if (lista.length > 0) {
      envio.fallo();
      return;
    }
    setGuardando(true);
    try {
      await guardarCambioEstado(
        pedido.id,
        pedido.estado,
        "Cancelado",
        Number(usuarioId),
        motivo.trim(),
      );
      envio.exito();
      toast.success("Pedido #" + pedido.id + " cancelado");
      setMotivo("");
      setUsuarioId("");
      // Espera a que se vea la palomita antes de cerrar el panel
      await new Promise((r) => setTimeout(r, 900));
      setAbierto(false);
      await alCambiar();
    } catch (error) {
      setErrores(["Error al cancelar: " + error.message]);
      envio.fallo();
    } finally {
      setGuardando(false);
    }
  }

  // Un pedido entregado o ya cancelado no muestra el botón
  if (pedido.estado === "Entregado" || pedido.estado === "Cancelado") {
    return null;
  }

  return (
    <Sheet open={abierto} onOpenChange={setAbierto}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="text-destructive hover:bg-red-50 hover:text-destructive"
        >
          Cancelar pedido
        </Button>
      </SheetTrigger>
      <SheetContent>
        <form onSubmit={cancelar} className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>Cancelar pedido #{pedido.id}</SheetTitle>
            <SheetDescription>
              El pedido pasa a Cancelado y ya no cambia de estado.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 px-4">
            <div className="grid gap-1.5">
              <Label htmlFor="motivo">Motivo</Label>
              <Sacudir veces={faltaMotivo ? envio.intentos : 0}>
                <Textarea
                  id="motivo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={4}
                  placeholder="Ej. El cliente ya no necesita las prendas"
                  aria-invalid={faltaMotivo}
                />
              </Sacudir>
            </div>
            <div className="grid gap-1.5">
              <Label>¿Quién cancela?</Label>
              <Sacudir veces={!usuarioId ? envio.intentos : 0}>
                <Select value={usuarioId} onValueChange={setUsuarioId}>
                  <SelectTrigger className="w-full" aria-invalid={errores.length > 0 && !usuarioId}>
                    <SelectValue placeholder="Elige a la persona" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Sacudir>
            </div>
            <Sacudir veces={envio.intentos}>
              <ListaErrores errores={errores} />
            </Sacudir>
          </div>
          <SheetFooter>
            <BotonGuardar
              guardando={guardando}
              listo={envio.listo}
              variant="destructive"
              textoGuardando="Cancelando..."
            >
              Cancelar pedido
            </BotonGuardar>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}