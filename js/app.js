// Theme cycle: system -> dark -> light -> system.
// "system" = no data-theme attribute; CSS follows prefers-color-scheme.
(function () {
    var MODES = ['system', 'dark', 'light'];
    var LABELS = { system: '-- System', dark: '-- Dark', light: '-- Light' };

    function currentMode() {
        var stored = null;
        try { stored = localStorage.getItem('theme'); } catch (e) {}
        return MODES.indexOf(stored) > 0 ? stored : 'system';
    }

    function apply(mode) {
        var root = document.documentElement;
        if (mode === 'system') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', mode);
        }
        var toggle = document.getElementById('theme-toggle');
        MODES.forEach(function (m) {
            // setAttribute, not .hidden — SVGElement has no hidden property.
            var icon = document.getElementById('icon-' + m);
            if (m === mode) icon.removeAttribute('hidden');
            else icon.setAttribute('hidden', '');
        });
        toggle.querySelector('.mode-text').textContent = LABELS[mode];
    }

    document.addEventListener('DOMContentLoaded', function () {
        apply(currentMode());
        document.getElementById('theme-toggle').addEventListener('click', function () {
            var next = MODES[(MODES.indexOf(currentMode()) + 1) % MODES.length];
            try { localStorage.setItem('theme', next); } catch (e) {}
            apply(next);
        });
    });
})();
