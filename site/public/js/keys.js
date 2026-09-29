/* keys.js — navegación con las flechas del teclado.
 *
 * - En un caso: ← va al proyecto anterior y → al siguiente (los enlaces
 *   rel="prev"/rel="next" del pie, en el mismo orden que /trabajo/).
 * - En la home y en /trabajo/: ← → mueven el foco entre las tarjetas de
 *   proyectos; ↑ ↓ también, pero solo si ya hay una tarjeta con foco, para no
 *   quitarle el scroll normal a la página. Enter abre la tarjeta con foco.
 *
 * No actúa con modificadores (Alt+← sigue siendo "atrás" del navegador) ni
 * mientras se escribe en un campo.
 */
(function () {
  function escribiendo(el) {
    if (!el) return false;
    var tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  var suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (escribiendo(document.activeElement)) return;
    var key = e.key;

    var prev = document.querySelector('a.case__pager-link[rel="prev"]');
    var next = document.querySelector('a.case__pager-link[rel="next"]');
    if (prev || next) {
      var destino = key === 'ArrowLeft' ? prev : key === 'ArrowRight' ? next : null;
      if (destino) {
        e.preventDefault();
        window.location.href = destino.href;
      }
      return;
    }

    var tarjetas = Array.prototype.slice.call(document.querySelectorAll('.work-card__link'));
    if (!tarjetas.length) return;
    var actual = tarjetas.indexOf(document.activeElement);
    var adelante = key === 'ArrowRight' || (actual !== -1 && key === 'ArrowDown');
    var atras = key === 'ArrowLeft' || (actual !== -1 && key === 'ArrowUp');
    if (!adelante && !atras) return;

    e.preventDefault();
    var siguiente = actual === -1
      ? (adelante ? 0 : tarjetas.length - 1)
      : Math.min(tarjetas.length - 1, Math.max(0, actual + (adelante ? 1 : -1)));
    tarjetas[siguiente].focus({ preventScroll: true });
    tarjetas[siguiente].scrollIntoView({ block: 'center', behavior: suave ? 'smooth' : 'auto' });
  });
})();
