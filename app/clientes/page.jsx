"use client";
// Pantalla de clientes (RF1): registrar un cliente y buscarlo por nombre
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { validarCliente } from "../../lib/logica";
import { guardarCliente, buscarClientes } from "../../lib/datos";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EncabezadoPagina, ListaErrores, Pagina } from "@/components/comunes";

const VACIO = { nombre: "", telefono: "", correo: "", notas: "" };

export default function Clientes() {
  const [cliente, setCliente] = useState(VACIO);
  const [errores, setErrores] = useState([]);
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // Al abrir la pantalla muestra todos los clientes
  useEffect(() => {
    buscarClientes("")
      .then(setResultados)
      .catch((e) => setErrores(["Error al cargar clientes: " + e.message]));
  }, []);

  // Guarda lo que se escribe en cada campo
  function cambiar(e) {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  }

  // Revisa el cliente y, si es válido, lo guarda en Supabase
  async function registrar(e) {
    e.preventDefault();
    const resultado = validarCliente(cliente);
    setErrores(resultado.errores);

    if (!resultado.valido) {
      return;
    }

    setGuardando(true);
    try {
      await guardarCliente(cliente);
      toast.success("Cliente guardado.");
      setCliente(VACIO);
      setResultados(await buscarClientes(texto));
    } catch (error) {
      setErrores(["Error al guardar: " + error.message]);
    } finally {
      setGuardando(false);
    }
  }

  // Busca clientes que tengan el texto en su nombre
  async function buscar(e) {
    e.preventDefault();
    try {
      setResultados(await buscarClientes(texto));
    } catch (error) {
      setErrores(["Error al buscar: " + error.message]);
    }
  }
  return (
    <Pagina>
      <EncabezadoPagina
        titulo="Clientes"
        descripcion="Registra clientes y búscalos por nombre."
      />
      <div className="grid gap-4 lg:grid-cols-[340px_1fr] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Registrar cliente</CardTitle>
            <CardDescription>Necesita teléfono o correo.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={registrar} className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={cliente.nombre}
                  onChange={cambiar}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={cliente.telefono}
                  onChange={cambiar}
                  placeholder="10 números"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="correo">Correo</Label>
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  value={cliente.correo}
                  onChange={cambiar}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="notas">Notas de personalización</Label>
                <Input
                  id="notas"
                  name="notas"
                  value={cliente.notas}
                  onChange={cambiar}
                />
              </div>
              <Button type="submit" className="w-full" disabled={guardando}>
                {guardando ? "Guardando…" : "Registrar"}
              </Button>
              <ListaErrores errores={errores} />
            </form>
          </CardContent>
        </Card>
        <Card className="min-w-0 gap-0 py-0">
          <form onSubmit={buscar} className="flex gap-2 border-b p-4">
            <div className="relative flex-1">
              <Search
                className={`absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground`}
              />
              <Input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribe parte del nombre"
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
          <CardContent className="p-0">
            {resultados.length === 0 ? (
              <p className="p-10 text-center text-sm text-muted-foreground">
                No hay clientes con ese nombre.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead className="pr-4">Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultados.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="pl-4 font-medium">
                        {c.nombre}
                      </TableCell>
                      <TableCell>{c.telefono || "-"}</TableCell>
                      <TableCell>{c.correo || "-"}</TableCell>
                      <TableCell className="pr-4 text-muted-foreground">
                        {c.notas || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Pagina>
  );
}