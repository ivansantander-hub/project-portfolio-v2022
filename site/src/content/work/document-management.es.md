---
slug: document-management
lang: es
order: 9
title: Gestión documental con permisos y trazabilidad
project: Gestión documental
headline: Trabajé en el gestor documental de una plataforma de ensayos clínicos, donde cada archivo debe tener claro quién puede verlo y cada acción queda registrada.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead · modelo de permisos y carga de archivos
featured: false
summary:
  - k: El problema
    v: "Carpetas anidadas y documentos compartidos con usuarios internos y externos, con trazabilidad de cada acción."
  - k: La decisión
    v: "Permisos por carpeta y documento resueltos en el servidor, y un registro de actividad separado de la operación principal."
  - k: En qué terminó
    v: "Un gestor documental que el equipo sigue ampliando sobre esa base."
stack:
  - TypeScript
  - Node.js
  - React
  - PostgreSQL
tags:
  - arquitectura
  - seguridad
  - auditoría
---

## El problema

La plataforma necesitaba su propio gestor documental: carpetas de la organización y personales, versiones, papelera, descargas y documentos compartidos con usuarios internos y externos. En un entorno regulado, cada acción sobre un documento tiene que quedar registrada.

Lo construimos en equipo. Yo trabajé sobre todo en la API, la carga de archivos y el frontend.

Lo difícil era el acceso: un documento compartido dentro de una estructura de carpetas debe ser visible para quien lo recibe sin mostrarle el resto, y quien tiene acceso a una carpeta debe ver también lo que se agregue después.

## Decisiones

**Permisos por carpeta y documento, calculados de antemano.** Guardamos el acceso efectivo de cada usuario sobre cada elemento, en lugar de calcularlo en cada lectura. Así las consultas son simples y rápidas. Costo: compartir, mover o versionar obliga a recalcular, y esos casos piden cuidado.

**Trazabilidad fuera del camino crítico.** El registro de actividad se procesa aparte de la operación del usuario, para no alargar cada respuesta. Costo: hay más piezas que vigilar para que ningún registro se pierda.

## Resultado

- El gestor documental quedó como una pieza central de la plataforma, con permisos por carpeta y documento y trazabilidad de cada acción.

## Qué haría distinto

Documentaría el modelo de permisos desde el principio, con ejemplos, para que el equipo y los usuarios entiendan por qué alguien ve o no un documento.
