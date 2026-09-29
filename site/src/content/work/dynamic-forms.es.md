---
slug: dynamic-forms
lang: es
order: 15
title: Formularios definidos por configuración
project: Formularios configurables
headline: Cada formulario era una pantalla escrita a mano. Para los módulos que más cambian entre proyectos, el formulario pasó a ser un esquema que el frontend dibuja y el backend valida.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead · constructor de formularios compartido, lógica condicional e integraciones
featured: false
summary:
  - k: El problema
    v: "Formularios escritos a mano por módulo, cuando cada proyecto pedía campos distintos."
  - k: La decisión
    v: "El formulario como datos: campos, secciones y reglas guardados como configuración y validados también en el backend."
  - k: En qué terminó
    v: "Los formularios de esos módulos se ajustan por proyecto sin cambios de código."
stack:
  - TypeScript
  - React
  - Node.js
  - PostgreSQL
tags:
  - producto
  - frontend
  - arquitectura
---

## El problema

Los módulos de seguimiento de la plataforma tenían cada uno su formulario de creación y edición escrito a mano. Para algunos módulos clínicos eso no alcanzaba: cada proyecto necesitaba campos distintos, secciones distintas y reglas del tipo "este campo solo aparece si aquel tiene cierto valor". Hacerlo en código significaba un cambio y un despliegue por proyecto.

## Decisiones

**Configuración en lugar de código.** El equipo definió el formulario como un registro con sus campos, secciones y ajustes, y las respuestas se guardan ligadas al elemento al que pertenecen, como borrador o enviadas. Costo: la base de datos no valida la forma de las respuestas; esa responsabilidad pasa a la aplicación.

**Las reglas también son datos, y se validan en el servidor.** Un campo puede mostrarse o exigirse según el valor de otros. Yo agregué la evaluación de esas reglas en la vista de solo lectura. El backend vuelve a validar cada respuesta, así las reglas no dependen solo del navegador. Costo: la misma lógica vive en el frontend y en el backend, y hay que mantenerlas alineadas.

**Un constructor compartido.** El equipo había hecho un constructor de arrastrar y soltar dentro de un módulo. Lo convertí en un componente compartido, le agregué manejo de secciones y lo conecté con una integración de datos clínicos externa. Costo: el constructor creció bastante.

**Avisar en lugar de sobrescribir.** Varias personas editan el mismo registro. Si alguien guardó antes, el usuario ve quién lo cambió y no pierde lo que escribió. Costo: el conflicto se resuelve a mano.

## Resultado

- En esos módulos, agregar un campo o una regla no requiere despliegue.
- Los demás módulos siguen con sus formularios propios; no los migramos.

## Qué haría distinto

Definiría el contrato del esquema una sola vez y lo compartiría entre constructor, vista y validación, en lugar de que cada capa tenga su propia versión.
