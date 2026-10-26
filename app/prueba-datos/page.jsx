"use client";
import { useState } from "react";
import { guardarCliente, buscarClientes } from "../../lib/datos";

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

  return (
    <main>
      <button onClick={probar}>Guardar y leer cliente</button>
      <pre>{resultado}</pre>
    </main>
  );
}
