import {
  validarCliente,
  validarProducto,
  validarOpcion,
  validarPedido,
  calcularTotal,
  esAtrasado,
  hoyTexto,
  validarCancelacion,
  puedeCambiarEstado,
} from "../../lib/logica";




export default function Pruebas() {
  const casos = [
    // Aura
    ["Cliente completo", validarCliente({ nombre: "Ana", telefono: "5512345678" })],
    ["Cliente sin contacto", validarCliente({ nombre: "Ana" })],
    ["Cliente sin nombre", validarCliente({ nombre: "", correo: "ana@correo.com" })],
    ["Teléfono con letras (false)", validarCliente({ nombre: "Ana", telefono: "abc" })],    
    ["Teléfono de 8 números (false)", validarCliente({ nombre: "Ana", telefono: "12345678" })],    
    ["Correo sin @ (false)", validarCliente({ nombre: "Ana", correo: "ana.correo.com" })],    
    ["Teléfono con solo espacios (false)", validarCliente({ nombre: "Ana", telefono: "   " })],
    ["Pendiente a En proceso (true)", puedeCambiarEstado("Pendiente", "En proceso")],    
    ["En proceso a Entregado (true)", puedeCambiarEstado("En proceso", "Entregado")],    
    ["Pendiente a Entregado (false)", puedeCambiarEstado("Pendiente", "Entregado")],    
    ["Entregado a Pendiente (false)", puedeCambiarEstado("Entregado", "Pendiente")],    
    ["Cancelado a En proceso (false)", puedeCambiarEstado("Cancelado", "En proceso")],    
    ["En proceso a Pendiente (false)", puedeCambiarEstado("En proceso", "Pendiente")],

    // Francisca
    ["Producto completo", validarProducto({ tipo_prenda: "Chaleco", precio: 250 })],
    ["Producto sin precio", validarProducto({ tipo_prenda: "Chaleco" })],
    ["Producto vacío y precio negativo", validarProducto({ tipo_prenda: "", precio: -5 })],
    ["Opción completa", validarOpcion({ tipo: "Bordado", descripcion: "Logo en el pecho", precio: 25 })],
    ["Opción sin descripción", validarOpcion({ tipo: "Serigrafía", descripcion: "", precio: 20 })],
        ["Cancelar sin motivo (false)", validarCancelacion({ estado: "Pendiente" }, "")],
    ["Motivo con solo espacios (false)", validarCancelacion({ estado: "Pendiente" }, "   ")],
    ["Cancelar un entregado (false)", validarCancelacion({ estado: "Entregado" }, "El cliente ya no lo quiere")],
    ["Cancelar un cancelado (false)", validarCancelacion({ estado: "Cancelado" }, "Pedido repetido")],
    ["Cancelar con motivo (true)", validarCancelacion({ estado: "En proceso" }, "El cliente cambió el diseño")],

    // Achtli
    ["Pedido sin prendas", validarPedido({ cliente_id: 1, prendas: [], fecha_compromiso: "2030-01-01" })],
    ["Pedido con fecha pasada", validarPedido({ cliente_id: 1, prendas: [{ producto_id: 1, piezas: 2 }], fecha_compromiso: "2020-01-01" })],    
    ["Pedido completo", validarPedido({ cliente_id: 1, prendas: [{ producto_id: 1, piezas: 2 }], fecha_compromiso: "2030-01-01" })],    
    ["Prenda sin producto (false)", validarPedido({ cliente_id: 1, prendas: [{ piezas: 2 }], fecha_compromiso: "2030-01-01" })],   
    ["Piezas con decimales (false)", validarPedido({ cliente_id: 1, prendas: [{ producto_id: 1, piezas: 1.5 }], fecha_compromiso: "2030-01-01" })],
    ["Total normal (3855)", calcularTotal([{ piezas: 20, precio_unitario: 150 }, { piezas: 10, precio_unitario: 85.5 }])],
    ["Total con centavos (30.3)", calcularTotal([{ piezas: 3, precio_unitario: 10.1 }])],
    ["Total sin prendas (0)", calcularTotal([])],

    ["Vence hoy (false)",
     esAtrasado({ estado: "Pendiente", fecha_compromiso: hoyTexto() })],
    ["Ya venció (true)",
     esAtrasado({ estado: "Pendiente", fecha_compromiso: "2020-01-01" })],
    ["Entregado con fecha pasada (false)",
     esAtrasado({ estado: "Entregado", fecha_compromiso: "2020-01-01" })],
    ["Fecha futura (false)",
     esAtrasado({ estado: "Pendiente", fecha_compromiso: "2030-01-01" })],
    ["Cancelado con fecha pasada (false)",
     esAtrasado({ estado: "Cancelado", fecha_compromiso: "2020-01-01" })],
    ["En proceso con fecha pasada (true)",
     esAtrasado({ estado: "En proceso", fecha_compromiso: "2020-01-01" })],

  ];


  return (
    <main>
      <h1>Pruebas de lógica</h1>
      {casos.map(([nombre, resultado]) => (
        <pre key={nombre}>{nombre}: {JSON.stringify(resultado)}</pre>
      ))}
    </main>
  );
}
