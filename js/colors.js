(function () {
    'use strict';

    const root = document.documentElement;
    root.style.setProperty('--background', '#111111');
    root.style.setProperty('--color-text', '#F1F4FF');
    root.style.setProperty('--contrast', '#F1F4FF');

    const preloadEl = document.getElementById('preload');
    const barFill = document.getElementById('preload-bar-fill');
    const percentEl = document.getElementById('preload-percent');

    function setProgress(percent) {
        const p = Math.min(100, Math.max(0, Math.round(percent)));
        if (percentEl) percentEl.textContent = p + '%';
        if (barFill) barFill.style.width = p + '%';
    }

    function hidePreload() {
        if (!preloadEl) return;
        preloadEl.classList.add('preload--done');
        setTimeout(function () { preloadEl.style.display = 'none'; }, 520);
    }

    function onLoadDone() {
        setProgress(100);
        setTimeout(hidePreload, 380);
    }

    const heroViewer = document.querySelector('#model-viewer');
    if (heroViewer && barFill && percentEl) {
        heroViewer.addEventListener('progress', function (evt) {
            const total = (evt.detail && typeof evt.detail.totalProgress === 'number') ? evt.detail.totalProgress : 0;
            setProgress(total * 100);
            if (total >= 1) onLoadDone();
        });
        heroViewer.addEventListener('load', onLoadDone);
    } else {
        onLoadDone();
    }
    setTimeout(function () {
        if (preloadEl && !preloadEl.classList.contains('preload--done')) hidePreload();
    }, 10000);

    $( '.color-1' ).on('click', function () {
        root.style.setProperty('--background', '#111111');
        root.style.setProperty('--color-text', '#ECEBF3');
        root.style.setProperty('--contrast', '#ECEBF3');
    });

    $( '.color-2' ).on('click', function () {
        root.style.setProperty('--background', '#a4c5c5');
        root.style.setProperty('--color-text', '#F1F4FF');
        root.style.setProperty('--contrast', '#F1F4FF');
    });

    $( '.color-3' ).on('click', function () {
        root.style.setProperty('--background', '#E2C2C6');
        root.style.setProperty('--color-text', '#1D2B28');
        root.style.setProperty('--contrast', '#1D2B28');
    });

    $( '.color-4' ).on('click', function () {
        root.style.setProperty('--background', '#FDFFFC');
        root.style.setProperty('--color-text', '#011627');
        root.style.setProperty('--contrast', '#011627');
    });
})();
