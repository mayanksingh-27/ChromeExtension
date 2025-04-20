(function () {
  const DEBUG = true;
  let url = location.href, adSeen = false, speed = 1;
  let forcePlayOnce = false;

  log("🎯 Ad skipper loaded");

  setInterval(() => {
    const vid = document.querySelector("video");
    const ad = document.querySelector(".ad-showing");

    if (location.href !== url) {
      url = location.href;
      removePageAds();
    }

    if (ad && vid) {
      adSeen = true;
      vid.playbackRate = 10;
      vid.volume = 0;

      document.querySelectorAll(".ytp-ad-skip-button, .ytp-ad-skip-button-modern").forEach(btn => btn.click());

      if (isFinite(vid.duration) && vid.duration > 0) {
        vid.currentTime = vid.duration - 0.2;
        vid.play();
        forcePlayOnce = true; // allow autoplay once after ad
        log("⏩ Skipped ad");
      } else {
        log("⏳ Waiting for video duration...", "warn");
      }

    } else if (vid) {
      if (vid.playbackRate === 10) vid.playbackRate = speed;
      if (adSeen) {
        adSeen = false;
        vid.playbackRate = speed = 1;
        vid.volume = 1;
        forcePlayOnce = true; // allow one autoplay after ad
        log("✅ Restored normal playback");
      } else {
        speed = vid.playbackRate;
      }
    }
  }, 100);

  // Clean up popups + safely auto-play
  setInterval(() => {
    const overlay = document.querySelector("tp-yt-iron-overlay-backdrop");
    const popup = document.querySelector("ytd-enforcement-message-view-model");
    const dismissBtn = document.getElementById("dismiss-button");

    if (overlay) overlay.remove();
    if (popup) popup.remove();
    if (dismissBtn) dismissBtn.click();

    const vid = document.querySelector("video");
    if (vid && vid.paused && forcePlayOnce) {
      vid.play();
      forcePlayOnce = false;
      log("▶️ Resumed video after ad/popup");
    }
  }, 1000);

  function removePageAds() {
    const style = document.createElement("style");
    style.textContent = `
      ytd-display-ad-renderer, ytd-in-feed-ad-layout-renderer,
      ytd-action-companion-ad-renderer, ytd-ad-slot-renderer,
      yt-about-this-ad-renderer, yt-mealbar-promo-renderer,
      #player-ads, #masthead-ad, masthead-ad, .ytd-video-masthead-ad-v3-renderer {
        display: none !important;
      }`;
    document.head.appendChild(style);
    log("🧹 Removed page ads");
  }

  function log(msg, type = "log") {
    if (!DEBUG) return;
    console[type](`[AdCleaner] ${msg}`);
  }
})();
