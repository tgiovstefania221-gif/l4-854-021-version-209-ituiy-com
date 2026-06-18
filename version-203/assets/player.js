(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function getCloudflareIframeUrl(source) {
    var match = String(source || "").match(/cloudflarestream\.com\/([^/]+)\/manifest\/video\.m3u8/i);
    if (!match) {
      return "";
    }
    return "https://iframe.videodelivery.net/" + match[1];
  }

  function setMessage(player, message) {
    var target = player.querySelector("[data-player-message]");
    if (target) {
      target.textContent = message;
    }
  }

  function attachWithHlsClass(HlsClass, video, source) {
    if (!HlsClass || !HlsClass.isSupported || !HlsClass.isSupported()) {
      return false;
    }
    var hls = new HlsClass({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    video._hlsInstance = hls;
    return true;
  }

  function attachNative(video, source) {
    var canPlay = video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
    if (!canPlay) {
      return false;
    }
    video.src = source;
    return true;
  }

  function attachIframeFallback(player, source) {
    var iframeUrl = getCloudflareIframeUrl(source);
    if (!iframeUrl) {
      return false;
    }
    var stage = player.querySelector("[data-player-stage]");
    var video = player.querySelector("video");
    if (!stage) {
      return false;
    }
    if (video) {
      video.remove();
    }
    var iframe = document.createElement("iframe");
    iframe.src = iframeUrl;
    iframe.title = player.getAttribute("data-title") || "在线播放";
    iframe.allow = "accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;";
    iframe.allowFullscreen = true;
    stage.appendChild(iframe);
    return true;
  }

  async function startPlayer(player) {
    var source = player.getAttribute("data-video-src");
    var video = player.querySelector("video");
    var overlay = player.querySelector("[data-player-overlay]");
    if (!source || !video) {
      setMessage(player, "当前页面缺少可播放地址。");
      return;
    }

    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    setMessage(player, "正在初始化播放源，请稍候……");

    try {
      var attached = attachNative(video, source);

      if (!attached && window.Hls) {
        attached = attachWithHlsClass(window.Hls, video, source);
      }

      if (!attached) {
        try {
          var module = await import("./hls-vendor-bbsaiqh1.js");
          attached = attachWithHlsClass(module.H, video, source);
        } catch (importError) {
          attached = false;
        }
      }

      if (attached) {
        await video.play();
        setMessage(player, "播放器已启动，可使用进度条、音量和全屏按钮控制播放。");
        return;
      }

      if (attachIframeFallback(player, source)) {
        setMessage(player, "已切换到兼容播放模式，可直接点击画面播放。");
        return;
      }

      setMessage(player, "当前浏览器不支持此播放源，请换用支持 HLS 的浏览器访问。");
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    } catch (error) {
      if (attachIframeFallback(player, source)) {
        setMessage(player, "已切换到兼容播放模式，可直接点击画面播放。");
        return;
      }
      setMessage(player, "播放初始化失败，请刷新页面后重试。");
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-video-player]"));
    players.forEach(function (player) {
      var button = player.querySelector("[data-player-start]");
      if (!button) {
        return;
      }
      button.addEventListener("click", function () {
        startPlayer(player);
      });
    });
  }

  ready(setupPlayers);
})();
