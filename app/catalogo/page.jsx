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
import {
  EncabezadoPagina,
  Kpi,
  ListaErrores,
  Pagina,
  Seccion,
  dinero,
} from "@/components/comunes";
import Galeria from "@/components/galeria";
import { BotonGuardar } from "@/components/alitachs/boton-guardar";
import { Sacudir } from "@/components/alitachs/sacudir";
import { useEnvio } from "@/components/alitachs/usar-envio";

const PRODUCTO_VACIO = {
  tipo_prenda: "",
  modelo: "",
  colores: "",
  precio: "",
};

const OPCION_VACIA = {
  tipo: "Bordado",
  descripcion: "",
  precio: "",
};

export default function Catalogo() {
  const [producto, setProducto] = useState(PRODUCTO_VACIO);
  const [erroresProducto, setErroresProducto] = useState([]);
  const [erroresOpcion, setErroresOpcion] = useState([]);
  const [productos, setProductos] = useState([]);
  const [opcion, setOpcion] = useState(OPCION_VACIA);
  const [opciones, setOpciones] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [guardandoOpcion, setGuardandoOpcion] = useState(false);
  const envioProducto = useEnvio();
  const envioOpcion = useEnvio();

  // Marca en rojo el campo si algún error lo menciona
  const falla = (errores, palabra) =>
    errores.some((e) => e.toLowerCase().includes(palabra));

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
      envioProducto.fallo();
      return;
    }
    setGuardando(true);
    try {
      await guardarProducto({
        ...producto,
        precio: Number(producto.precio),
      });
      envioProducto.exito();
      toast.success("Producto guardado.");
      setProducto(PRODUCTO_VACIO);
      cargarProductos();
    } catch (error) {
      setErroresProducto(["Error al guardar: " + error.message]);
      envioProducto.fallo();
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
      envioOpcion.fallo();
      return;
    }
    setGuardandoOpcion(true);
    try {
      await guardarOpcion({
        ...opcion,
        precio: Number(opcion.precio),
      });
      envioOpcion.exito();
      toast.success("Opción guardada.");
      setOpcion(OPCION_VACIA);
      cargarOpciones();
    } catch (error) {
      setErroresOpcion(["Error al guardar la opción: " + error.message]);
      envioOpcion.fallo();
    } finally {
      setGuardandoOpcion(false);
    }
  }

  return (
    <Pagina>
      <EncabezadoPagina
        etiqueta="Catálogo"
        titulo="Productos"
        descripcion={
          productos.length +
          (productos.length === 1 ? " prenda · " : " prendas · ") +
          opciones.length +
          (opciones.length === 1
            ? " opción de personalización"
            : " opciones de personalización")
        }
      />

      {/* Productos: cada prenda es una etiqueta de precio colgante */}
      <Seccion numero={1}>Prendas y precios</Seccion>
      <div className="grid gap-9 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="min-w-0">
          {productos.length === 0 ? (
            <p className="texto-mano py-6 text-center">
              Todavía no hay productos.
            </p>
          ) : (
            <div className="etiquetas-precio">
              {productos.map((p) => (
                <Kpi
                  key={p.id}
                  etiqueta={p.tipo_prenda}
                  valor={dinero(p.precio)}
                  nota={p.modelo + (p.colores ? " · " + p.colores : "")}
                />
              ))}
            </div>
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Registrar producto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={registrar} className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="tipo_prenda">Tipo de prenda</Label>
                <Sacudir
                  veces={
                    falla(erroresProducto, "prenda")
                      ? envioProducto.intentos
                      : 0
                  }
                >
                  <Input
                    id="tipo_prenda"
                    name="tipo_prenda"
                    value={producto.tipo_prenda}
                    onChange={cambiar}
                    placeholder="Ej. Chaleco de seguridad"
                    aria-invalid={falla(erroresProducto, "prenda")}
                  />
                </Sacudir>
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
                <Sacudir
                  veces={
                    falla(erroresProducto, "precio")
                      ? envioProducto.intentos
                      : 0
                  }
                >
                  <Input
                    id="precio"
                    name="precio"
                    type="number"
                    step="0.01"
                    value={producto.precio}
                    onChange={cambiar}
                    aria-invalid={falla(erroresProducto, "precio")}
                  />
                </Sacudir>
              </div>
              <BotonGuardar
                guardando={guardando}
                listo={envioProducto.listo}
                className="w-full"
              >
                Registrar producto
              </BotonGuardar>
              <Sacudir veces={envioProducto.intentos}>
                <ListaErrores errores={erroresProducto} />
              </Sacudir>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Opciones de personalización */}
      <Seccion numero={2}>Opciones de personalización</Seccion>
      <div className="grid gap-9 lg:grid-cols-[1fr_340px] lg:items-start">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Bordado y serigrafía</CardTitle>
            <CardDescription>
              Bordados y serigrafías que se suman al precio de la prenda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {opciones.length === 0 ? (
              <p className="texto-mano py-6 text-center">
                Todavía no hay opciones.
              </p>
            ) : (
              <Table className="tabla-movil">
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
                      <TableCell data-et="Tipo">
                        <Badge variant="secondary">{o.tipo}</Badge>
                      </TableCell>
                      <TableCell data-et="Descripción">{o.descripcion}</TableCell>
                      <TableCell
                        data-et="Precio"
                        className="text-right tabular-nums"
                      >
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
                  onValueChange={(v) =>
                    setOpcion({ ...opcion, tipo: v })
                  }
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
                <Sacudir
                  veces={
                    falla(erroresOpcion, "descripción")
                      ? envioOpcion.intentos
                      : 0
                  }
                >
                  <Input
                    id="descripcion"
                    value={opcion.descripcion}
                    placeholder="Ej. Logo en el pecho"
                    onChange={(e) =>
                      setOpcion({
                        ...opcion,
                        descripcion: e.target.value,
                      })
                    }
                    aria-invalid={falla(erroresOpcion, "descripción")}
                  />
                </Sacudir>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="precio-opcion">Precio (MXN)</Label>
                <Sacudir
                  veces={
                    falla(erroresOpcion, "precio")
                      ? envioOpcion.intentos
                      : 0
                  }
                >
                  <Input
                    id="precio-opcion"
                    type="number"
                    step="0.01"
                    value={opcion.precio}
                    onChange={(e) =>
                      setOpcion({
                        ...opcion,
                        precio: e.target.value,
                      })
                    }
                    aria-invalid={falla(erroresOpcion, "precio")}
                  />
                </Sacudir>
              </div>
              <BotonGuardar
                guardando={guardandoOpcion}
                listo={envioOpcion.listo}
                variant="outline"
                className="w-full"
              >
                Agregar opción
              </BotonGuardar>
              <Sacudir veces={envioOpcion.intentos}>
                <ListaErrores errores={erroresOpcion} />
              </Sacudir>
            </form>
          </CardContent>
        </Card>
      </div>

      <Seccion numero={3}>Galería</Seccion>
      <Galeria />
    </Pagina>
  );
}