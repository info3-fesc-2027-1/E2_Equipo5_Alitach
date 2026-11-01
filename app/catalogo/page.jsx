"use client";

// Pantalla del catálogo (RF2): el personal registra y consulta prendas para cotizar

import { useState } from "react";
import { validarProducto } from "../../lib/logica";
import { guardarProducto } from "../../lib/datos";

export default function Catalogo() {
  const [producto, setProducto] = useState({
    tipo_prenda: "",
    modelo: "",
    colores: "",
    precio: "",
  });
  const [errores, setErrores] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // Guarda lo que se escribe en cada campo
  function cambiar(e) {
    setProducto({ ...producto, [e.target.name]: e.target.value });
  }

    // Revisa el producto y si es válido lo guarda en Supabase
  async function registrar(e) {
    e.preventDefault();
    const resultado = validarProducto(producto);
    setErrores(resultado.errores);
    setMensaje("");

    if (!resultado.valido) {
      return;
    }

    try {
      await guardarProducto({ ...producto, precio: Number(producto.precio) });
      setMensaje("Producto guardado.");
      setProducto({ tipo_prenda: "", modelo: "", colores: "", precio: "" });
    } catch (error) {
      setMensaje("Error al guardar: " + error.message);
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
              placeholder="Ej. " />
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
        <button type="submit">Registrar</button>
      </form>

      {errores.length > 0 && (
        <ul>
          {errores.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      {mensaje && <p>{mensaje}</p>}
    </main>
  );
}