(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var target = Number(dot.getAttribute("data-target"));
                showSlide(target);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    initListingFilters();
})();

function initListingFilters() {
    var toolBlocks = document.querySelectorAll("[data-listing-tools]");

    toolBlocks.forEach(function (tools) {
        var searchInput = tools.querySelector("[data-listing-search]");
        var grid = document.querySelector("[data-listing-grid]");
        var emptyState = document.querySelector("[data-empty-state]");
        var chips = Array.prototype.slice.call(tools.querySelectorAll(".filter-chip"));
        var activeFilter = "all";

        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

        function applyFilters() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-text") || "").toLowerCase();
                var year = card.getAttribute("data-year") || "";
                var type = card.getAttribute("data-type") || "";
                var matchText = !keyword || text.indexOf(keyword) !== -1;
                var matchFilter = activeFilter === "all" || year === activeFilter || type === activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
                var show = matchText && matchFilter;

                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", applyFilters);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeFilter = chip.getAttribute("data-filter") || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("active", item === chip);
                });
                applyFilters();
            });
        });
    });
}

function initSearchPage() {
    var input = document.getElementById("site-search-input");
    var results = document.getElementById("search-results");
    var title = document.getElementById("search-title");
    var empty = document.getElementById("search-empty");

    if (!input || !results || typeof SiteSearchData === "undefined") {
        return;
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>\"]/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[character];
        });
    }

    function cardTemplate(item) {
        var tags = item.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join("");

        return [
            '<article class="movie-card movie-card-compact">',
            '<a class="movie-thumb" href="' + escapeHtml(item.url) + '" aria-label="观看' + escapeHtml(item.title) + '">',
            '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<span class="movie-play">▶</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
            '<p class="movie-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>',
            '<p class="movie-desc">' + escapeHtml(item.oneLine) + '</p>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function performSearch() {
        var keyword = input.value.trim().toLowerCase();

        if (!keyword) {
            title.textContent = "近期片单";
            empty.classList.remove("is-visible");
            return;
        }

        var matched = SiteSearchData.filter(function (item) {
            return item.searchText.indexOf(keyword) !== -1;
        }).slice(0, 120);

        results.innerHTML = matched.map(cardTemplate).join("");
        title.textContent = "搜索结果";
        empty.classList.toggle("is-visible", matched.length === 0);
    }

    input.addEventListener("input", performSearch);
}

function initMoviePlayer(videoId, coverId, streamUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var connected = false;
    var hlsInstance = null;

    if (!video) {
        return;
    }

    function connect() {
        if (connected) {
            return Promise.resolve();
        }

        connected = true;

        if (typeof Hls !== "undefined" && Hls.isSupported()) {
            return new Promise(function (resolve) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        video.setAttribute("data-error", "1");
                    }
                });
                window.setTimeout(resolve, 900);
            });
        }

        video.src = streamUrl;
        return Promise.resolve();
    }

    function startPlay() {
        connect().then(function () {
            var playTask = video.play();

            if (cover) {
                cover.classList.add("is-hidden");
            }

            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
        });
    }

    if (cover) {
        cover.addEventListener("click", startPlay);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            startPlay();
        }
    });

    video.addEventListener("play", function () {
        if (cover) {
            cover.classList.add("is-hidden");
        }
    });

    video.addEventListener("error", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
