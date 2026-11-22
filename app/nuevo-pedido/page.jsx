"use client";
// Pantalla de nuevo pedido (RF3):: elegir cliente, agregar prendas y fecha compromiso

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { validarPedido, calcularTotal, calcularPrecioPieza, hoyTexto } from "../../lib/logica";
import {
  buscarClientes,
  obtenerProductos,
  obtenerOpciones,
  guardarPedido, } from "../../lib/datos";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {  Select,  SelectContent,  SelectItem,  SelectTrigger,  SelectValue, } from "@/components/ui/select";
import { EncabezadoPagina, ListaErrores, Pagina, Seccion, dinero, fechaCorta } from "@/components/comunes";
import { BotonGuardar } from "@/components/alitachs/boton-guardar";
import { Sacudir } from "@/components/alitachs/sacudir";
import { Contador } from "@/components/alitachs/contador";
import { NumeroSalta } from "@/components/alitachs/numero-salta";
import { useEnvio } from "@/components/alitachs/usar-envio";

const PRENDA_VACIA = {
  producto_id: "",
  opcion_id: "",
  piezas: 1,
  talla: "",
  color: "",
  precio_unitario: 0,
};

const SIN_OPCION = "ninguna";

export default function NuevoPedido() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [opciones, setOpciones] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [fechaCompromiso, setFechaCompromiso] = useState("");
  const [prendas, setPrendas] = useState([{ ...PRENDA_VACIA }]);
  const [errores, setErrores] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [hoy, setHoy] = useState("");
  const envio = useEnvio();

  useEffect(() => {
    async function cargar() {
      // Fecha de hoy para la nota de remisión (se calcula en el navegador)
      setHoy(hoyTexto());
      try {
        setClientes(await buscarClientes(""));
        setProductos(await obtenerProductos());
        setOpciones(await obtenerOpciones());
      } catch (error) {
        setErrores(["Error al cargar datos: " + error.message]);
      }
    }
    cargar();
  }, []);

  function agregarPrenda() {
    setPrendas([...prendas, { ...PRENDA_VACIA }]);
  }

  function quitarPrenda(index) {
    setPrendas(prendas.filter((_, i) => i !== index));
  }

  function cambiarPrenda(index, campo, valor) {
    const nuevas = [...prendas];
    nuevas[index] = { ...nuevas[index], [campo]: valor };
    setPrendas(nuevas);
  }

  function elegirProducto(index, id) {
    const nuevas = [...prendas];
    const producto = productos.find((p) => String(p.id) === id);
    const opcion = opciones.find((o) => String(o.id) === String(nuevas[index].opcion_id));
    nuevas[index] = {
      ...nuevas[index],
      producto_id: id,
      precio_unitario: calcularPrecioPieza(producto, opcion),
    };
    setPrendas(nuevas);
  }

  function elegirOpcion(index, valor) {
    const id = valor === SIN_OPCION ? "" : valor;
    const nuevas = [...prendas];
    const producto = productos.find((p) => String(p.id) === String(nuevas[index].producto_id));
    const opcion = opciones.find((o) => String(o.id) === id);
    nuevas[index] = {
      ...nuevas[index],
      opcion_id: id,
      precio_unitario: calcularPrecioPieza(producto, opcion),
    };
    setPrendas(nuevas);
  }

  async function registrar(e) {
    e.preventDefault();
    const pedido = {
      cliente_id: clienteId,
      fecha_compromiso: fechaCompromiso,
      prendas: prendas,
    };
    const resultado = validarPedido(pedido);
    setErrores(resultado.errores);
    if (!resultado.valido) {
      envio.fallo();
      return;
    }
    setGuardando(true);
    try {
      const nuevo = await guardarPedido(
        {
          cliente_id: clienteId,
          fecha_compromiso: fechaCompromiso,
          fecha_compromiso_original: fechaCompromiso,
          estado: "Pendiente",
        },
        prendas.map((p) => ({ ...p, opcion_id: p.opcion_id || null }))
      );
      toast.success("Pedido #" + nuevo.id + " guardado en Pendiente.", {
        action: {
          label: "Ver pedido",
          onClick: () => (window.location.href = "/pedidos/" + nuevo.id),
        },
      });
      envio.exito();
      setClienteId("");
      setFechaCompromiso("");
      setPrendas([{ ...PRENDA_VACIA }]);
    } catch (error) {
      setErrores(["Error al guardar: " + error.message]);
      envio.fallo();
    } finally {
      setGuardando(false);
    }
  }

  // Qué campos marcar en rojo según los errores
  const faltaCliente = errores.some((e) => e.includes("cliente"));
  const fallaFecha = errores.some((e) => e.includes("fecha"));

  const total = calcularTotal(prendas);

  // Datos para la nota de remisión: el cliente elegido y las prendas que ya tienen producto
  const clienteElegido = clientes.find((c) => String(c.id) === String(clienteId));
  const lineas = prendas
    .map((p) => ({
      piezas: Number(p.piezas) || 0,
      precio: p.precio_unitario,
      producto: productos.find((x) => String(x.id) === String(p.producto_id)),
      opcion: opciones.find((x) => String(x.id) === String(p.opcion_id)),
    }))
    .filter((l) => l.producto);
  const piezasNota = lineas.reduce((s, l) => s + l.piezas, 0);

  return (
    <Pagina>
      <EncabezadoPagina
        etiqueta="Operación"
        titulo="Nuevo pedido"
        descripcion="Nace en estado Pendiente."
      />
      <form
        onSubmit={registrar}
        className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
      >
        <div className="flex min-w-0 flex-col gap-9">
          <Seccion numero={1}>Cliente y fecha</Seccion>
          <Card>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Cliente</Label>
                <Sacudir veces={faltaCliente ? envio.intentos : 0}>
                  <Select value={clienteId} onValueChange={setClienteId}>
                    <SelectTrigger className="w-full" aria-invalid={faltaCliente}>
                      <SelectValue placeholder="Elige un cliente" />
                    </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Sacudir>
              <Link href="/clientes" className="text-xs text-primary hover:underline">
                ¿No está? Registrar cliente
              </Link>
              </div>
              <div className="grid content-start gap-1.5">
                <Label htmlFor="fecha">Fecha compromiso</Label>
                <Sacudir veces={fallaFecha ? envio.intentos : 0}>
                  <Input
                    id="fecha"
                    type="date"
                    value={fechaCompromiso}
                    aria-invalid={fallaFecha}
                    onChange={(e) => setFechaCompromiso(e.target.value)}
                  />
                </Sacudir>
              </div>
            </CardContent>
          </Card>
          <Seccion numero={2}>Prendas</Seccion>
          <Card>
            <CardHeader>
              <CardDescription>
                Precio por pieza = precio del producto + personalización.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {prendas.map((prenda, index) => (
                <div
                  key={index}
                  className="rounded-lg border bg-muted/30 p-3 animate-in fade-in slide-in-from-top-3 duration-300"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium">Prenda {index + 1}</span>
                    {prendas.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => quitarPrenda(index)}
                        aria-label={"Quitar prenda " + (index + 1)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-6">
                    <div className="grid gap-1.5 md:col-span-3">
                      <Label className="text-xs text-muted-foreground">Producto</Label>
                      <Select
                        value={String(prenda.producto_id)}
                        onValueChange={(v) => elegirProducto(index, v)}
                      >
                        <SelectTrigger className="w-full bg-card">
                          <SelectValue placeholder="Elige un producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {productos.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.tipo_prenda} {p.modelo} ({dinero(p.precio)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5 md:col-span-3">
                      <Label className="text-xs text-muted-foreground">
                        Personalización
                      </Label>
                      <Select
                        value={prenda.opcion_id ? String(prenda.opcion_id) : SIN_OPCION}
                        onValueChange={(v) => elegirOpcion(index, v)}
                      >
                        <SelectTrigger className="w-full bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SIN_OPCION}>Sin personalización</SelectItem>
                            {opciones.map((o) => (
                              <SelectItem key={o.id} value={String(o.id)}>
                                {o.tipo} {o.descripcion} (+{dinero(o.precio)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1.5 md:col-span-2">
                        <Label className="text-xs text-muted-foreground">Piezas</Label>
                        <Contador
                          valor={prenda.piezas}
                          alCambiar={(n) => cambiarPrenda(index, "piezas", n)}
                        />
                      </div>
                      <div className="grid gap-1.5 md:col-span-2">
                        <Label className="text-xs text-muted-foreground">Talla</Label>
                        <Input
                          className="bg-card"
                          value={prenda.talla}
                          placeholder="Ej. M"
                          onChange={(e) => cambiarPrenda(index, "talla", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1.5 sm:col-span-2 md:col-span-2">
                          <Label className="text-xs text-muted-foreground">Color</Label>
                          <Input
                            className="bg-card"
                            value={prenda.color}
                            placeholder="Ej. Naranja"
                            onChange={(e) => cambiarPrenda(index, "color", e.target.value)}
                          />
                        </div>
                      </div>
                      <p className="mt-3 text-right text-sm text-muted-foreground">
                        {dinero(prenda.precio_unitario)} c/u{" "}
                        <span className="font-medium text-foreground">
                          {dinero((Number(prenda.piezas) || 0) * prenda.precio_unitario)}
                        </span>
                      </p>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={agregarPrenda}>
                    <Plus /> Agregar otra prenda
                  </Button>
                </CardContent>
              </Card>
            </div>
        {/* Resumen como nota de remisión del taller */}
        <div className="flex min-w-0 flex-col gap-9 lg:sticky lg:top-20">
          <Seccion numero={3}>Resumen</Seccion>
          <div className="nota-remision">
            <div className="nr-cab">
              <b>Nota de remisión</b>
              <span>{hoy ? fechaCorta(hoy) : ""}</span>
            </div>
            <dl className="nr-datos">
              <dt>Cliente</dt>
              <dd>
                {clienteElegido ? (
                  clienteElegido.nombre
                ) : (
                  <span className="text-muted-foreground">Sin elegir</span>
                )}
              </dd>
              <dt>Entrega</dt>
              <dd>
                {fechaCompromiso ? (
                  fechaCorta(fechaCompromiso)
                ) : (
                  <span className="text-muted-foreground">Sin fecha</span>
                )}
              </dd>
            </dl>
            <ul className="nr-lineas">
              {lineas.length === 0 ? (
                <li className="text-muted-foreground">Agrega una prenda del catálogo.</li>
              ) : (
                lineas.map((l, i) => (
                  <li key={i}>
                    <span>
                      {l.piezas} × {l.producto.tipo_prenda}
                      {l.opcion && <small>{l.opcion.tipo}: {l.opcion.descripcion}</small>}
                      <small>{dinero(l.precio)} c/u</small>
                    </span>
                    <b>{dinero(l.piezas * l.precio)}</b>
                  </li>
                ))
              )}
            </ul>
            <div className="nr-total">
              <span>
                Total · <NumeroSalta valor={piezasNota} /> {piezasNota === 1 ? "pieza" : "piezas"}
              </span>
              <b>{dinero(total)}</b>
            </div>
            <BotonGuardar guardando={guardando} listo={envio.listo} className="mt-4 w-full">
              Guardar pedido
            </BotonGuardar>
          </div>
          <Sacudir veces={envio.intentos}>
            <ListaErrores errores={errores} />
          </Sacudir>
        </div>
          </form>
        </Pagina>
      );
  }