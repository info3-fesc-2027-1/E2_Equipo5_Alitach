"use client";

// Pantalla de clientes (RF1): registrar un cliente y buscarlo por nombre

import { useState } from "react";
import { validarCliente } from "../../lib/logica";
import { guardarCliente, buscarClientes } from "../../lib/datos";

const VACIO = { nombre: "", telefono: "", correo: "", notas: "" };

export default function Clientes() {
  const [cliente, setCliente] = useState(VACIO);
  const [errores, setErrores] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // Guarda lo que se escribe en cada campo
  function cambiar(e) {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  }

  // Revisa el cliente y, si es válido, lo guarda en Supabase
  async function registrar(e) {
    e.preventDefault();
    const resultado = validarCliente(cliente);
    setErrores(resultado.errores);
    setMensaje("");

    if (!resultado.valido) {
      return;
    }

    setGuardando(true);
    try {
      await guardarCliente(cliente);
      setMensaje("Cliente guardado.");
      setCliente(VACIO);
    } catch (error) {
      setMensaje("Error al guardar: " + error.message);
    } finally {
      setGuardando(false);
    }
  }

  // Busca clientes que tengan el texto en su nombre
  async function buscar(e) {
    e.preventDefault();
    try {
      const lista = await buscarClientes(texto);
      setResultados(lista);
    } catch (error) {
      setMensaje("Error al buscar: " + error.message);
    }
  }

  return (
    <main>
      <h1>Clientes</h1>

      <h2>Registrar cliente</h2>
      <form onSubmit={registrar}>
        <p>
          <label>
            Nombre<br />
            <input name="nombre" value={cliente.nombre} onChange={cambiar} />
          </label>
        </p>
        <p>
          <label>
            Teléfono<br />
            <input name="telefono" value={cliente.telefono} onChange={cambiar} />
          </label>
        </p>
        <p>
          <label>
            Correo<br />
            <input name="correo" type="email" value={cliente.correo} onChange={cambiar} />
          </label>
        </p>
        <p>
          <label>
            Notas de personalización<br />
            <input name="notas" value={cliente.notas} onChange={cambiar} />
          </label>
        </p>
        <button type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Registrar"}
        </button>
      </form>

      {errores.length > 0 && (
        <ul>
          {errores.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      {mensaje && <p>{mensaje}</p>}

      <h2>Buscar cliente</h2>
      <form onSubmit={buscar}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe parte del nombre" />
        <button type="submit">Buscar</button>
      </form>

      <ul>
        {resultados.map((c) => (
          <li key={c.id}>
            {c.nombre} · {c.telefono} · {c.correo} · {c.notas}
          </li>
        ))}
      </ul>
    </main>
  );
}
