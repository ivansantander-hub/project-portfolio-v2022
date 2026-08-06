/**
 * site.config.mjs — configuración de build del sitio.
 *
 * Cambiar la paleta del sitio entero es cambiar UNA constante de aquí.
 * Las cuatro paletas siguen definidas en:
 *   - public/css/quarks/tokens.css   (acento, fondo, tinta, por tema)
 *   - public/js/shader.js            (coeficientes del fondo generativo)
 * Ninguna se borra: cambiar de dirección de color no debe implicar reescribir
 * nada, solo cambiar este valor.
 *
 * También se puede sobrescribir por variable de entorno sin tocar el archivo:
 *   PALETTE=vermilion pnpm build
 *   PALETTE_PICKER=1 pnpm dev      ← vuelve a mostrar el selector en vivo
 */

/** 'ultramarine' | 'chartreuse' | 'vermilion' | 'copper' */
export const PALETTE = process.env.PALETTE || 'ultramarine';

/** Selector de paleta en vivo. Herramienta de decisión, no parte del diseño. */
export const PALETTE_PICKER = process.env.PALETTE_PICKER === '1';

/**
 * Enlace en el footer a la v1 — el portafolio de 2022 con modelos 3D, que
 * sigue servido en /v1/. Sirve para comparar las dos direcciones.
 * Para quitarlo del sitio publicado:
 *   LINK_V1=0 pnpm build
 */
export const LINK_V1 = process.env.LINK_V1 !== '0';

/** Paletas válidas — el build falla si PALETTE no está aquí, en vez de
 *  generar un sitio sin acento y que nadie se entere hasta verlo. */
export const PALETTES = ['ultramarine', 'chartreuse', 'vermilion', 'copper'];
