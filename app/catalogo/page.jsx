"use client";

// Pantalla del catálogo (RF2): el personal registra y consulta prendas para cotizar

import { useState, useEffect } from "react";
import { validarProducto, validarOpcion } from "../../lib/logica";
import { guardarProducto, obtenerProductos, guardarOpcion, obtenerOpciones } from "../../lib/datos";

export default function Catalogo() {
  const [producto, setProducto] = useState({
    tipo_prenda: "",
    modelo: "",
    colores: "",
    precio: "",
  });
  const [errores, setErrores] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [productos, setProductos] = useState([]);
  const [opcion, setOpcion] = useState({ tipo: "Bordado", descripcion: "", precio: "" });
  const [opciones, setOpciones] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // Trae de Supabase la lista de productos
  async function cargarProductos() {
    try {
      const lista = await obtenerProductos();
      setProductos(lista);
    } catch (error) {
      setMensaje("Error al cargar el catálogo: " + error.message);
    }
  }

  // Trae de Supabase las opciones de bordado y serigrafía
  async function cargarOpciones() {
    try {
      const lista = await obtenerOpciones();
      setOpciones(lista);
    } catch (error) {
      setMensaje("Error al cargar las opciones: " + error.message);
    }
  }

  // Al abrir la pantalla, carga el catálogo y las opciones una vez
  useEffect(() => {
    cargarProductos();
    cargarOpciones();
  }, []);

  // Guarda lo que se escribe en cada campo
  function cambiar(e) {
    setProducto({ ...producto, [e.target.name]: e.target.value });
  }

  // Revisa el producto y, si es válido, lo guarda en Supabase
  async function registrar(e) {
    e.preventDefault();
    const resultado = validarProducto(producto);
    setErrores(resultado.errores);
    setMensaje("");

    if (!resultado.valido) {
      return;
    }

    setGuardando(true);
    try {
      await guardarProducto({ ...producto, precio: Number(producto.precio) });
      setMensaje("Producto guardado.");
      setProducto({ tipo_prenda: "", modelo: "", colores: "", precio: "" });
      cargarProductos();
    } catch (error) {
      setMensaje("Error al guardar: " + error.message);
    } finally {
      setGuardando(false);
    }
  }

  // Guarda una opción de personalización (bordado o serigrafía)
  async function registrarOpcion(e) {
    e.preventDefault();
    setMensaje("");
    const resultado = validarOpcion(opcion);
    setErrores(resultado.errores);
    if (!resultado.valido) {
      return;
    }
    setGuardando(true);
    try {
      await guardarOpcion({ ...opcion, precio: Number(opcion.precio) });
      setMensaje("Opción guardada.");
      setOpcion({ tipo: "Bordado", descripcion: "", precio: "" });
      cargarOpciones();
    } catch (error) {
      setMensaje("Error al guardar la opción: " + error.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main>
      <h1>Catálogo de productos</h1>
      <p>Aquí el personal registra y consulta las prendas para cotizar.</p>

      <h2>Registrar producto</h2>
      <form onSubmit={registrar}>
        <p>
          <label>
            Tipo de prenda<br />
            <input name="tipo_prenda" value={producto.tipo_prenda} onChange={cambiar}
              placeholder="Ej. Chaleco de seguridad" />
          </label>
        </p>
        <p>
          <label>
            Modelo<br />
            <input name="modelo" value={producto.modelo} onChange={cambiar}
              placeholder="Ej. Reflejante" />
          </label>
        </p>
        <p>
          <label>
            Colores<br />
            <input name="colores" value={producto.colores} onChange={cambiar}
              placeholder="Ej. rosa" />
          </label>
        </p>
        <p>
          <label>
            Precio (MXN)<br />
            <input name="precio" type="number" step="0.01" value={producto.precio} onChange={cambiar}
              placeholder="Ej. 250" />
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

      <h2>Productos registrados</h2>
      {productos.length === 0 ? (
        <p>Todavía no hay productos.</p>
      ) : (
        <ul>
          {productos.map((p) => (
            <li key={p.id}>
              {p.tipo_prenda} · {p.modelo} · {p.colores} · ${p.precio}
            </li>
          ))}
        </ul>
      )}

      <h2>Opciones de personalización</h2>
      <form onSubmit={registrarOpcion}>
        <select value={opcion.tipo} onChange={(e) => setOpcion({ ...opcion, tipo: e.target.value })}>
          <option value="Bordado">Bordado</option>
          <option value="Serigrafía">Serigrafía</option>
        </select>{" "}
        <input value={opcion.descripcion} placeholder="Ej. Logo en el pecho"
          onChange={(e) => setOpcion({ ...opcion, descripcion: e.target.value })} />{" "}
        <input type="number" step="0.01" value={opcion.precio} placeholder="Precio"
          onChange={(e) => setOpcion({ ...opcion, precio: e.target.value })} />{" "}
        <button type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Agregar opción"}
        </button>
      </form>

      <ul>
        {opciones.map((o) => (
          <li key={o.id}>
            {o.tipo} · {o.descripcion} · ${o.precio}
          </li>
        ))}
      </ul>
    </main>
  );
}