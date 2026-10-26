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
