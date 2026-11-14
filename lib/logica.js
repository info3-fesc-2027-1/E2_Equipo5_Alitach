//Funciones de lógica para el sistema de Alitach

export function validarCliente(cliente) {
  const errores = []; 


  if (!cliente.nombre || cliente.nombre.trim() === "") { 
    errores.push("Falta el nombre");
  }


  const telefono = (cliente.telefono || "").trim();  
  const correo = (cliente.correo || "").trim();  
  if (!telefono && !correo) {    
    errores.push("Debe tener teléfono o correo");  
  }  
  if (telefono && !/^[0-9]{10}$/.test(telefono)) {    
    errores.push("El teléfono debe tener 10 números, sin espacios ni guiones");  
  }  
  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {    
    errores.push("Escribe un correo válido, por ejemplo ana@correo.com");  
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

export function validarOpcion(opcion) {
  const errores = [];

  if (opcion.tipo !== "Bordado" && opcion.tipo !== "Serigrafía") {
    errores.push("El tipo debe ser Bordado o Serigrafía");
  }

  if (!opcion.descripcion || opcion.descripcion.trim() === "") {
    errores.push("Escribe la descripción de la opción");
  }

  const precio = Number(opcion.precio);
  if (opcion.precio === undefined || opcion.precio === "" || isNaN(precio) || precio < 0) {
    errores.push("Escribe un precio válido");
  }

  return { valido: errores.length === 0, errores };
}

export function hoyTexto() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return hoy.getFullYear() + "-" + mes + "-" + dia;
}

export function validarPedido(pedido) {
  const errores = [];


  if (!pedido.cliente_id) {
    errores.push("Falta el cliente");
  }


  if (!pedido.prendas || pedido.prendas.length === 0) {
    errores.push("El pedido debe tener al menos una prenda");
  } else {
   for (const prenda of pedido.prendas) {  
     if (!prenda.producto_id) {       
       errores.push("Cada prenda debe tener un producto del catálogo");
     }   

      const piezas = Number(prenda.piezas); 

      if (!Number.isInteger(piezas) || piezas < 1) {
        errores.push("Cada prenda debe tener al menos 1 pieza, sin decimales");  
      }  
    }
  }


  if (!pedido.fecha_compromiso) {
    errores.push("Falta la fecha compromiso");
  } else if (pedido.fecha_compromiso < hoyTexto()) {
    errores.push("La fecha compromiso no puede ser anterior a hoy");
  }


  return { valido: errores.length === 0, errores };
}

export function calcularTotal(prendas) {
  let total = 0;
  for (const prenda of prendas) {
    total = total + prenda.piezas * prenda.precio_unitario;
  }
  return Math.round(total * 100) / 100;
}

export function esAtrasado(pedido) {
 if (pedido.estado === "Entregado" || pedido.estado === "Cancelado") {
 return false;
 }
 return pedido.fecha_compromiso < hoyTexto();
}

export function validarCancelacion(pedido, motivo) {
  const errores = [];
  if (!motivo || motivo.trim() === "") {
    errores.push("Escribe el motivo de la cancelación");
  }
  if (pedido.estado === "Entregado") {
    errores.push("Un pedido entregado no se puede cancelar");
  }
  if (pedido.estado === "Cancelado") {
    errores.push("Este pedido ya está cancelado");
  }
  return { valido: errores.length === 0, errores };
}

export function puedeCambiarEstado(actual, nuevo) {  
  const errores = [];  
  const permitido =    
    (actual === "Pendiente" && nuevo === "En proceso") ||    
    (actual === "En proceso" && nuevo === "Entregado"); 

  if (!permitido) {    
    errores.push("No se puede pasar de " + actual + " a " + nuevo);  
  }  
  
  return { valido: errores.length === 0, errores }; 
}

export function puedeModificarFecha(pedido, nuevaFecha) {
  const errores = [];

  if (pedido.estado === "Entregado" || pedido.estado === "Cancelado") {
    errores.push("Solo se cambia la fecha de un pedido Pendiente o En proceso");
  }

  if (!nuevaFecha) {
    errores.push("Escribe la nueva fecha compromiso");
  } else if (nuevaFecha < hoyTexto()) {
    errores.push("La fecha compromiso no puede ser anterior a hoy");
  } else if (nuevaFecha === pedido.fecha_compromiso) {
    errores.push("La nueva fecha es igual a la actual");
  }

  return { valido: errores.length === 0, errores };
}
export function ordenarPedidos(pedidos) {
  const atrasados = [];
  const activos = [];
  const cerrados = [];
  for (const pedido of pedidos) {
    if (esAtrasado(pedido)) {
      atrasados.push(pedido);
    } else if (pedido.estado === "Entregado" || pedido.estado === "Cancelado") {
      cerrados.push(pedido);
    } else {
      activos.push(pedido);
    }
  }
  const porFecha = (a, b) => a.fecha_compromiso.localeCompare(b.fecha_compromiso);
  atrasados.sort(porFecha);
  activos.sort(porFecha);
  return [...atrasados, ...activos, ...cerrados];
}

export function calcularPrecioPieza(producto, opcion) {
  const precioProducto = producto ? Number(producto.precio) : 0;
  const precioOpcion = opcion ? Number(opcion.precio) : 0;
  return Math.round((precioProducto + precioOpcion) * 100) / 100;
}