---
slug: mini-astro
lang: es
order: 14
title: Un generador de sitios estáticos propio
project: mini-astro
headline: "Entender cómo funciona por dentro un generador de sitios estáticos construyendo uno: una sola dependencia, que solo usa el servidor de desarrollo, y ningún runtime en el cliente. No compite con Astro; este portafolio corre sobre él."
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
    v: "Código abierto con licencia MIT en GitHub; con él se construye este portafolio."
metrics:
  - value: "1"
    label: "dependencia (solo para `dev`)"
  - value: "0"
    label: "runtime en el cliente"
  - value: "55"
    label: "tests con `node --test`"
  - value: "~2.300"
    label: "líneas de JavaScript"
stack:
  - Node.js
  - JavaScript
tags:
  - producto propio
  - herramientas
  - código abierto
---

mini-astro compone componentes HTML con `<mini-include src="organisms/Hero" />` y ofrece enrutamiento por archivos, plantillas con slots, estructura de Atomic Design, datos globales en JSON o JavaScript y un servidor de desarrollo con recarga en vivo. No envía runtime al navegador: sale HTML, CSS y los scripts que se añadan a mano. Son unas 2.300 líneas de JavaScript para Node 18 o superior, de las que unas 840 son el andamiaje que genera un proyecto nuevo.

## Por qué no usar Astro

Astro es mejor, y por mucho: islas, integraciones, optimización de imágenes, un ecosistema y un equipo a tiempo completo. mini-astro está en alfa (versión 0.2.0) y lo mantengo yo solo. Si la pregunta fuera cuál es la mejor herramienta disponible, la respuesta sería Astro. Escribir uno propio se justifica por otras razones:

- **Entender el mecanismo.** Resolución de componentes, orden de composición, sustitución de plantillas, invalidación en el watcher, sincronización de estáticos: son decisiones que no se ven hasta que toca tomarlas. El objetivo no es reemplazar nada.
- **Costo acotado.** Un SSG que compone HTML es un problema pequeño y bien delimitado, y mantenerlo cuesta poco. Un ORM o un framework de UI propios no cumplen esa condición, y por eso no los he escrito.
- **Necesidades concretas sin rodeos.** Este portafolio necesita colecciones de contenido en Markdown, rutas bilingües y un pipeline de imágenes propio. Con un framework de terceros eso significa plugins y adaptarse a decisiones ajenas; aquí son scripts que corren antes y después de `mini-astro build`.

## Cómo funciona por dentro

**Una sola pasada de render.** Una única expresión regular reconoce `{{{ var }}}` (HTML sin escapar), `{{ var }}` (escapado) y `<mini-include … />`, y el resultado nunca se vuelve a recorrer: si un dato contiene `{{ algo }}`, se imprime tal cual en lugar de evaluarse. Los atributos pueden llevar `>` dentro de comillas y guiones (`data-id`, `aria-label`).

**Resolución de includes.** `./X` y `../atoms/X` se resuelven respecto al archivo que incluye; `atoms/X`, respecto a `src/`; un nombre suelto se busca en `atoms/`, `molecules/` y `organisms/`, en ese orden. Si no aparece, el build falla y el error lista las rutas probadas. Un include circular se corta mostrando la cadena completa, y el anidamiento tiene un máximo de 20 niveles.

**Props y contexto.** Los atributos de `<mini-include>` son las props del componente y se suman al contexto de quien lo incluye; sus valores pueden referenciarlo (`href="{{ base }}/x"`). El contexto de una página se arma con una precedencia fija: frontmatter de la plantilla < frontmatter de la página < `site`. `site` sale de `src/data/`: cada `*.json` o `*.js` (un objeto o una función, también asíncrona) se convierte en `site.<nombre>`.

**Plantillas y slots.** La página elige plantilla con `layout` en su frontmatter (`Base` por defecto), y su contenido entra en el `<slot />` o `<!-- @slot -->` de la plantilla. Una plantilla sin slot, o un `layout` que no existe, es un error de build, no una página vacía.

**Rutas limpias.** `pages/about.html` sale como `about/index.html` y `pages/blog/index.html` como `blog/index.html`. Si `x.html` y `x/index.html` producirían la misma URL, el build se detiene.

**Salida sin restos.** Cada build guarda en `.mini-astro/manifest.json` la lista de archivos que escribió. El siguiente borra los que ya no genera (páginas renombradas, estáticos eliminados) y nunca toca archivos que mini-astro no haya escrito.

**Servidor de desarrollo.** Es `node:http`, sin framework. El watcher vigila `src/`, `public/`, los datos y el archivo de configuración; los cambios se agrupan 50 ms y los rebuilds se serializan para que dos guardados seguidos no se pisen. La recarga va por Server-Sent Events con un script servido como archivo propio, compatible con una CSP `script-src 'self'`. Si el build falla, el servidor sigue arriba: las páginas devuelven un 500 con el error, que se recarga solo al corregirlo, y los estáticos se siguen sirviendo. Las rutas se decodifican y no pueden salir de `dist/`.

**Inicialización.** `mini-astro init` pregunta nombre, banner de cookies, páginas de política, CSP, puerto (2323 por defecto) y gestor de paquetes (pnpm, yarn o npm). Todas las preguntas comparten un único lector de líneas, así que también se puede automatizar con una tubería: `printf 'mysite\nn\nn\nn\n4321\nnpm\n' | mini-astro init`. Además hay comandos para crear rutas, componentes y plantillas, y autocompletado para bash y zsh.

## Decisiones de diseño

**Atomic Design como estructura de archivos.** Las carpetas `atoms/`, `molecules/`, `organisms/`, `templates/` y `pages/` forman parte del funcionamiento de la herramienta: un include sin ruta se busca en ellas. *Trade-off:* la organización viene impuesta en lugar de depender de una convención, y a cambio el proyecto tiene que encajar en esa estructura.

**Valores seguros por defecto.** El build inyecta una meta de Content-Security-Policy en cada página que no declare la suya; por defecto es estricta (`default-src 'self'`, `object-src 'none'`) y la configuración admite `true`, una política propia o `false`. `{{ var }}` escapa el HTML y hay que pedir explícitamente `{{{ var }}}` para no hacerlo. Si se activan al crear el proyecto, se generan banner de cookies y páginas de política. *Trade-off:* una CSP estricta rompe fuentes o scripts externos hasta que se declaran, y por eso el proyecto inicial ya la amplía para Google Fonts en la configuración.

**Sin JavaScript en el cliente salvo el que escribas tú.** Sin hidratación, runtime ni bundle. *Trade-off:* se renuncia a la interactividad por islas que ofrece Astro, y a cambio el resto del sistema se simplifica mucho.

**Errores ruidosos en lugar de silencios.** Un componente que no existe, un JSON inválido o una configuración con valores imposibles (un `outDir` que coincide con la raíz o se solapa con `src/`) detienen el build con el motivo. *Trade-off:* un sitio a medio hacer no compila hasta que se corrige, pero no se publican páginas rotas sin aviso.

**Una sola dependencia de runtime.** Es chokidar, y la usa únicamente el servidor de desarrollo: se carga con `import()` dinámico dentro de `dev` y, si no está disponible, el servidor funciona igual sin recarga automática. El build y el sitio generado no tienen ninguna dependencia. *Trade-off:* sigue declarada en `dependencies`, así que se instala con el paquete aunque el build no la use.

## Resultado

Código abierto con licencia MIT, instalable desde GitHub con `npx github:ivansantander-hub/mini-astro init` (no está en el registro de npm). Este portafolio está construido con él: su `package.json` lo instala desde GitHub y su build es `mini-astro build` rodeado de scripts propios de contenido e imágenes. La mayoría de sus límites aparecen así, al usarlo, más que por issues.

## Qué haría distinto

Escribir los tests primero. En un compilador son fáciles de hacer (entra texto, sale texto), y aun así durante meses lo probé a mano en el navegador. Los tests llegaron tarde, con la versión 0.2.0: hoy son 55, se ejecutan con `node --test` sin dependencias añadidas y cubren build, CLI, configuración, servidor de desarrollo y frontmatter. Esa misma versión corrigió fallos que una suite temprana habría detectado: errores que se ignoraban en silencio, subcarpetas de `pages/` que se generaban como `x/index/index.html`, o un `init` que, con la entrada por tubería, terminaba con éxito sin crear nada.

El otro riesgo a vigilar es que crezca de más. Con una herramienta propia es tentador añadir todo lo que pide cada proyecto, y si mini-astro acaba pareciéndose a Astro, deja de tener sentido haberlo escrito.
