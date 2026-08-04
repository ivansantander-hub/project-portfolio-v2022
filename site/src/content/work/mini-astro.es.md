---
slug: mini-astro
lang: es
order: 4
title: Por qué escribí mi propio generador de sitios
project: mini-astro
headline: Una dependencia, cero JavaScript en el cliente. No es mejor que Astro y no pretende serlo. Este portafolio corre sobre él.
domain: Proyecto propio · Código abierto (MIT)
role: Autor
period: 2026 – presente
confidential: false
featured: false
links:
  - label: Código en GitHub
    href: https://github.com/ivansantander-hub/mini-astro
summary:
  - k: El problema
    v: "Sé usar un generador de sitios. No sabía qué hace uno por dentro."
  - k: La decisión
    v: "Escribirlo porque el costo estaba acotado. Un SSG que compone HTML es un problema pequeño y cerrado."
  - k: En qué terminó
    v: "Publicado con licencia MIT. Y con el mejor test posible: lo uso para algo que me importa."
metrics:
  - value: "1"
    label: "dependencia en producción"
  - value: "0"
    label: "JavaScript en el cliente"
stack:
  - Node.js
  - JavaScript
tags:
  - producto propio
  - herramientas
  - código abierto
---

## Qué es

Un generador de sitios estáticos.

Componentes HTML que se componen con `<mini-include src="organisms/Hero" />`, enrutamiento por archivos, plantillas con slots, estructura de Atomic Design y servidor de desarrollo con recarga en vivo.

Una sola dependencia de producción. Cero runtime en el navegador.

Este portafolio se construye con él.

## La pregunta incómoda primero

¿Es mejor que Astro?

No.

Astro tiene islas, integraciones, optimización de imágenes, un ecosistema y gente a tiempo completo. mini-astro está en alfa y lo mantengo yo.

Si el criterio fuera "elegir la mejor herramienta disponible", la respuesta correcta sería usar Astro y cerrar el tema.

Así que la decisión merece una justificación real. No una excusa.

## Por qué lo escribí igual

**Para entender la categoría, no para reemplazarla.**

Hay diferencia entre saber usar un generador de sitios y saber qué hace uno por dentro.

Resolución de componentes. Orden de composición. Sustitución de plantillas. Invalidación en el watcher. Sincronización de estáticos.

Esas decisiones son invisibles hasta que las tomas tú.

**Porque el costo estaba acotado.**

Un SSG que compone HTML es un problema pequeño y bien delimitado. Sé cuánto pesa mantenerlo. Es poco.

Escribir mi propio ORM o mi propio framework de UI sería la decisión opuesta con la misma lógica aparente. No lo he hecho, porque ahí el costo no está acotado.

**Porque tener el compilador cambia lo que puedo construir.**

Este portafolio necesita colecciones de contenido en Markdown, rutas bilingües y un pipeline de imágenes propio.

Con un framework ajeno, eso son plugins y adaptarse a decisiones que no tomé.

Con el mío, son funciones.

## Las decisiones

**Atomic Design como estructura de archivos, no como convención.**

Las carpetas `atoms/`, `molecules/`, `organisms/`, `templates/` y `pages/` son parte del contrato de la herramienta. Impone la disciplina en vez de sugerirla.

**Valores por defecto seguros.**

Cabeceras de política de contenido, banner de cookies y páginas de política se generan si las activas al crear el proyecto.

La razón es simple: son cosas que todo el mundo pospone. Un valor por defecto se salta la discusión.

**Cero JavaScript en el cliente salvo el que escribas tú.**

No hay hidratación. No hay runtime. No hay bundle.

Lo que sale es HTML, CSS y los scripts que hayas puesto a mano. Es la restricción que hace simple todo lo demás.

**Una dependencia.**

Solo el watcher de archivos, y solo en desarrollo.

Cada dependencia que no está es una vulnerabilidad que no tengo que parchar.

## En qué terminó

Publicado con licencia MIT. Se instala desde GitHub, con inicialización interactiva y comandos para generar rutas y componentes.

Y tiene el mejor test posible para una herramienta:

> la uso para algo que me importa.

Los límites de mini-astro los descubro construyendo mi propio portafolio. No leyendo issues.

## Qué haría distinto

Los tests debieron ir primero.

Un compilador es exactamente el tipo de software donde los tests son baratos. Entrada de texto, salida de texto. Y aun así lo construí a mano, verificando en el navegador.

También hay algo que no debería pasar: que crezca.

La tentación con una herramienta propia es agregarle todo lo que el proyecto de turno necesita. Si mini-astro empieza a parecerse a Astro, la decisión de haberlo escrito deja de tener sentido.
