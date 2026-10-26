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
  if (error2) throw error2;
  return nuevo;
}

export async function obtenerPedidos() {
  const { data, error } = await supabase.from("pedido").select("*, cliente(nombre)");
  if (error) throw error;
  return data;
