# Plan de despliegue del incremento

**Informática III · Grupo 1301 · Ciclo 2027-1**
**Tema:** 3.5 Fase de Despliegue
**Entrega:** domingo 8 de noviembre de 2026, 22:00, con el enlace al commit en Classroom

| Equipo (número) | Equipo 5|
| Modelo asignado |Espiral |
| Integrantes |Aura Mercedes Becerra Reyes · Francisca Molina Sarmientos · Shirel Itzamatúl Tapia Ortega · Achtli Iyari Holguin Leon |
| Contexto de negocio de nuestro sistema | |

> **Cómo usar esta plantilla:** guarden este archivo en `docs/plan-despliegue.md` dentro del repositorio de su equipo. Sustituyan los textos entre `[corchetes]` y borren las líneas que empiezan con `>` cuando terminen. Suban el archivo con GitHub Desktop y entreguen en Classroom **el enlace a su último commit** de este archivo.

---

## 1. Alcance del incremento

> ¿Qué funcionalidad exacta incluye este despliegue y qué queda fuera? Incluyan cómo quedó el cambio de requisito del 5 de octubre.

| Requisito | ¿Entra en este despliegue? (Sí / Parcial / No) | Qué incluye exactamente o por qué queda fuera |
|---|---|---|
| RF1 | | |
| RF2 | | |
| RF3 | | |
| RF4 | | |
| RF5 | | |
| Cambio de requisito (5 oct) | | |

---

## 2. Destino y configuración

| Elemento | Respuesta |
|---|---|
| Destino | Vercel |
| Proyecto o URL en Vercel | [ ] |
| Repositorio desde el que se despliega | [ ] |
| Rama que se publica en producción | [ ] |
| Comando de build (si aplica) | [ ] |

### Variables de entorno necesarias

> Escriban **solo los nombres**, nunca los valores. Las credenciales no van en el repositorio.

| Nombre de la variable | Para qué sirve |
|---|---|
| [ ] | [ ] |
| [ ] | [ ] |

### Servicios externos de los que depende el sistema

> Base de datos, APIs, almacenamiento, etc. Si no dependen de ninguno, escriban "Ninguno".

- [ ]

---

## 3. Checklist pre-despliegue

> Mínimo 5 puntos, cada uno verificable con sí/no. El lunes lo van a recorrer antes de desplegar.

| # | Verificación | ¿Cumple? (Sí / No) | Responsable |
|---|---|---|---|
| 1 | [Ej.: el proyecto compila sin errores en Codespaces] | | |
| 2 | [Ej.: todas las pruebas unitarias pasan] | | |
| 3 | [ ] | | |
| 4 | [ ] | | |
| 5 | [ ] | | |

---

## 4. Smoke test (verificación posdespliegue)

> De 3 a 5 pruebas manuales rápidas que confirmen que lo esencial funciona **ya desplegado**, no en local.

| # | Acción | Resultado esperado | Resultado obtenido (se llena el lunes) |
|---|---|---|---|
| 1 | [Ej.: registrar un cliente nuevo] | [Ej.: aparece en el listado de clientes] | |
| 2 | [ ] | [ ] | |
| 3 | [ ] | [ ] | |
| 4 | [ ] | [ ] | |
| 5 | [ ] | [ ] | |

---

## 5. Plan de reversión

> Si el despliegue rompe algo, ¿cómo regresan a la última versión que funcionaba? Escriban los pasos concretos y quién los ejecuta.

**Responsable de la reversión:** [ ]

**Señal para revertir:** [Ej.: falla cualquiera de las pruebas 1 a 3 del smoke test]

**Pasos:**

1. [ ]
2. [ ]
3. [ ]

---

## 6. Despliegue según nuestro modelo

> Un párrafo de 8 a 12 líneas: según su modelo asignado, ¿cuándo y cuántas veces debería desplegar un equipo? ¿Su plan real es coherente con eso? Si no lo es, expliquen por qué.

[ ]

---

## Bloqueos para el lunes

> ¿Qué les impediría hoy desplegar el lunes 9 de noviembre? Si no hay bloqueos, escriban "Ninguno".

- [ ]

---

## Declaración de uso de IA

> Obligatoria si usaron IA. Si no la usaron, escriban "No se usó IA".

| Herramienta | Para qué la usamos | Qué verificamos nosotros |
|---|---|---|
| [ ] | [ ] | [ ] |
