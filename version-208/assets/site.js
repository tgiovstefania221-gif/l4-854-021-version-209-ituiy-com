document.addEventListener('DOMContentLoaded', function () {
  var searchToggle = document.querySelector('[data-search-toggle]');
  var searchPanel = document.querySelector('[data-search-panel]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', function () {
      searchPanel.classList.toggle('is-open');
      var input = searchPanel.querySelector('input');
      if (searchPanel.classList.contains('is-open') && input) {
        input.focus();
      }
    });
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var cards = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-card]'));
    var bgs = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-bg]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer;

    var showSlide = function (index) {
      activeIndex = (index + cards.length) % cards.length;
      cards.forEach(function (card, i) {
        card.classList.toggle('is-active', i === activeIndex);
      });
      bgs.forEach(function (bg, i) {
        bg.classList.toggle('is-active', i === activeIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === activeIndex);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    };

    var restart = function () {
      window.clearInterval(timer);
      start();
    };

    cards.forEach(function (card, index) {
      card.addEventListener('mouseenter', function () {
        showSlide(index);
        restart();
      });
    });

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    if (cards.length > 1) {
      start();
    }
  }

  var params = new URLSearchParams(window.location.search);
  var queryFromUrl = params.get('q') || '';
  var searchInput = document.getElementById('siteSearchInput');
  var categoryFilter = document.getElementById('categoryFilter');
  var yearFilter = document.getElementById('yearFilter');
  var localFilter = document.querySelector('[data-local-filter]');
  var localYearFilter = document.querySelector('[data-year-filter]');
  var grids = Array.prototype.slice.call(document.querySelectorAll('[data-card-grid]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var resultCount = document.querySelector('[data-result-count]');

  if (searchInput && queryFromUrl) {
    searchInput.value = queryFromUrl;
  }

  var textOf = function (card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-category') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-genre') || '',
      card.getAttribute('data-tags') || ''
    ].join(' ').toLowerCase();
  };

  var applyFilters = function () {
    var text = ((searchInput && searchInput.value) || (localFilter && localFilter.value) || '').trim().toLowerCase();
    var category = (categoryFilter && categoryFilter.value) || '';
    var year = ((yearFilter && yearFilter.value) || (localYearFilter && localYearFilter.value) || '').trim();
    var visible = 0;

    grids.forEach(function (grid) {
      Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]')).forEach(function (card) {
        var okText = !text || textOf(card).indexOf(text) !== -1;
        var okCategory = !category || card.getAttribute('data-category') === category;
        var okYear = !year || card.getAttribute('data-year') === year;
        var show = okText && okCategory && okYear;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
    if (resultCount) {
      resultCount.textContent = '匹配结果：' + visible;
    }
  };

  [searchInput, categoryFilter, yearFilter, localFilter, localYearFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  if (grids.length && (searchInput || localFilter || categoryFilter || yearFilter || localYearFilter)) {
    applyFilters();
  }
});
