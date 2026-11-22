"use client";
// Detalle del pedido (RF4): cliente, prendas, fechas, historial y cambio de estado
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Mail, Phone, XCircle } from "lucide-react";
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
  AtrasadoBadge,
  EstadoBadge,
  ListaErrores,
  Pagina,
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
    pedido.fecha_compromiso_original !== pedido.fecha_compromiso;

  // Fecha en que el pedido llegó a cada paso (tomada del historial)
  function fechaDePaso(paso) {
    if (paso === "Pendiente") return pedido.fecha_creacion;
    const cambio = historial.find((c) => c.estado_nuevo === paso);
    return cambio ? cambio.fecha_hora : null;
  }
  const pasoActual = PASOS.indexOf(pedido.estado);

  return (
    <Pagina>
      {/* Encabezado */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label="Volver a pedidos"
        >
          <Link href="/pedidos">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          Pedido #{pedido.id}
        </h1>
        <EstadoBadge estado={pedido.estado} />
        {esAtrasado(pedido) && <AtrasadoBadge />}
        <div className="ml-auto">
          <CancelarPedido pedido={pedido} alCambiar={cargar} />
        </div>
      </div>
      <p className="-mt-4 text-sm text-muted-foreground">
        Creado el {fechaCorta(pedido.fecha_creacion)} · Entrega comprometida el{" "}
        {fechaCorta(pedido.fecha_compromiso)}
      </p>
      {/* Cliente / Fechas / Montos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">{pedido.cliente?.nombre}</p>
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
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Mail className="size-4" /> {pedido.cliente.correo}
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
                  esAtrasado(pedido) && "text-red-600",
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
                <dd className="text-base font-semibold">
                  {dinero(total)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 2xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          {/* Prendas */}
          <Card>
            <CardHeader>
              <CardTitle>Prendas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Personalización</TableHead>
                    <TableHead>Talla</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="text-right">Piezas</TableHead>
                    <TableHead className="text-right">Precio c/u</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prendas.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <p className="font-medium">
                          {p.producto?.tipo_prenda}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.producto?.modelo}
                        </p>
                      </TableCell>
                      <TableCell>
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
                      <TableCell>{p.talla || "-"}</TableCell>
                      <TableCell>{p.color || "-"}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {p.piezas}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {dinero(p.precio_unitario)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {dinero(p.piezas * p.precio_unitario)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={6} className="text-right">
                      Total
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {dinero(total)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
          {/* Estado del pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {pedido.estado === "Cancelado" ? (
                <div
                  className={`flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm`}
                >
                  <XCircle className="size-5 shrink-0 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">
                      Pedido cancelado
                    </p>
                    <p className="text-red-700">
                      Motivo: {pedido.motivo_cancelacion || "-"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <AnilloAvance
                    paso={pasoActual + 1}
                    total={PASOS.length}
                    atrasado={esAtrasado(pedido)}
                  />
                  <ol className="flex flex-1">
                    {PASOS.map((paso, i) => {
                      const hecho = i <= pasoActual;
                      const fecha = fechaDePaso(paso);
                      return (
                        <li key={paso} className="relative flex-1">
                          {i > 0 && (
                            <span
                              className={cn(
                                "absolute top-3 right-1/2 -z-0 h-0.5 w-full",
                                hecho ? "bg-green-600" : "bg-border",
                              )}
                            />
                          )}
                          <div className="relative z-[1] flex flex-col items-center text-center">
                            <span
                              className={cn(
                                `flex size-6 items-center justify-center rounded-full border-2 bg-card`,
                                hecho
                                  ? "border-green-600 bg-green-600 text-white"
                                  : "border-border",
                              )}
                            >
                              {hecho && <Check className="size-3.5" />}
                            </span>
                            <span
                              className={cn(
                                "mt-2 text-sm",
                                hecho ? "font-medium" : "text-muted-foreground",
                              )}
                            >
                              {paso}
                            </span>
                            {hecho && fecha && (
                              <span className="text-xs text-muted-foreground">
                                {fechaCorta(fecha)}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
              <CambiarEstado pedido={pedido} alCambiar={cargar} />
            </CardContent>
          </Card>
        </div>
        {/* Cambiar fecha e Historial: abajo en dos columnas; al lado solo en pantallas muy anchas */}
        <div className="grid items-start gap-4 md:grid-cols-2 2xl:grid-cols-1 2xl:content-start">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar fecha compromiso</CardTitle>
              <CardDescription>
                La fecha original se conserva.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CambiarFecha pedido={pedido} alCambiar={cargar} />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Desplegable
                titulo="Historial"
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
        </div>
      </div>
    </Pagina>
  );
}