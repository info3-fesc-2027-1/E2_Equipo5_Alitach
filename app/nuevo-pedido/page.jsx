"use client";

// Pantalla de nuevo pedido (RF3): elegir cliente, agregar prendas y fecha compromiso

import { useState, useEffect } from "react";
import { validarPedido, calcularTotal, calcularPrecioPieza } from "../../lib/logica";
import { buscarClientes, obtenerProductos, obtenerOpciones, guardarPedido } from "../../lib/datos";

const PRENDA_VACIA = { producto_id: "", opcion_id: "", piezas: 1, talla: "", color: "", precio_unitario: 0 };

export default function NuevoPedido() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [opciones, setOpciones] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [fechaCompromiso, setFechaCompromiso] = useState("");
  const [prendas, setPrendas] = useState([{ ...PRENDA_VACIA }]);
  const [errores, setErrores] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Al abrir la pantalla, trae clientes, productos y opciones de Supabase
  useEffect(() => {
    async function cargar() {
      try {
        setClientes(await buscarClientes(""));
        setProductos(await obtenerProductos());
        setOpciones(await obtenerOpciones());
      } catch (error) {
        setErrores(["Error al cargar datos: " + error.message]);
      }
    }
    cargar();
  }, []);

  function agregarPrenda() {
    setPrendas([...prendas, { ...PRENDA_VACIA }]);
  }

  function cambiarPrenda(index, campo, valor) {
    const nuevas = [...prendas];
    nuevas[index] = { ...nuevas[index], [campo]: valor };
    setPrendas(nuevas);
  }

    // Al elegir producto u opción, el precio por pieza = producto + opción (RF3)
  function elegirProducto(index, id) {
    const nuevas = [...prendas];
    const producto = productos.find((p) => String(p.id) === id);
    const opcion = opciones.find((o) => String(o.id) === String(nuevas[index].opcion_id));
    nuevas[index] = { ...nuevas[index], producto_id: id, precio_unitario: calcularPrecioPieza(producto, opcion) };
    setPrendas(nuevas);
  }

  function elegirOpcion(index, id) {
    const nuevas = [...prendas];
    const producto = productos.find((p) => String(p.id) === String(nuevas[index].producto_id));
    const opcion = opciones.find((o) => String(o.id) === id);
    nuevas[index] = { ...nuevas[index], opcion_id: id, precio_unitario: calcularPrecioPieza(producto, opcion) };
    setPrendas(nuevas);
  }

  async function registrar(e) {
    e.preventDefault();
    setMensaje("");

    const pedido = { cliente_id: clienteId, fecha_compromiso: fechaCompromiso, prendas: prendas };
    const resultado = validarPedido(pedido);
    setErrores(resultado.errores);

    if (!resultado.valido) {
      return;
    }

    setGuardando(true);
    try {
      await guardarPedido(
        { cliente_id: clienteId, fecha_compromiso: fechaCompromiso, fecha_compromiso_original: fechaCompromiso, estado: "Pendiente" },
        prendas.map((p) => ({ ...p, opcion_id: p.opcion_id || null }))
      );
      setMensaje("Pedido guardado en Pendiente.");
      setClienteId("");
      setFechaCompromiso("");
      setPrendas([{ ...PRENDA_VACIA }]);
    } catch (error) {
      setErrores(["Error al guardar: " + error.message]);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main>
      <h1>Nuevo pedido</h1>

      <form onSubmit={registrar}>
        <p>
          <label>
            Cliente<br />
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Elige un cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </label>
        </p>

        <p>
          <label>
            Fecha compromiso<br />
            <input type="date" value={fechaCompromiso}
              onChange={(e) => setFechaCompromiso(e.target.value)} />
          </label>
        </p>

        <h2>Prendas</h2>
        {prendas.map((prenda, index) => (
          <fieldset key={index}>
            <legend>Prenda {index + 1}</legend>
            <select value={prenda.producto_id} onChange={(e) => elegirProducto(index, e.target.value)}>
              <option value="">Producto</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>{p.tipo_prenda} · {p.modelo}</option>
              ))}
            </select>{" "}
            <select value={prenda.opcion_id} onChange={(e) => elegirOpcion(index, e.target.value)}>
              <option value="">Sin personalización</option>
              {opciones.map((o) => (
                <option key={o.id} value={o.id}>{o.tipo} · {o.descripcion}</option>
              ))}
            </select>{" "}
            <input type="number" min="1" value={prenda.piezas} placeholder="Piezas"
              onChange={(e) => cambiarPrenda(index, "piezas", Number(e.target.value))} />{" "}
            <input value={prenda.talla} placeholder="Talla"
              onChange={(e) => cambiarPrenda(index, "talla", e.target.value)} />{" "}
            <input value={prenda.color} placeholder="Color"
              onChange={(e) => cambiarPrenda(index, "color", e.target.value)} />{" "}
            <span>${prenda.precio_unitario} c/u</span>
          </fieldset>
        ))}
        <button type="button" onClick={agregarPrenda}>+ Agregar otra prenda</button>

        <p><b>Total: ${calcularTotal(prendas).toFixed(2)}</b></p>

        <button type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar pedido"}
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
    </main>
  );
}
