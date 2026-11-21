"use client";
// Panel de inicio: indicadores de los pedidos, atrasados y próximas entregas :D

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { obtenerPedidos } from "../lib/datos";
import { calcularTotal, esAtrasado, ordenarPedidos } from "../lib/logica";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EncabezadoPagina,
  EstadoBadge,
  Kpi,
  ListaErrores,
  Pagina,
  dinero,
  fechaCorta,
} from "@/components/comunes";
import { CorteTijeras } from "@/components/alitachs/corte-tijeras";

// Lista corta de pedidos para las tarjetas del panel
function ListaCorta({ pedidos, vacio, rojo }) {
  if (pedidos.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{vacio}</p>;
  }
  return (
    <ul className="divide-y">
      {pedidos.map((p) => (
        <li key={p.id}>
          <Link
            href={"/pedidos/" + p.id}
            className="flex items-center gap-3 py-3 hover:bg-muted/50"
          >
            <span className="w-12 font-medium text-primary">#{p.id}</span>
            <span className="min-w-0 flex-1 truncate">{p.cliente?.nombre}</span>
            <EstadoBadge estado={p.estado} />
            <span
              className={
                "w-24 text-right text-sm " +
                (rojo ? "font-medium text-red-600" : "text-muted-foreground")
              }
            >
              {fechaCorta(p.fecha_compromiso)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Panel() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerPedidos()
      .then(setPedidos)
      .catch((e) => setError("Error al cargar pedidos: " + e.message))
      .finally(() => setCargando(false));
  }, []);

  const contar = (s) => pedidos.filter((p) => p.estado === s).length;
  const activos = pedidos.filter(
    (p) => p.estado === "Pendiente" || p.estado === "En proceso",
  );
  const atrasados = ordenarPedidos(pedidos.filter((p) => esAtrasado(p)));
  const proximos = ordenarPedidos(activos.filter((p) => !esAtrasado(p)));
  const montoActivo = activos.reduce((s, p) => s + calcularTotal(p.prenda_pedido || []), 0);

  return (
    <Pagina>
      <EncabezadoPagina titulo="Panel" descripcion="Resumen de los pedidos del taller.">
        <Button asChild variant="outline">
          <Link href="/pedidos">
            Ver todos los pedidos <ArrowRight />
          </Link>
        </Button>
      </EncabezadoPagina>

      <ListaErrores errores={error ? [error] : []} />

      {cargando ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Skeleton key={n} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Kpi etiqueta="Pendientes" valor={contar("Pendiente")} />
          <Kpi etiqueta="En proceso" valor={contar("En proceso")} />
          <Kpi
            etiqueta="Atrasados"
            valor={atrasados.length}
            tono={atrasados.length > 0 ? "rojo" : undefined}
          />
          <Kpi etiqueta="Entregados" valor={contar("Entregado")} />
          <Kpi
            etiqueta="Monto en curso"
            valor={dinero(montoActivo)}
            nota={
              activos.length +
              (activos.length === 1 ? " pedido activo" : " pedidos activos")
            }
          />
        </div>
      )}

      <CorteTijeras titulo="Pedidos por atender" className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atrasados</CardTitle>
            <CardDescription>
              Ya pasó su fecha compromiso y no se han entregado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ListaCorta
              pedidos={atrasados.slice(0, 5)}
              vacio="No hay pedidos atrasados."
              rojo
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas entregas</CardTitle>
            <CardDescription>
              Pedidos activos con la fecha compromiso más cercana.
            </CardDescription>
            <CardAction>
              <Button asChild variant="link" size="sm">
                <Link href="/pedidos">Ver todos</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ListaCorta
              pedidos={proximos.slice(0, 5)}
              vacio="No hay entregas pendientes."
            />
          </CardContent>
        </Card>
       </CorteTijeras>
    </Pagina>
  );
}