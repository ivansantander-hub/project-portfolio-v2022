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

/* Aviso de atajos: aparece donde hay atajos (casos, home, /trabajo/), solo
 * con teclado y ratón, y se va solo a los pocos segundos. Se puede cerrar
 * con × o Esc. Cerrado o usado el atajo, no vuelve a salir; si se ignora,
 * sale como mucho tres veces. */
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var esCaso = !!document.querySelector('a.case__pager-link[rel="prev"], a.case__pager-link[rel="next"]');
  var hayTarjetas = !!document.querySelector('.work-card__link');
  if (!esCaso && !hayTarjetas) return;

  var CLAVE = 'is-keys-hint';
  var MAX_VECES = 3;
  var guardado = null;
  try { guardado = localStorage.getItem(CLAVE); } catch (e) {}
  if (guardado === 'off') return;
  var veces = parseInt(guardado, 10) || 0;
  if (veces >= MAX_VECES) return;
  try { localStorage.setItem(CLAVE, String(veces + 1)); } catch (e) {}

  var es = (document.documentElement.lang || 'es').indexOf('es') === 0;
  var texto = esCaso
    ? (es ? 'Usa <kbd>←</kbd> <kbd>→</kbd> para cambiar de proyecto' : 'Use <kbd>←</kbd> <kbd>→</kbd> to switch projects')
    : (es ? 'Recorre los proyectos con <kbd>←</kbd> <kbd>→</kbd> y ábrelos con <kbd>Enter</kbd>'
          : 'Browse projects with <kbd>←</kbd> <kbd>→</kbd> and open them with <kbd>Enter</kbd>');

  var aviso = document.createElement('div');
  aviso.className = 'keys-hint';
  aviso.setAttribute('role', 'status');
  aviso.innerHTML = '<span>' + texto + '</span>' +
    '<button type="button" class="keys-hint__close" aria-label="' + (es ? 'Cerrar aviso' : 'Dismiss') + '">×</button>';
  document.body.appendChild(aviso);

  var temporizador;
  function ocultar() {
    clearTimeout(temporizador);
    aviso.classList.remove('is-visible');
    document.removeEventListener('keydown', alTeclear);
    setTimeout(function () { aviso.remove(); }, 400);
  }
  function apagar() {
    try { localStorage.setItem(CLAVE, 'off'); } catch (e) {}
    ocultar();
  }
  function alTeclear(e) {
    if (e.key === 'Escape' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') apagar();
  }
  aviso.querySelector('button').addEventListener('click', apagar);
  document.addEventListener('keydown', alTeclear);

  setTimeout(function () {
    aviso.classList.add('is-visible');
    temporizador = setTimeout(ocultar, 7000);
  }, 1200);
})();
