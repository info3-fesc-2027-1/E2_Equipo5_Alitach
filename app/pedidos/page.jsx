
"use client";

// Listado de pedidos (RF5): por estado o por cliente, con los atrasados primero

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { obtenerPedidos } from "../../lib/datos";

import {
  ordenarPedidos,
  esAtrasado,
  calcularTotal,
} from "../../lib/logica";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  AtrasadoBadge,
  EncabezadoPagina,
  EstadoBadge,
  ListaErrores,
  Pagina,
  dinero,
  fechaCorta,
} from "@/components/comunes";

import { FiltroEstados } from "@/components/alitachs/filtro-estados";
import { cn } from "@/lib/utils";

const ESTADOS = ["Pendiente", "En proceso", "Entregado", "Cancelado"];
const TODOS = "todos";

export default function Pedidos() {
  const router = useRouter();

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [estado, setEstado] = useState(TODOS);
  const [cliente, setCliente] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Si llega desde una etiqueta del Panel (ej. /pedidos?estado=Pendiente) ya viene filtrado
    const desdePanel = new URLSearchParams(window.location.search).get("estado");

    if (ESTADOS.includes(desdePanel)) {
      setEstado(desdePanel);
    }

    obtenerPedidos()
      .then(setPedidos)
      .catch((e) => setError("Error al cargar pedidos: " + e.message))
      .finally(() => setCargando(false));
  }, []);

  // Filtra por estado y por nombre del cliente, y luego ordena (RN-11)
  const texto = cliente.trim().toLowerCase();

  const filtrados = pedidos.filter((p) => {
    const nombre = (p.cliente?.nombre || "").toLowerCase();

    return (
      (estado === TODOS || p.estado === estado) &&
      nombre.includes(texto)
    );
  });

  const lista = ordenarPedidos(filtrados);

  const contar = (s) => pedidos.filter((p) => p.estado === s).length;

  return (
    <Pagina>
      <EncabezadoPagina
        etiqueta="Operación"
        titulo="Pedidos"
        descripcion={
          cargando
            ? "Cargando pedidos..."
            : pedidos.length +
              (pedidos.length === 1
                ? " pedido en total"
                : " pedidos en total") +
              " · los atrasados van primero"
        }
      />

      <h2 className="texto-mano mb-3 font-bold">01. Filtrar</h2>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Buscar por cliente"
            className="pl-9"
          />
        </div>

        <FiltroEstados
          valor={estado}
          alCambiar={setEstado}
          opciones={[
            {
              valor: TODOS,
              texto: "Todos",
              cantidad: pedidos.length,
            },
            ...ESTADOS.map((s) => ({
              valor: s,
              texto: s,
              cantidad: contar(s),
            })),
          ]}
        />

        <p className="texto-mano lg:ml-auto">
          {lista.length} {lista.length === 1 ? "pedido" : "pedidos"}
        </p>
      </div>

      <h2 className="texto-mano mb-3 font-bold">02. Resultados</h2>

      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          {error && (
            <div className="p-4">
              <ListaErrores errores={[error]} />
            </div>
          )}

          {cargando ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : lista.length === 0 ? (
            <p className="texto-mano p-10 text-center">
              No hay pedidos con esos filtros.
            </p>
          ) : (
            <Table className="tabla-movil">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Estado</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha compromiso</TableHead>
                  <TableHead className="text-right">Piezas</TableHead>
                  <TableHead className="pr-4 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {lista.map((p) => {
                  const prendas = p.prenda_pedido || [];
                  const atrasado = esAtrasado(p);

                  return (
                    <TableRow
                      key={p.id}
                      onClick={() => router.push("/pedidos/" + p.id)}
                      className={cn(
                        "cursor-pointer",
                        atrasado && "fila-atrasada"
                      )}
                    >
                      <TableCell data-et="Estado" className="pl-4">
                        <div className="flex flex-wrap gap-1">
                          <EstadoBadge estado={p.estado} />
                          {atrasado && <AtrasadoBadge />}
                        </div>
                      </TableCell>

                      <TableCell data-et="Pedido">
                        <Link
                          href={"/pedidos/" + p.id}
                          onClick={(e) => e.stopPropagation()}
                          className="font-extrabold text-primary hover:underline"
                        >
                          #{p.id}
                        </Link>
                      </TableCell>

                      <TableCell data-et="Cliente">
                        {p.cliente?.nombre}
                      </TableCell>

                      <TableCell
                        data-et="Fecha compromiso"
                        className={cn(
                          atrasado && "font-medium text-red-600"
                        )}
                      >
                        {fechaCorta(p.fecha_compromiso)}
                      </TableCell>

                      <TableCell
                        data-et="Piezas"
                        className="text-right tabular-nums"
                      >
                        {prendas.reduce((s, x) => s + x.piezas, 0)}
                      </TableCell>

                      <TableCell
                        data-et="Total"
                        className="pr-4 text-right font-semibold tabular-nums"
                      >
                        {dinero(calcularTotal(prendas))}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Pagina>
  );
}
