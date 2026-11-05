import { supabase } from "./supabase";

export async function guardarPedidoEnSupabase(pedido) {
  const { data: pedidoData, error: errorPedido } = await supabase
    .from("pedido") // <-- Corregido: se llama "pedido" (sin 's')
    .insert([
      {
        cliente_id: pedido.cliente_id,
        fecha_compromiso: pedido.fecha_compromiso,
      },
    ])
    .select()
    .single();

  if (errorPedido) {
    throw new Error("Error al guardar el pedido: " + errorPedido.message);
  }

  const pedidoId = pedidoData.id;

  const prendasAInsertar = pedido.prendas.map((p) => ({
    pedido_id: pedidoId,
    producto_id: p.producto_id, // Asegúrate de incluir producto_id si lo usas
    piezas: p.piezas,
    talla: p.talla,
    color: p.color,
    precio_unitario: p.precio_unitario,
  }));

  const { error: errorPrendas } = await supabase
    .from("prenda_pedido") // <-- Corregido: se llama "prenda_pedido"
    .insert(prendasAInsertar);

  if (errorPrendas) {
    throw new Error("Error al guardar las prendas: " + errorPrendas.message);
  }

  return true;
}

export async function guardarOpcion(opcion) {
  const { data, error } = await supabase.from("opcion_personalizacion").insert(opcion).select();
  if (error) throw error;
  return data[0];
}

export async function obtenerOpciones() {
  const { data, error } = await supabase.from("opcion_personalizacion").select("*");
  if (error) throw error;
  return data;
}