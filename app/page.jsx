"use client";

// Panel de inicio: frase del día, accesos a cada pantalla, indicadores y pedidos por atender :D

import { useState, useEffect } from "react";
import Link from "next/link";
import { CirclePlus, ClipboardList, Shirt, UserPlus } from "lucide-react";
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

import { Maniqui } from "@/components/alitachs/maniqui";
import {
  Acceso,
  EstadoBadge,
  Kpi,
  ListaErrores,
  Pagina,
  Seccion,
  dinero,
  fechaCorta,
} from "@/components/comunes";

// Lista corta de pedidos para las tarjetas del panel
function ListaCorta({ pedidos, vacio, rojo }) {
  if (pedidos.length === 0) {
    return (
      <p className="texto-mano py-6 text-center">
        {vacio}
      </p>
    );
  }

  return (
    <ul className="lista-corta">
      {pedidos.map((p) => (
        <li key={p.id}>
          <Link
            href={"/pedidos/" + p.id}
>
            <span className="num">#{p.id}</span>
            <span className="min-w-0 flex-1 truncate">
              {p.cliente?.nombre}
            </span>

            <span className="hidden sm:inline-flex">
              <EstadoBadge estado={p.estado} />
            </span>

            <span
              className={
                "w-24 text-right text-sm " +
                (rojo
                  ? "font-medium text-red-600"
                  : "text-muted-foreground")
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
  const [hoy, setHoy] = useState("");

  useEffect(() => {
    // La fecha se calcula ya en el navegador (no al compilar)
    setHoy(
      new Date().toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    );
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

  const montoActivo = activos.reduce(
    (s, p) => s + calcularTotal(p.prenda_pedido || []),
    0,
  );

  // Para ir a Pedidos ya filtrado por estado (RF5)
  const verEstado = (estado) => "/pedidos?estado=" + encodeURIComponent(estado);

  return (
    <Pagina>
      {/* Frase del día con los números en botoncitos cosidos */}
      <div className="panel-enc">
        <div className="min-w-0 flex-1">
          <span className="nota-etiqueta">({hoy || "Hoy"})</span>
          {cargando ? (
            <Skeleton className="mt-2 h-24 max-w-xl" />
          ) : atrasados.length > 0 ? (
            <p className="frase-panel">
              Hola. Hoy hay <span className="chip rojo">{atrasados.length}</span>{" "}
              {atrasados.length === 1 ? "pedido atrasado" : "pedidos atrasados"} y{" "}
              <span className="chip verde">{proximos.length}</span>{" "}
              {proximos.length === 1 ? "próxima entrega." : "próximas entregas."}
            </p>
          ) : (
            <p className="frase-panel">
              Hola. Todo va al día: <span className="chip verde">0</span> atrasados y{" "}
              <span className="chip verde">{proximos.length}</span>{" "}
              {proximos.length === 1 ? "próxima entrega." : "próximas entregas."}
            </p>
          )}
          <svg className="costura-panel" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 22 C 120 8, 240 34, 380 20 S 640 6, 780 22 S 940 30, 1000 16" />
          </svg>
        </div>
        <Maniqui />
      </div>

      <ListaErrores errores={error ? [error] : []} />

      <Seccion numero={1}>¿Qué quieres hacer?</Seccion>
      <div className="accesos">
        <Acceso
          href="/nuevo-pedido"
          principal
          numero="01"
          icono={CirclePlus}
          titulo="Nuevo pedido"
          texto="Registrar un pedido con sus prendas y fecha compromiso."
        />
        <Acceso
          href="/pedidos"
          numero="02"
          icono={ClipboardList}
          titulo="Consultar pedidos"
          texto="Ver, filtrar y cambiar el estado de los pedidos."
        />
        <Acceso
          href="/clientes"
          numero="03"
          icono={UserPlus}
          titulo="Clientes"
          texto="Registrar clientes y consultar sus datos."
        />
        <Acceso
          href="/catalogo"
          numero="04"
          icono={Shirt}
          titulo="Productos"
          texto="Catálogo de prendas, precios y opciones."
        />
      </div>

      <Seccion numero={2}>Indicadores</Seccion>
      {cargando ? (
        <div className="tendedero">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="tendedero">
          <Kpi etiqueta="Pendientes" valor={contar("Pendiente")} href={verEstado("Pendiente")} />
          <Kpi etiqueta="En proceso" valor={contar("En proceso")} href={verEstado("En proceso")} />
          <Kpi etiqueta="Entregados" valor={contar("Entregado")} tono="verde" href={verEstado("Entregado")} />
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

      <Seccion numero={3}>Pedidos por atender</Seccion>
      <div className="grid gap-5 lg:grid-cols-2 *:min-w-0">
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
      </div>
    </Pagina>
  );
}