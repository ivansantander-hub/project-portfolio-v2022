# Plan — Portafolio v3

> Documento de plan. Decisiones tomadas, concepto, fases y presupuestos.
> Estado: propuesta para aprobación. Fecha: 2026-08-02.
>
> **Este documento describe la intención, no necesariamente lo que existe hoy.**
> El hero visual (grafo caos → orden) de §3.2 se implementó y se revirtió; el
> hero de v3 es texto puro. Ver [`BITACORA.md`](./BITACORA.md) para el estado
> real y las desviaciones, con fecha y motivo de cada una.

---

## 0. Decisiones ya cerradas

| Decisión | Valor |
|---|---|
| Objetivo | Conseguir rol senior (Tech Lead / EM / TPO) |
| Stack | Vanilla + `mini-astro` (SSG propio) |
| Alcance | Rebuild completo: concepto, contenido y código nuevos |
| Idioma | Bilingüe ES/EN con toggle |
| 3D | Se mantiene, optimizado en serio (Draco/meshopt + KTX2) |
| Easter egg | Se mantiene, fuera de la carga inicial |
| Divulgación | **NDA activo.** Cifras duras solo de proyectos propios. Trabajo de empleador: cualitativo y anonimizado (ver §9.1) |

---

## 1. Diagnóstico del v2022

Medido en vivo, no estimado.

**Lo que funciona:** el craft de movimiento es real y hecho a mano (cursor con velocity
stretch, magnetic links, scramble por IntersectionObserver, clip-path wipes, drag con
fricción). 291 líneas de tests E2E. Todo self-hosted. `prefers-reduced-motion` respetado.
Consola limpia.

**Lo que no:**

| Problema | Dato |
|---|---|
| Carga inicial | **8.47 MB** (37 recursos), antes de los modelos lazy |
| Modelos 3D en repo | **87 MB**, de los cuales **~50 MB no se referencian** |
| Peor ofensor | `silent_ash` — 37 MB, con una normal map de 22 MB, sin usar |
| Design system | 60 KB de CSS, **4 custom properties**, 21 `!important`, 19 hex hardcodeados |
| Contenido | Cada proyecto = 1 frase + stack list + 3 métricas sin atribución |
| Señal de seniority | Cero. El sitio vende frontend dev de animaciones, no Tech Lead |
| SEO | ~7.400 palabras en página, casi todas marquee repetido |

**Conclusión:** la ejecución técnica es fuerte, el posicionamiento está equivocado. El
riesgo del rebuild es duplicar el error — más animación, misma falta de sustancia.

---

## 2. Inventario de material real

Levantado de Drive, Notion, GitHub y disco local. Esto es lo que el portafolio actual
**no está usando** y que vale más que todo lo que sí muestra.

### 2.1 Trayectoria (CV, Nov 2025)

| Empresa | Rol | Periodo |
|---|---|---|
| LearUp | Sr. Associate Technical Product Owner | Nov 2025 – presente |
| LearUp | Sr. Associate Tech Lead | Ene 2025 – Nov 2025 |
| LearUp | Associate Product Full Stack Developer | Jul 2024 – Ene 2025 |
| CogenTech | Product Full Stack Developer | Jun 2023 – Jul 2024 |
| Cielum / Omnivida | Software Developer — API Manager Azure, RPA en salud | May 2023 – Jun 2023 |
| Newo | Software Developer — Payment Gateway (líder del desarrollo) | Mar 2023 – Jun 2023 |
| Be4tech | Software Developer — apps híbridas y web | Ago 2021 – Jun 2023 |

Progresión Dev → Tech Lead → TPO en 18 meses dentro de la misma empresa. Eso es una
historia, y hoy no se cuenta en ningún lado.

### 2.2 Las tres piezas de caso de estudio (Notion)

**A. Propuesta de Simplificación LearUp** — la joya de la corona.

Auditoría completa de arquitectura con propuesta de reducción:

- 15 microservicios API + 11 cronjobs + workflow engine + 2 backups = **30+ componentes**
  mantenidos por **5 desarrolladores** → ratio 6:1 (benchmark 1:1)
- 24 deployments en QA / 34 en DEV
- Frontend v1: 99 páginas, 1.661 componentes, ~268k líneas TSX, DevExtreme deprecated
- Frontend v2 diseñado por él: **99 páginas → 7** (registry engine con catch-all),
  **1.661 componentes → 123** (5 shells genéricos), 77 → 29 deps, TS estricto, 177+ tests
- Dos propuestas completas (A conservadora, D definitiva) con comparativa, asignación
  nominal del equipo por fase, restricciones de entrega y plan de rollback

**B. Low-Code EDC Integration & Visual DAG Builder** — la pieza técnica.

Plataforma low-code para integración de EDC en ensayos clínicos:

- Wizard de 5 pasos, motor de workflows Python/FastAPI con DAGs dinámicos desde DB,
  builder visual con React Flow, nodos condicionales IF/ELSE, data mapping drag-and-drop
- Fix de N+1 documentado por él: **83 queries / ~48s → 4 batch queries / ~2s**, cache TTL 60s
- 8 task types registrados, ejecución en orden topológico con contexto compartido
- Estimado 30h, real 20h

**C. Estrategia TPO — Plan de Mejora del Equipo** — la pieza de liderazgo.

Proceso de equipo, refinamiento, estimación, retrospectivas con análisis de strikes por
área, definición de roles, y reportes de entrevistas (él evalúa candidatos).

### 2.3 Proyectos propios

| Proyecto | Qué es | Estado |
|---|---|---|
| **SGC / business-system** | ERP multi-tenant: 2 schemas Postgres, POS, contabilidad PUC colombiana, facturación DIAN, transacciones Serializable con retry, agente IA (AURA) texto→SQL | Activo, con docs y tests |
| **blog-26** | CMS propio: Astro 6 SSR, Postgres, R2, editor Milkdown, versionado con diff, RSS, analytics | Activo, con dominio |
| **mini-astro** | SSG propio con `<mini-include>`, atomic design, templates | Publicado, corre este sitio |
| **scrum-poker** | Monorepo NestJS + frontend, Docker, auth, admin dashboard | Activo |
| **project-flip**, **script-lab**, **opencode-builder**, **po-master**, **prisma-core** | Experimentos y herramientas | Varios |

**Problema transversal:** los 12+ repos de GitHub tienen **0 descripciones, 0 topics,
0 estrellas**. Un reclutador que abra el perfil no entiende nada. Eso se arregla en una
tarde y multiplica el efecto del portafolio.

---

## 3. El concepto: "Complejidad → Claridad"

### 3.1 La tesis

Hay un hilo que atraviesa todo el material y que ninguna versión del portafolio ha contado:

> **Iván reduce complejidad en sistemas complejos.**

- 30+ componentes → 5
- 99 páginas → 7
- 1.661 componentes → 123
- 83 queries / 48s → 4 queries / 2s
- 15 microservicios → 3 + 1 worker

No es una frase de marketing: son cifras que él mismo documentó. Y es exactamente lo
que un hiring manager busca en un Tech Lead.

### 3.2 La ejecución visual

El sitio **demuestra la tesis en vez de enunciarla.**

La pieza central es un **mapa de sistema vivo**: un grafo de nodos denso y caótico —
la arquitectura real de 30+ componentes — que al hacer scroll **colapsa, se reorganiza
y se resuelve** en un sistema limpio de 5 nodos. La animación *es* el argumento.

Después, cada nodo del sistema simplificado es la entrada a un caso de estudio. Navegar
el portafolio es navegar la arquitectura.

**Por qué esto y no el "Voxel Oasis" (el doc de Drive de Feb 2026):**

La idea del metaverso 3D es divertida pero juega en tu contra para este objetivo:

1. Un hiring manager de Tech Lead necesita leer tus casos en 90 segundos, no caminar un
   avatar por una biblioteca. La fricción mata la conversión.
2. Comunica "frontend creativo", que es justo el desajuste que ya tiene el v2022.
3. Son meses de trabajo, no semanas.
4. **Riesgo legal serio:** Heisenberg (Breaking Bad / Sony), el Gigante de Hierro (Warner),
   la alfombra del Overlook (The Shining), Ready Player One, el DeLorean. Es un muro de
   propiedad intelectual ajena en la pieza que usarías para conseguir trabajo.

El mapa de sistema consigue el mismo "wow" con material 100% tuyo, carga liviana, y
alineado con el rol que buscas. La energía de juego se canaliza en el easter egg.

### 3.3 Dónde vive cada cosa

| Elemento | Rol en el concepto |
|---|---|
| **Grafo 2D (canvas/SVG)** | Pieza central. Ligera, animable, tuya. Es el hero y la navegación |
| **3D (un solo momento)** | Un objeto en el hero o en un caso. Optimizado. Delight puntual, no repetición |
| **Video (HyperFrames)** | Un clip por caso: la evolución de arquitectura antes/después, renderizado desde HTML |
| **Easter egg** | Escondido dentro del grafo. Chunk aparte, carga bajo demanda |

---

## 4. Arquitectura de información

```
/                     Hero (grafo caótico → simplificado) + tesis + CTA
/about                Trayectoria Dev → Tech Lead → TPO. Cómo trabajo. Cómo lidero
/work                 Índice de casos
  /work/simplification   Reducir 30+ componentes a 5 (arquitectura + liderazgo)
  /work/low-code-dag     Plataforma low-code y motor de DAGs (técnico profundo)
  /work/sgc              ERP multi-tenant con contabilidad colombiana (producto propio)
  /work/mini-astro       Por qué escribí mi propio SSG (decisión con trade-offs)
  /work/blog-26          CMS propio con versionado (producto propio)
/notes                Enlace o sección al blog-26 — escribir es señal de seniority
/contact              CTA real + CV descargable
```

Casos secundarios en lista breve, sin página propia: Payment Gateway (Newo), BE4CARE,
BE4TECH, iRocket, QR Access.

### 4.1 Estructura de cada caso

Fija, para que se lean rápido y comparen bien:

1. **Una línea de resultado** — el titular, con la cifra
2. **Contexto** — qué sistema, qué escala, qué restricción
3. **El problema** — con datos, no adjetivos
4. **Mi rol** — explícito: qué decidí yo, qué decidió el equipo
5. **Decisiones y trade-offs** — las alternativas que consideré y por qué descarté
6. **Resultado** — medido
7. **Qué haría distinto** — señal de madurez; casi nadie lo pone

---

## 5. Sistema de diseño

Este es el punto donde el v2022 falla más silenciosamente: 4 variables no son un
design system.

### 5.1 Capa de quarks (tokens)

```
--space-*      escala modular (no valores sueltos)
--type-*       escala tipográfica fluida con clamp
--color-*      superficie / texto / acento / borde, por tema
--radius-*     radios
--motion-*     duraciones y curvas nombradas
--layer-*      z-index nombrados (hoy hay 21 !important por falta de esto)
```

Regla dura: **cero hex hardcodeados fuera del archivo de tokens. Cero `!important`.**

### 5.2 CSS

Se rompe `styles.css` (60 KB monolítico) en capas con `@layer`:
`reset → tokens → base → atoms → molecules → organisms → utilities`.
CSS crítico inline, el resto diferido.

### 5.3 Dirección de arte

Se define con `/frontend-design` + `/ui-ux-pro-max` en Fase 1. Restricciones de entrada:

- Sistema tipográfico con jerarquía real (hoy no hay: casi todo es display)
- Paleta que soporte el grafo (necesita estados: activo, atenuado, error, resuelto)
- Modo claro y oscuro de primera clase, no un swatch escondido
- Los dos temas "TESTING" se rescatan como parte del easter egg, no del selector normal

---

## 6. Stack y trabajo sobre mini-astro

El sitio corre sobre tu propio SSG, y eso es parte del argumento. Pero mini-astro
necesita crecer para soportar este plan:

| Necesidad | Trabajo en mini-astro |
|---|---|
| Casos de estudio en Markdown | Content collections: leer `.md` + frontmatter, generar rutas |
| Bilingüe ES/EN | i18n: `[lang]` en rutas, diccionario, `hreflang`, fallback |
| Rutas por caso | Rutas dinámicas desde colección |
| Peso de imágenes | Pipeline con `sharp`: AVIF/WebP + `srcset` + dimensiones automáticas |
| SEO | `sitemap.xml`, `robots.txt`, JSON-LD `Person` + `CreativeWork`, OG por página |

**Beneficio doble:** cada mejora aquí es material para el caso de estudio de mini-astro.
El portafolio se convierte en la demo de la herramienta.

---

## 7. Presupuesto de performance

Innegociable. Un portafolio de Tech Lead que carga lento es un contraargumento.

| Métrica | v2022 (medido) | Objetivo v3 |
|---|---|---|
| Carga inicial (sin 3D) | 8.47 MB | **< 400 KB** |
| Con el momento 3D cargado | ~8.5 MB+ | **< 1.5 MB** |
| JS inicial | ~1.1 MB (model-viewer + GSAP) | **< 100 KB** |
| LCP (4G móvil) | sin medir | **< 2.0 s** |
| CLS | sin medir | **< 0.05** |
| Lighthouse (las 4) | sin medir | **> 95** |

**Cómo se llega:**

- `model-viewer` (1 MB) sale del bundle inicial: import dinámico al entrar en viewport
- Modelos con Draco/meshopt + texturas KTX2 → de 7.5 MB a ~800 KB por modelo
- Purga de los ~50 MB de modelos huérfanos, y limpieza del historial de git con
  `git-filter-repo` (el repo pesa aunque los archivos ya no estén)
- Audio del easter egg (3.2 MB): chunk aparte, `fetch` solo al activarlo
- GSAP: solo los plugins usados
- Grafo en canvas 2D o SVG, no WebGL

---

## 8. Fases

### Fase 0 — Fundaciones y contenido (bloqueante)

Nada visual empieza sin esto.

1. Escribir los 5 casos de estudio en Markdown, ES y EN
2. Revisión de divulgación (ver §9) — qué se publica y cómo se anonimiza
3. Definir la tesis y el copy del hero
4. Limpiar los 12+ repos de GitHub: descripción, topics, README en los que valen
5. Repo nuevo o rama limpia + purga de assets del historial

**Entregable:** carpeta `content/` con los casos escritos y aprobados.

### Fase 1 — Dirección de arte y design system

1. `/frontend-design` + `/ui-ux-pro-max` para dirección visual y tipográfica
2. Capa de quarks completa (tokens)
3. Prototipo del grafo: la transición caos → orden, sola, sin sitio alrededor
4. Definir el mapa de animación con `/hyperframes-animation` (reglas de motion, no efectos sueltos)

**Entregable:** tokens + prototipo del grafo funcionando y aprobado.

### Fase 2 — mini-astro

1. Content collections + frontmatter
2. i18n con rutas `[lang]`
3. Pipeline de imágenes con `sharp`
4. SEO: sitemap, robots, JSON-LD, OG por página

**Entregable:** mini-astro capaz de construir el sitio nuevo.

### Fase 3 — Construcción

1. Átomos y moléculas sobre los tokens
2. Home con el grafo
3. Páginas de caso
4. About y Contact
5. Toggle de idioma
6. Momento 3D, con carga diferida
7. Easter egg reconstruido, en chunk aparte

**Entregable:** sitio completo en local.

### Fase 4 — Video

1. Un clip por caso con HyperFrames: la evolución de arquitectura, renderizada desde HTML
2. Empezar por el de Simplificación — 30+ nodos colapsando a 5 es la pieza más fuerte
3. Poster + `preload="none"`, nunca autoplay pesado

**Entregable:** 2-3 clips integrados.

### Fase 5 — Calidad y lanzamiento

1. Playwright: navegación, i18n, casos, easter egg, reduced-motion, móvil
2. Auditoría de accesibilidad (contraste, foco, teclado, lectores de pantalla)
3. Presupuesto de performance verificado contra la tabla de §7
4. Deploy + medición real en móvil

**Entregable:** en producción, con números.

---

## 9. Riesgos

### 9.1 Divulgación — política definitiva (NDA activo)

Hay NDA. La regla es conservadora y no se negocia caso por caso:

**Regla de oro: las cifras duras solo salen de proyectos propios.**

| Fuente | Qué se puede publicar |
|---|---|
| **Proyectos propios** (SGC, blog-26, mini-astro, scrum-poker) | Todo. Cifras, arquitectura, código, capturas, repos. Sin restricción |
| **Trabajo de empleador** | Clase de problema, enfoque, decisiones, trade-offs y rol. **Sin números, sin inventarios, sin nombres** |

**Prohibido en cualquier caso de empleador:**

- Conteos de su arquitectura (cuántos servicios, cuántos cronjobs, cuántas páginas,
  cuántos componentes, cuántos deployments, tamaño del equipo)
- Métricas de sus sistemas (tiempos de query, tamaños de bundle, tiempos de build)
- Nombres: de estudios clínicos, de personas, de repos internos, de endpoints, de clientes
- Juicios sobre proveedores o sobre la calidad del código heredado
- Capturas de pantalla, diagramas reales o extractos de código de su base

**Permitido:**

- Nombrar al empleador y el cargo en la trayectoria — es público en LinkedIn y el CV
- Describir el dominio en genérico: "plataforma SaaS de gestión de ensayos clínicos"
- El tipo de problema: "consolidación de una arquitectura de microservicios sobredimensionada
  para el tamaño del equipo"
- Las decisiones y el razonamiento: alternativas evaluadas, criterios, riesgos, plan de
  migración. **Esto es lo que evalúa un hiring manager de Tech Lead, y no es confidencial.**
- El rol: qué decidió él, qué delegó, cómo lo comunicó

**Consecuencia de diseño:** los casos de empleador cargan el peso de *criterio y liderazgo*;
los proyectos propios cargan el peso de *evidencia numérica y código verificable*. El
portafolio se equilibra solo, y la restricción se convierte en estructura.

**Acción antes de publicar:** Iván revisa cada borrador contra esta tabla.

### 9.2 Propiedad intelectual

- El easter egg actual usa arte de álbum y música de terceros. Se reemplaza por material
  propio o CC0 con atribución.
- Los modelos 3D descargados: verificar licencia de cada uno que sobreviva, y atribuir.
- El concepto Voxel Oasis queda descartado también por esto (§3.2).

### 9.3 Alcance

El riesgo real de este plan es que Fase 0 no se termine y se salte a la parte divertida.
**Si el contenido no está escrito, no se abre Figma ni se escribe CSS.** El contenido es
el entregable; el diseño es el vehículo.

### 9.4 El nombre

`project-portfolio-v2022` deja de tener sentido. Repo nuevo, o rename.

---

## 10. Lo primero que haría

Aunque el rebuild tarde semanas, hay dos cosas de alto impacto y bajo costo:

1. **Limpiar GitHub** (una tarde) — 12+ repos sin descripción es la primera impresión de
   cualquier reclutador técnico, y hoy está vacía.
2. **Escribir el caso de Simplificación** (un día) — es tu mejor pieza y ya está
   documentada. Sirve para el portafolio, para LinkedIn y para entrevistas, en ese orden.
