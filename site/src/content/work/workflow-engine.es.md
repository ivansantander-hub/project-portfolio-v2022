---
slug: workflow-engine
lang: es
order: 7
title: Un motor de flujos configurable para integraciones de datos
project: Motor de flujos
headline: Cada integración de datos se resolvía con código escrito a medida. Diseñé un motor de flujos configurable para que quienes conocen los datos puedan armarlos sin pasar por ingeniería.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead · diseño del motor y de la vista previa
featured: false
summary:
  - k: El problema
    v: "Cada integración nueva requería código casi idéntico al de la anterior."
  - k: La decisión
    v: "Un motor de flujos definido por configuración, con vista previa paso a paso."
  - k: En qué terminó
    v: "Una integración nueva pasa a ser configuración, no desarrollo."
stack:
  - Python
  - FastAPI
  - React
  - PostgreSQL
tags:
  - arquitectura
  - datos
  - producto
---

## El problema

La plataforma intercambia datos con sistemas externos de captura de datos clínicos, cada uno con su propia estructura y nomenclatura. Cada integración se resolvía con código a medida, muy parecido entre sí pero distinto justo en la parte importante.

Una corrección había que repetirla en varias copias, y cada integración nueva pasaba por ingeniería. Las personas que mejor entienden los datos no podían cambiar nada por su cuenta.

Lo planteé como un problema de producto: que quien conoce los datos pueda construir el flujo sin depender de ingeniería.

## Decisiones

**Configuración en lugar de código.** El flujo es un grafo de pasos guardado como configuración. Un catálogo de tipos de paso (extraer, transformar, cargar, comparar, entre otros) se combina al ejecutar. Una capacidad nueva es un tipo de paso; una integración nueva, un grafo. Costo: diseñar bien el catálogo antes de que crezca.

**Construir sobre la plataforma en lugar de adoptar una herramienta genérica.** Hacía falta una interfaz del dominio (formularios clínicos, mapeos de campos), no un editor de grafos genérico. Es una decisión discutible; dejé el razonamiento escrito para poder revisarla.

**Vista previa por paso.** Se puede ejecutar un solo paso sobre una muestra y ver su salida al momento, y un inspector muestra qué entra y qué sale en cada paso. Costo: se valida sobre una muestra, no sobre el volumen completo.

**Rendimiento como requisito.** Medí la vista previa desde temprano y la ajusté (consultas agrupadas y una caché breve) hasta que respondiera sin interrumpir el trabajo. Costo: tiempo de ajuste antes de ampliar la interfaz.

## Resultado

- Incorporar una integración nueva pasa a ser una tarea de configuración.
- Quienes conocen los datos pueden construir y revisar los flujos directamente.
- Una corrección se hace en un solo lugar.

## Qué haría distinto

Mediría el rendimiento de la vista previa antes de construir la interfaz encima, no después.
