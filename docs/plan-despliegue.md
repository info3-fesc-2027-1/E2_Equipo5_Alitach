# Plan de despliegue del incremento

**Informática III · Grupo 1301 · Ciclo 2027-1**
**Tema:** 3.5 Fase de Despliegue
**Entrega:** domingo 8 de noviembre de 2026, 23:59, con el enlace al commit en Classroom

| Dato | Respuesta |
|---|---|
| Equipo (número) | Equipo 5 · ASKI |
| Modelo asignado | Espiral |
| Integrantes | Becerra Reyes Aura Mercedes · Holguín León Achtli Iyari · Molina Sarmientos Francisca · Tapia Ortega Shirel Itzamatul |
| Contexto de negocio de nuestro sistema | Sistema interno de pedidos para Alitach, un taller de bordado, serigrafía y uniformes. Lo usa el personal del taller para registrar clientes, consultar el catálogo de prendas y capturar pedidos con fecha compromiso. El cliente no pide en línea: no hay pagos, inventario ni mensajes automáticos. |

---

## 1. Alcance del incremento

Este despliegue corresponde al cierre de la vuelta 2 de la espiral: lo que esté en `main` el lunes 9 de noviembre (tareas T4, T5, T6 y el adelanto de `esAtrasado`).

| Requisito | ¿Entra en este despliegue? (Sí / Parcial / No) | Qué incluye exactamente o por qué queda fuera |
|---|---|---|
| RF1 Clientes | Sí | Ya está en `main` (PR #5, unido el 8 nov). Pantalla de clientes (T4): registrar un cliente con nombre, teléfono o correo y notas; se rechaza si no tiene teléfono ni correo (`validarCliente`). Buscar escribiendo parte del nombre (`buscarClientes`). |
| RF2 Catálogo | Sí | Pantalla `/catalogo` (T5): registrar una prenda con tipo, modelo, colores y precio (`validarProducto`) y opciones de bordado o serigrafía con descripción y precio (`validarOpcion`); se guardan en Supabase y se ven en sus listas. El catálogo completo de Alitach se carga el 18 nov. |
| RF3 Crear pedido | Parcial | Pantalla `/nuevo-pedido` (T6): elegir cliente, agregar prendas con piezas, talla y color, capturar fecha compromiso y ver el total (`validarPedido`, `calcularTotal`). El pedido queda en Pendiente. |
| RF4 Estados del pedido | No | Cambiar de estado con historial (T7) y la pantalla de detalle (T10) son de la vuelta 3; se programan para el 13 nov. |
| RF5 Listado | No | La pantalla de listado con filtros (T9) es de la vuelta 3 (13 nov). Ya entra la función `esAtrasado` con sus casos en `/pruebas`, que es la base del listado. |
| Cambio de requisito (5 oct, RC-01) | Parcial | Entra: (a) fecha compromiso obligatoria y que no esté en el pasado, y la regla de "atrasado" (`esAtrasado`: fecha vencida y sigue Pendiente o En proceso). Queda para la vuelta 3: cancelar con motivo, modificar la fecha compromiso y mostrar los atrasados primero en el listado. |

---

## 2. Destino y configuración

| Elemento | Respuesta |
|---|---|
| Destino | Vercel |
| Proyecto o URL en Vercel | https://e2equipo5alitach.vercel.app |
| Repositorio desde el que se despliega | https://github.com/info3-fesc-2027-1/E2_Equipo5_Alitach |
| Rama que se publica en producción | `main` (cada PR genera una vista previa; solo `main` va a producción) |
| Comando de build (si aplica) | `npm run build` (ejecuta `next build`) |

### Variables de entorno necesarias

| Nombre de la variable | Para qué sirve |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Dirección del proyecto de Supabase al que se conecta `lib/supabase.js` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (anon) para leer y guardar datos en Supabase |

Las dos deben estar en Vercel marcadas para **Production y Preview**. En local van en `.env.local`, que está en `.gitignore`.

### Servicios externos de los que depende el sistema

- Supabase: base de datos (tablas `cliente`, `producto`, `opcion_personalizacion`, `pedido`, `prenda_pedido`) y su API, usada desde `lib/datos.js`.
- Vercel: hospedaje y despliegue automático desde GitHub.

---

## 3. Checklist pre-despliegue

| # | Verificación | ¿Cumple? (Sí / No) | Responsable |
|---|---|---|---|
| 1 | Los 4 PR que faltan (#4 opciones, #6 catálogo, #3 `esAtrasado`, #2 nuevo pedido) siguen aprobados por su revisora y su vista previa de Vercel dice *Ready* (#5 clientes ya está en `main`) | | Aura |
| 2 | En cada rama, `npm run build` termina sin errores (ningún import con `@/lib`) | | Cada autora |
| 3 | En `/pruebas` todos los casos salen correctos, incluidos los de `esAtrasado` y `validarOpcion` | | Achtli |
| 4 | Las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` están en Vercel para Production y Preview | | Aura |
| 5 | La vista previa del último PR abre `/catalogo` y `/nuevo-pedido` sin el error "supabaseUrl is required" | | Francisca |
| 6 | Las tablas de Supabase tienen las columnas que usa el código (confirmado por Shirel el 8 nov: estados con mayúscula inicial, `prenda_pedido` con `opcion_id`, `pedido` con `fecha_compromiso_original`) y RLS no bloquea guardar ni leer | | Shirel |
| 7 | No hay claves ni archivos `.env` subidos al repositorio | | Francisca |
| 8 | Anotamos el último despliegue de producción que funciona (fecha y commit) antes de desplegar | | Aura |

---

## 4. Smoke test (verificación posdespliegue)

Todas las pruebas se hacen en https://e2equipo5alitach.vercel.app, no en local.

| # | Acción | Resultado esperado | Resultado obtenido (se llena el lunes) |
|---|---|---|---|
| 1 | Abrir la portada y `/pruebas` desde un celular y una computadora | La portada carga y en `/pruebas` todos los casos salen correctos | |
| 2 | Registrar un cliente con nombre y teléfono; buscarlo escribiendo parte del nombre. Intentar registrar otro sin teléfono ni correo | El primero aparece en la búsqueda; el segundo se rechaza con mensaje | |
| 3 | En `/catalogo`, registrar un chaleco de seguridad y una opción de bordado | Los dos aparecen en sus listas después de recargar la página | |
| 4 | En `/nuevo-pedido`, elegir un cliente y crear un pedido de 20 chalecos bordados y 10 playeras serigrafiadas con fecha compromiso | Se guarda, muestra el total y queda en Pendiente | |
| 5 | Intentar guardar un pedido sin fecha compromiso o con una fecha pasada | El sistema lo rechaza y muestra el error | |

---

## 5. Plan de reversión

**Responsable de la reversión:** Aura (tiene el proyecto en Vercel). Francisca la acompaña para revisar el smoke test después.

**Señal para revertir:** falla cualquiera de las pruebas 1 a 4 del smoke test, o el build de producción falla.

**Orden de los merges el lunes** (cada revisora une el PR que revisó y se espera a que Vercel diga *Ready* antes del siguiente): 1) #4 opciones (Achtli) → 2) #6 catálogo (Aura) → 3) #3 `esAtrasado` (Francisca) → 4) #2 nuevo pedido (Achtli). El #5 clientes ya se unió el domingo 8 nov. Después, el smoke test. Si el #2 no está aprobado o su vista previa falla, no se une y se despliegan los otros 3.

**Pasos:**

1. En Vercel, abrir el proyecto → **Deployments**, buscar el último despliegue de producción que funcionaba (el anotado en el punto 8 del checklist) y usar **Instant Rollback** / **Promote to Production**. Con esto el sitio vuelve a la versión anterior en segundos.
2. Repetir las pruebas 1 y 2 del smoke test para confirmar que el sitio regresó a la versión buena.
3. En GitHub, abrir el PR que se unió y causó la falla y dar clic en **Revert**. Eso crea un PR de reversión; otra integrante lo aprueba y lo une, para que `main` vuelva a como estaba y el siguiente despliegue no publique el error.
4. Avisar al equipo cuál PR falló; su autora lo corrige en su rama, lo prueba en la vista previa y se vuelve a revisar con la rueda.

---

## 6. Despliegue según nuestro modelo

En el modelo Espiral el proyecto avanza por vueltas, y cada vuelta termina con un incremento o prototipo que se evalúa con el cliente antes de planear la siguiente. Por eso un equipo en Espiral no despliega de forma continua, sino al cierre de cada vuelta: en nuestro plan son tres despliegues (V2 el 9 nov, V3 al cerrar el código el 13 nov, y V4 con la versión final el 19 nov). Nuestro plan sí es coherente con eso: el despliegue del lunes es el cierre de la vuelta 2 y sirve para revisar con la dueña lo que ya funciona (clientes, catálogo y nuevo pedido) antes de empezar la vuelta 3, donde se resuelven los riesgos más altos del RC-01 (cancelación, cambio de fecha y atrasados primero). Hay una diferencia: Vercel publica en producción cada vez que algo entra a `main`, así que técnicamente desplegamos más veces de las que marca el modelo. Lo manejamos así: las vistas previas de cada PR las usamos como prototipos internos, y solo consideramos "entrega de la vuelta" el despliegue que pasa el checklist y el smoke test.

---

## Bloqueos para el lunes

- Ninguno en el código: los 4 PR que faltan (#4, #6, #3 y #2) están aprobados por su revisora, compilan y no tienen conflictos entre sí; el #5 ya está en "main".
- A considerar: las vistas previas de Vercel están protegidas; quien no esté en el equipo de Vercel pide acceso y Aura lo aprueba.

---

## Declaración de uso de IA

| Herramienta | Para qué la usamos | Qué verificamos nosotros |
|---|---|---|
| Claude | Ordenar el plan a partir de nuestro backlog y del estado del repositorio; revisar que las ramas compilaran; proponer código de referencia para las pantallas y las funciones de datos y validación | Que el alcance coincide con el plan de la E2; probamos cada pantalla en local guardando y leyendo en Supabase; los casos de /pruebas salen correctos; cada PR lo revisa otra integrante |