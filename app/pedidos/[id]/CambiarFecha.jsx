"use client";

// Cambiar la fecha compromiso (RF6): la fecha original se conserva
import { useState } from "react";
import { cambiarFechaCompromiso } from "../../../lib/datos";
import { puedeModificarFecha } from "../../../lib/logica";

export default function CambiarFecha({ pedido, alCambiar }) {
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [errores, setErrores] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Revisa RN-03 y RN-04 y, si se puede, guarda la nueva fecha
  async function cambiar(e) {
    e.preventDefault();

    const resultado = puedeModificarFecha(pedido, nuevaFecha);
    setErrores(resultado.errores);
    setMensaje("");

    if (!resultado.valido) {
      return;
    }

    setGuardando(true);

    try {
      await cambiarFechaCompromiso(pedido.id, nuevaFecha);
      setNuevaFecha("");
      setMensaje("Fecha cambiada. La fecha original se conserva.");
      await alCambiar();
    } catch (error) {
      setErrores(["Error al cambiar la fecha: " + error.message]);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={cambiar}>
      <h2>Cambiar fecha compromiso</h2>

      <input
        type="date"
        value={nuevaFecha}
        onChange={(e) => setNuevaFecha(e.target.value)}
      />{" "}

      <button type="submit" disabled={guardando}>
        {guardando ? "Guardando..." : "Cambiar fecha"}
      </button>

      {mensaje && <p>{mensaje}</p>}

      {errores.length > 0 && (
        <ul>
          {errores.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
              )}
    </form>
  );
}