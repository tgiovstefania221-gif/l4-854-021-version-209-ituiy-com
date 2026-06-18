(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function filterCards(input) {
        var scope = input.closest("main") || document;
        var query = input.value.trim().toLowerCase();
        var cards = scope.querySelectorAll(".movie-card[data-search]");
        var shown = 0;
        cards.forEach(function (card) {
            var text = card.getAttribute("data-search").toLowerCase();
            var matched = !query || text.indexOf(query) !== -1;
            card.style.display = matched ? "" : "none";
            if (matched) {
                shown += 1;
            }
        });
        var empty = scope.querySelector("[data-empty]");
        if (empty) {
            empty.classList.toggle("is-visible", shown === 0);
        }
    }

    ready(function () {
        var navButton = document.querySelector("[data-nav-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (navButton && mobileMenu) {
            navButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var searchButton = document.querySelector("[data-search-toggle]");
        var searchPanel = document.querySelector("[data-search-panel]");
        if (searchButton && searchPanel) {
            searchButton.addEventListener("click", function () {
                searchPanel.classList.toggle("is-open");
                var input = searchPanel.querySelector("input");
                if (input && searchPanel.classList.contains("is-open")) {
                    input.focus();
                }
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var thumbs = Array.prototype.slice.call(hero.querySelectorAll(".hero-thumb"));
            var current = 0;
            var timer = null;
            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === current);
                });
                thumbs.forEach(function (thumb, i) {
                    thumb.classList.toggle("active", i === current);
                });
            }
            function play() {
                if (slides.length < 2) {
                    return;
                }
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
            thumbs.forEach(function (thumb, i) {
                thumb.addEventListener("click", function () {
                    show(i);
                    if (timer) {
                        window.clearInterval(timer);
                    }
                    play();
                });
            });
            show(0);
            play();
        }

        var filters = document.querySelectorAll(".filter-input");
        filters.forEach(function (input) {
            input.addEventListener("input", function () {
                filterCards(input);
            });
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q && filters.length) {
            filters[0].value = q;
            filterCards(filters[0]);
        }
    });
})();
