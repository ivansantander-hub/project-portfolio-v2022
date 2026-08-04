---
slug: architecture-simplification
lang: es
order: 1
title: Cuando el sistema es más grande que el equipo
project: Consolidación de arquitectura
headline: Una arquitectura de microservicios que había crecido más rápido que el equipo que debía mantenerla. Medí primero, propuse dos caminos y empecé por lo aburrido.
domain: Plataforma SaaS de gestión de ensayos clínicos
role: Technical Lead → Technical Product Owner
period: 2025 – 2026
confidential: true
featured: true
summary:
  - k: El problema
    v: "Más componentes que personas para mantenerlos. No era rendimiento ni bugs: era una relación rota."
  - k: La decisión
    v: "Dos propuestas con sus costos, no una. Migración por partes con Strangler Fig, nunca un corte total."
  - k: En qué terminó
    v: "Documento de referencia para la decisión de arquitectura. Empezamos por retirar lo que ya no se desplegaba."
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

## El contexto

Una plataforma para gestionar ensayos clínicos. Gestión de proyectos, control documental, captura de datos y analítica.

Dominio regulado. Hay auditorías. Un dato mal migrado tiene consecuencias reales.

El sistema había crecido por acumulación durante años. Cada necesidad nueva, un servicio nuevo. Cada cliente nuevo, un proceso programado nuevo.

Ninguna de esas decisiones fue mala.

El conjunto sí.

## El problema

No era rendimiento. No eran bugs.

Era otra cosa:

> había más componentes que mantener que personas para mantenerlos.

Los síntomas eran los de siempre cuando esa relación se rompe.

- Un cambio transversal obligaba a repetir el mismo trabajo en muchos repositorios
- Entender un flujo de punta a punta exigía saltar entre varios servicios
- El onboarding se medía en semanas, no en días
- Debugging distribuido para problemas que no eran distribuidos

Y el patrón de "un proceso por cliente" garantizaba que el problema creciera con el negocio.

Lo importante no era ninguno de esos síntomas por separado.

Era que todos apuntaban a lo mismo y nadie había puesto el número encima.

## Lo primero no fue proponer. Fue contar.

Revisé el código servicio por servicio y armé un inventario real. Qué existe, qué sigue vivo, qué lleva un año sin un commit, qué depende de qué.

Ese inventario cambió la conversación.

Pasamos de "el sistema se siente pesado" a una tabla donde cualquiera veía la desproporción.

Un argumento con datos lo puede evaluar alguien que no es técnico. Una sensación, no.

## Dos caminos, no uno

Llegué con dos propuestas a propósito.

Una sola opción pide un sí o un no. Dos opciones con sus costos piden una decisión.

**El camino conservador.** Consolidar los servicios manteniendo el estilo actual. Menos ruptura, terreno conocido, se puede empezar la semana siguiente. No resuelve la fragmentación de fondo.

**El camino de fondo.** Reducir a un puñado de procesos en monorepo, tipado de punta a punta, quitando la capa de federación y unificando los procesos programados en un worker dirigido por eventos. Resuelve la causa. Cuesta más y toca más cosas.

Para cada uno definí alcance, secuencia, responsables y criterios de vuelta atrás.

## Tres decisiones que sostengo

**Migración incremental, nunca big bang.**

Strangler Fig con proxy inverso. El sistema nuevo absorbe rutas una por una mientras el viejo sigue sirviendo el resto.

En un dominio regulado, un corte total no es una opción que puedas defender.

**Siempre alguien dedicado a la operación.**

En los dos planes reservé una persona para bugs y soporte durante toda la migración.

Las migraciones no se mueren por problemas técnicos. Se mueren porque la operación del día a día se come al equipo y el proyecto se queda sin nadie.

**Primero lo comprometido, después lo estructural.**

El plan decía explícitamente que las entregas ya prometidas iban antes que la refactorización.

Una propuesta de arquitectura que ignora los compromisos del negocio no se ejecuta. Se archiva.

## En qué terminó

La propuesta quedó como el documento de referencia para la decisión de arquitectura.

El inventario dejó de ser conocimiento de dos o tres personas y pasó a ser algo que se puede consultar.

Antes de tocar lo grande ejecutamos lo trivial: retirar lo que ya no se desplegaba y absorber los servicios de catálogo que no justificaban existir aparte.

Empezar por lo aburrido genera la confianza que después necesitas para lo caro.

En paralelo diseñé el reemplazo del frontend sobre otra idea. En vez de un archivo por vista, un motor de registro: una ruta genérica que resuelve contra un mapa de configuración, y unos pocos armazones reutilizables para todos los patrones de pantalla.

Agregar una vista pasa a ser agregar un objeto de configuración. No crear archivos.

## Qué haría distinto

El inventario debí hacerlo un año antes.

La propuesta no fue difícil de escribir. Lo difícil es que para cuando existió, el costo de la deuda ya estaba pagado.
