export default {
  /**
   * mini-astro NO lee `src/` directamente: lee `.build/`, un directorio
   * desechable que arma scripts/build-content.mjs en cada compilación
   * (componentes + plantillas copiados, más las páginas generadas desde
   * src/content/). Así `src/` solo contiene lo escrito a mano y ningún
   * artefacto de build acaba en git.
   */
  srcDir: '.build',
  outDir: 'dist',
  dataDir: '.build/data',
  atomicDesign: true,
  cookies: { strict: false },
  security: { csp: false, policyPages: false },
};
