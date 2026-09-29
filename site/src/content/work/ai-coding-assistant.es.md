---
slug: ai-coding-assistant
lang: es
order: 3
title: Un asistente de código con IA adaptado a la forma de trabajar del equipo
project: Asistente de código con IA
headline: Un asistente de programación que parte del contexto del equipo, con roles especializados, convenciones escritas y verificación humana antes de integrar cambios.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead · diseño e implementación
featured: false
summary:
  - k: El problema
    v: "Un asistente genérico no conoce un código repartido en muchos repositorios ni el proceso del equipo."
  - k: La decisión
    v: "Roles especializados, convenciones como documentos editables y verificación humana antes de integrar."
  - k: En qué terminó
    v: "Una herramienta de uso interno que sigue el flujo de trabajo que el equipo ya tenía."
stack:
  - TypeScript
  - Node.js
  - React
  - LLM APIs
tags:
  - ia
  - herramientas internas
  - automatización
---

## El problema

La plataforma está repartida en muchos repositorios. Un asistente de código genérico no sabe cómo se relacionan, cómo el equipo escribe una tarea ni cómo se verifica un cambio antes de pasarlo a pruebas. Yo quería una herramienta que partiera de ese contexto: que ayudara a implementar y revisar código, pero siguiendo el proceso que el equipo ya usa.

## Decisiones

**No depender de un solo proveedor de modelos.** Separé la lógica del asistente del modelo que la ejecuta, para poder cambiar de proveedor sin reescribir la herramienta. Costo: hay diferencias entre proveedores que toca cubrir a mano.

**Roles especializados en lugar de un asistente para todo.** Definí roles distintos, por ejemplo uno que implementa y otro que solo revisa, cada uno con acceso limitado a lo que necesita. Costo: más piezas que configurar y mantener coherentes entre sí.

**Convenciones escritas como documentos editables.** La forma de trabajar del equipo quedó en documentos que cualquiera puede leer y cambiar, en lugar de estar escondida en el código. Costo: el comportamiento vive en texto, y un cambio solo se comprueba ejecutándolo.

**Una persona verifica antes de que un cambio se integre.** El asistente propone y prueba, pero la decisión final la toma alguien del equipo. Costo: el flujo sigue teniendo un paso manual y avanza más despacio.

## Resultado

- Una herramienta de uso interno que conoce la estructura del código y el proceso del equipo.
- Menos tiempo explicando contexto al asistente en cada tarea.
- Cambios que llegan revisados por una persona antes de integrarse.

## Qué haría distinto

Registraría los cambios de la herramienta desde el principio y los entregaría en pasos más pequeños y espaciados, en lugar de concentrar mucho trabajo al final.
