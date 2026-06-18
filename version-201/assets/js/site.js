(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function getBase() {
    return document.body.getAttribute('data-base') || './';
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-box]'));
    if (!inputs.length || !window.SITE_MOVIES) {
      return;
    }
    var base = getBase();

    inputs.forEach(function (input) {
      var wrap = input.closest('[data-search-wrap]');
      var panel = wrap ? wrap.querySelector('[data-search-results]') : null;
      if (!panel) {
        return;
      }

      function render() {
        var keyword = normalizeText(input.value);
        if (!keyword) {
          panel.classList.remove('open');
          panel.innerHTML = '';
          return;
        }
        var matches = window.SITE_MOVIES.filter(function (item) {
          var haystack = normalizeText([
            item.title,
            item.region,
            item.type,
            item.genre,
            item.tags,
            item.year
          ].join(' '));
          return haystack.indexOf(keyword) !== -1;
        }).slice(0, 12);

        if (!matches.length) {
          panel.classList.add('open');
          panel.innerHTML = '<div class="search-result"><div></div><div><strong>没有找到匹配内容</strong><span>换个关键词试试</span></div></div>';
          return;
        }

        panel.innerHTML = matches.map(function (item) {
          return '<a class="search-result" href="' + base + item.href + '">' +
            '<img src="' + base + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
            '<div><strong>' + escapeHtml(item.title) + '</strong>' +
            '<span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span></div>' +
            '</a>';
        }).join('');
        panel.classList.add('open');
      }

      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      document.addEventListener('click', function (event) {
        if (wrap && !wrap.contains(event.target)) {
          panel.classList.remove('open');
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupFilters() {
    var grid = document.querySelector('[data-card-grid]');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var input = document.querySelector('[data-filter-input]');
    var year = document.querySelector('[data-year-filter]');
    var region = document.querySelector('[data-region-filter]');

    function apply() {
      var keyword = normalizeText(input ? input.value : '');
      var yearValue = year ? year.value : 'all';
      var regionValue = region ? region.value : 'all';

      cards.forEach(function (card) {
        var title = normalizeText(card.getAttribute('data-title'));
        var tags = normalizeText(card.getAttribute('data-tags'));
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var keywordMatch = !keyword || title.indexOf(keyword) !== -1 || tags.indexOf(keyword) !== -1;
        var yearMatch = yearValue === 'all' || cardYear === yearValue;
        var regionMatch = regionValue === 'all' || cardRegion === regionValue;
        card.style.display = keywordMatch && yearMatch && regionMatch ? '' : 'none';
      });
    }

    [input, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function setupPlayer() {
    var shell = document.querySelector('.player-shell');
    if (!shell) {
      return;
    }
    var video = shell.querySelector('video[data-stream]');
    var trigger = shell.querySelector('[data-play-trigger]');
    if (!video || !trigger) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var hasStarted = false;

    function startPlayback() {
      if (!stream) {
        return;
      }
      trigger.classList.add('is-hidden');
      if (!hasStarted) {
        hasStarted = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        }
      } else {
        video.play().catch(function () {});
      }
    }

    trigger.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (!hasStarted) {
        startPlayback();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupFilters();
    setupPlayer();
  });
})();
