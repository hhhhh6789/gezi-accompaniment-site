(function(){
  "use strict";
  var visibilityThreshold = 0.2;

  function markup(){
    return '<div class="musician-video-wrap">'+
      '<video id="musician-animation" width="960" height="640" muted loop playsinline preload="metadata" poster="assets/videos/musician-b-poster.png" src="assets/videos/musician-b-loop-v2-7.25s.mp4" aria-label="小琴师无声循环动画"></video>'+
      '<img class="musician-static-poster" src="assets/videos/musician-b-poster.png" width="960" height="640" alt="" aria-hidden="true">'+
    '</div>';
  }

  function mount(root){
    var wrap = root.querySelector('.musician-video-wrap');
    if(!wrap) return function(){};
    var video = wrap.querySelector('video');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var disposed = false, pageActive = true, playPending = false, autoBlocked = false;
    var inView = false;
    video.muted = true;

    function measureView(){
      var rect = wrap.getBoundingClientRect();
      var width = Math.max(0, Math.min(rect.right, window.innerWidth)-Math.max(rect.left, 0));
      var height = Math.max(0, Math.min(rect.bottom, window.innerHeight)-Math.max(rect.top, 0));
      return rect.width > 0 && rect.height > 0 && width*height/(rect.width*rect.height) >= visibilityThreshold;
    }
    function allowed(){
      return !disposed && pageActive && !document.hidden && inView && !reduce.matches && !autoBlocked;
    }
    function status(){
      wrap.classList.toggle('musician-show-poster', !!video.error || reduce.matches);
    }
    function reconcile(){
      if(!allowed()){
        video.pause();
      }else if(video.paused && !playPending){
        playPending = true;
        video.play().then(function(){
          playPending = false;
          // A pending play() must not restart a detached or background player.
          if(!allowed()) video.pause();
          if(!disposed) status();
        }).catch(function(error){
          playPending = false;
          if(!disposed){
            if(error.name !== 'AbortError') autoBlocked = true;
            status();
            if(error.name === 'AbortError' && allowed()) reconcile();
          }
        });
      }
      status();
    }
    function visibility(){
      inView = measureView();
      reconcile();
    }
    function motionChange(){
      reconcile();
    }
    function pageHide(){pageActive = false; reconcile();}
    function pageShow(){pageActive = true; visibility();}
    function mediaError(){autoBlocked = true; reconcile();}
    var observer = new IntersectionObserver(function(entries){
      if(disposed) return;
      inView = entries[0].isIntersecting && entries[0].intersectionRatio >= visibilityThreshold;
      reconcile();
    }, {threshold:[0, visibilityThreshold]});

    video.addEventListener('error', mediaError);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', pageHide);
    window.addEventListener('pageshow', pageShow);
    reduce.addEventListener('change', motionChange);
    inView = measureView();
    status();
    observer.observe(wrap);
    reconcile();

    return function(){
      if(disposed) return;
      disposed = true;
      observer.disconnect();
      video.removeEventListener('error', mediaError);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', pageHide);
      window.removeEventListener('pageshow', pageShow);
      reduce.removeEventListener('change', motionChange);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }
  window.GeziMusician = {markup:markup, mount:mount};
})();
