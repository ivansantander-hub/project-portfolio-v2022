---
slug: dashboards
lang: es
order: 10
title: Dashboards configurables por proyecto
project: Dashboards configurables
headline: Los dashboards estaban escritos a mano uno por uno. Los reemplazamos por un motor donde el dashboard es configuración y los datos se resuelven en el servidor.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead · diseño de la solución, flujo de datos y base del motor
featured: false
summary:
  - k: El problema
    v: "Dashboards fijos en código y duplicados entre módulos, donde cambiar una etiqueta pedía un despliegue."
  - k: La decisión
    v: "El dashboard como configuración, un catálogo de widgets y los datos resueltos en el servidor."
  - k: En qué terminó
    v: "Un motor de dashboards que cada proyecto puede ajustar sin cambios de código."
stack:
  - TypeScript
  - React
  - Node.js
  - PostgreSQL
tags:
  - producto
  - datos
  - arquitectura
---

## El problema

Los dashboards de la plataforma estaban programados uno por uno. Varios mostraban los mismos datos en módulos distintos, y la preparación de datos dependía de detalles de cada estudio escritos en el código. Cuando un cliente pedía ocultar un widget o cambiar una etiqueta en su proyecto, eso significaba un cambio de código y un despliegue.

## Decisiones

**Configuración en lugar de código.** Cada dashboard y cada widget se guarda como configuración: tipo de gráfica, fuente de datos, campos, filtros y posición. Los dashboards predefinidos se arman con los mismos componentes que puede usar un administrador. Escribí el diseño de la solución y la base del motor en el frontend. Costo: el motor es una pieza grande y tiene casos especiales por familia de widget.

**Los datos se resuelven en el servidor.** El frontend pide los datos del dashboard completo y el servidor interpreta la configuración de cada widget: obtiene, filtra, agrega y ordena. Escribí la primera versión de ese flujo. Costo: el frontend no sabe qué campos recibirá hasta que el servidor responde.

**Consultar los datos donde viven en lugar de copiarlos.** Los datos que vienen de sistemas externos se consultan bajo demanda con una capa de caché, en vez de duplicarlos. Costo: un dato puede llegar con algo de atraso.

**Menos fuentes, más completas.** Agrupé los reportes operativos por entidad para que el frontend no tenga que cruzarlos. Costo: un cambio en una fuente afecta a muchos widgets.

## Resultado

- El equipo construyó la mayor parte del motor sobre esa base.
- Cada proyecto puede ajustar sus dashboards sin pasar por un despliegue.
- Revisamos qué widgets se pueden construir con los datos que existen y cuáles necesitan datos nuevos.

## Qué haría distinto

Haría el mapa de widgets contra datos antes de construir el catálogo, para descubrir temprano qué información faltaba.
