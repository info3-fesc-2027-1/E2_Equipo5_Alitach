"use client";
// Cambiar el estado de un pedido (RF4) guardando quién lo hizo
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { obtenerUsuarios, guardarCambioEstado } from "../../../lib/datos";
import { puedeCambiarEstado } from "../../../lib/logica";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListaErrores } from "@/components/comunes";
import { BotonGuardar } from "@/components/alitachs/boton-guardar";
import { Sacudir } from "@/components/alitachs/sacudir";
import { useEnvio } from "@/components/alitachs/usar-envio";
// Siguiente estado permitido según RN-06
const SIGUIENTE = { Pendiente: "En proceso", "En proceso": "Entregado" };
export default function CambiarEstado({ pedido, alCambiar }) {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioId, setUsuarioId] = useState("");
  const [nuevo, setNuevo] = useState("");
  const [errores, setErrores] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const envio = useEnvio();
  useEffect(() => {
    obtenerUsuarios()
      .then(setUsuarios)
      .catch((e) => setErrores(["Error al cargar usuarios: " + e.message]));
  }, []);
  // Revisa la regla RN-06 y, si se puede, guarda el cambio
  async function cambiar() {
    const lista = [];
    if (!nuevo) {
      lista.push("Elige el nuevo estado");
    } else {
      lista.push(...puedeCambiarEstado(pedido.estado, nuevo).errores);
    }
    if (!usuarioId) {
      lista.push("Elige quién hace el cambio");
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
        nuevo,
        Number(usuarioId),
      );
      envio.exito();
      toast.success("Pedido #" + pedido.id + " ahora está " + nuevo);
      setNuevo("");
      setUsuarioId("");
      await alCambiar();
    } catch (e) {
      setErrores(["Error al guardar: " + e.message]);
      envio.fallo();
    } finally {
      setGuardando(false);
    }
  }
  if (pedido.estado === "Entregado" || pedido.estado === "Cancelado") {
    return (
      <p className="text-sm text-muted-foreground">
        Este pedido está {pedido.estado}: ya no cambia de estado.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <div className="grid gap-1.5">
          <Label>Nuevo estado</Label>
          <Sacudir veces={!nuevo ? envio.intentos : 0}>
            <Select value={nuevo} onValueChange={setNuevo}>
              <SelectTrigger className="w-full" aria-invalid={errores.length > 0 && !nuevo}>
                <SelectValue placeholder="Elige el estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="En proceso">En proceso</SelectItem>
                <SelectItem value="Entregado">Entregado</SelectItem>
              </SelectContent>
            </Select>
          </Sacudir>
        </div>
        <div className="grid gap-1.5">
          <Label>¿Quién hace el cambio?</Label>
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
        <BotonGuardar type="button" onClick={cambiar} guardando={guardando} listo={envio.listo}>
          Cambiar estado
        </BotonGuardar>
      </div>
      {SIGUIENTE[pedido.estado] && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          Siguiente paso: {pedido.estado} <ArrowRight className="size-3" />{" "}
          {SIGUIENTE[pedido.estado]}
        </p>
      )}
      <Sacudir veces={envio.intentos}>
        <ListaErrores errores={errores} />
      </Sacudir>
    </div>
  );
}