---
slug: mini-astro
lang: es
order: 4
title: Un generador de sitios estáticos propio
project: mini-astro
headline: Un generador de sitios estáticos con una dependencia y sin JavaScript en el cliente. No compite con Astro; lo hice para aprender y este portafolio corre sobre él.
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
    v: "Sabía usar un generador de sitios, pero no sabía bien cómo funciona uno por dentro."
  - k: La decisión
    v: "Escribir uno, porque un SSG que compone HTML es un problema pequeño y el costo de mantenerlo es bajo."
  - k: En qué terminó
    v: "Está publicado con licencia MIT y lo uso para construir este portafolio."
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

Un generador de sitios estáticos. Los componentes HTML se componen con `<mini-include src="organisms/Hero" />`, y tiene enrutamiento por archivos, plantillas con slots, estructura de Atomic Design y un servidor de desarrollo con recarga en vivo. Usa una sola dependencia de producción y no manda runtime al navegador.

Este portafolio está hecho con él.

## ¿Por qué no usar Astro?

Astro es mejor, y por mucho: tiene islas, integraciones, optimización de imágenes, un ecosistema y gente trabajando en él a tiempo completo. mini-astro está en alfa y lo mantengo yo solo. Si solo se tratara de elegir la mejor herramienta disponible, lo razonable sería usar Astro.

Así que tenía que tener claro por qué valía la pena hacerlo igual.

## Por qué lo escribí

**Para entender cómo funciona uno por dentro.** No pretendía reemplazar nada. Quería ver de cerca cosas como la resolución de componentes, el orden de composición, la sustitución de plantillas, la invalidación en el watcher o la sincronización de estáticos. Son decisiones que no ves hasta que te toca tomarlas.

**Porque el costo era acotado.** Un SSG que compone HTML es un problema pequeño y bien delimitado, y mantenerlo me cuesta poco. Con un ORM o un framework de UI propio la cuenta sería otra, porque ahí el costo no está acotado, y por eso no lo he hecho.

**Porque me deja construir lo que necesito sin rodeos.** Este portafolio necesita colecciones de contenido en Markdown, rutas bilingües y un pipeline de imágenes propio. Con un framework de terceros eso significa plugins y adaptarse a decisiones de otros; con el mío son funciones.

## Cómo está planteado

**Atomic Design como estructura de archivos.** Las carpetas `atoms/`, `molecules/`, `organisms/`, `templates/` y `pages/` son parte de cómo funciona la herramienta, así que la organización viene impuesta y no depende de una convención.

**Valores por defecto seguros.** Si los activas al crear el proyecto, se generan cabeceras de política de contenido, banner de cookies y páginas de política. Son cosas que se suelen dejar para después, y tenerlas por defecto ayuda a que no se olviden.

**Sin JavaScript en el cliente salvo el que escribas tú.** No hay hidratación, runtime ni bundle: sale HTML, CSS y los scripts que hayas puesto a mano. Esta restricción simplifica mucho el resto.

**Una sola dependencia.** El watcher de archivos, y solo en desarrollo. Menos dependencias también significa menos vulnerabilidades que parchar.

## Publicación y uso

Tiene licencia MIT y se instala desde GitHub, con una inicialización interactiva y comandos para generar rutas y componentes.

Lo uso para este portafolio, y la mayoría de sus límites los voy encontrando así, al construirlo, más que por issues.

## Qué haría distinto y qué quiero evitar

Debí escribir los tests primero. En un compilador son fáciles de hacer (entra texto, sale texto) y aun así lo fui probando a mano en el navegador.

Y quiero evitar que crezca de más. Con una herramienta propia es tentador ir agregándole todo lo que pide cada proyecto, pero si mini-astro termina pareciéndose a Astro, deja de tener sentido haberlo escrito.
