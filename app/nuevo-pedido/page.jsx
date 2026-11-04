"use client";
import { useState } from "react";
import { validarPedido, calcularTotal } from "@/lib/logica";
import { guardarPedidoEnSupabase } from "@/lib/datos";

export default function NuevoPedidoPage() {
  const [clienteId, setClienteId] = useState("");
  const [fechaCompromiso, setFechaCompromiso] = useState("");
  const [prendas, setPrendas] = useState([
    { tipo_prenda: "", piezas: 1, precio_unitario: 0 }
  ]);
  const [errores, setErrores] = useState([]);
  const [exito, setExito] = useState(false);

  const agregarPrenda = () => {
    setPrendas([...prendas, { tipo_prenda: "", piezas: 1, precio_unitario: 0 }]);
  };

  const actualizarPrenda = (index, campo, valor) => {
    const nuevasPrendas = [...prendas];
    nuevasPrendas[index][campo] = valor;
    setPrendas(nuevasPrendas);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setExito(false);

    const pedidoAValidar = {
      cliente_id: clienteId,
      fecha_compromiso: fechaCompromiso,
      prendas: prendas
    };

    const resultado = validarPedido(pedidoAValidar);

    if (!resultado.valido) {
      setErrores(resultado.errores);
      return;
    }

    setErrores([]);

    try {
      
      await guardarPedidoEnSupabase(pedidoAValidar);
      setExito(true);
      console.log("Pedido guardado exitosamente en Supabase:", pedidoAValidar);
    } catch (error) {
      setErrores([error.message]);
    }
  };

  const totalCalculado = calcularTotal(prendas);

  return (
    <main className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Registrar Nuevo Pedido (RF3)</h1>

      {errores.length > 0 && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Por favor corrige los siguientes errores:</p>
          <ul className="list-disc pl-5">
            {errores.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {exito && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          ¡Registro exitoso! El pedido se ha guardado correctamente en la base de datos.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">ID del Cliente:</label>
          <input
            type="text"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Ej. cli-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha Compromiso:</label>
          <input
            type="date"
            value={fechaCompromiso}
            onChange={(e) => setFechaCompromiso(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-2">Prendas y Personalización</h2>
          {prendas.map((prenda, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <input
                type="text"
                placeholder="Tipo de prenda"
                value={prenda.tipo_prenda}
                onChange={(e) => actualizarPrenda(index, "tipo_prenda", e.target.value)}
                className="w-1/3 p-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                placeholder="Piezas"
                min="1"
                value={prenda.piezas}
                onChange={(e) => actualizarPrenda(index, "piezas", Number(e.target.value))}
                className="w-1/4 p-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                placeholder="Precio unitario ($)"
                min="0"
                step="0.01"
                value={prenda.precio_unitario}
                onChange={(e) => actualizarPrenda(index, "precio_unitario", Number(e.target.value))}
                className="w-1/3 p-2 border border-gray-300 rounded-md"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={agregarPrenda}
            className="mt-2 px-4 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            + Añadir otra prenda
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-md mt-4 flex justify-between items-center">
          <span className="font-semibold text-gray-700">Total Calculado:</span>
          <span className="text-xl font-bold text-green-600">${totalCalculado.toFixed(2)}</span>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 font-semibold"
        >
          Guardar y Registrar Pedido
        </button>
      </form>
    </main>
  );
}