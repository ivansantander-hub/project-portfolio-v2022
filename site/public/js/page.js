/* page.js — dos detalles de lectura.
 *
 * 1. La cabecera gana fondo al hacer scroll (.is-scrolled), para que el
 *    contenido no pase por debajo del logo y del menú.
 * 2. El índice lateral (.toc) marca con aria-current la sección que se está
 *    leyendo.
 */
(function () {
  var header = document.querySelector('.site-header');
  if (header) {
    var marcar = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    marcar();
    window.addEventListener('scroll', marcar, { passive: true });
  }

  var enlaces = Array.prototype.slice.call(document.querySelectorAll('.toc__list a[href^="#"]'));
  if (!enlaces.length || !('IntersectionObserver' in window)) return;
  var porId = {};
  var secciones = enlaces.map(function (a) {
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    porId[id] = a;
    return document.getElementById(id);
  }).filter(Boolean);

  var activar = function (id) {
    enlaces.forEach(function (a) { a.removeAttribute('aria-current'); });
    if (porId[id]) porId[id].setAttribute('aria-current', 'true');
  };

  /* La sección activa es la última cuyo título ya pasó el tercio superior. */
  var actualizar = function () {
    var limite = window.innerHeight * 0.33;
    var actual = secciones[0];
    secciones.forEach(function (h) { if (h.getBoundingClientRect().top <= limite) actual = h; });
    activar(actual.id);
  };
  var io = new IntersectionObserver(actualizar, { rootMargin: '0px 0px -60% 0px' });
  secciones.forEach(function (h) { io.observe(h); });
  window.addEventListener('scroll', actualizar, { passive: true });
  actualizar();
})();
