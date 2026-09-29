---
slug: blog-26
lang: es
order: 14
title: El historial de versiones que rehice tres veces
project: blog-26
headline: Publicar en un blog estático exigía commit, push y build. La solución fue un CMS propio; su parte difícil, el historial de versiones, necesitó tres intentos.
domain: Proyecto propio
role: Autor único · diseño y desarrollo
period: 2026
featured: false
links:
  - label: Ver el blog
    href: https://blog.ivansantander.com
summary:
  - k: El problema
    v: "Cada nota exigía commit, push y esperar un build."
  - k: La decisión
    v: "Separar ver una versión de compararlas, en vez de seguir parchando el diff."
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

## El problema

El blog era estático, con entradas en Markdown. Publicar una nota requería commit, push y esperar un build, y esa fricción bastaba para no escribir. El objetivo: un CMS con base de datos, editor visual, borradores, historial de versiones, subida de imágenes y conteo de vistas.

## Decisiones

**Base de datos en vez de archivos.** Postgres gestionado. Trade-off: dependencia del proveedor. Mitigación pendiente: un job de respaldo periódico a almacenamiento de objetos.

**Editor por bloques en vez de un textarea de Markdown.** Las imágenes se suben directo al almacenamiento y se optimizan solas. Trade-off: el editor introduce cambios invisibles de formato, que después afectaron al diff. Se eligió igual porque, si escribir no es cómodo, la herramienta deja de usarse.

**Analítica propia.** Un contador de vistas hecho a mano en lugar de un script de terceros: sin cuentas, sin cookies, sin banner de consentimiento. Para un blog personal, un entero en una tabla es suficiente.

## El historial de versiones

Tres intentos, cada uno con un bug distinto:

- **Guardar el estado anterior a cada cambio** → el historial mostraba fechas equivocadas → el contenido de cada versión no correspondía con su fecha.
- **Guardar el resultado después de cada guardado** → comparar la última versión con el estado actual no mostraba nada → eran exactamente lo mismo.
- **Comparar la última versión con la anterior** → el texto agregado salía tachado en rojo, como borrado, y párrafos idénticos aparecían como modificados → en el segundo caso, el diff operaba sobre Markdown crudo, con el ruido invisible del editor (saltos de línea, espacios).

La causa común no estaba en cada parche sino en el planteamiento: una sola vista hacía dos trabajos.

**Solución.** Cada versión se muestra tal como se guardó, sin comparar nada. Las diferencias van en un botón aparte, y el diff compara el texto ya renderizado, no el Markdown crudo, lo que elimina el ruido de formato del editor.

## Resultado

- Editor visual, borradores, historial con restauración y auditoría.
- Imágenes optimizadas al subir.
- RSS, sitemap, página 404 e integración continua.
- Analítica propia, sin dependencias de terceros.

La lógica más delicada (historial, diffs, almacenamiento, tiempo de lectura) tiene tests unitarios. Los tests de punta a punta están pendientes.

## Qué haría distinto

Definir qué representa exactamente una versión, en papel, antes de implementar. Los tres intentos fallaron por esa misma omisión; unos quince minutos dibujando la línea de tiempo habrían evitado las tres reescrituras.
