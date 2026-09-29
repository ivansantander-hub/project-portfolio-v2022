---
slug: shell-system
lang: es
order: 9
title: Servir trackers desde un componente y un endpoint genéricos
project: Sistema de shells
headline: Cada tracker de la plataforma tenía su carpeta de componentes y su resolver. Construí un experimento para comprobar si una grilla y un endpoint genéricos, dirigidos por un registro, pueden reemplazarlos.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead · diseño e implementación del experimento
period: 2026
featured: false
summary:
  - k: El problema
    v: "Una pantalla de tracker nueva significaba componentes, hook, página, formulario y resolver nuevos."
  - k: La decisión
    v: "Un registro en el servidor, una ruta genérica y una grilla configurable, con la configuración guardada en cascada."
  - k: En qué terminó
    v: "Experimento funcionando con dos trackers. No reemplaza ninguna pantalla real todavía."
metrics:
  - value: "2"
    label: trackers conectados; agregar otro son dos entradas de registro
  - value: "15"
    label: operaciones GraphQL (9 queries, 6 mutaciones) para todos los trackers
  - value: "262"
    label: pruebas unitarias (121 backend, 141 frontend)
  - value: "34"
    label: pruebas e2e contra la base local
stack:
  - Next.js
  - React
  - TypeScript
  - MUI X DataGrid Pro
  - GraphQL
  - Prisma
  - PostgreSQL
  - Jest
  - Playwright
  - k6
tags:
  - arquitectura
  - frontend
  - experimento
---

## El problema

En la plataforma, cada tracker (sitios, documentos del archivo maestro, etc.) se construía a mano: una carpeta de componentes, un hook, una página, un formulario y un resolver en el backend. Las pantallas se parecían, pero cada una repetía el trabajo.

En la propuesta de consolidación planteé reemplazar eso por un motor de registro. Este caso es el experimento para probarlo: una rama aparte, con rutas propias, que no toca ninguna pantalla existente. La pregunta era si un componente y un endpoint genéricos podían servir los trackers.

## Decisiones

**El cliente pide por clave de registro, no por modelo.** Un endpoint que acepte el nombre de un modelo queda abierto a los 176 modelos del esquema, incluidos usuarios y sesiones. El registro del servidor declara qué modelo sirve cada clave, qué rutas de campo expone, cuáles se pueden escribir y qué paneles (comentarios, documentos, historial) cuelgan de una fila. Cada ruta pasa por una validación contra metadatos generados del esquema: máximo tres saltos, sin listas intermedias y sin campos con forma de credencial. Al escribir, los campos que maneja el sistema (id, autoría, borrado) quedan fuera. Costo: un generador de metadatos que hay que mantener sincronizado con el esquema.

**Usar la grilla que ya tenía la aplicación.** El primer intento reescribió la tabla a mano, con su propia barra de herramientas. Pasé a DataGrid Pro, que ya usan los trackers actuales, en modo servidor para paginación, orden y filtros. El shell aporta una traducción de filtros que solo ofrece los operadores que el servidor responde bien, y una barra que, al mover o redimensionar columnas, pregunta si guardar la disposición para todos o solo para el proyecto. Costo: no reutilicé el organismo de grilla existente, porque está atado al modelo de guardado de vistas que el shell sustituye.

**Configuración en cascada, guardando solo diferencias.** Registro en código, luego configuración de sistema y luego de proyecto, sobre una tabla que ya existía en el esquema, sin migración. A nivel de proyecto solo se persiste lo que difiere de lo heredado; si no, tocar un título copiaba todas las columnas y el proyecto dejaba de recibir cambios de sistema. Costo: la comparación tuvo que ser canónica, porque Postgres reordena las claves de los campos JSON.

**Errores visibles en lugar de pantalla en blanco.** Lo que no se puede servir vuelve como rechazo con su motivo y la interfaz lo muestra. Un filtro rechazado ensancha el resultado, así que el aviso no puede quedar en la consola. Costo: más estados que cubrir en la interfaz.

**Medir antes de optimizar.** Hice una prueba de carga con 200.000 filas sintéticas. La forma de la configuración casi no pesa; lo que cuesta es el conteo exacto, la búsqueda de texto y el desplazamiento profundo. Cambié el conteo exacto por uno acotado a 1.000 filas: de 63 a 90 peticiones por segundo con 30 usuarios. Costo: el total deja de ser exacto en tablas grandes y la interfaz tiene que saberlo.

## Resultado

- El experimento funciona con dos trackers. Agregar un tercero son dos entradas de registro, una en el servidor y otra en el frontend, sin resolver, hook, página ni formulario nuevos.
- El formulario de alta y edición se genera de la misma configuración.
- Una prueba del registro valida cada entrada contra el esquema generado; detectó errores en las primeras entradas que escribí a mano.
- Sigue siendo un experimento. Falta aplicar permisos por proyecto y compañía, preferencias por usuario, selectores de relación en el formulario y los índices que la prueba de carga señaló. Por ahora solo existe el shell de grilla.

## Qué haría distinto

Empezaría directamente sobre DataGrid Pro en lugar de escribir la tabla a mano. Y resolvería los permisos por proyecto antes que la pantalla de configuración, porque son lo primero que bloquea usarlo en un tracker real.
