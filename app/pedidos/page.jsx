"use client";
// Listado de pedidos (RF5): por estado o por cliente, con los atrasados primero
import { useState, useEffect } from "react";
import { obtenerPedidos } from "../../lib/datos";
import { ordenarPedidos, esAtrasado } from "../../lib/logica";

const ESTADOS = ["Pendiente", "En proceso", "Entregado", "Cancelado"];

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [estado, setEstado] = useState("");
  const [cliente, setCliente] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerPedidos()
      .then(setPedidos)
      .catch((e) => setError("Error al cargar pedidos: " + e.message));
  }, []);

  // Filtra por estado y por nombre del cliente, y luego ordena (RN-11)
  const texto = cliente.trim().toLowerCase();
  const filtrados = pedidos.filter((p) => {
    const nombre = (p.cliente?.nombre || "").toLowerCase();
    return (estado === "" || p.estado === estado) && nombre.includes(texto);
  });

  const lista = ordenarPedidos(filtrados);

  return (
    <main>
      <h1>Pedidos</h1>
      <p>
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>{" "}
        <input
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="Buscar por cliente"
        />
      </p>

      {error && <p>{error}</p>}
      <p>{lista.length} pedidos</p>

      {lista.length === 0 ? (
        <p>No hay pedidos con esos filtros.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Fecha compromiso</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.id}>
                <td>
                  <a href={"/pedidos/" + p.id}>#{p.id}</a>
                </td>
                <td>{p.cliente?.nombre}</td>
                <td>{p.fecha_compromiso}</td>
                <td>
                  {p.estado}
                  {esAtrasado(p) && (
                    <b style={{ color: "#B42318" }}> ATRASADO</b>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
