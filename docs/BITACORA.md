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

## Pendiente de decisión (no se tocó, requiere que Iván decida)

- Momento 3D y easter egg para v3 (o formalizar que no van).
- Presupuesto de performance (`PLAN-V3.md` §7) — nunca verificado contra el
  build real de v3.
- Los 87MB de `models-3d/` se siguen empacando en cada deploy (`sync-static.mjs`)
  aunque solo `/v1/` los usa.
- `DESIGN-DIRECTION.md` sigue describiendo el sistema de color del grafo que
  ya no existe — decidir si se reescribe o se archiva con una nota.
