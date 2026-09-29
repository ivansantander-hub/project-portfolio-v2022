---
slug: blog-26
lang: es
order: 5
title: El historial de versiones que rehice tres veces
project: blog-26
headline: Convertí mi blog estático en un CMS propio. La parte difícil fue el historial de versiones, que tuve que rehacer tres veces.
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
    v: "Dejar de parchar el diff y simplificar: una vista para ver cada versión y otra para comparar."
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

El blog empezó siendo estático, con entradas en Markdown. El problema apareció rápido: para publicar una nota tenía que hacer un commit, un push y esperar un build, y así se me quitaban las ganas de escribir.

Así que lo convertí en un CMS: base de datos propia, editor visual, borradores, historial de versiones, subida de imágenes y conteo de vistas.

## Decisiones principales

**Base de datos en vez de archivos.** Uso Postgres gestionado. Eso me deja atado a un proveedor, y no me termina de gustar. Tengo anotado como pendiente un job de respaldo periódico a almacenamiento de objetos.

**Editor visual en vez de un textarea de Markdown.** Un editor por bloques, con imágenes que se suben directo al almacenamiento y se optimizan solas. Quería que escribir fuera cómodo, porque si no, dejaría de usarlo.

**Analítica propia.** Un contador de vistas hecho a mano en lugar de un script de terceros: sin cuentas, sin cookies, sin banner de consentimiento. Para un blog personal me basta con un entero en una tabla.

## El historial de versiones

Esta parte me costó más de lo esperado, y sobre todo por cómo la abordé.

**Primer intento.** Guardaba el estado anterior a cada cambio. El problema era que el contenido de cada versión no correspondía con su fecha, así que el historial mostraba fechas equivocadas.

**Segundo intento.** Pasé a guardar el resultado después de cada guardado. Las fechas quedaron bien, pero comparar la versión más reciente con el estado actual no mostraba nada, porque eran exactamente lo mismo.

**Tercer intento.** Comparé la última versión con la anterior. Apareció otro problema: el texto agregado salía tachado en rojo, como si se hubiera borrado, en vez de en verde. Además, cualquier cambio invisible del editor (un salto de línea, un espacio) marcaba como modificado un párrafo que era idéntico.

Después de tres arreglos que traían tres problemas distintos, me di cuenta de que el fallo estaba en cómo había planteado el historial, no en cada parche.

**Lo que hice fue simplificar.** Estaba pidiéndole a una sola vista que hiciera dos cosas. Ahora cada versión se muestra tal como se guardó, sin comparar nada, y las diferencias están en un botón aparte. El diff compara el texto ya renderizado, no el Markdown crudo, y así desaparece el ruido de formato que mete el editor.

## Estado actual

Un CMS con editor visual, borradores, historial con restauración, auditoría, imágenes optimizadas al subir, RSS, sitemap, página 404, integración continua y analítica propia.

La lógica que más trabajo me dio (historial, diffs, almacenamiento, tiempo de lectura) tiene tests unitarios. Los tests de punta a punta están pendientes y anotados.

## Qué haría distinto

Dibujaría el historial en papel antes de programarlo. Los tres intentos fallaron por lo mismo: empecé a implementar sin haber definido qué representa exactamente una versión. Con unos quince minutos pensando la línea de tiempo me habría ahorrado las tres reescrituras.
