(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.from((scope || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = qs("[data-menu-toggle]");
        var nav = qs("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            toggle.textContent = nav.classList.contains("is-open") ? "×" : "☰";
        });
    }

    function initHero() {
        var slider = qs("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = qsa(".hero-slide", slider);
        var dots = qsa("[data-hero-dot]", slider);
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }
        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5600);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });
        slider.addEventListener("mouseenter", function () {
            clearInterval(timer);
        });
        slider.addEventListener("mouseleave", play);
        play();
    }

    function initFilterLists() {
        qsa("[data-filter-list]").forEach(function (bar) {
            var wrap = bar.parentElement;
            var cards = qsa(".movie-card", wrap);
            var keyword = qs("[data-filter-keyword]", bar);
            var year = qs("[data-filter-year]", bar);
            var region = qs("[data-filter-region]", bar);
            function apply() {
                var key = (keyword && keyword.value || "").trim().toLowerCase();
                var y = year && year.value || "";
                var r = region && region.value || "";
                cards.forEach(function (card) {
                    var text = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.year].join(" ").toLowerCase();
                    var ok = (!key || text.indexOf(key) > -1) && (!y || card.dataset.year === y) && (!r || card.dataset.region === r);
                    card.classList.toggle("is-hidden-card", !ok);
                });
            }
            [keyword, year, region].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", apply);
                    el.addEventListener("change", apply);
                }
            });
        });
    }

    function cardHtml(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\">",
            "<a class=\"movie-card-link\" href=\"" + movie.url + "\">",
            "<div class=\"movie-thumb\">",
            "<img src=\"" + movie.image + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"movie-year\">" + escapeHtml(movie.year) + "</span>",
            "<span class=\"play-glow\">▶</span>",
            "</div>",
            "<div class=\"movie-card-body\">",
            "<div class=\"card-tags\">" + tags + "</div>",
            "<h2>" + escapeHtml(movie.title) + "</h2>",
            "<p>" + escapeHtml(movie.one) + "</p>",
            "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
            "</div>",
            "</a>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function initSearch() {
        var form = qs("[data-search-form]");
        var input = qs("[data-search-input]");
        var results = qs("[data-search-results]");
        var suggestions = qs("[data-search-suggestions]");
        if (!form || !input || !results || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function render(term) {
            var key = term.trim().toLowerCase();
            if (!key) {
                results.innerHTML = "";
                if (suggestions) {
                    suggestions.style.display = "block";
                }
                return;
            }
            var matched = window.SEARCH_MOVIES.filter(function (movie) {
                return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.one, (movie.tags || []).join(" ")].join(" ").toLowerCase().indexOf(key) > -1;
            }).slice(0, 80);
            if (suggestions) {
                suggestions.style.display = "none";
            }
            if (!matched.length) {
                results.innerHTML = "<p class=\"result-title\">未找到相关影片</p>";
                return;
            }
            results.innerHTML = "<p class=\"result-title\">搜索结果</p><div class=\"movie-grid\">" + matched.map(cardHtml).join("") + "</div>";
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var value = input.value.trim();
            var url = new URL(window.location.href);
            if (value) {
                url.searchParams.set("q", value);
            } else {
                url.searchParams.delete("q");
            }
            window.history.replaceState({}, "", url.toString());
            render(value);
        });
        input.addEventListener("input", function () {
            render(input.value);
        });
        render(initial);
    }

    function bootPlayer(id, src) {
        var video = document.getElementById(id);
        if (!video || !src) {
            return;
        }
        var cover = document.querySelector("[data-player-for='" + id + "']");
        var hlsInstance = null;
        function load() {
            if (video.dataset.ready === "1") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }
            video.dataset.ready = "1";
        }
        function start() {
            load();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.MovieSite = {
        bootPlayer: bootPlayer
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilterLists();
        initSearch();
    });
})();
