---
slug: super-8
lang: es
order: 4
title: Animación 3D escrita en código
project: Super 8
headline: "Aprender Blender sin tocar la interfaz: cada escena, personaje y corto animado sale de un script de Python. Catorce piezas publicadas, del primer dado a un monólogo con voz y boca sincronizada."
domain: "Proyecto propio · Animación 3D"
cardLine: "Animación 3D con Python y Blender"
role: "Autor único · escenas, personajes, rig, render y sitio"
period: "Noviembre 2026 – presente"
featured: true
links:
  - label: Ver las piezas
    href: https://super-8.pages.dev
  - label: Proyecto hermano · Mark 1
    href: https://mark-1.pages.dev
summary:
  - k: La pregunta
    v: "¿Se puede llegar de un dado estático a un corto animado escribiendo código en vez de mover vértices a mano?"
  - k: La regla
    v: "El script es la fuente de verdad; el .blend, la imagen y el video son artefactos que se regeneran."
  - k: Dónde va
    v: "Catorce piezas publicadas, dos personajes con rig y tres cortos con sonido, uno de ellos con voz."
metrics:
  - value: "14"
    label: "piezas publicadas"
  - value: "12"
    label: "proyectos en un solo repositorio"
  - value: "2"
    label: "personajes con rig y expresiones"
media:
  video: /img/casos/super-8/la-nube.mp4
  poster: /img/casos/super-8/la-nube.webp
  alt: "La nube de arcilla del corto «Yo no lloro», renderizada en Blender"
points:
  - "**De un dado a un corto con voz**, con una técnica nueva en cada pieza."
  - "**Rig generado por código:** los pesos de la piel salen de la geometría, sin pintar nada."
  - "**La voz mueve la boca:** la animación se lee del volumen de cada frase."
gallery:
  - src: /img/casos/super-8/la-ultima-ficha.webp
    alt: "La ficha de dominó con brazos y cara del corto «La última ficha»"
    caption: La última ficha
  - src: /img/casos/super-8/domino.webp
    alt: "Cadena de fichas de dominó cayendo en curva"
    caption: Cadena de dominó
  - src: /img/casos/super-8/dados.webp
    alt: "Dados rodando con física de cuerpos rígidos"
    caption: Física de dados
  - src: /img/casos/super-8/nube-rig.webp
    alt: "La nube enojada con rayos, una expresión del rig"
    caption: La nube · rig
moreLabel: "Ver el detalle: cómo se trabaja sin la interfaz"
stack:
  - Python
  - Blender (bpy)
  - Geometry Nodes
  - Cycles · EEVEE
  - ffmpeg
tags:
  - 3d
  - animación
  - procedural
---

Super 8 es una ruta de aprendizaje de Blender hecha al revés: en lugar de la interfaz, cada pieza es un script de Python que arma la escena, la anima y la renderiza. El repositorio guarda el código; el archivo de Blender, las imágenes y los videos se pueden reconstruir con un comando. Las piezas viven en un sitio propio, con su proceso explicado.

## De un dado a un corto

La ruta avanzó por escalones, cada uno con una técnica nueva: un dado con iluminación de cine, monedas procedurales con Geometry Nodes, física de cuerpos rígidos, una cadena de fichas de dominó, y después personajes. El primero fue una ficha de dominó con brazos, piernas y cara; el segundo, una nube de arcilla. La ficha protagonizó un corto de 26 segundos con explosión, cámara lenta y once tomas; la nube, un monólogo de un minuto con voz.

## Cómo se trabaja sin la interfaz

**Revisar rápido antes de renderizar.** Un render final en Cycles tarda horas. Antes de eso hay un borrador en Workbench o EEVEE que sale en minutos, con sonido, para juzgar la actuación y los tiempos. El render final solo se lanza cuando el borrador está aprobado.

**Rig generado, no pintado.** El cuerpo de la nube son siete esferas; el rig crea un hueso por esfera y calcula los pesos de la piel a partir de su posición y radio, sin pintar nada. La cara tiene un panel de controles (sonrisa, sorpresa, parpadeo, enojo) que mueve boca, ojos y cejas por drivers.

**La voz manda sobre la boca.** En el monólogo, la boca se anima leyendo el volumen de cada frase de la voz. Cuando la voz cambió después del render, no se repitieron horas: se renderizó solo un recuadro alrededor de la boca y se pegó sobre los cuadros originales.

**Sonido también por código.** Efectos sintetizados con numpy y grabaciones libres se colocan en los cuadros exactos de la simulación, y el montaje y los créditos se generan con el mismo pipeline.

## Lo aprendido por el camino

Que el tiempo se va en revisar, no en escribir: el mayor ahorro fue el borrador rápido, no un render más veloz. Que un personaje simple (pocas formas grandes) es más fácil de animar y se ve mejor que uno lleno de detalle. Y que la voz y el guion se aprueban antes del render final; cambiar la voz después obliga a parchear la boca.
