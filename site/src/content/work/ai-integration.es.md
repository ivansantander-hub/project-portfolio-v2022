---
slug: ai-integration
lang: es
order: 4
title: Una propuesta para integrar IA en una plataforma de un entorno regulado
project: Integración de IA
headline: La plataforma no tenía funcionalidades de IA y maneja datos sensibles. Escribí una propuesta para integrarla con la privacidad como punto de partida y la validé con un prototipo.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead / Technical Product Owner · propuesta de integración y prototipo
featured: false
summary:
  - k: El problema
    v: "Agregar IA a una plataforma de un entorno regulado sin exponer datos sensibles."
  - k: La decisión
    v: "Privacidad primero, un único punto de entrada para la IA y aprobación humana de sus resultados."
  - k: En qué terminó
    v: "Una propuesta escrita y un prototipo que sirvió para validar la idea."
stack:
  - TypeScript
  - Node.js
  - React
  - LLM APIs
tags:
  - ia
  - arquitectura
  - privacidad
---

## El problema

La plataforma no tenía funcionalidades de IA y opera en un entorno regulado, con datos sensibles que no pueden salir de un entorno controlado. Antes de agregar cualquier cosa había que resolver cómo usar un modelo sin exponer esos datos y cómo dejar trazabilidad de lo que hace la IA.

## Decisiones

**La privacidad como criterio principal para elegir proveedor.** Comparé opciones y prioricé un proveedor de modelos en la nube que mantuviera los datos dentro de un entorno controlado, por encima de otras ventajas. Costo: quedamos más atados a ese proveedor y a sus particularidades.

**Un único punto de entrada para la IA.** Propuse que todo uso de IA pasara por un solo servicio, para que la protección de datos y el registro de uso vivieran en un solo lugar y cambiar de modelo no afectara al resto. Costo: es un componente más que desplegar y mantener.

**Una persona aprueba los resultados de la IA.** Ningún resultado se considera oficial sin revisión humana. Costo: los flujos con IA siguen necesitando un paso manual.

**Un prototipo rápido para validar la idea.** Construí un asistente de prueba sencillo para comprobar que el enfoque funcionaba antes de invertir más. Costo: era deliberadamente limitado y no reemplaza el trabajo de diseño completo.

## Resultado

- Una propuesta escrita que el equipo puede usar como base para decidir cómo integrar IA.
- Un prototipo que mostró que la idea era viable y dejó claros los problemas prácticos antes de invertir más.

## Qué haría distinto

Construiría la capa de protección de datos antes que el prototipo. La propuesta la ponía en el centro, pero el prototipo se hizo primero para validar la idea, y el orden debió ser el inverso.
