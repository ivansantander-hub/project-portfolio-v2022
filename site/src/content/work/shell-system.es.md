---
slug: shell-system
lang: es
order: 16
title: Pantallas de seguimiento a partir de configuración
project: Pantallas configurables
headline: Cada pantalla de seguimiento se construía a mano. Diseñé un enfoque en el que una grilla y un servicio genéricos sirven estas pantallas a partir de configuración.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead · diseño e implementación
featured: false
summary:
  - k: El problema
    v: "Cada pantalla de seguimiento nueva repetía el mismo trabajo en frontend y backend."
  - k: La decisión
    v: "Una grilla y un servicio genéricos dirigidos por configuración en cascada."
  - k: En qué terminó
    v: "Agregar una pantalla pasa a ser agregar una entrada de configuración."
stack:
  - TypeScript
  - React
  - Next.js
  - PostgreSQL
tags:
  - arquitectura
  - frontend
  - configuración
---

## El problema

En la plataforma, cada pantalla de seguimiento (listas de registros que el equipo edita y revisa) se construía a mano, con sus componentes, su formulario y su lógica en el backend. Las pantallas se parecían, pero cada una repetía el trabajo.

La pregunta era si un componente y un servicio genéricos, dirigidos por configuración, podían servirlas todas.

## Decisiones

**Configuración en lugar de código.** Una sola definición declara qué datos muestra cada pantalla, qué se puede editar y qué paneles acompañan a cada fila. El formulario de alta y edición sale de la misma definición. Costo: esa configuración tiene que mantenerse al día con el modelo de datos, así que agregué una prueba que la valida.

**Reutilizar la librería de grillas existente.** Mi primer intento fue escribir la tabla a mano. Lo cambié por la librería que la aplicación ya usaba, con paginación, orden y filtros resueltos en el servidor. Costo: el diseño queda atado a las convenciones de esa librería.

**Configuración en cascada, guardando solo diferencias.** Primero la definición base, luego ajustes generales y luego ajustes por proyecto. Cada nivel guarda solo lo que cambia respecto al anterior, así un proyecto sigue recibiendo mejoras generales. Costo: comparar configuraciones con cuidado para no guardar diferencias falsas.

**Medir antes de optimizar.** Hice pruebas de carga con datos sintéticos: lo caro era contar y paginar tablas grandes, no la configuración. Cambié el conteo exacto por uno aproximado. Costo: la interfaz tiene que indicar cuándo el total es aproximado.

## Resultado

- Agregar una pantalla de seguimiento es agregar una entrada de configuración, sin componentes ni lógica nuevos.
- Los errores de configuración se muestran en la interfaz con su motivo en lugar de una pantalla en blanco.

## Qué haría distinto

Empezaría directamente sobre la librería de grillas existente, en lugar de escribir la tabla a mano, y validaría el diseño con quienes usan estas pantallas antes de construir la configuración.
