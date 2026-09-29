---
slug: learup-agent
lang: es
order: 3
title: Un asistente de código con IA que conoce el código de LearUp
project: LearUp Agent
headline: Un asistente de programación con varios agentes, varios proveedores de modelos y dos flujos propios, uno que lleva tareas hasta QA y otro que convierte la grabación de un bug en un análisis y una prueba que lo reproduce.
domain: Plataforma de gestión de ensayos clínicos
role: Technical Lead · diseño e implementación
period: 2026
featured: false
summary:
  - k: El problema
    v: "Los asistentes genéricos no conocen el código, el flujo de tareas ni los entornos de la plataforma."
  - k: La decisión
    v: "Una herramienta propia con agentes por rol, un gateway de modelos y flujos conectados al proceso del equipo."
  - k: En qué terminó
    v: "106 commits, 36 entradas en el registro de versiones y 45 archivos de pruebas automatizadas."
metrics:
  - value: "106"
    label: commits entre marzo y septiembre de 2026
  - value: "8"
    label: agentes con rol propio
  - value: "10"
    label: tipos de proveedor de modelos soportados
  - value: "45"
    label: archivos de pruebas con Vitest
stack:
  - TypeScript
  - Node.js
  - Express
  - Socket.IO
  - React
  - Vite
  - SQLite
  - Model Context Protocol
  - Playwright
  - AWS Bedrock
tags:
  - ia
  - herramientas internas
  - automatización
---

## El problema

La plataforma está repartida en muchos repositorios. Un asistente de código genérico no sabe cómo se organizan, cómo se escribe una tarea en el equipo ni cómo se verifica un cambio antes de llevarlo a QA. Yo quería una herramienta que partiera de ese contexto: implementar y revisar código, pero también seguir el proceso que el equipo ya usa.

Me concentré en dos partes del proceso: llevar una tarea desde su definición hasta un cambio verificado en QA, y reportar bugs con suficiente evidencia para encontrar la causa.

## Decisiones

**Un gateway de modelos en lugar de un solo proveedor.** El servidor elige el cliente según el prefijo del ID del modelo: Anthropic, compatibles con OpenAI (OpenAI, Google, Groq, xAI, OpenRouter, Ollama), endpoints propios y dos CLI locales (Claude Code y Cursor). Si no hay API key de Anthropic pero sí credenciales de AWS, usa Claude a través de Bedrock. Costo: dos bucles de agente que mantener (Anthropic y compatible con OpenAI) y diferencias entre proveedores que hay que cubrir a mano.

**Agentes definidos en Markdown y un registro de modos.** Cada agente (desarrollo, producto, revisión, QA, orquestador, arquitecto, chat) es una skill en Markdown más una entrada en un registro que dice qué herramientas carga. Producto y revisión son de solo lectura. Tomé patrones de un agente open source sin hacer fork. Costo: el comportamiento vive en texto y un cambio en una skill solo se comprueba ejecutándola.

**Un piloto automático que sigue el flujo del equipo.** Toma tareas marcadas explícitamente en Notion, escribe y valida la parte técnica (máximo tres rondas), implementa en un worktree por tarea, abre los MRs y verifica el cambio en local antes de fusionar nada. Cada fallo se clasifica como de código, de entorno o humano; solo los de código vuelven a implementación. Corre sobre la suscripción de Claude por CLI, sin API key. Costo: depende de la máquina local y de la CLI de desarrollo del equipo, y solo verifica una tarea a la vez.

**Captura de bugs con redacción antes de guardar.** Una pestaña graba el bug en un navegador real: video, red con cuerpos, consola, clics y capturas. Cabeceras de autenticación, cookies, tokens y contraseñas se eliminan antes de escribir en disco, y los campos sensibles se difuminan en el video. Las capturas se borran a los 30 días y cada una guarda quién la vio, exportó o analizó. Después, Claude busca la causa en el código y genera una prueba de Playwright que reproduce el fallo. Costo: la redacción descarta datos que a veces servirían para depurar.

## Resultado

- 106 commits entre el 23 de marzo y el 26 de septiembre de 2026, y 36 entradas en el registro de versiones (v0.1.0 a v0.31.0).
- 8 agentes, 10 tipos de proveedor y soporte para servidores MCP.
- Extensión de Chrome para grabar desde el navegador del tester, con una prueba E2E que revisa 21 puntos.
- 45 archivos de pruebas con Vitest, más una guía de pruebas manuales.

## Qué haría distinto

Llevaría el registro de versiones desde el primer commit: las fechas de las primeras entradas no coinciden con el historial de git. Además, 28 de esas 36 entradas quedaron entre el 24 y el 26 de septiembre; habría repartido ese trabajo en entregas más espaciadas.
