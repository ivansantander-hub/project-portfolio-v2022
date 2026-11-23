---
slug: avatar-studio
lang: es
order: 2
title: Un estudio que produce y publica videos cortos con IA
project: Avatar Studio
headline: "Una plataforma propia para producir videos cortos de punta a punta, de la idea a la publicación automática en Instagram, YouTube y Facebook. Las cuentas que alimenta suman más de dos millones de vistas en un mes."
domain: "Proyecto propio · Producto y contenido"
role: "Autor único · producto, arquitectura, código y dirección de contenido"
period: "Septiembre 2026 – presente"
featured: true
links:
  - label: "@tony.mercury en Instagram"
    href: https://www.instagram.com/tony.mercury/
  - label: "Kinema Studio en Facebook"
    href: https://www.facebook.com/1262282486979772
  - label: "kalvin9604 en YouTube"
    href: https://www.youtube.com/@kalvin9604
summary:
  - k: El problema
    v: "Hacer un video corto bueno toma muchos pasos sueltos: idea, guion, voz, imágenes, montaje, subtítulos y publicar en cada red por separado."
  - k: La decisión
    v: "Un solo estudio donde cada paso es parte de un proyecto, los modelos se eligen por llamada y la publicación sale sola a su hora."
  - k: Qué está pasando
    v: "Tres cuentas activas alimentadas por el estudio, con más de dos millones de vistas y más de 5.000 seguidores nuevos en un mes."
metrics:
  - value: "1,5 M"
    label: "vistas en un mes en Kinema Studio (Facebook)"
  - value: "541 mil"
    label: "vistas en un mes en @tony.mercury (Instagram)"
  - value: "+5.300"
    label: "seguidores nuevos en un mes entre las tres cuentas"
stack:
  - TypeScript
  - tRPC · Postgres
  - Remotion
  - MCP
  - Python (modelos locales)
tags:
  - producto propio
  - ia generativa
  - contenido
---

Avatar Studio empezó en septiembre de 2026 como una carpeta de scripts para hacer hablar a un personaje con IA. Hoy es una plataforma: un espacio de trabajo con cuentas, series, un calendario y un pipeline que lleva cada video de la idea a la publicación. Lo uso para producir el contenido de tres cuentas reales, y sus números se pueden ver en público.

## Lo que hay detrás de cada video

Cada video es un proyecto que pasa por etapas: idea, guion, tomas, edición, revisión, programado y publicado. Las ideas se capturan y se votan; el guion se escribe en versiones; la voz sale de un modelo de texto a voz dirigido como personaje; las imágenes y escenas, de los modelos que convenga para cada toma; el montaje se arma como datos y se renderiza a MP4. Al final, el estudio sube el video a su hora a Instagram como Reel, a YouTube y a una página de Facebook, y deja enlazada cada publicación con sus métricas.

## Decisiones

**El montaje es un dato, no un archivo.** Un corte se guarda como una composición (clips, textos, música, subtítulos) y se renderiza con Remotion. Así se puede corregir un texto o un tiempo y volver a exportar sin rehacer nada, y el mismo corte sale también como subtítulos o paquete para CapCut.

**Un arnés de modelos con presupuesto.** Cada llamada elige su modelo (video, imagen, voz o texto, en la nube o en el Mac) y queda registrada con su costo en un libro de gastos con tope mensual. *Trade-off:* más plomería que casarse con un proveedor, a cambio de usar el mejor modelo para cada paso y saber cuánto cuesta cada video.

**Trabajo local y en la nube separados por carriles.** Lo que corre en el Mac (modelos locales, render) va por un carril; lo que corre en el servidor, por otro. Si no hay un trabajador encendido para un carril, el estudio rechaza el trabajo con la razón en vez de dejarlo esperando en una cola que nunca avanza.

**Cualquier agente puede trabajar en el estudio.** Un servidor MCP expone el estudio con los mismos permisos que la app web, así que un agente como Claude puede proponer ideas, escribir guiones o armar un corte dentro del espacio de trabajo, con roles y tope de gasto.

**El estudio aprende de las correcciones.** Las correcciones que hago a un video se vuelven lecciones de un libro de estilo por cuenta, y los siguientes videos las siguen.

## Resultados

En el último mes, medido el 21 de noviembre de 2026: **Kinema Studio** en Facebook llegó a 1,5 millones de vistas y 1,2 millones de cuentas alcanzadas, con casi 4.000 seguidores nuevos; **@tony.mercury** en Instagram, a 541 mil vistas y 385 mil cuentas alcanzadas, con 1.226 seguidores nuevos; y **kalvin9604** en YouTube, a 75 mil vistas. El repositorio tiene unos 400 commits desde finales de septiembre.

## Lo que sigue

Que el estudio cierre el ciclo solo: leer qué videos funcionaron, convertirlo en ideas y proponer la semana siguiente.
