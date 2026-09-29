---
slug: architecture-simplification
lang: es
order: 4
title: Simplificar una arquitectura que creció por acumulación
project: Simplificación de arquitectura
headline: Un sistema que había crecido pieza a pieza durante años. Hice un inventario y preparé opciones con sus costos para que la simplificación fuera una decisión que se pudiera evaluar.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead → Technical Product Owner · inventario y propuesta de arquitectura
featured: false
summary:
  - k: El problema
    v: "El sistema tenía más piezas de las que el equipo podía mantener con comodidad."
  - k: La decisión
    v: "Medir antes de proponer y presentar opciones con sus costos, todas con migración por partes."
  - k: En qué terminó
    v: "La discusión pasó de una sensación general a opciones concretas que se podían comparar."
stack:
  - TypeScript
  - Next.js
  - Python
tags:
  - arquitectura
  - liderazgo
  - migración
---

## El problema

La plataforma opera en un entorno regulado, donde un dato mal migrado tiene consecuencias reales.

El sistema había crecido por acumulación: cada necesidad nueva traía una pieza nueva. Decisiones razonables por separado dejaron, en conjunto, un sistema difícil de mantener. Un cambio transversal había que repetirlo en varios lugares, incorporar a alguien al equipo tomaba más de lo necesario y el problema crecía junto con el negocio. Todo tenía la misma causa, pero nadie la había puesto sobre la mesa de forma concreta.

## Decisiones

**Medir antes de proponer.** Revisé el código y armé un inventario: qué existe, qué se usa y qué depende de qué. La conversación pasó de "el sistema se siente pesado" a un documento que también podía leer alguien no técnico. Costo: tiempo de revisión antes de poder proponer nada.

**Opciones en lugar de una sola propuesta.** Preparé una alternativa conservadora y otra de fondo, cada una con alcance, secuencia y criterios para dar marcha atrás. Así la discusión era cuál elegir, no aprobar o rechazar. Costo: más trabajo de preparación.

**Migrar por partes.** Ambas opciones reemplazan el sistema de a poco, mientras el anterior sigue funcionando. Costo: convivir con dos sistemas un tiempo, a cambio de no depender de un corte total en un entorno regulado.

**Respetar los compromisos existentes.** Las entregas ya prometidas van primero y una persona queda dedicada a la operación. Costo: la migración avanza más despacio, pero el plan es realista.

## Resultado

- El conocimiento del sistema, que estaba en pocas cabezas, quedó escrito y disponible para el equipo.
- La decisión de arquitectura se discute con opciones y costos a la vista.
- La misma idea de configuración en lugar de código guio el diseño del frontend (ver el caso de pantallas configurables).

## Qué haría distinto

Haría el inventario más temprano, cuando el sistema era más pequeño y la revisión más sencilla.
