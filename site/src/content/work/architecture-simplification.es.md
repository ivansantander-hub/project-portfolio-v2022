---
slug: architecture-simplification
lang: es
order: 1
title: Consolidar una arquitectura de microservicios
project: Consolidación de arquitectura
headline: Una arquitectura de microservicios con más componentes que personas para mantenerlos. Un inventario del sistema y dos propuestas con sus costos la convirtieron en una decisión evaluable, empezando por retirar lo que ya no se desplegaba.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead → Technical Product Owner · inventario y propuesta de arquitectura
period: 2025 – 2026
featured: true
summary:
  - k: El problema
    v: "Más componentes que personas para mantenerlos. El problema no era el rendimiento ni los bugs, sino esa proporción."
  - k: La decisión
    v: "Dos propuestas con sus costos. Ambas con migración incremental (Strangler Fig), sin corte total."
  - k: En qué terminó
    v: "La propuesta es el documento de referencia para la decisión de arquitectura. Primer paso: retirar lo que ya no se desplegaba."
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

## El problema

La plataforma cubre proyectos, control documental, captura de datos y analítica en un dominio regulado y auditado: un dato mal migrado tiene consecuencias reales.

El sistema había crecido por acumulación durante años. Cada necesidad nueva traía un servicio nuevo y cada cliente nuevo, un proceso programado nuevo. Decisiones razonables por separado dejaron, en conjunto, más componentes que personas para mantenerlos:

- Un cambio transversal se repetía en varios repositorios.
- El onboarding tardaba semanas en vez de días.
- Se depuraban en sistemas distribuidos problemas que no eran distribuidos.
- El patrón "un proceso por cliente" hacía que el problema creciera con el negocio.

Todos tenían la misma causa, pero nadie la había cuantificado.

## Decisiones

**Inventario antes que propuesta.** Revisé el código servicio por servicio y construí un inventario: qué existe, qué sigue en uso, qué lleva un año sin commits y qué depende de qué. La conversación pasó de "el sistema se siente pesado" a una tabla que mostraba la desproporción, evaluable también por alguien no técnico. Costo: tiempo de revisión antes de poder proponer nada.

**Dos opciones en lugar de una.** Propuse dos planes con sus costos, para discutir cuál elegir en vez de aprobar o rechazar uno. Para cada uno definí alcance, secuencia, responsables y criterios para dar marcha atrás.

- *Conservadora:* consolidar servicios manteniendo el estilo actual. Menos ruptura, terreno conocido y arranque la semana siguiente; no resuelve la fragmentación de fondo.
- *De fondo:* reducir a unos pocos procesos en un monorepo con tipado de punta a punta, quitar la capa de federación y unificar los procesos programados en un worker dirigido por eventos. Ataca la causa, pero cuesta más y toca más cosas.

**Migración incremental en ambos planes.** Strangler Fig con un proxy inverso: el sistema nuevo absorbe rutas una a una y el viejo sirve el resto. Obliga a mantener dos sistemas a la vez, pero en un dominio regulado un corte total era difícil de justificar.

**Una persona dedicada a la operación.** Alguien reservado para bugs y soporte durante toda la migración. Resta capacidad, pero evita que el día a día absorba al equipo y estanque la migración.

**Primero los compromisos ya adquiridos.** Las entregas ya prometidas van antes que la refactorización. La migración avanza más despacio, a cambio de que el plan sea realista para el negocio.

## Resultado

- La propuesta es el documento de referencia para la decisión de arquitectura.
- El inventario, antes en la cabeza de dos o tres personas, ahora lo puede consultar cualquiera.
- El equipo empezó por lo sencillo: retirar lo que ya no se desplegaba y absorber los servicios de catálogo que no justificaban existir por separado. Eso dio confianza para las partes más caras.
- Diseñé el reemplazo del frontend con la misma idea: un motor de registro en lugar de un archivo por vista. Una ruta genérica resuelve contra un mapa de configuración y la idea es que unos pocos armazones reutilizables cubran los patrones de pantalla, de modo que agregar una vista sea agregar un objeto de configuración. Hoy es un experimento con un solo armazón, el de grilla (ver el caso del sistema de shells).

## Qué haría distinto

Haría el inventario un año antes. Cuando la propuesta llegó, ya habíamos pagado el costo de esa deuda.
