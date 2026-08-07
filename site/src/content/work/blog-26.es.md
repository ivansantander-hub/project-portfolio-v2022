---
slug: blog-26
lang: es
order: 5
title: El historial de versiones que rehice tres veces
project: blog-26
headline: Tres arreglos, tres bugs nuevos. Cuando cada parche produce un problema distinto, el problema no está en el parche.
domain: Proyecto propio
role: Diseño y desarrollo
period: 2026
confidential: false
featured: false
links:
  - label: Ver el blog
    href: https://blog.ivansantander.com
summary:
  - k: El problema
    v: "No podía escribir sin desplegar. Cada nota era un commit, un push y esperar un build."
  - k: La decisión
    v: "Dejar de parchar el diff y simplificar el modelo. Una vista, un trabajo."
  - k: En qué terminó
    v: "CMS propio con editor visual, borradores, historial y analítica sin terceros."
metrics:
  - value: "3"
    label: "intentos hasta que el diff funcionó"
  - value: "0"
    label: "dependencias de analítica"
stack:
  - Astro
  - TypeScript
  - PostgreSQL
  - Cloudflare R2
  - Milkdown
tags:
  - producto propio
  - depuración
  - producto
---

No podía escribir sin desplegar.

Empezó como un blog estático con entradas en Markdown, y el problema práctico apareció rápido: cada nota era un commit, un push y esperar un build. Eso mata el hábito de escribir.

Así que lo convertí en un CMS: base de datos propia, editor visual, borradores, historial de versiones, subida de imágenes y conteo de vistas.

## Las decisiones

**Base de datos en vez de archivos.** Postgres gestionado. La consecuencia es una dependencia de proveedor que me incomoda, y que está anotada como pendiente: un job de respaldo periódico a almacenamiento de objetos. Prefiero tener el riesgo escrito que fingir que no existe.

**Editor visual, no un textarea de Markdown.** Un editor tipo bloque, con imágenes que suben directo al almacenamiento y se optimizan solas. La escritura tiene que ser sin fricción — si no, el proyecto muere de desuso, no de bugs.

**Analítica propia.** Un contador de vistas hecho a mano en vez de un script de terceros. Sin cuentas, sin cookies, sin nada que consentir. Para un blog personal, un entero en una tabla es toda la analítica que necesito.

## El historial que me dio guerra

Esta es la parte que vale la pena contar. El error no fue técnico. Fue de método.

**Primer intento.** Guardaba el estado anterior a cada cambio. El contenido de una versión y su fecha no correspondían — cada entrada del historial mentía sobre cuándo había existido.

**Segundo intento.** Lo cambié para guardar el resultado después de cada guardado. Arregló las fechas y rompió otra cosa: comparar la versión más reciente contra el estado actual no mostraba nada. Eran literalmente lo mismo.

**Tercer intento.** Comparé la última versión contra la anterior. Y apareció un tercer problema, más sutil: el texto agregado se mostraba tachado en rojo, como borrado, en vez de en verde, y cualquier reacomodo invisible del editor —un salto de línea, un espacio— marcaba como modificado un párrafo idéntico.

Tres arreglos, tres problemas nuevos. Esa es la señal de que el problema no está en el parche — está en el modelo.

**La solución fue quitar, no agregar.** Dejé de intentar que una sola vista hiciera dos trabajos. Cada versión se muestra tal cual quedó guardada, sin comparar nada, y las diferencias pasan a un botón aparte. El diff compara el texto ya renderizado, no el Markdown crudo — con eso, el ruido de formato del editor desaparece por construcción.

## Lo que quedó funcionando

Un CMS con editor visual, borradores, historial con restauración, auditoría, imágenes optimizadas al subir, RSS, sitemap, 404 real, integración continua y analítica propia.

La lógica que más me costó —historial, diffs, almacenamiento, tiempo de lectura— está cubierta con tests unitarios. Los de punta a punta siguen pendientes, y está anotado.

## Quince minutos que me habría ahorrado

Debí modelar el historial en papel antes de escribirlo. Los tres intentos fallidos fueron el mismo error: implementar una idea de versionado sin haber definido qué representa exactamente una versión.

Quince minutos dibujando la línea de tiempo me habrían ahorrado tres reescrituras.
