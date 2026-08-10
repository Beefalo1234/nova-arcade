/* NOVA ARCADE — ad slot loader.
   Zero external requests until AD_CONFIG is filled (see README-ADS).
   Slots: ad-top (leaderboard), ad-mid (rectangle). */
"use strict";
(function () {
  const slots = document.querySelectorAll(".ad-slot");
  const cfg = window.AD_CONFIG || {};

  slots.forEach(function (slot) {
    const id = slot.id;
    const conf = cfg[id];
    if (conf && conf.html) {
      // network-provided code (AdSense/Ezoic/etc) injected as-is
      slot.innerHTML = conf.html;
      slot.classList.add("has-ad");
    } else if (conf && conf.src) {
      const f = document.createElement("iframe");
      f.src = conf.src;
      f.setAttribute("scrolling", "no");
      f.style.cssText = "width:100%;height:" + (conf.height || 250) + "px;border:0;overflow:hidden";
      slot.appendChild(f);
      slot.classList.add("has-ad");
    } else {
      // placeholder state — visible "ad space" until a network is configured
      slot.innerHTML = '<span class="ad-label">AD SPACE</span>';
    }
  });
})();

// floating slot close button
(function(){
  const closeBtn = document.getElementById("adClose");
  const floatSlot = document.getElementById("ad-float");
  if (closeBtn && floatSlot) {
    closeBtn.addEventListener("click", () => { floatSlot.style.display = "none"; });
  }
})();
