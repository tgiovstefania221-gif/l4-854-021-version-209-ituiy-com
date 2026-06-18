(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startAuto() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startAuto();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startAuto();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startAuto();
            });
        }

        startAuto();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var input = filterPanel.querySelector('[data-filter-input]');
        var select = filterPanel.querySelector('[data-filter-category]');
        var count = filterPanel.querySelector('[data-filter-count]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (input && query) {
            input.value = query;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var category = normalize(select ? select.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-category')
                ].join(' '));
                var cardCategory = normalize(card.getAttribute('data-category'));
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedCategory = !category || cardCategory === category;
                var matched = matchedKeyword && matchedCategory;

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部';
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (select) {
            select.addEventListener('change', applyFilter);
        }

        applyFilter();
    }

    function bootPlayer(wrapper) {
        var video = wrapper.querySelector('video');
        var cover = wrapper.querySelector('.player-cover');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-source') || (cover && cover.getAttribute('data-source'));

        if (!source) {
            return;
        }

        if (cover) {
            cover.classList.add('is-hidden');
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.getAttribute('src')) {
                video.setAttribute('src', source);
            }

            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!video._hlsInstance) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(source);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            }

            video.play().catch(function () {});
            return;
        }

        if (!video.getAttribute('src')) {
            video.setAttribute('src', source);
        }

        video.play().catch(function () {});
    }

    document.querySelectorAll('[data-player]').forEach(function (wrapper) {
        var cover = wrapper.querySelector('.player-cover');
        var video = wrapper.querySelector('video');

        if (cover) {
            cover.addEventListener('click', function () {
                bootPlayer(wrapper);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    bootPlayer(wrapper);
                }
            });
        }
    });
})();
