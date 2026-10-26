//Funciones de lógica para el sistema de Alitach

export function validarProducto(producto) {
  const errores = [];

  if (!producto.tipo_prenda || producto.tipo_prenda.trim() === "") {
    errores.push("Escribe el tipo de prenda");
  }

  const precio = Number(producto.precio);
  if (producto.precio === undefined || producto.precio === "" || isNaN(precio)) {
    errores.push("Escribe un precio válido");
  } else if (precio <= 0) {
    errores.push("El precio debe ser mayor a $0");
  }

  return { valido: errores.length === 0, errores };
}