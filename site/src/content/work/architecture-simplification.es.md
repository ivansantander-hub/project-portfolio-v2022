---
slug: architecture-simplification
lang: es
order: 1
title: Consolidar una arquitectura de microservicios
project: Consolidación de arquitectura
headline: Una arquitectura de microservicios que había crecido más rápido que el equipo que la mantenía. Hice un inventario, propuse dos planes y empezamos por lo más sencillo.
domain: Plataforma SaaS de gestión de ensayos clínicos
role: Technical Lead → Technical Product Owner
period: 2025 – 2026
confidential: true
featured: true
summary:
  - k: El problema
    v: "Había más componentes que personas para mantenerlos. El problema no era el rendimiento ni los bugs, sino esa proporción."
  - k: La decisión
    v: "Dos propuestas con sus costos. En ambas, migración por partes con Strangler Fig en lugar de un corte total."
  - k: En qué terminó
    v: "La propuesta es el documento de referencia para la decisión de arquitectura. Empezamos retirando lo que ya no se desplegaba."
stack:
  - Arquitectura de microservicios
  - GraphQL Federation
  - Kubernetes
  - Next.js
  - TypeScript
  - Python
tags:
  - arquitectura
  - liderazgo
  - migración
---

La plataforma sirve para gestionar ensayos clínicos: proyectos, control documental, captura de datos y analítica. Es un dominio regulado y auditado, así que un dato mal migrado tiene consecuencias reales.

El sistema había crecido por acumulación durante años. Cada necesidad nueva traía un servicio nuevo y cada cliente nuevo, un proceso programado nuevo. Cada decisión tenía sentido por separado, pero en conjunto habían dejado más componentes que personas para mantenerlos. Lo comprobé cuando me puse a contarlos.

Se notaba en el día a día: un cambio transversal obligaba a repetir el mismo trabajo en varios repositorios, el onboarding tardaba semanas en vez de días y depurábamos en sistemas distribuidos problemas que no eran distribuidos. Además, el patrón de "un proceso por cliente" hacía que el problema creciera con el negocio.

Todos esos síntomas tenían la misma causa, pero nadie la había cuantificado.

## Hacer un inventario antes de proponer

Revisé el código servicio por servicio y armé un inventario: qué existe, qué sigue en uso, qué lleva un año sin commits y qué depende de qué.

Con eso la conversación cambió. En lugar de "el sistema se siente pesado" teníamos una tabla donde se veía la desproporción, y que también podía evaluar alguien no técnico.

## Dos propuestas

Presenté dos opciones, cada una con sus costos, para que la discusión fuera sobre cuál elegir y no solo sobre aprobar o rechazar una.

**Opción conservadora.** Consolidar servicios manteniendo el estilo actual. Menos ruptura, terreno conocido y se podía empezar la semana siguiente. No resuelve la fragmentación de fondo.

**Opción de fondo.** Reducir a unos pocos procesos en un monorepo, con tipado de punta a punta, quitando la capa de federación y unificando los procesos programados en un worker dirigido por eventos. Ataca la causa, pero cuesta más y toca más cosas.

Para cada una definí alcance, secuencia, responsables y criterios para dar marcha atrás.

## Condiciones comunes a los dos planes

**Migración incremental, sin big bang.** Strangler Fig con un proxy inverso: el sistema nuevo va absorbiendo rutas una a una mientras el viejo sigue sirviendo el resto. En un dominio regulado, un corte total era difícil de justificar.

**Una persona dedicada a la operación.** En ambos planes reservé a alguien para bugs y soporte durante toda la migración. Si el trabajo diario absorbe a todo el equipo, la migración se queda sin gente y se estanca.

**Primero los compromisos ya adquiridos.** El plan dejaba claro que las entregas ya prometidas iban antes que la refactorización. Si no, la propuesta no habría sido realista para el negocio.

## Dónde quedó

La propuesta es hoy el documento de referencia para la decisión de arquitectura. El inventario, que antes estaba en la cabeza de dos o tres personas, ahora lo puede consultar cualquiera.

Antes de tocar lo grande, el equipo hizo lo sencillo: retirar lo que ya no se desplegaba y absorber los servicios de catálogo que no justificaban existir por separado. Eso nos dio algo de confianza para las partes más caras.

En paralelo diseñé el reemplazo del frontend con la misma idea: en vez de un archivo por vista, un motor de registro. Una ruta genérica resuelve contra un mapa de configuración, con unos pocos armazones reutilizables que cubren todos los patrones de pantalla. Agregar una vista pasa a ser agregar un objeto de configuración, no crear archivos.

## Qué haría distinto

Haría el inventario un año antes. Escribir la propuesta no fue lo difícil; el problema es que, cuando llegó, ya habíamos pagado el costo de esa deuda.
