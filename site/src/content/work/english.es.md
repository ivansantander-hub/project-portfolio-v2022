---
slug: english
lang: es
order: 2
title: Una app para practicar inglés a diario
project: English A1
headline: "Una app personal para practicar Present Simple con ejercicios reales, corrección con IA oración por oración y un motor que elige qué practicar según los errores."
domain: Proyecto propio
role: Desarrollador único · diseño y desarrollo
period: Agosto 2026
featured: true
links:
  - label: Código en GitHub
    href: https://github.com/ivansantander-hub/english
  - label: Ver la app
    href: https://web-production-81f3a7.up.railway.app
summary:
  - k: El problema
    v: "Practicar inglés a diario con corrección útil, no solo acierto o error, y saber qué repasar."
  - k: La decisión
    v: "Corrección con IA validada por esquema, con respaldo por reglas para que toda respuesta tenga resultado."
  - k: En qué terminó
    v: "Desplegada en Railway, versión 1.5.0, con CI y 131 tests."
metrics:
  - value: "131"
    label: "tests automatizados"
  - value: "29"
    label: "procedimientos tRPC"
  - value: "19"
    label: "modelos de datos"
  - value: "~10.7k"
    label: "líneas de TypeScript"
stack:
  - React
  - Vite
  - Tailwind
  - Node.js
  - tRPC
  - Prisma
  - PostgreSQL
  - Zod
  - OpenRouter
  - Railway
tags:
  - producto propio
  - IA
  - educación
---

English A1 es una app de uso diario para un hispanohablante que estudia Present Simple. Tiene ejercicios de traducción, completar espacios, corregir oraciones y traducir párrafos; un mapa de práctica; práctica diaria de 15 ejercicios; conversación con un tutor; historial de errores; un análisis del perfil generado con IA y recomendaciones de videos de YouTube ligadas a los errores.

## El problema

Una app de ejercicios que solo dice "correcto" o "incorrecto" no sirve de mucho para aprender: una paráfrasis válida cuenta como error y no queda claro qué falló. Quería corrección por oración, con la explicación en inglés y en español, y que la app usara esos errores para decidir qué practicar después.

## Decisiones

**El dominio va en paquetes puros.** La lógica de aprendizaje (precisión por concepto, detección de debilidades, estrategias de selección, composición de la práctica diaria) y la de ejercicios no dependen de React, Prisma ni OpenRouter: entran datos y salen datos. Eso permite probarla sin base de datos ni red. Costo: un monorepo con siete paquetes y su cableado, que para una app de este tamaño es bastante estructura.

**La IA corrige, pero siempre hay un resultado.** El modelo devuelve JSON que se valida con Zod; si falla, hay un reintento con una instrucción más estricta, y si vuelve a fallar se califica con reglas de coincidencia exacta. Cada intento guarda `gradedBy: "ai" | "rules"`. Costo: las reglas son mucho más estrictas que la IA y no aceptan paráfrasis, así que los dos tipos de resultado no son comparables; por eso quedan marcados.

**El modelo se cambia desde el panel de administración.** Las variables de entorno solo son el valor inicial; después manda una fila `AISettings` editable sin redesplegar. El selector se llena con el catálogo real de OpenRouter, ordenado por precio, y el costo de cada llamada se calcula al registrarla para que no cambie si el proveedor ajusta precios. Costo: las llamadas de conversación van en streaming y no reciben el conteo de tokens, así que su costo queda en `null`.

**Los videos se cachean por tema e idioma.** Una búsqueda real en YouTube se hace como máximo una vez al mes por combinación de tema e idioma, y la caché se comparte entre usuarios. El idioma sale del nivel (A1/A2 reciben lecciones en español) o de una preferencia explícita. Costo: las recomendaciones pueden tener hasta 30 días de antigüedad.

**Autenticación con correo y PIN de 6 dígitos.** Sesiones opacas con vencimiento deslizante de 90 días, enviadas como token bearer porque web y API viven en subdominios distintos de Railway. Costo: un PIN de 6 dígitos es débil; lo compensa en parte el bloqueo de 15 minutos tras 5 intentos fallidos.

## Resultado

Está desplegada en Railway (web, API y Postgres), con despliegue automático en cada push a `main`, migraciones y seed en cada despliegue, y un pipeline de CI que corre lint, typecheck y tests contra un Postgres real. El historial tiene 22 commits entre el 11 y el 12 de agosto de 2026 y llega a la versión 1.5.0, con changelog y notas de versión bilingües dentro de la app.

## Qué haría distinto

Pensaría antes en el estado de la práctica: cambiar de pestaña reiniciaba el ejercicio en curso y hicieron falta dos versiones (1.1.2 y 1.1.3) para corregirlo, la segunda por el `refetchOnWindowFocus` de React Query. También cerraría el hueco del costo de las conversaciones. Y el modelo ya soporta niveles, pero todo el contenido sembrado sigue siendo A1.
