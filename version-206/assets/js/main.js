(function () {
  const searchToggle = document.querySelector("[data-search-toggle]");
  const searchPanel = document.querySelector("[data-search-panel]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener("click", function () {
      searchPanel.classList.toggle("is-open");
      const input = searchPanel.querySelector("input");
      if (searchPanel.classList.contains("is-open") && input) {
        input.focus();
      }
    });
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero-carousel]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let active = 0;
    let timer = null;

    const show = function (index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
    };

    const move = function (step) {
      show(active + step);
    };

    const restart = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        move(1);
      }, 5200);
    };

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        restart();
      });
    }

    restart();
  }

  const filterInput = document.querySelector("[data-filter-input]");
  const cards = Array.from(document.querySelectorAll(".filter-card"));
  const empty = document.querySelector("[data-empty-results]");
  const chips = Array.from(document.querySelectorAll("[data-filter-chip]"));

  if (filterInput && cards.length) {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";

    const applyFilter = function (value) {
      const query = String(value || "").trim().toLowerCase();
      let visible = 0;
      cards.forEach(function (card) {
        const text = (card.getAttribute("data-filter") || card.textContent || "").toLowerCase();
        const matched = !query || text.indexOf(query) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
      chips.forEach(function (chip) {
        chip.classList.toggle("is-active", (chip.getAttribute("data-filter-chip") || "") === query);
      });
    };

    filterInput.value = initial;
    applyFilter(initial);

    filterInput.addEventListener("input", function () {
      applyFilter(filterInput.value);
    });

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        const value = chip.getAttribute("data-filter-chip") || "";
        filterInput.value = value;
        applyFilter(value);
      });
    });
  }
})();
