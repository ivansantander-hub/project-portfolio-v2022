# Dirección de arte — Portafolio v3

Fecha: 2026-08-02 · Concepto: **Complejidad → Claridad**

> **§4 (color) quedó obsoleto.** Describe tres tokens de estado para colorear
> nodos del grafo (`--signal`/`--live`/`--orphan`). El grafo se revirtió; el
> sistema de color que corre hoy es el de 4 paletas nombradas en
> `site.config.mjs` sobre una UI monocroma (el shader del fondo pone el
> color). Ver [`BITACORA.md`](./BITACORA.md).

---

## 1. El default que rechacé, y por qué

La base de datos de diseño devolvió, para "portafolio de desarrollador, técnico, oscuro":

- Estilo **Modern Dark**, fondo `#0F172A`, acento verde `#22C55E`
- **Inter** para títulos y para cuerpo
- Glassmorphism, blobs de luz ambiental, gradientes

Es una recomendación correcta y es exactamente el aspecto que tiene todo portafolio técnico
generado hoy: near-black con un acento verde ácido, tipografía neutra. Descartado por ser un
default y no una decisión.

**Lo que sí tomé de esa consulta:** el preset de scroll con `pin` + `scrub` (aplica
directamente al grafo), la advertencia de no usar `#000000` puro, el límite de 1–2 secciones
pineadas por página, y la lista de verificación de accesibilidad.

---

## 2. La idea rectora

El sitio **ejecuta la tesis en vez de enunciarla.**

La página empieza densa y termina en silencio. Al bajar, el grafo colapsa, las etiquetas
desaparecen, el color se drena y el espacio se abre. Al llegar al contacto queda casi nada
en pantalla.

No es una metáfora decorativa: es el argumento del portafolio, ejecutado en la propia
página. Un visitante entiende qué hace Iván sin haber leído todavía un caso.

---

## 3. Tipografía — una superfamilia, tres densidades

La idea tipográfica es la misma que la del concepto: **un solo sistema, distintas
densidades.**

| Rol | Familia | Eje | Uso |
|---|---|---|---|
| Display | Archivo Variable | `wdth 118`, peso 600–800 | Titulares. Ancho, industrial, tipo señalización de infraestructura |
| Cuerpo | Archivo Variable | `wdth 100`, peso 400–500 | Prosa de los casos |
| Datos | Martian Mono Variable | `wdth 87.5`, peso 400–600 | Etiquetas de nodo, IDs, métricas, eyebrows |

Es la misma familia estirada y comprimida, más una mono ancha para lo que es literalmente
dato. La diferencia entre jerarquías la hace el **ancho**, no un cambio de fuente. Eso es
raro de ver, es barato de cargar (dos familias variables) y dice algo cierto sobre el
contenido.

**Verificado antes de comprometer:** Archivo Variable expone el eje `wdth` en 62–125% y `wght`
100–900. Martian Mono expone `wdth` 75–112.5% y `wght` 100–800. El ancho se controla con
`font-stretch`, no con `font-variation-settings`.

**Peso real:** cuatro archivos, 244 KB en disco. Pero los acentos del español (`á é í ó ú ñ
¿ ¡`) viven en el rango `U+0000-00FF`, es decir en el subset **latin** — no en `latin-ext`.
Con `unicode-range` correcto, una página en español o inglés descarga solo los dos archivos
latin: **126 KB**. El `latin-ext` queda declarado para nombres propios extranjeros y no se
pide nunca en el caso normal.

Se descartó Inter (default), y se descartó la pareja serif-display + sans-body (default).

---

## 4. Color — estados de sistema, no paleta de marca

El color no es decorativo: **codifica el estado de un nodo**, que es el vocabulario nativo
de un diagrama de arquitectura.

| Token | Dark | Light | Significado |
|---|---|---|---|
| `--signal` | `#E8A33D` | `#845203` | Resuelto. El acento. Se usa **una vez por vista** |
| `--live` | `#4FB8A8` | `#1F6E62` | Activo, sano, en producción |
| `--orphan` | `#9B7BC4` | `#6A4A93` | Huérfano, sin uso, candidato a eliminarse |

Ámbar + teal + violeta apagado no es ninguno de los tríos por defecto. Y el violeta como
"esto sobra" es la especialidad de Iván hecha color.

El fondo oscuro es un índigo muy profundo (`#0D1017`), no negro puro. El fondo claro es un
gris frío (`#E7E9ED`), deliberadamente **no** el crema `#F4F1EA` del default.

### Contraste verificado (WCAG, calculado no estimado)

**Oscuro** sobre `#0D1017`: texto 15.52:1 (AAA) · atenuado 6.17:1 (AA) · ámbar 8.82:1 (AAA) ·
teal 7.93:1 (AAA) · violeta 5.46:1 (AA)

**Claro** sobre `#E7E9ED`: texto 14.64:1 (AAA) · atenuado 5.54:1 (AA) · ámbar 5.42:1 (AA) ·
teal 4.99:1 (AA) · violeta 5.73:1 (AA)

Los bordes finos son decorativos y no requieren ratio. `--border-strong`, usado en límites de
componentes interactivos, cumple 3:1 en ambos modos. El anillo de foco usa `--signal`, que
cumple 3:1 contra su fondo en los dos temas.

---

## 5. El gradiente de densidad — la firma

Tres zonas, declaradas con `data-zone`. Cada una cambia ritmo, ruido y saturación.

| Zona | Dónde | Espaciado | Ruido | Croma |
|---|---|---|---|---|
| `dense` | Hero y grafo | Comprimido | Grano visible | Los tres estados activos |
| `transition` | Tesis, índice de casos | Medio | Grano al 40% | Solo `live` y `signal` |
| `clear` | Casos, about, contacto | Generoso | Sin grano | Monocromo + `signal` |

Es una sola idea aplicada con disciplina, y es lo que hace que la página se recuerde.

---

## 6. Estructura — los casos son nodos

Nada de marcadores `01 / 02 / 03`: los casos no son una secuencia, son **nodos de un sistema**.
Cada uno se etiqueta con su identificador de nodo en mono:

```
node/architecture-simplification    [merge]
node/workflow-engine                [live]
node/sgc                            [live]
node/mini-astro                     [live]
node/blog-26                        [live]
```

El estado entre corchetes usa el color correspondiente. La estructura codifica algo cierto
sobre el contenido en vez de decorarlo.

---

## 7. Movimiento

Una sola coreografía orquestada, no efectos sueltos.

**El colapso del grafo** es el único momento pineado de la página: `ScrollTrigger` con
`pin: true` y `scrub: 1`. Los nodos se fusionan, las aristas huérfanas se desvanecen, las
etiquetas caen. `ScrollTrigger.refresh()` después de que carguen las fuentes.

Todo lo demás es contención: revelados de 300–400 ms con `power1.out` y desplazamientos de
8–16 px, que se leen como fundido y no como deslizamiento.

`prefers-reduced-motion` no desactiva el grafo — lo entrega **ya resuelto**, en su estado
final. El contenido nunca depende del movimiento.

---

## 8. El riesgo asumido

Que la mitad superior del sitio sea deliberadamente ruidosa y difícil. Es contraintuitivo
para un portafolio, donde el instinto es que todo se vea limpio desde el primer píxel.

Se justifica porque el ruido tiene una función: **sin el "antes" no existe el "después".**
La claridad de la segunda mitad solo significa algo si la primera costó leerla. Y la
transición es rápida — el usuario está en zona `clear` antes del primer caso.
