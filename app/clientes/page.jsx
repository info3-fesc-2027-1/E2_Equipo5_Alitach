
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
import { BotonGuardar } from "@/components/alitachs/boton-guardar";
import { Sacudir } from "@/components/alitachs/sacudir";
import { useEnvio } from "@/components/alitachs/usar-envio";

const VACIO = { nombre: "", telefono: "", correo: "", notas: "" };

export default function Clientes() {
  const [cliente, setCliente] = useState(VACIO);
  const [errores, setErrores] = useState([]);
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const envio = useEnvio();

  // Marca en rojo el campo si algún error lo menciona
  const falla = (palabra) =>
    errores.some((e) => e.toLowerCase().includes(palabra));

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
      envio.fallo();
      return;
    }

    setGuardando(true);

    try {
      await guardarCliente(cliente);
      envio.exito();
      toast.success("Cliente guardado.");
      setCliente(VACIO);
      setResultados(await buscarClientes(texto));
    } catch (error) {
      setErrores(["Error al guardar: " + error.message]);
      envio.fallo();
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
                <Sacudir veces={falla("nombre") ? envio.intentos : 0}>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={cliente.nombre}
                    onChange={cambiar}
                    aria-invalid={falla("nombre")}
                  />
                </Sacudir>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="telefono">Teléfono</Label>
                <Sacudir veces={falla("teléfono") ? envio.intentos : 0}>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={cliente.telefono}
                    onChange={cambiar}
                    placeholder="10 números"
                    aria-invalid={falla("teléfono")}
                  />
                </Sacudir>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="correo">Correo</Label>
                <Sacudir veces={falla("correo") ? envio.intentos : 0}>
                  <Input
                    id="correo"
                    name="correo"
                    type="email"
                    value={cliente.correo}
                    onChange={cambiar}
                    aria-invalid={falla("correo")}
                  />
                </Sacudir>
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

              <BotonGuardar
                guardando={guardando}
                listo={envio.listo}
                className="w-full"
              >
                Registrar
              </BotonGuardar>

              <Sacudir veces={envio.intentos}>
                <ListaErrores errores={errores} />
              </Sacudir>
            </form>
          </CardContent>
        </Card>

        <Card className="min-w-0 gap-0 py-0">
          <form onSubmit={buscar} className="flex gap-2 border-b p-4">
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
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
