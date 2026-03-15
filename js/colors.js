(function () {
    'use strict';

    const root = document.documentElement;
    root.style.setProperty('--background', '#0C120C');
    root.style.setProperty('--color-text', '#F1F4FF');
    root.style.setProperty('--contrast', '#F1F4FF');

    function hidePreload() {
        if (typeof $ === 'undefined') {
            const preload = document.querySelector('.preload');
            if (preload) preload.style.display = 'none';
        } else {
            $('.preload').fadeOut('fast');
        }
    }

    const modelViewer = document.querySelector('#model-viewer');
    if (modelViewer) {
        modelViewer.addEventListener('model-visibility', function () {
            setTimeout(hidePreload, 2000);
        });
    }
    /* Fallback: hide preload after 8s if model-viewer never fires */
    setTimeout(hidePreload, 8000);

    $( '.color-1' ).on('click', function () {
        root.style.setProperty('--background', '#0C120C');
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
