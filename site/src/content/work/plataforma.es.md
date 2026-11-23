---
slug: plataforma
lang: es
order: 2
title: Convertir pantallas escritas a mano en una plataforma configurable
project: Plataforma SaaS
headline: "Como Technical Lead de un producto SaaS en un sector regulado, llevé formularios, tableros, flujos de datos y pantallas de código a medida a configuración, y llevé la IA al equipo sin exponer datos sensibles."
domain: "Empresa · Producto SaaS en un sector regulado"
role: "Technical Lead · diseño de soluciones, arquitectura y equipo"
featured: true
confidential: true
media:
  image: /img/casos/plataforma/esquema.svg
  alt: "Esquema: formularios, tableros, integraciones y pantallas hechos a mano pasan por un motor y salen como configuración"
points:
  - "**Configuración en vez de código:** un cambio entre proyectos ya no pasa por ingeniería."
  - "**Trazabilidad por diseño:** permisos por archivo, cada acción registrada y firmas verificables."
  - "**IA con cuidado:** un asistente de código para el equipo y una propuesta de IA con la privacidad primero."
moreLabel: "Ver lo que construí"
stack:
  - TypeScript
  - Node.js
  - React
  - PostgreSQL
  - LLM APIs
tags:
  - liderazgo técnico
  - arquitectura
  - plataforma
---

Detalles del cliente, capturas y cifras internas quedan fuera por un acuerdo de confidencialidad. Lo que sigue describe el tipo de problema, las decisiones y mi papel.

## Motores de configuración

**Motor de flujos para integraciones de datos.** Cada integración con sistemas externos era código a medida, casi igual entre sí pero distinto justo en la parte importante. La pasé a un grafo de pasos guardado como configuración, con un catálogo de tipos de paso y una vista previa que ejecuta un paso sobre una muestra. Así, quien conoce los datos arma el flujo sin pasar por ingeniería.

**Formularios definidos por esquema.** En los módulos que más cambian entre proyectos, el formulario dejó de ser una pantalla escrita a mano: es un esquema que el frontend dibuja y el backend valida.

**Tableros configurables.** Los tableros se escribían uno por uno. Ahora el tablero es configuración y los datos se resuelven en el servidor, con los permisos de quien lo mira.

**Pantallas de seguimiento genéricas.** Una grilla y un servicio genéricos sirven las pantallas de seguimiento a partir de configuración, en lugar de una pantalla por caso.

## Documentos y evidencia

**Gestión documental.** Cada archivo tiene claro quién puede verlo y cada acción queda registrada, porque en un sector regulado la trazabilidad no es opcional.

**Firma electrónica.** Los flujos de firma terminan en un documento con la evidencia de quién firmó y una forma de verificarlo después.

## Equipo e IA

**Entorno local con un comando.** Una herramienta de línea de comandos clona, configura, diagnostica y arranca el entorno, con un asistente que guía cada paso.

**Asistente de código con IA.** Un asistente que parte del contexto del equipo: roles especializados, convenciones escritas y revisión humana antes de integrar cualquier cambio.

**Propuesta de IA con la privacidad primero.** La plataforma maneja datos sensibles y no tenía funciones de IA. Escribí una propuesta para integrarla con la privacidad como punto de partida y la validé con un prototipo.

**Simplificar la arquitectura.** Un sistema que creció pieza a pieza durante años. Hice un inventario y preparé opciones con sus costos, para que simplificar fuera una decisión que se pudiera evaluar.

## Lo que me llevo

Que el trabajo de un Technical Lead en una plataforma así es convertir lo repetido en configuración, para que el equipo dedique su tiempo a lo que sí es distinto.
