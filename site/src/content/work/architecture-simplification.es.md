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

> Había más componentes que mantener que personas para mantenerlos.

No era una sensación. Era lo que encontré al contar.

Una plataforma para gestionar ensayos clínicos: proyectos, control documental, captura de datos, analítica. Dominio regulado, con auditorías — un dato mal migrado tiene consecuencias reales.

El sistema había crecido por acumulación durante años. Cada necesidad nueva, un servicio nuevo. Cada cliente nuevo, un proceso programado nuevo. Ninguna de esas decisiones fue mala. El conjunto sí.

Los síntomas eran los de siempre cuando esa relación se rompe: un cambio transversal obligaba a repetir el mismo trabajo en varios repositorios, el onboarding se medía en semanas y no en días, había debugging distribuido para problemas que no eran distribuidos. Y el patrón de "un proceso por cliente" garantizaba que el problema creciera con el negocio.

Nada de eso importaba por separado. Importaba que todos apuntaban a lo mismo, y que nadie le había puesto un número encima.

## Contar antes de proponer

Revisé el código servicio por servicio y armé un inventario real: qué existe, qué sigue vivo, qué lleva un año sin un commit, qué depende de qué.

Ese inventario cambió la conversación. Pasamos de "el sistema se siente pesado" a una tabla donde cualquiera veía la desproporción — un argumento que puede evaluar alguien que no es técnico. Una sensación, no.

## Dos caminos, a propósito

Llegué con dos propuestas. Una sola opción pide un sí o un no; dos opciones con sus costos piden una decisión.

**El camino conservador.** Consolidar los servicios manteniendo el estilo actual. Menos ruptura, terreno conocido, se puede empezar la semana siguiente. No resuelve la fragmentación de fondo.

**El camino de fondo.** Reducir a un puñado de procesos en monorepo, tipado de punta a punta, quitando la capa de federación y unificando los procesos programados en un worker dirigido por eventos. Resuelve la causa. Cuesta más y toca más cosas.

Para cada uno definí alcance, secuencia, responsables y criterios de vuelta atrás.

## Lo que no negocié

**Migración incremental, nunca big bang.** Strangler Fig con proxy inverso: el sistema nuevo absorbe rutas una por una mientras el viejo sigue sirviendo el resto. En un dominio regulado, un corte total no es una opción que puedas defender.

**Alguien dedicado a la operación, siempre.** En los dos planes reservé una persona para bugs y soporte durante toda la migración. Las migraciones no se mueren por problemas técnicos — se mueren porque el día a día se come al equipo y el proyecto se queda sin nadie.

**Lo comprometido antes que lo estructural.** El plan decía explícitamente que las entregas ya prometidas iban antes que la refactorización. Una propuesta que ignora los compromisos del negocio no se ejecuta. Se archiva.

## Dónde quedó

La propuesta es hoy el documento de referencia para la decisión de arquitectura. El inventario dejó de ser conocimiento de dos o tres personas y pasó a ser algo que se puede consultar.

Antes de tocar lo grande, ejecutamos lo trivial: retirar lo que ya no se desplegaba, absorber los servicios de catálogo que no justificaban existir aparte. Empezar por lo aburrido genera la confianza que después necesitas para lo caro.

En paralelo diseñé el reemplazo del frontend sobre la misma lógica: en vez de un archivo por vista, un motor de registro — una ruta genérica que resuelve contra un mapa de configuración, con unos pocos armazones reutilizables para todos los patrones de pantalla. Agregar una vista pasa a ser agregar un objeto de configuración, no crear archivos.

## Un año tarde

El inventario debí hacerlo un año antes. La propuesta no fue difícil de escribir — lo difícil es que para cuando existió, el costo de la deuda ya estaba pagado.
