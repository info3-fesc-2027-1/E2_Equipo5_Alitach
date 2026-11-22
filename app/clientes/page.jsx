"use client";

// Pantalla de clientes (RF1): registrar un cliente y buscarlo por nombre en el directorio de fichas

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { validarCliente } from "../../lib/logica";
import { guardarCliente, buscarClientes, existeCliente } from "../../lib/datos";
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
  EncabezadoPagina,
  ListaErrores,
  Pagina,
  Seccion,
} from "@/components/comunes";
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
  const [total, setTotal] = useState(null);
  const envio = useEnvio();

  // Marca en rojo el campo si algún error lo menciona
  const falla = (palabra) =>
    errores.some((e) => e.toLowerCase().includes(palabra));

  // Al abrir la pantalla muestra todos los clientes
  useEffect(() => {
    buscarClientes("")
      .then((lista) => {
        setResultados(lista);
        setTotal(lista.length);
      })
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
      if (await existeCliente(cliente.nombre)) {
        setErrores(["Ya existe un cliente con ese nombre"]);
        envio.fallo();
        return;
      }
      await guardarCliente({ ...cliente, nombre: cliente.nombre.trim() });
      envio.exito();
      toast.success("Cliente guardado.");
      setTotal((n) => (n ?? 0) + 1);
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

  // Directorio en orden alfabético
  const fichas = [...resultados].sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  );

  return (
    <Pagina>
      <EncabezadoPagina
        etiqueta="Catálogo"
        titulo="Clientes"
        descripcion={
          total === null
            ? "Cargando clientes..."
            : total +
              (total === 1 ? " cliente registrado" : " clientes registrados")
        }
      />

      <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-9">
          <Seccion numero={1}>Registrar cliente</Seccion>
          <Card>
            <CardHeader>
              <CardTitle>Nuevo cliente</CardTitle>
              <CardDescription>
                Necesita nombre y al menos teléfono o correo.
              </CardDescription>
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
                      placeholder="Nombre o empresa"
                      aria-invalid={falla("nombre")}
                    />
                  </Sacudir>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Sacudir veces={falla("teléfono") ? envio.intentos : 0}>
                      <Input
                        id="telefono"
                        name="telefono"
                        inputMode="numeric"
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
                        placeholder="ana@correo.com"
                        aria-invalid={falla("correo")}
                      />
                    </Sacudir>
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="notas">Notas de personalización</Label>
                  <Input
                    id="notas"
                    name="notas"
                    value={cliente.notas}
                    onChange={cambiar}
                    placeholder="Preferencias de bordado, tallas, colores..."
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
        </div>

        <div className="flex min-w-0 flex-col gap-9">
          <Seccion numero={2}>Directorio</Seccion>
          <div className="flex flex-col gap-5">
            <form onSubmit={buscar} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
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

            {fichas.length === 0 ? (
              <p className="texto-mano py-8 text-center">
                No hay clientes con ese nombre.
              </p>
            ) : (
              <div className="fichas">
                {fichas.map((c) => (
                  <div key={c.id} className="ficha">
                    <div className="ficha-cab">
                      <span className="inicial">
                        {c.nombre.charAt(0).toUpperCase()}
                      </span>
                      <b>{c.nombre}</b>
                    </div>
                    <dl>
                      <dt>Teléfono</dt>
                      <dd>{c.telefono || "-"}</dd>
                      <dt>Correo</dt>
                      <dd>{c.correo || "-"}</dd>
                      <dt>Notas</dt>
                      <dd>{c.notas || "-"}</dd>
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Pagina>
  );
}