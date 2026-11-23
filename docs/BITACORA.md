# Bitácora de decisiones — v3

> Registro de qué se decidió y por qué, a medida que se ejecuta `PLAN-V3.md`.
> El plan describe la intención; esto describe lo que realmente pasó, incluidas
> las desviaciones. Fecha de la primera entrada: 2026-08-06.

---

## Estado real vs. plan (léase antes de confiar en PLAN-V3.md o DESIGN-DIRECTION.md)

- **El grafo del hero (caos → orden) se implementó y se revirtió.** Commits
  `250c621` (feat: implementar el hero visual) → `cbee5be` (refactor: quitarlo),
  el mismo ciclo de trabajo, 2026-08-05. Se fueron 400 líneas de
  `hero-visual.js`. La pieza central del concepto "Complejidad → Claridad" que
  describe `PLAN-V3.md` §3.2 **no existe hoy**. El hero es texto puro; todo el
  argumento lo cargan el `statement` y el `thesis` (ver más abajo).
- **El sistema de color de `DESIGN-DIRECTION.md` §4 quedó obsoleto.** Ese
  documento describe tres tokens de estado (`--signal`/`--live`/`--orphan`)
  pensados para colorear nodos del grafo. El grafo no está; el sistema de color
  que corre hoy en `quarks/tokens.css` es de 4 paletas nombradas
  (`ultramarine`/`chartreuse`/`vermilion`/`copper`, ver `site.config.mjs`) sobre
  una UI intencionalmente monocroma — el color lo pone el shader del fondo, no
  la UI. No se actualizó `DESIGN-DIRECTION.md` para no reescribir un documento
  de dirección de arte a mitad de camino; que quede claro acá cuál manda.
- **Sin momento 3D ni easter egg en v3**, pese a que el plan los mantenía
  (Fase 3). Los dos siguen vivos solo en `/v1/` (congelado). No se han
  reconstruido para v3 todavía.

---

## 2026-08-06 — Hero y thesis

**Decisión:** el `statement` del hero pasó de una frase de *builder* genérica
("Construyo lo que dura") a nombrar directamente el diferenciador real
("Simplifico lo que se volvió complejo"). El `lead` pasó de "disfruto convertir
ideas en herramientas útiles" a la trayectoria Dev → Tech Lead → TPO en año y
medio, un dato público (LinkedIn/CV) y verificable.

**Por qué:** un hiring manager decide en 6-8 segundos si sigue leyendo. El
hero original vendía "builder genérico" — el mismo posicionamiento de
cualquier portafolio técnico — mientras la idea realmente diferenciada
("Iván reduce complejidad en sistemas complejos", `PLAN-V3.md` §3.1) estaba
enterrada en la sección `thesis`, dos scrolls más abajo. Se movió el
diferenciador al primer lugar que alguien realmente lee.

**Restricción respetada:** el NDA (`PLAN-V3.md` §9.1) prohíbe publicar
conteos de arquitectura de trabajo de empleador. El nuevo copy usa la
trayectoria (permitida explícitamente, es pública) y nunca cifras de sistemas
de LearUp.

**Cómo aplicar en el futuro:** si el hero vuelve a tocarse, mantener el eje
"identidad → prueba verificable", no volver a una frase aspiracional sin
respaldo.

---

## 2026-08-06 — Sección "Casos"

**Decisiones:**
1. La home ahora filtra a `featured: true` (3 casos) en vez de mostrar los 5,
   con un link "Ver todos los casos" hacia `/trabajo/`.
2. La etiqueta de estado pasó de "bajo NDA"/"abierto" a "bajo NDA"/"proyecto
   propio".
3. Se corrigió que "Ver caso →" saliera siempre en español, incluso en las
   tarjetas de la home en inglés.

**Por qué (1):** el campo `featured` ya existía en el frontmatter de las 5
fichas de `src/content/work/` pero nunca se leía — la home y el índice
completo renderizaban exactamente la misma lista. "Menos es más en el punto
de entrada" es el patrón que se repite en la investigación de portafolios
2026; la home ahora muestra solo los 3 mejores casos.

**Por qué (2):** "abierto" implicaba código visible. De los proyectos propios
solo `mini-astro` enlaza a un repo — SGC y blog-26 enlazan al producto/sitio
en vivo, no a código. La etiqueta original prometía algo que no todos los
casos cumplen.

**Consecuencia de (1):** el copy de `work_intro` ("Cinco piezas...") se
reescribió a "Tres primero..." para no mentir sobre lo que la home
efectivamente muestra.

---

## 2026-08-06/07 — Bugs de CSS (no eran de contenido)

Tres bugs visuales reportados por Iván, verificados y corregidos en
`public/css/base.css`:

1. **Nombres de proyecto cortados a media palabra** ("Consolidaci-ón"). Causa:
   regla global `p, li { overflow-wrap: break-word }` sobre una columna de
   metadata de 80px. Arreglo: columna a `7rem` + `hyphens: auto` en
   `.work-card__project` en vez de heredar el corte crudo.
2. **Cursor duplicado** (círculo suelto, desconectado del puntero real).
   Causa: `motion.js` mueve un anillo custom (`.cursor`) con retraso, pero
   ningún CSS de v3 apagaba el cursor nativo del sistema — v1 sí lo hacía
   (`styles.css` tenía `* { cursor: none !important }`), esa regla nunca se
   portó. Arreglo: `* { cursor: none }` dentro del layer `motion` (el último
   en el orden de cascada — gana sobre los `cursor: pointer` de botones sin
   necesitar `!important`, que el proyecto prohíbe por regla dura de
   `PLAN-V3.md` §5.1), condicionado a `(pointer: fine) and
   (prefers-reduced-motion: no-preference)` — el mismo guard que usa
   `motion.js` para activar el anillo. Si el anillo nunca se activa (usuario
   con movimiento reducido), el cursor nativo se queda visible en vez de
   desaparecer sin reemplazo.
3. **Título y párrafo de contacto superpuestos** ("¿Trabajamos juntos?" con la
   J de "Juntos" montada sobre la B de "Busco"). Causa: `.contact
   .section-title` solo definía `max-width`, sin `margin-top` en el
   `.prose` siguiente — el reset global pone `margin: 0` en todo. Arreglo:
   `.contact .prose { margin-top: var(--space-lg) }`, mismo valor que ya
   usaban `.thesis__body` y `.contact__location`.

---

## 2026-08-07 — Contacto: CTA real

**Hallazgo:** la sección de contacto —el final de todo el embudo de
conversión del sitio— no tenía ningún método de contacto accionable. El CTA
del hero ("Escríbeme") solo hacía scroll hasta `#contact`, y ahí el texto
terminaba en "hablemos" sin nada que clickear.

**Decisión (de Iván, no mía):** LinkedIn como CTA primario + GitHub como
secundario. **Explícitamente no email** — riesgo de phishing/spam en una URL
pública e indexada. Se le preguntó porque no era una decisión de copy que
pudiera tomar sola (expone información de contacto real, es cuasi-irreversible
una vez publicada).

**Implementación:** dos botones (`.btn btn--primary` / `.btn`, mismo patrón
visual del hero) en `.contact__actions`. Las URLs de LinkedIn/GitHub se
extrajeron a constantes (`LINKEDIN_URL`, `GITHUB_URL`) en `build-content.mjs`
y se reusan también en `PERSONA.sameAs` (antes hardcodeadas por separado ahí
y en `Doc.html`) — una sola fuente de verdad, aunque `Doc.html` (el footer)
todavía las tiene hardcodeadas por separado porque ese archivo no pasa por
`build-content.mjs`.

---

## 2026-08-07 — "Antes de esto": lista en vez de párrafo

Los 4 proyectos tempranos pasaron de un párrafo corrido a una lista con
viñetas (`.prose ul`, sin CSS nuevo — ya existía el estilo). Más escaneable
en el tiempo real que alguien le dedica a esta sección. El copy en sí ya
estaba bien resuelto (selección breve, no diluye el foco, cierra con la
misma idea de criterio que corre por todo el sitio) — no hacía falta
reescribirlo, solo reformatearlo.

---

## 2026-08-07 — Nav del header: faltaba About y Work

**Hallazgo:** `/sobre-mi/` (y `/en/about/`) no estaban enlazadas desde
**ningún lugar de la UI** — ni header, ni footer, ni home. Solo eran
alcanzables por URL directa o por `sitemap.xml`. El header solo tenía el
logo + toggle de idioma + toggle de tema.

**Arreglo:** se agregaron dos links al nav (`Trabajo`/`Sobre mí`,
`Work`/`About` en inglés), calculados por página en `build-content.mjs`
(`navWorkHref`/`navAboutHref`, mismo patrón que ya existía para
`langToggleHref`) e interpolados en `Doc.html`. Verificado en 375px de ancho
— cabe en una sola fila sin romper.

---

## 2026-08-07 — Cloudflare servía CSS/JS de hasta 4 horas atrás

**Síntoma:** local (`pnpm dev`) se veía bien, producción (`ivansantander.com`)
mostraba el nav sin estilo (texto plano, sin mayúsculas ni mono) después de
un deploy con cambios de CSS.

**Causa:** Railway pone Cloudflare delante del dominio. `serve` (el server
estático de `pnpm start`) no manda `Cache-Control` propio, así que Cloudflare
aplica su default para extensiones "estáticas" — `max-age=14400` (4h) — a
`/css/*` y `/js/*`. El HTML no se cachea (`cf-cache-status: DYNAMIC`), pero
CSS/JS sí, y como los nombres de archivo no llevan hash de contenido, la
misma URL sigue sirviendo bytes viejos hasta que el caché expira solo.
Confirmado con `curl -I` contra prod: `cf-cache-status: HIT` +
`grep -c "site-header__link" base.css` → 0 en el CSS servido.

**Arreglo:** `site/public/serve.json` (mini-astro copia `public/` completo a
`dist/`, donde `serve` lo autodetecta) fijando `Cache-Control: max-age=60`
para CSS/JS. Ojo con el schema de `serve.json`: `"etag"` como propiedad de
nivel superior es inválido (lo controla el CLI, no el archivo) — con
`--debug` tira `must NOT have additional properties`; sin `--debug` falla en
silencio y el header simplemente no se aplica. Verificado contra el comando
real de producción (`pnpm start`), no contra `pnpm serve` (son invocaciones
distintas del mismo paquete).

**No resuelto por este fix:** el caché que Cloudflare ya tenía en producción
al momento de este cambio no se limpia solo — hace falta un deploy nuevo +
esperar el TTL viejo, o purgar el caché a mano desde el dashboard.

---

## 2026-08-07 — Cursor imperceptible en modo claro

**Síntoma:** el punto/anillo del cursor (agregado el mismo día para
reemplazar el cursor nativo del sistema) se veía bien en oscuro pero era
"completamente imperceptible" en claro.

**Causa:** el punto usaba `background: var(--text)` con
`mix-blend-mode: difference`. En oscuro `--text` es casi blanco → invierte
fuerte. En claro `--text` es casi negro, y `difference(negro, X) = X` — un
no-op matemático. El cursor literalmente devolvía el color de fondo sin
tocarlo.

**Arreglo:** se quitó `mix-blend-mode` del cursor por completo. Ahora usa
color sólido de `--text`/`--accent` (sin blend), el mismo par que ya usa
todo el texto del sitio y que `DESIGN-DIRECTION.md` §4 tenía verificado con
contraste AA/AAA en los dos temas. Es el mismo patrón que `.site-header` ya
aplicaba (difference en oscuro, color sólido en claro) — no una idea nueva.
Verificado con capturas en oscuro, claro y hover (`.is-active`).

---

## 2026-08-07 — Los 5 casos de estudio: misma plantilla, se sentía a archivador

**Hallazgo (calificado por Iván como "pésimo", debía cambiar):** el
contenido de cada caso era sólido — específico, honesto, con cifras y
trade-offs reales — pero los 5 seguían exactamente el mismo esqueleto de
encabezados, en el mismo orden, con el mismo cierre (`## El contexto` →
`## El problema` → `## Las decisiones` → `## En qué terminó` →
`## Qué haría distinto`, literal en los 5). Investigación de agosto 2026
confirma el riesgo: una estructura repetida "lee como un archivador, no como
una historia", incluso cuando cada frase individual es buena.

**Arreglo:** se reescribieron los 10 archivos (5 casos × ES/EN) con
encabezados propios de cada historia — sin dos casos compartiendo el mismo
título de sección de cierre — y se redujo el tic retórico "No era X. Era Y",
repetido en los 5. No se inventó contenido nuevo: cifras, decisiones y
trade-offs quedaron intactos, solo cambió cómo se organizan y qué tanto se
apoyan en la misma fórmula. Verificado con build + tests de Playwright +
capturas (caso confidencial, caso con métricas, página en inglés).

---

## Pendiente de decisión (no se tocó, requiere que Iván decida)

- Momento 3D y easter egg para v3 (o formalizar que no van).
- Presupuesto de performance (`PLAN-V3.md` §7) — nunca verificado contra el
  build real de v3.
- Los 87MB de `models-3d/` se siguen empacando en cada deploy (`sync-static.mjs`)
  aunque solo `/v1/` los usa.
- `DESIGN-DIRECTION.md` sigue describiendo el sistema de color del grafo que
  ya no existe — decidir si se reescribe o se archiva con una nota.

---

## 2026-11-22 — Casos nuevos: Super 8 y Kinora

**Hallazgo:** el portafolio terminaba en septiembre de 2026 (eco-loop) y dejaba
fuera los dos proyectos más grandes de octubre y noviembre.

**Cambio:** dos casos nuevos en ES/EN, destacados en la portada después de
Talonaria: **Super 8** (animación 3D escrita en Python, 14 piezas publicadas,
enlace a super-8.pages.dev) y **Kinora** (estudio creativo de escritorio donde la
IA propone operaciones tipadas y la persona aprueba; repo privado, enlace a la
cadena de herramientas pública). English A1 y eco-loop bajan a los puestos 4 y 5.
Cifras sacadas de los repos (commits, paquetes, referencias ADR), sin inventar.
Sin cambio de posicionamiento, así que título, descripción y OG quedan igual.
Verificado: build (47 páginas), `audit:seo` sin inválidos y capturas de la portada
y de los dos casos.

---

## 2026-11-22 — Avatar Studio: del piloto al estudio con resultados públicos

**Hallazgo:** el caso describía el piloto de septiembre (un commit, dos clips de
prueba). Hoy es una plataforma que produce y publica en tres cuentas reales.

**Cambio:** caso reescrito en ES/EN y destacado en la portada (puesto 2):
pipeline de la idea a la publicación automática, decisiones (montaje como datos,
arnés de modelos con presupuesto, carriles local/nube, servidor MCP, lecciones
por cuenta) y resultados del último mes, medidos el 21-11-2026 desde el estudio,
**nombrando las cuentas con enlace** para que las cifras se puedan verificar
(decisión de Iván): Kinema Studio (Facebook) 1,5 M vistas, @tony.mercury
(Instagram) 541 mil, kalvin9604 (YouTube) 75 mil; +5.300 seguidores entre las tres.
Super 8, Kinora, English A1 y eco-loop bajan un puesto. Misma URL
(`/trabajo/avatar-studio/`), sin cambio de posicionamiento.

---

## 2026-11-22 — Casos de 30 segundos y un solo caso de empresa

**Hallazgo:** los casos eran texto largo (300 a 1.500 palabras) que casi nadie
lee, sin una sola imagen, y 10 de los 20 casos eran del mismo empleador.

**Cambio:**
- Formato corto en `renderCase()`: un caso con `points` muestra arriba imagen o
  video (`media`), cifras, tres líneas y una galería (`gallery`, `galleryShape:
  vertical` para Reels); el cuerpo de siempre queda plegado en un `<details>`
  ("Ver el detalle", texto propio en `moreLabel`). Los casos sin `points` siguen
  con el formato largo.
- Aplicado a los 7 destacados. Medios en `public/img/casos/<slug>/` (WebP y un
  MP4 sin audio de 8 s para Super 8; 604 KB en total). Kinora usa capturas del
  manual; Eco Loop, su web local; Avatar Studio, portadas de Reels propios de
  @tony.mercury (sin personas reales).
- Los 10 casos del empleador se unieron en `/trabajo/plataforma/`, con la regla
  de §9.1: sin nombre del cliente, capturas, cifras ni conteos; la imagen es un
  esquema abstracto. Las 10 URLs viejas redirigen con 301 en `serve.json`.
- Orden sin duplicados: Talonaria, Plataforma, Avatar Studio, Super 8, Kinora,
  English, eco-loop, Mark 1, mini-astro, megabyte, blog-26, scrum-poker.

**Pendiente:** talonaria.co y la app de English responden 404; sin capturas
hasta que vuelvan a estar en línea.

---

## 2026-11-22 — Apoyo visual en todos los casos

**Cambio:** los 12 casos quedan en formato corto con imagen o video. Las capturas
salen de las apps corriendo en local con datos de demostración y bases de datos
temporales que se borraron después: Talonaria (`setup:demo`), English, blog-26 y
Scrum Poker. Mark 1 usa su video de ensamble y sus planos; mini-astro, su salida
real de terminal y el sitio que genera; megabyte, sesiones reales guardadas (el
modelo se muestra como "qwen3 14b").

**Por qué local:** talonaria.co, la app de English y blog.ivansantander.com
responden 404 "Application not found" en Railway.

**Ajuste:** mini-astro tiene hoy 56 tests (antes decía 55).

---

## 2026-11-22 — "Sobre mí" rediseñado

**Hallazgo:** era una columna de texto con la mitad derecha vacía, la trayectoria
en párrafos sueltos y "Proyectos propios" desactualizado (nombraba 3 proyectos).

**Cambio:** el contenido pasa a frontmatter estructurado y `renderAboutRich()` lo
arma con el lenguaje de los casos: nombre y frase, ficha a la derecha (ahora, base,
sectores, LinkedIn, GitHub), cifras (2019, 3 roles en LearUp, +2 M vistas/mes del
estudio, 12 casos), trayectoria como línea de tiempo, "Cómo trabajo" y "Cómo
lidero" en dos columnas de tarjetas, stack en etiquetas y los proyectos propios
como tarjetas con imagen generadas desde los casos (todos menos los `confidential`),
para que no vuelvan a quedar viejos. Sin frontmatter `timeline` se usa el render
anterior. Mismo título y descripción: sin cambio de posicionamiento.

---

## 2026-11-22 — "Sobre mí" en 30 segundos

**Hallazgo (Iván):** el rediseño seguía teniendo mucho texto que poca gente lee.

**Cambio:** la trayectoria muestra solo empresa, periodo y progresión de roles
(LearUp: Developer → Tech Lead → Technical Product Owner); qué se hizo en cada rol
queda plegado. "Cómo trabajo" y "Cómo lidero" muestran solo los títulos, con la
explicación plegada. Frase de cabecera más corta. Unas 260 palabras visibles,
contando etiquetas del stack y títulos de proyectos.

---

## 2026-11-22 — Portada y /trabajo/ con tarjetas visuales

**Hallazgo:** las tarjetas de casos eran texto (párrafo, etiquetas, tres cifras) y
ya cada caso tiene imagen; "Enfoque" era una frase suelta con media pantalla vacía;
las cifras del hero ("20+ proyectos") no cuadraban con los 12 casos; "Antes de
esto" repetía "Sobre mí".

**Cambio:** `renderVisualCard()` (imagen, proyecto, título y una cifra) reemplaza a
`renderWorkCard()` en la portada y en /trabajo/, 4 columnas; la portada cierra la
grilla con una tarjeta "Ver todos los casos". La frase de "Enfoque" pasa al lead
del hero y las secciones `thesis` y `secondary` se vuelven opcionales (ya no están
en el contenido). Cifras del hero: +2 M vistas al mes · 12 casos · desde 2019.
`keys.js` navega ahora `.vcard__link`. Se borró el CSS de `.work-card`. El
`statement` no cambia, así que título, descripción y OG quedan igual.
