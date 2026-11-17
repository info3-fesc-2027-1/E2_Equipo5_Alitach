"use client";

// Pantalla del catálogo (RF2): el personal registra y consulta prendas para cotizar

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { validarProducto, validarOpcion } from "../../lib/logica";
import {
  guardarProducto,
  obtenerProductos,
  guardarOpcion,
  obtenerOpciones,
} from "../../lib/datos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EncabezadoPagina, ListaErrores, Pagina, dinero } from "@/components/comunes";

const PRODUCTO_VACIO = { tipo_prenda: "", modelo: "", colores: "", precio: "" };
const OPCION_VACIA = { tipo: "Bordado", descripcion: "", precio: "" };

export default function Catalogo() {
  const [producto, setProducto] = useState(PRODUCTO_VACIO);
  const [erroresProducto, setErroresProducto] = useState([]);
  const [erroresOpcion, setErroresOpcion] = useState([]);
  const [productos, setProductos] = useState([]);
  const [opcion, setOpcion] = useState(OPCION_VACIA);
  const [opciones, setOpciones] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // Trae de Supabase la lista de productos
  async function cargarProductos() {
    try {
      setProductos(await obtenerProductos());
    } catch (error) {
      setErroresProducto(["Error al cargar el catálogo: " + error.message]);
    }
  }

  // Trae de Supabase las opciones de bordado y serigrafía
  async function cargarOpciones() {
    try {
      setOpciones(await obtenerOpciones());
    } catch (error) {
      setErroresOpcion(["Error al cargar las opciones: " + error.message]);
    }
  }

  // Al abrir la pantalla, carga el catálogo y las opciones una vez
  useEffect(() => {
    cargarProductos();
    cargarOpciones();
  }, []);

  // Guarda lo que se escribe en cada campo
  function cambiar(e) {
    setProducto({ ...producto, [e.target.name]: e.target.value });
  }

  // Revisa el producto y, si es válido, lo guarda en Supabase
  async function registrar(e) {
    e.preventDefault();
    const resultado = validarProducto(producto);
    setErroresProducto(resultado.errores);

    if (!resultado.valido) {
      return;
    }

    setGuardando(true);
    try {
      await guardarProducto({ ...producto, precio: Number(producto.precio) });
      toast.success("Producto guardado.");
      setProducto(PRODUCTO_VACIO);
      cargarProductos();
    } catch (error) {
      setErroresProducto(["Error al guardar: " + error.message]);
    } finally {
      setGuardando(false);
    }
  }

  // Guarda una opción de personalización (bordado o serigrafía)
  async function registrarOpcion(e) {
    e.preventDefault();
    const resultado = validarOpcion(opcion);
    setErroresOpcion(resultado.errores);
    if (!resultado.valido) {
      return;
    }
    setGuardando(true);
    try {
      await guardarOpcion({ ...opcion, precio: Number(opcion.precio) });
      toast.success("Opción guardada.");
      setOpcion(OPCION_VACIA);
      cargarOpciones();
    } catch (error) {
      setErroresOpcion(["Error al guardar la opción: " + error.message]);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Pagina>
      <EncabezadoPagina
        titulo="Productos"
        descripcion="Aquí el personal registra y consulta las prendas para cotizar."
      />

      {/* Productos */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px] lg:items-start">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Productos registrados</CardTitle>
            <CardDescription>{productos.length} productos en el catálogo</CardDescription>
          </CardHeader>
          <CardContent>
            {productos.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Todavía no hay productos.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de prenda</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Colores</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productos.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.tipo_prenda}</TableCell>
                      <TableCell>{p.modelo}</TableCell>
                      <TableCell>{p.colores || "-"}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {dinero(p.precio)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registrar producto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={registrar} className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="tipo_prenda">Tipo de prenda</Label>
                <Input
                  id="tipo_prenda"
                  name="tipo_prenda"
                  value={producto.tipo_prenda}
                  onChange={cambiar}
                  placeholder="Ej. Chaleco de seguridad"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  name="modelo"
                  value={producto.modelo}
                  onChange={cambiar}
                  placeholder="Ej. Reflejante"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="colores">Colores</Label>
                <Input
                  id="colores"
                  name="colores"
                  value={producto.colores}
                  onChange={cambiar}
                  placeholder="Ej. Naranja, Amarillo"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="precio">Precio (MXN)</Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  step="0.01"
                  value={producto.precio}
                  onChange={cambiar}
                />
              </div>
              <Button type="submit" className="w-full" disabled={guardando}>
                {guardando ? "Guardando…" : "Registrar producto"}
              </Button>
              <ListaErrores errores={erroresProducto} />
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Opciones de personalización */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px] lg:items-start">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Opciones de personalización</CardTitle>
            <CardDescription>
              Bordados y serigrafías que se suman al precio de la prenda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {opciones.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Todavía no hay opciones.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opciones.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>
                        <Badge variant="secondary">{o.tipo}</Badge>
                      </TableCell>
                      <TableCell>{o.descripcion}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {dinero(o.precio)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agregar opción</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={registrarOpcion} className="space-y-4">
              <div className="grid gap-1.5">
                <Label>Tipo</Label>
                <Select
                  value={opcion.tipo}
                  onValueChange={(v) => setOpcion({ ...opcion, tipo: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bordado">Bordado</SelectItem>
                    <SelectItem value="Serigrafía">Serigrafía</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={opcion.descripcion}
                  placeholder="Ej. Logo en el pecho"
                  onChange={(e) => setOpcion({ ...opcion, descripcion: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="precio-opcion">Precio (MXN)</Label>
                <Input
                  id="precio-opcion"
                  type="number"
                  step="0.01"
                  value={opcion.precio}
                  onChange={(e) => setOpcion({ ...opcion, precio: e.target.value })}
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={guardando}
              >
                {guardando ? "Guardando…" : "Agregar opción"}
              </Button>
              <ListaErrores errores={erroresOpcion} />
            </form>
          </CardContent>
        </Card>
      </div>
    </Pagina>
  );
}