(function(){
  var video=document.querySelector("[data-player]");
  if(!video)return;
  var src=video.getAttribute("data-play")||"";
  var layer=document.querySelector("[data-play-layer]");
  var button=document.querySelector("[data-play-button]");
  var hls=null;
  var ready=false;
  var want=false;
  function runPlay(){
    var p=video.play();
    if(p&&p.catch){p.catch(function(){})}
  }
  function prepare(){
    if(ready)return;
    ready=true;
    if(window.Hls&&window.Hls.isSupported()){
      hls=new window.Hls({enableWorker:true,lowLatencyMode:true});
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED,function(){if(want)runPlay()});
      hls.on(window.Hls.Events.ERROR,function(e,data){
        if(!data||!data.fatal)return;
        if(data.type===window.Hls.ErrorTypes.NETWORK_ERROR){hls.startLoad()}
        else if(data.type===window.Hls.ErrorTypes.MEDIA_ERROR){hls.recoverMediaError()}
        else{hls.destroy()}
      });
    }else if(video.canPlayType("application/vnd.apple.mpegurl")){
      video.src=src;
    }
  }
  function play(){
    want=true;
    prepare();
    video.controls=true;
    if(layer)layer.classList.add("is-hidden");
    runPlay();
  }
  if(layer)layer.addEventListener("click",play);
  if(button)button.addEventListener("click",play);
  video.addEventListener("click",function(){if(video.paused)play()});
})();