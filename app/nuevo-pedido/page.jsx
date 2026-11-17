"use client";
// Pantalla de nuevo pedido (RF3): elegir cliente, agregar prendas y fecha compromiso
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { validarPedido, calcularTotal, calcularPrecioPieza } from "../../lib/logica";
import {
  buscarClientes,
  obtenerProductos,
  obtenerOpciones,
  guardarPedido,
} from "../../lib/datos";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { EncabezadoPagina, ListaErrores, Pagina, dinero } from "@/components/comunes";

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

  useEffect(() => {
    async function cargar() {
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
      return;
    }
    setGuardando(true);
    try {
      const nuevo = await guardarPedido({
        cliente_id: clienteId,
        fecha_compromiso: fechaCompromiso,
        fecha_compromiso_original: fechaCompromiso,
        estado: "Pendiente",
        prendas: prendas.map((p) => ({ ...p, opcion_id: p.opcion_id || null })),
      });
      toast.success("Pedido #" + nuevo.id + " guardado en Pendiente.", {
        action: {
          label: "Ver pedido",
          onClick: () => (window.location.href = "/pedidos/" + nuevo.id),
        },
      });
      setClienteId("");
      setFechaCompromiso("");
      setPrendas([{ ...PRENDA_VACIA }]);
    } catch (error) {
      setErrores(["Error al guardar: " + error.message]);
    } finally {
      setGuardando(false);
    }
  }

  const total = calcularTotal(prendas);
  const piezas = prendas.reduce((s, p) => s + (Number(p.piezas) || 0), 0);

  return (
    <Pagina>
      <EncabezadoPagina
        titulo="Nuevo pedido"
        descripcion="El pedido se guarda en estado Pendiente."
      />
      <form
        onSubmit={registrar}
        className="grid gap-4 lg:grid-cols-[1fr_300px] lg:items-start"
      >
        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos del pedido</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Cliente</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger className="w-full">
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
                <Link href="/clientes" className="text-xs text-primary hover:underline">
                  ¿No está? Registrar cliente
                </Link>
              </div>
              <div className="grid content-start gap-1.5">
                <Label htmlFor="fecha">Fecha compromiso</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={fechaCompromiso}
                  onChange={(e) => setFechaCompromiso(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Prendas</CardTitle>
              <CardDescription>
                Precio por pieza = precio del producto + personalización.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {prendas.map((prenda, index) => (
                <div key={index} className="rounded-lg border bg-muted/30 p-3">
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
                      <Input
                        type="number"
                        min="1"
                        className="bg-card"
                        value={prenda.piezas}
                        onChange={(e) =>
                          cambiarPrenda(index, "piezas", Number(e.target.value))
                        }
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
        <Card className="lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prendas</span>
              <span>{prendas.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Piezas</span>
              <span>{piezas}</span>
            </div>
            <Separator />
            <div className="flex items-baseline justify-between">
              <span className="font-medium">Total</span>
              <span className="text-xl font-semibold tabular-nums">{dinero(total)}</span>
            </div>
            <Button type="submit" className="w-full" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar pedido"}
            </Button>
            <ListaErrores errores={errores} />
          </CardContent>
        </Card>
      </form>
    </Pagina>
  );
}
