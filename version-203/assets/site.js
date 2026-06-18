(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var previous = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function restartTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot") || 0));
        restartTimer();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(activeIndex - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(activeIndex + 1);
        restartTimer();
      });
    }

    if (slides.length > 1) {
      restartTimer();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupLocalCardFilter() {
    var input = document.querySelector("[data-card-filter]");
    if (!input) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var countTarget = document.querySelector("[data-filter-count]");

    function filterCards() {
      var keyword = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type")
        ].join(" "));
        var match = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });
      if (countTarget) {
        countTarget.textContent = String(visible);
      }
    }

    input.addEventListener("input", filterCards);
    filterCards();
  }

  function buildSearchCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="movie-poster" href="' + movie.url + '" aria-label="查看 ' + escapeHtml(movie.title) + ' 详情">',
      '    <img src="' + movie.poster + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
      '    <span class="movie-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="movie-play">播放</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.rating) + ' 分</span></div>',
      '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="chip-row"><span class="chip">' + escapeHtml(movie.category) + '</span></div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var resultTarget = document.querySelector("[data-search-results]");
    var counter = document.querySelector("[data-search-count]");
    if (!form || !resultTarget || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var queryInput = form.querySelector("[name='q']");
    var typeSelect = form.querySelector("[name='type']");
    var regionSelect = form.querySelector("[name='region']");
    var yearSelect = form.querySelector("[name='year']");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    queryInput.value = initialQuery;

    function search() {
      var keyword = normalize(queryInput.value);
      var type = normalize(typeSelect.value);
      var region = normalize(regionSelect.value);
      var year = normalize(yearSelect.value);
      var results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.type,
          movie.region,
          movie.year,
          movie.genre,
          movie.tags,
          movie.category,
          movie.oneLine
        ].join(" "));
        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }
        if (type && normalize(movie.type).indexOf(type) === -1) {
          return false;
        }
        if (region && normalize(movie.region).indexOf(region) === -1) {
          return false;
        }
        if (year && normalize(movie.year) !== year) {
          return false;
        }
        return true;
      }).slice(0, 240);

      if (counter) {
        counter.textContent = String(results.length);
      }

      if (!results.length) {
        resultTarget.innerHTML = '<div class="empty-state">没有找到匹配影片，请尝试更换关键词、地区或年份。</div>';
        return;
      }

      resultTarget.innerHTML = results.map(buildSearchCard).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var nextUrl = new URL(window.location.href);
      if (queryInput.value.trim()) {
        nextUrl.searchParams.set("q", queryInput.value.trim());
      } else {
        nextUrl.searchParams.delete("q");
      }
      window.history.replaceState(null, "", nextUrl.toString());
      search();
    });

    [queryInput, typeSelect, regionSelect, yearSelect].forEach(function (field) {
      field.addEventListener("input", search);
      field.addEventListener("change", search);
    });

    search();
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupLocalCardFilter();
    setupSearchPage();
  });
})();
