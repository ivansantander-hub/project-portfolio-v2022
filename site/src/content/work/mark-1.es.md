---
slug: mark-1
lang: es
order: 8
title: Piezas reales diseñadas en código
project: Mark 1
headline: "El hermano de Super 8, con FreeCAD: cada pieza sale de un script de Python con sus medidas arriba, y de ahí el modelo 3D, los planos a escala, los archivos para fabricar y los cálculos de cuánto aguanta."
domain: "Proyecto propio · Diseño mecánico y fabricación"
cardLine: "Diseño mecánico con FreeCAD"
role: "Autor único · modelado, planos, cálculo y sitio"
period: "Noviembre 2026 – presente"
featured: false
links:
  - label: Ver las piezas
    href: https://mark-1.pages.dev
  - label: Proyecto hermano · Super 8
    href: https://super-8.pages.dev
summary:
  - k: La pregunta
    v: "¿Se puede diseñar una pieza que se fabrique de verdad, con planos y cálculos, sin abrir la interfaz de un programa CAD?"
  - k: La regla
    v: "El script es la fuente de verdad; el modelo, los planos, el troquel y el video se regeneran con un comando."
  - k: Dónde va
    v: "Dos piezas en dos series: una caja de cartón con troqueles y planos, y una escuadra de PLA probada con elementos finitos."
metrics:
  - value: "2"
    label: "piezas publicadas"
  - value: "3"
    label: "hojas A3 a escala 1:1"
  - value: "4,3"
    label: "factor de seguridad calculado"
media:
  video: /img/casos/mark-1/ensamble.mp4
  poster: /img/casos/mark-1/ensamble.webp
  alt: "La caja de cartón armándose desde su troquel, generada con FreeCAD"
points:
  - "**Una pieza, un script:** del mismo código salen el modelo 3D, los planos a escala y el troquel."
  - "**Cálculo antes de fabricar:** la escuadra de PLA se prueba con elementos finitos; factor de seguridad 4,3."
  - "**Hermano de Super 8:** la misma regla de trabajo, con FreeCAD y piezas que se fabrican de verdad."
gallery:
  - src: /img/casos/mark-1/caja-3d.webp
    alt: "La caja tapa-fondo abierta y cerrada"
    caption: Caja · modelo 3D
  - src: /img/casos/mark-1/troquel.webp
    alt: "Troquel acotado de la base de la caja"
    caption: Troquel a escala 1:1
  - src: /img/casos/mark-1/plano.webp
    alt: "Plano de conjunto con vistas, corte y detalle"
    caption: Plano de conjunto
  - src: /img/casos/mark-1/esfuerzo.webp
    alt: "Esfuerzo de von Mises y deformación de la escuadra de PLA"
    caption: Escuadra · elementos finitos
moreLabel: "Ver el detalle: piezas, planos y cálculos"
stack:
  - Python
  - FreeCAD
  - gmsh · CalculiX
  - matplotlib
  - ffmpeg
tags:
  - cad
  - fabricación
  - procedural
---

Mark 1 hace con FreeCAD lo que Super 8 hace con Blender: cada pieza es un script de Python, y FreeCAD la construye sin abrir la ventana. Del mismo script salen el modelo 3D, los planos acotados, los archivos para fabricar y los números que dicen si la pieza aguanta. Las piezas se agrupan en series y viven en un sitio propio.

## Dos piezas, dos series

**Empaques · caja de cartón.** Una caja tapa-fondo de microcorrugado: el script genera el modelo, los troqueles planos (DXF, SVG y PDF a escala 1:1), tres hojas A3 con cotas, corte y detalle, y una animación donde cada panel gira sobre su línea de doblez hasta cerrar la caja. Con la fórmula de McKee calcula cuánto pesa y cuánto aguanta apilada.

**Soportes impresos · escuadra de PLA.** Una escuadra de repisa para imprimir en 3D, mallada con gmsh y resuelta con CalculiX con 5 kg encima: mapa de esfuerzos, flecha y factor de seguridad, con una cuenta a mano que confirma el orden de magnitud.

## Lo aprendido por el camino

Que un número de elementos finitos se revisa antes de creerlo: el esfuerzo máximo cayó en una esquina en punta y cambiaba con cada malla, así que se reporta el valor más alto y se explica por qué. Que un cambio de nombres en el código debe dar los mismos archivos byte por byte. Y que las herramientas con interfaz se pueden usar sin que se vea una sola ventana.
