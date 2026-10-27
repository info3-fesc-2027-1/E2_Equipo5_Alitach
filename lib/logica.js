//Funciones de lógica para el sistema de Alitach

export function validarCliente(cliente) {
  const errores = []; 


  if (!cliente.nombre || cliente.nombre.trim() === "") { 
    errores.push("Falta el nombre");
  }


  if (!cliente.telefono && !cliente.correo) {
    errores.push("Debe tener teléfono o correo");
  }


  return { valido: errores.length === 0, errores };
}


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

export function hoyTexto() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return hoy.getFullYear() + "-" + mes + "-" + dia;
}

