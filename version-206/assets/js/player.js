(function () {
  window.initMoviePlayer = function (url, playerId) {
    const root = document.getElementById(playerId);
    if (!root) {
      return;
    }

    const video = root.querySelector("video");
    const cover = root.querySelector(".player-cover");
    let loaded = false;

    const attach = function () {
      if (loaded || !video) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = url;
      }
    };

    const start = function () {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    };

    if (cover) {
      cover.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
  };
})();
