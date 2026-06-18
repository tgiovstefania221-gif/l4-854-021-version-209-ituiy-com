(function () {
    window.initVideoPlayer = function (videoUrl) {
        var video = document.getElementById("videoPlayer");
        var overlay = document.getElementById("playButton");
        if (!video || !overlay || !videoUrl) {
            return;
        }
        var prepared = false;
        var hlsInstance = null;
        function attach() {
            if (prepared) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = videoUrl;
            }
            prepared = true;
        }
        function start() {
            attach();
            overlay.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }
        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                overlay.classList.remove("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
