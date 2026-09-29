---
slug: megabyte
lang: es
order: 11
title: Un agente de terminal con modelos locales
project: megabyte
headline: "Un agente que corre en mi terminal con un modelo local de Ollama. Primero lo escribí en Python; al día siguiente lo pasé a una capa delgada sobre un fork de pi, un proyecto MIT de earendil-works."
domain: Proyecto propio
role: Autor único de la capa megabyte · el motor es pi (earendil-works, MIT)
period: 2026
featured: false
links:
  - label: Fork en GitHub (TypeScript)
    href: https://github.com/ivansantander-hub/megabyte
  - label: Versión en Python (archivada)
    href: https://github.com/ivansantander-hub/megabyte-python
summary:
  - k: El problema
    v: "Quería un agente en la terminal que usara un modelo local y supiera cuándo usar herramientas y cuándo no."
  - k: La decisión
    v: "Después de una versión propia en Python, usar pi como motor y dejar megabyte como una capa encima."
  - k: En qué terminó
    v: "Un lanzador, una configuración de Ollama y dos herramientas portadas; la versión en Python quedó archivada."
metrics:
  - value: "1.395"
    label: "líneas de Python en la primera versión"
  - value: "14"
    label: "herramientas en la versión en Python"
  - value: "11"
    label: "casos en la evaluación de uso de herramientas"
  - value: "208"
    label: "líneas de la capa sobre pi"
stack:
  - Python
  - TypeScript
  - Node.js
  - Ollama
  - OpenRouter
  - Playwright
tags:
  - proyecto propio
  - agentes
  - código abierto
---

megabyte es un agente que se invoca como `megabyte` desde cualquier terminal. Tuvo dos versiones: una escrita por mí en Python y otra que es un fork de [pi](https://github.com/earendil-works/pi), el proyecto de Mario Zechner y earendil-works (licencia MIT). La API unificada de LLMs, el ciclo del agente, la TUI y el CLI de programación que aparecen en la descripción del repositorio son de pi, no míos. Lo mío en ese repositorio es un solo commit de 251 líneas, encima de más de 6.500 commits de upstream.

## El problema

Quería un agente que corriera con un modelo local (Qwen en Ollama), que leyera archivos, navegara y buscara en la web, y que no se quedara describiendo un plan en vez de ejecutarlo. Con modelos pequeños eso falla de formas concretas: repiten la misma llamada que ya falló, escriben la llamada a la herramienta como texto plano o usan herramientas para preguntas que no las necesitan.

## Decisiones

**Primero, una versión propia en Python.** Ocho commits el 24 de septiembre de 2026: ciclo modelo–herramientas, 14 herramientas (archivos, navegador con Playwright, búsqueda en DuckDuckGo sin API key, imagen, voz y `ask_claude`), compactación automática del contexto, sesiones reanudables y configuración en YAML. Me sirvió para ver qué partes eran difíciles de verdad. Costo: un día de trabajo en algo que después dejé de lado.

**Arreglar los fallos del modelo en el harness.** Si el modelo repite exactamente una acción que ya falló, el ciclo la bloquea y le pide cambiar de estrategia. Si escribe la llamada como texto (`web_search{...}`), el harness la interpreta y la ejecuta. Costo: son heurísticas que dependen del modelo y pueden fallar con otro.

**Una evaluación pequeña en vez de tests.** `dev/eval_tool_decisions.py` corre 11 prompts etiquetados y mide si el agente usó una herramienta o respondió directo. No hay tests unitarios en ninguna de las dos versiones mías. Costo: la evaluación llama al modelo real, es lenta y no es determinista.

**Cambiar a pi en lugar de seguir con mi motor.** pi ya resolvía proveedores, TUI, extensiones y sesiones, y lo mantiene un equipo con cientos de colaboradores. Marqué la versión Python con el tag `python-final` y al día siguiente hice el fork. Costo: el motor ya no es mío y dependo de las decisiones de otro proyecto.

**No tocar el código interno de pi.** megabyte es un lanzador en bash que apunta pi a `~/.megabyte/agent`, un `models.json` con el proveedor Ollama, un prompt de identidad y dos extensiones portadas: `ask-claude.ts` y `web-search.ts`. Así puedo traer cambios de upstream sin conflictos. Costo: todo lo que quiera agregar tiene que caber en el sistema de extensiones de pi.

## Resultado

El fork compila y `megabyte` corre con Ollama en modo no interactivo; las dos extensiones cargan y la búsqueda devuelve resultados usando la versión lite de DuckDuckGo cuando la HTML bloquea (según el mensaje del commit). Ambos repositorios son públicos. No está publicado en npm ni en PyPI.

## Qué haría distinto

Revisaría antes qué proyectos abiertos existían: buena parte de lo que escribí en Python ya estaba resuelto en pi. También escribiría tests para la recuperación de llamadas en texto (`_text_to_call` es una función pura) y sacaría la detección de ciclos del ciclo principal para poder probarla sin un modelo.
