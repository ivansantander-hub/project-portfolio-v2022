---
slug: dynamic-forms
lang: es
order: 8
title: Formularios definidos por configuración
project: Formularios dinámicos
headline: Cada formulario de un tracker era un modal escrito a mano. Para eventos adversos y sometimientos regulatorios, el formulario pasó a ser un esquema guardado en base de datos que el frontend dibuja y el backend valida.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead · constructor de formularios compartido, lógica condicional e integración con el EDC
period: 2025 – 2026
confidential: true
featured: false
summary:
  - k: El problema
    v: "Un modal de creación y edición escrito a mano por tracker. Cada proyecto pedía campos distintos y eso era código."
  - k: La decisión
    v: "El formulario como datos: esquema, layout y reglas en JSON, dibujado en el frontend y validado otra vez en el backend."
  - k: En qué terminó
    v: "Los formularios de eventos adversos y sometimientos se configuran sin desplegar. Los demás trackers siguen con modales propios."
metrics:
  - value: "8"
    label: "tipos de campo"
  - value: "8"
    label: "operadores para condiciones"
  - value: "3"
    label: "niveles de obligatoriedad (obligatorio, suave, opcional)"
stack:
  - Next.js
  - TypeScript
  - React Hook Form
  - dnd-kit
  - GraphQL
  - PostgreSQL
  - Prisma
tags:
  - producto
  - frontend
  - arquitectura
---

## El problema

Los trackers de la plataforma (sitios, documentos, visitas, contactos) tienen cada uno su modal de creación y edición escrito a mano; conté 11. Para eventos adversos y sometimientos regulatorios eso no alcanzaba: cada proyecto necesitaba campos distintos, secciones distintas y reglas del tipo "este campo solo aparece si aquel tiene tal valor". Hacerlo en código significaba un cambio y un despliegue por proyecto.

## Decisiones

**El formulario es un registro en base de datos.** El equipo definió un modelo `Form` con el esquema de campos, el layout por secciones y la configuración (respuestas múltiples, borradores, acceso) en columnas JSON con índices GIN. Las respuestas también se guardan como JSON, en estado borrador o enviado, ligadas al evento adverso o al sometimiento al que pertenecen. Costo: la base no valida la forma de los datos; esa responsabilidad pasa a la aplicación.

**Las condiciones también son datos.** Un campo puede tener `showIf` y `requiredIf` con grupos AND/OR y ocho operadores (igual, distinto, contiene, mayor que, vacío, etc.). Yo agregué la evaluación de esas condiciones en la vista de solo lectura. El backend vuelve a validar la respuesta contra el esquema, incluidas las condiciones, así que un cliente modificado no puede saltarse las reglas. Costo: la misma lógica está implementada dos veces, en el frontend y en el backend, y puede desalinearse.

**Obligatorio "suave" y borradores.** Además de obligatorio y opcional, un campo puede ser obligatorio suave: se puede guardar un borrador sin llenarlo, pero se exige al enviar. Costo: un estado más que explicar y que probar.

**Una salida para lo que no es un campo simple.** Además de los ocho tipos básicos, un campo `COMPONENT` referencia un componente registrado por nombre. Costo: esos campos vuelven a ser código.

**Un constructor compartido y conectado al EDC.** El equipo había hecho un constructor de arrastrar y soltar dentro del tracker de sometimientos. Lo convertí en un componente compartido, le agregué manejo de secciones y lo conecté a la integración con el sistema externo de captura clínica: el formulario de eventos adversos se genera a partir del mapeo de campos del EDC, y una vista previa lo valida antes de confirmar la creación. Costo: el estado del constructor quedó en un hook de unas 1.400 líneas.

**Avisar en lugar de sobrescribir.** Varias personas editan secciones del mismo evento adverso. Hice que cada guardado envíe la versión que se cargó; si otra persona guardó antes, el backend rechaza el cambio, el usuario ve quién lo modificó y lo que escribió no se pierde. Costo: el usuario tiene que resolver el conflicto a mano.

## Resultado

- Los formularios de eventos adversos y de sometimientos regulatorios se definen por configuración: agregar un campo o una condición no requiere despliegue.
- El renderizador y el constructor del tracker de sometimientos están en la rama principal. El constructor compartido y la generación desde el EDC están en desarrollo y QA.
- Los demás trackers siguen con sus modales escritos a mano; no los migramos.

## Qué haría distinto

Definiría el contrato del esquema una sola vez y lo compartiría entre constructor, renderizador y validador. Hoy el constructor traduce entre dos vocabularios (operadores en minúscula en la interfaz, en PascalCase en el esquema guardado) con tablas de conversión, y cada capa tiene su propio tipo para lo mismo.
