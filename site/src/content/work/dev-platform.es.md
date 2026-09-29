---
slug: dev-platform
lang: es
order: 10
title: Una herramienta de línea de comandos para el entorno local
project: Entorno de desarrollo local
headline: Levantar la plataforma en local implicaba muchos pasos manuales. Armé una herramienta de línea de comandos que clona, configura, diagnostica y arranca el entorno con un asistente.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead · diseño e implementación de la herramienta
featured: false
summary:
  - k: El problema
    v: "Preparar el entorno local dependía de pasos manuales y conocimiento disperso."
  - k: La decisión
    v: "Una herramienta de línea de comandos delgada que orquesta scripts y guía con un asistente."
  - k: En qué terminó
    v: "El entorno se prepara y arranca con pocos comandos y se detiene limpio."
stack:
  - TypeScript
  - Node.js
  - Bash
tags:
  - herramientas internas
  - experiencia de desarrollo
  - automatización
---

## El problema

La plataforma está repartida en muchos repositorios independientes. Correrla en local exigía clonar cada uno, instalar dependencias, preparar la configuración de cada servicio y arrancarlos en el orden correcto. Ese conocimiento estaba repartido entre documentos y personas, y cada persona nueva lo volvía a descubrir.

## Decisiones

**Una capa delgada sobre scripts.** La herramienta está escrita en TypeScript y delega el trabajo pesado en scripts de bash. Una futura interfaz gráfica debería llamar a esa misma capa en lugar de duplicar la lógica. Costo: dos lenguajes que mantener y dependencia de herramientas Unix, así que el objetivo principal es macOS y Linux.

**Asistente por defecto, opciones para automatizar.** Sin argumentos, la herramienta pregunta qué partes levantar. Con opciones, se puede usar desde otros scripts. Costo: dos puntos de entrada que mantener alineados.

**Configuración en tiempo de ejecución.** La herramienta pasa la configuración a cada proceso al arrancarlo, sin reescribir archivos en disco. Costo: reiniciar un servicio tiene que pasar por el mismo mecanismo para no perderla.

**Advertir en lugar de actuar sobre recursos compartidos.** Cuando una opción afecta algo compartido con otras personas, la herramienta lo advierte y sugiere el paso, pero no lo ejecuta. Costo: ese paso queda en manos de quien la usa.

## Resultado

- Preparar el entorno quedó en pocos pasos documentados.
- Un comando de diagnóstico revisa requisitos, dependencias y configuración, e indica qué bloquea.
- Detener el entorno cierra todos los procesos que se abrieron.
- Cada entrega quedó documentada con su verificación manual.

## Qué haría distinto

Tendría un solo registro de repositorios desde el principio, en lugar de listas que hubo que unificar después. También escribiría pruebas unitarias para las partes puras desde el comienzo.
