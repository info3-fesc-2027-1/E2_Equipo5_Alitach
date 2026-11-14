import { supabase } from "./supabase";

export async function guardarCliente(cliente) {
  const { data, error } = await supabase.from("cliente").insert(cliente).select();
  if (error) throw error;
  return data[0];
}

export async function buscarClientes(texto) {
  const { data, error } = await supabase
    .from("cliente")
    .select("*")
    .ilike("nombre", "%" + texto + "%");
  if (error) throw error;
  return data;
}

export async function guardarProducto(producto) {
  const { data, error } = await supabase.from("producto").insert(producto).select();
  if (error) throw error;
  return data[0];
}

export async function obtenerProductos() {
  const { data, error } = await supabase.from("producto").select("*");
  if (error) throw error;
  return data;
}

export async function guardarPedido(pedido, prendas) {
  const { data, error } = await supabase.from("pedido").insert(pedido).select();
  if (error) throw error;
  const nuevo = data[0];
  const filas = prendas.map((p) => ({ ...p, pedido_id: nuevo.id }));
  const { error: error2 } = await supabase.from("prenda_pedido").insert(filas);
  if (error2) {
  await supabase.from("pedido").delete().eq("id", nuevo.id);
  throw error2;
}
  return nuevo;
}

export async function obtenerPedidos() {
  const { data, error } = await supabase.from("pedido").select("*, cliente(nombre)");
  if (error) throw error;
  return data;
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
export async function obtenerPedido(id) {
  if (!/^[0-9]+$/.test(String(id))) return null;
  const { data, error } = await supabase
    .from("pedido")
    .select("*, cliente(*), prenda_pedido(*, producto(*), opcion_personalizacion(*))")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function obtenerHistorial(pedidoId) {
  const { data, error } = await supabase
    .from("cambio_estado")
    .select("*, usuario(nombre)")
    .eq("pedido_id", pedidoId)
    .order("fecha_hora", { ascending: true });
  if (error) throw error;
  return data;
}

export async function obtenerUsuarios() {
  const { data, error } = await supabase.from("usuario").select("*").order("nombre");
  if (error) throw error;
  return data;
}

export async function guardarCambioEstado(pedidoId, anterior, nuevo, usuarioId, motivo) {
  const cambios = { estado: nuevo };
  if (nuevo === "Cancelado") {
    cambios.motivo_cancelacion = motivo;
  }
  const { data, error } = await supabase
    .from("pedido")
    .update(cambios)
    .eq("id", pedidoId)
    .eq("estado", anterior)
    .select();
  if (error) throw error;
  if (data.length === 0) {
    throw new Error("El pedido cambió mientras lo veías. Recarga la página.");
  }
  const { error: error2 } = await supabase.from("cambio_estado").insert({
    pedido_id: pedidoId,
    usuario_id: usuarioId,
    estado_anterior: anterior,
    estado_nuevo: nuevo,
    fecha_hora: new Date().toISOString(),
  });
  if (error2) {
    await supabase.from("pedido").update({ estado: anterior, motivo_cancelacion: null }).eq("id", pedidoId);
    throw error2;
  }
  return data[0];
}

export async function cambiarFechaCompromiso(pedidoId, nuevaFecha) {
  const { data, error } = await supabase
    .from("pedido")
    .update({ fecha_compromiso: nuevaFecha })
    .eq("id", pedidoId)
    .select();
  if (error) throw error;
  return data[0];
}

