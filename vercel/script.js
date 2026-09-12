// Theme toggle (light/dark, system-aware default), scroll-spy nav, section reveal.
(function () {
    document.documentElement.classList.add('js');

    function effectiveTheme() {
        var explicit = document.documentElement.getAttribute('data-theme');
        if (explicit) return explicit;
        return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function syncIcon() {
        // Show the icon for what a click switches TO.
        var dark = effectiveTheme() === 'dark';
        document.getElementById('icon-sun').toggleAttribute('hidden', !dark);
        document.getElementById('icon-moon').toggleAttribute('hidden', dark);
    }

    document.addEventListener('DOMContentLoaded', function () {
        syncIcon();
        document.getElementById('theme-toggle').addEventListener('click', function () {
            var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) { }
            syncIcon();
        });

        // Scroll spy: highlight the nav link of the section in view.
        var links = document.querySelectorAll('.side-nav a');
        var byId = {};
        links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    links.forEach(function (a) { a.classList.remove('active'); });
                    byId[entry.target.id].classList.add('active');
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px' });

        // Reveal sections as they enter the viewport.
        var reveal = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    reveal.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('main section').forEach(function (s) {
            spy.observe(s);
            reveal.observe(s);
        });
    });
})();
