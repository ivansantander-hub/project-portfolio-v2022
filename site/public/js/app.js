(function () {
    'use strict';

    /* Siempre iniciar en la parte superior al cargar o recargar */
    if (typeof history !== 'undefined' && history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    var HINT_HIDE_DELAY_MS = 5500;
    var modelViewerIds = ['model-viewer', 'model-viewer-2', 'model-viewer-3', 'model-viewer-4', 'model-viewer-5', 'model-viewer-6'];

    function runHeroEntrance() {
        var wrap = document.querySelector('.hero-model-wrap');
        if (!wrap || typeof gsap === 'undefined') return;
        /* Quitar pantalla negra al mismo tiempo que empieza la entrada para que se vea la animación */
        setTimeout(function () {
            clearTimeout(timeBlackScreen);
            blackScreen();
        }, 1800);
        gsap.to(wrap, {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 2.4,
            delay: 1.8,
            ease: 'power2.out',
            overwrite: 'auto'
        });
    }

    function hideHintFor(el) {
        var container = el.closest('.model-viewer, .model-3d');
        if (!container) return;
        var hint = container.querySelector('.model-viewer-hint');
        if (hint) hint.classList.add('model-viewer-hint--hidden');
    }

    function setupHints() {
        modelViewerIds.forEach(function (id) {
            var viewer = document.getElementById(id);
            if (!viewer) return;

            var container = viewer.closest('.model-viewer, .model-3d');
            var hint = container ? container.querySelector('.model-viewer-hint') : null;
            if (!hint) return;

            var hidden = false;
            function hide() {
                if (hidden) return;
                hidden = true;
                hint.classList.add('model-viewer-hint--hidden');
            }

            viewer.addEventListener('pointerdown', hide, { once: true });
            viewer.addEventListener('touchstart', hide, { once: true });

            setTimeout(hide, HINT_HIDE_DELAY_MS);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            window.scrollTo(0, 0);
            setupHints();
            runHeroEntrance();
        });
    } else {
        window.scrollTo(0, 0);
        setupHints();
        runHeroEntrance();
    }

    var timeBlackScreen = setTimeout(blackScreen, 4200);

    function blackScreen() {
        var el = document.querySelector('.black-screen');
        if (el) el.classList.remove('black-index');
        clearTimeout(timeBlackScreen);
    }
})();
