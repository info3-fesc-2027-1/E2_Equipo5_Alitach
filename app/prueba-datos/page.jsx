"use client";
import { useState } from "react";
import { guardarCliente, buscarClientes, obtenerPedido, obtenerHistorial, obtenerUsuarios } from "../../lib/datos";

export default function PruebaDatos() {
 const [resultado, setResultado] = useState("");


  async function probar() {
    try {
      await guardarCliente({ nombre: "Cliente de prueba", telefono: "5500000000" });
      const encontrados = await buscarClientes("prueba");
      setResultado(JSON.stringify(encontrados, null, 2));
    } catch (e) {
      setResultado("Error: " + e.message);
    }
  }
   async function leer() {
    try {
      const pedido = await obtenerPedido(1);
      const historial = await obtenerHistorial(1);
      const usuarios = await obtenerUsuarios();
      setResultado(JSON.stringify({ pedido, historial, usuarios }, null, 2));
    } catch (e) {
      setResultado("Error: " + e.message);
    }
  }
  return (
    <main>
     <button onClick={probar}>Guardar y leer cliente</button>{" "}
      <button onClick={leer}>Leer pedido 1 y usuarios</button>
      <pre>{resultado}</pre>
    </main>
  );
}
