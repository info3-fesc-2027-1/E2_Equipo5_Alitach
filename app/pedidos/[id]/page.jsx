"use client";
// Detalle del pedido (RF4): datos, prendas, estado, acciones (cambiar estado, fecha o cancelar) e historial
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, CalendarDays, Check, CircleX, Mail, Phone, XCircle } from "lucide-react";
import { obtenerPedido, obtenerHistorial } from "../../../lib/datos";
import { calcularTotal, esAtrasado } from "../../../lib/logica";
import CambiarEstado from "./CambiarEstado";
import CancelarPedido from "./CancelarPedido";
import CambiarFecha from "./CambiarFecha";
import { AnilloAvance } from "@/components/alitachs/anillo-avance";
import { Desplegable } from "@/components/alitachs/desplegable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Acceso,
  AtrasadoBadge,
  EncabezadoPagina,
  EstadoBadge,
  ListaErrores,
  Pagina,
  Seccion,
  dinero,
  fechaCorta,
} from "@/components/comunes";
import { cn } from "@/lib/utils";

const PASOS = ["Pendiente", "En proceso", "Entregado"];

function fechaHora(texto) {
  return new Date(texto).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function DetallePedido() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // Qué acción eligió el personal: "estado", "fecha", "cancelar" o ninguna
  const [accion, setAccion] = useState(null);

  // Trae el pedido y su historial de Supabase
  async function cargar() {
    try {
      const datos = await obtenerPedido(id);
      setPedido(datos);
      if (datos) {
        setHistorial(await obtenerHistorial(datos.id));
      }
    } catch (e) {
      setError("Error al cargar el pedido: " + e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, [id]);

  // Después de guardar un cambio se cierra la acción y se recarga el pedido
  async function alTerminarAccion() {
    // Deja ver la palomita antes de cerrar el formulario
    await new Promise((r) => setTimeout(r, 1200));
    setAccion(null);
    await cargar();
  }

  if (cargando) {
    return (
      <Pagina>
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-64" />
      </Pagina>
    );
  }
  if (error) {
    return (
      <Pagina>
        <ListaErrores errores={[error]} />
      </Pagina>
    );
  }
  if (!pedido) {
    return (
      <Pagina>
        <Card>
          <CardContent className="space-y-4 py-10 text-center">
            <p className="text-lg font-medium">No existe el pedido #{id}.</p>
            <Button asChild variant="outline">
              <Link href="/pedidos">Volver a pedidos</Link>
            </Button>
          </CardContent>
        </Card>
      </Pagina>
    );
  }

  const prendas = pedido.prenda_pedido || [];
  const total = calcularTotal(prendas);
  const piezas = prendas.reduce((suma, p) => suma + p.piezas, 0);
  const cambioFecha =
    Boolean(pedido.fecha_compromiso_original) &&
    pedido.fecha_compromiso_original !== pedido.fecha_compromiso;

  // Fecha en que el pedido llegó a cada paso (tomada del historial)
  function fechaDePaso(paso) {
    if (paso === "Pendiente") return pedido.fecha_creacion;
    const cambio = historial.find((c) => c.estado_nuevo === paso);
    return cambio ? cambio.fecha_hora : null;
  }
  const pasoActual = PASOS.indexOf(pedido.estado);
  const atrasado = esAtrasado(pedido);
  // Entregado y Cancelado son estados finales: ya no se cambia nada
  const final = pedido.estado === "Entregado" || pedido.estado === "Cancelado";
  const estadoMinusculas = pedido.estado.toLowerCase();

  // Abre la acción elegida (o la cierra si se vuelve a picar)
  const elegir = (nombre) => setAccion(accion === nombre ? null : nombre);

  return (
    <Pagina>
      {/* Encabezado: número del pedido, cliente, estado y anillo de avance */}
      <EncabezadoPagina
        etiqueta="Operación"
        titulo={"Pedido #" + pedido.id}
        descripcion={pedido.cliente?.nombre}
      >
        <div className="flex flex-wrap items-center gap-2">
          <EstadoBadge estado={pedido.estado} />
          {atrasado && <AtrasadoBadge />}
        </div>
        {pedido.estado !== "Cancelado" && (
          <AnilloAvance
            paso={pasoActual + 1}
            total={PASOS.length}
            atrasado={atrasado}
          />
        )}
      </EncabezadoPagina>

      {/* Contacto / Fechas / Montos */}
      <Seccion numero={1}>Datos</Seccion>
      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {pedido.cliente?.telefono && (
              <a
                href={"tel:" + pedido.cliente.telefono}
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Phone className="size-4" /> {pedido.cliente.telefono}
              </a>
            )}
            {pedido.cliente?.correo && (
              <a
                href={"mailto:" + pedido.cliente.correo}
                className="flex items-center gap-2 break-all text-primary hover:underline"
              >
                <Mail className="size-4 shrink-0" /> {pedido.cliente.correo}
              </a>
            )}
            {pedido.cliente?.notas && (
              <p className="text-muted-foreground">{pedido.cliente.notas}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fechas</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Creado</dt>
              <dd className="text-right">
                {fechaCorta(pedido.fecha_creacion)}
              </dd>
              <dt className="text-muted-foreground">Compromiso</dt>
              <dd
                className={cn(
                  "text-right font-medium",
                  atrasado && "text-red-600",
                )}
              >
                {fechaCorta(pedido.fecha_compromiso)}
              </dd>
              {cambioFecha && (
                <>
                  <dt className="text-muted-foreground">Original</dt>
                  <dd className="text-right text-muted-foreground line-through">
                    {fechaCorta(pedido.fecha_compromiso_original)}
                  </dd>
                </>
              )}
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Montos</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Prendas</dt>
                <dd>{prendas.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Piezas</dt>
                <dd>{piezas}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t pt-2">
                <dt className="font-medium">Total</dt>
                <dd className="text-xl font-extrabold tracking-tight">
                  {dinero(total)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Prendas */}
      <Seccion numero={2}>Prendas</Seccion>
      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          <Table className="tabla-movil">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Producto</TableHead>
                <TableHead>Personalización</TableHead>
                <TableHead>Talla</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-right">Piezas</TableHead>
                <TableHead className="text-right">Precio c/u</TableHead>
                <TableHead className="pr-4 text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prendas.map((p) => (
                <TableRow key={p.id}>
                  <TableCell data-et="Producto" className="pl-4">
                    <div>
                      <p className="font-medium">{p.producto?.tipo_prenda}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.producto?.modelo}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell data-et="Personalización">
                    {p.opcion_personalizacion ? (
                      p.opcion_personalizacion.tipo +
                      ": " +
                      p.opcion_personalizacion.descripcion
                    ) : (
                      <span className="text-muted-foreground">
                        Sin personalización
                      </span>
                    )}
                  </TableCell>
                  <TableCell data-et="Talla">{p.talla || "-"}</TableCell>
                  <TableCell data-et="Color">{p.color || "-"}</TableCell>
                  <TableCell data-et="Piezas" className="text-right tabular-nums">
                    {p.piezas}
                  </TableCell>
                  <TableCell data-et="Precio c/u" className="text-right tabular-nums">
                    {dinero(p.precio_unitario)}
                  </TableCell>
                  <TableCell data-et="Subtotal" className="pr-4 text-right font-semibold tabular-nums">
                    {dinero(p.piezas * p.precio_unitario)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6} data-movil="ocultar" className="text-right">
                  Total
                </TableCell>
                <TableCell data-et="Total" className="pr-4 text-right font-extrabold tabular-nums">
                  {dinero(total)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Estado del pedido */}
      <Seccion numero={3}>Estado del pedido</Seccion>
      <Card>
        <CardContent>
          {pedido.estado === "Cancelado" ? (
            <div className="cancelado-caja">
              <XCircle />
              <div>
                <b>Pedido cancelado</b>
                <p>Motivo: {pedido.motivo_cancelacion || "-"}</p>
              </div>
            </div>
          ) : (
            <ol className="pasos">
              {PASOS.map((paso, i) => {
                const hecho = i <= pasoActual;
                const fecha = fechaDePaso(paso);
                return (
                  <li key={paso} className={cn(hecho && "hecho")}>
                    <span className="punto">{hecho && <Check />}</span>
                    <b>{paso}</b>
                    {hecho && fecha && <small>{fechaCorta(fecha)}</small>}
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* Acciones: tarjetas que se pintan de marino; la elegida abre su formulario */}
      <Seccion numero={4}>¿Qué quieres hacer con este pedido?</Seccion>
      <div className="acciones">
        <Acceso
          icono={ArrowRight}
          titulo="Cambiar estado"
          texto={
            final
              ? "El pedido ya está " + estadoMinusculas + ": es un estado final."
              : "Avanza el pedido. Se guarda quién y cuándo."
          }
          disabled={final}
          elegida={accion === "estado"}
          onClick={() => elegir("estado")}
        />
        <Acceso
          icono={CalendarDays}
          titulo="Cambiar fecha"
          texto={
            final
              ? "Solo se cambia la fecha de un pedido Pendiente o En proceso."
              : "La fecha original se conserva."
          }
          disabled={final}
          elegida={accion === "fecha"}
          onClick={() => elegir("fecha")}
        />
        <Acceso
          icono={CircleX}
          titulo="Cancelar pedido"
          texto={
            final
              ? "Un pedido " + estadoMinusculas + " no se puede cancelar."
              : "Hay que escribir el motivo."
          }
          peligro
          disabled={final}
          elegida={accion === "cancelar"}
          onClick={() => elegir("cancelar")}
        />
      </div>

      {!final && accion === "estado" && (
        <Card>
          <CardHeader>
            <CardTitle>Cambiar estado</CardTitle>
            <CardDescription>Se guarda en el historial quién lo cambió y cuándo.</CardDescription>
          </CardHeader>
          <CardContent>
            <CambiarEstado pedido={pedido} alCambiar={alTerminarAccion} />
          </CardContent>
        </Card>
      )}
      {!final && accion === "fecha" && (
        <Card>
          <CardHeader>
            <CardTitle>Cambiar fecha compromiso</CardTitle>
            <CardDescription>La fecha original se conserva.</CardDescription>
          </CardHeader>
          <CardContent>
            <CambiarFecha pedido={pedido} alCambiar={alTerminarAccion} />
          </CardContent>
        </Card>
      )}
      {!final && accion === "cancelar" && (
        <Card>
          <CardHeader>
            <CardTitle>Cancelar pedido</CardTitle>
            <CardDescription>
              El pedido pasa a Cancelado y ya no cambia de estado. Se pide el motivo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CancelarPedido pedido={pedido} alCambiar={alTerminarAccion} />
          </CardContent>
        </Card>
      )}

      {/* Historial */}
      <Seccion numero={5}>Historial</Seccion>
      <Card>
        <CardContent>
          <Desplegable
            titulo="Cambios de estado"
            detalle={historial.length + (historial.length === 1 ? " cambio" : " cambios")}
          >
            {historial.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todavía no hay cambios de estado.
              </p>
            ) : (
              <ol className="space-y-4 border-l pl-4">
                {historial.map((c) => (
                  <li key={c.id} className="relative text-sm">
                    <span
                      className={`absolute top-1.5 -left-[21px] size-2.5 rounded-full bg-primary`}
                    />
                    <p className="font-medium">
                      {c.estado_anterior} → {c.estado_nuevo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fechaHora(c.fecha_hora)} · por{" "}
                      {c.usuario?.nombre || "?"}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Desplegable>
        </CardContent>
      </Card>
    </Pagina>
  );
}