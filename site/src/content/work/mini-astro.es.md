---
slug: mini-astro
lang: es
order: 4
title: Un generador de sitios estáticos propio
project: mini-astro
headline: "Entender cómo funciona por dentro un generador de sitios estáticos construyendo uno: una sola dependencia y sin JavaScript en el cliente. No compite con Astro; este portafolio corre sobre él."
domain: Proyecto propio · Código abierto (MIT)
role: Autor único · diseño, desarrollo y mantenimiento
period: 2026 – presente
confidential: false
featured: false
links:
  - label: Código en GitHub
    href: https://github.com/ivansantander-hub/mini-astro
summary:
  - k: El problema
    v: "Sabía usar un generador de sitios, no cómo funciona uno por dentro."
  - k: La decisión
    v: "Escribir uno: componer HTML es un problema pequeño y barato de mantener."
  - k: En qué terminó
    v: "Publicado con licencia MIT; con él se construye este portafolio."
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

mini-astro compone componentes HTML con `<mini-include src="organisms/Hero" />` y ofrece enrutamiento por archivos, plantillas con slots, estructura de Atomic Design y un servidor de desarrollo con recarga en vivo. No envía runtime al navegador.

## Por qué no usar Astro

Astro es mejor, y por mucho: islas, integraciones, optimización de imágenes, un ecosistema y un equipo a tiempo completo. mini-astro está en alfa y lo mantengo yo solo. Si la pregunta fuera cuál es la mejor herramienta disponible, la respuesta sería Astro. Escribir uno propio se justifica por otras razones:

- **Entender el mecanismo.** Resolución de componentes, orden de composición, sustitución de plantillas, invalidación en el watcher, sincronización de estáticos: son decisiones que no se ven hasta que toca tomarlas. El objetivo no es reemplazar nada.
- **Costo acotado.** Un SSG que compone HTML es un problema pequeño y bien delimitado, y mantenerlo cuesta poco. Un ORM o un framework de UI propios no cumplen esa condición, y por eso no los he escrito.
- **Necesidades concretas sin rodeos.** Este portafolio necesita colecciones de contenido en Markdown, rutas bilingües y un pipeline de imágenes propio. Con un framework de terceros eso significa plugins y adaptarse a decisiones ajenas; aquí son funciones.

## Decisiones de diseño

**Atomic Design como estructura de archivos.** Las carpetas `atoms/`, `molecules/`, `organisms/`, `templates/` y `pages/` forman parte del funcionamiento de la herramienta. La organización viene impuesta en lugar de depender de una convención; a cambio, el proyecto tiene que encajar en esa estructura.

**Valores seguros por defecto.** Si se activan al crear el proyecto, se generan cabeceras de política de contenido, banner de cookies y páginas de política. Son piezas que se suelen dejar para después; tenerlas desde el inicio evita que se olviden.

**Sin JavaScript en el cliente salvo el que escribas tú.** Sin hidratación, runtime ni bundle: sale HTML, CSS y los scripts añadidos a mano. Se renuncia a la interactividad por islas que ofrece Astro, y a cambio el resto del sistema se simplifica mucho.

**Una sola dependencia.** El watcher de archivos, y solo en desarrollo. Menos dependencias también significa menos vulnerabilidades que parchar.

## Resultado

Publicado con licencia MIT e instalable desde GitHub, con una inicialización interactiva y comandos para generar rutas y componentes. Este portafolio está construido con él, y la mayoría de sus límites aparecen así, al usarlo, más que por issues.

## Qué haría distinto

Escribir los tests primero: en un compilador son fáciles de hacer (entra texto, sale texto), y aun así lo probé a mano en el navegador. El riesgo a vigilar es que crezca de más; con una herramienta propia es tentador añadir todo lo que pide cada proyecto, y si mini-astro acaba pareciéndose a Astro, deja de tener sentido haberlo escrito.
