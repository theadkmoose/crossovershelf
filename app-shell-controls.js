/* Crossover Shelf — lightweight app controls: refresh + launch splash */
(() => {
  "use strict";
  const STYLE_ID = "cs-shell-controls-style";
  const SPLASH_KEY = "crossoverShelfSplashShownV1";

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #cs-refresh-btn{position:fixed;right:16px;top:16px;z-index:9000;border:1px solid var(--ink-line,#363b47);background:var(--ink-2,#1b1f28);color:var(--text,#eee);border-radius:999px;padding:8px 12px;min-height:36px;cursor:pointer;font:600 12px 'IBM Plex Sans',sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.16)}
      #cs-refresh-btn:hover{border-color:var(--brass,#c89a3c)}
      #cs-launch-splash{position:fixed;inset:0;z-index:20000;display:flex;align-items:center;justify-content:center;background:#12151d;color:#f2eee5;opacity:1;transition:opacity .28s ease;pointer-events:auto}
      #cs-launch-splash.cs-hidden{opacity:0;pointer-events:none}
      .cs-splash-inner{text-align:center;padding:30px}
      .cs-splash-mark{width:76px;height:76px;border-radius:20px;margin:0 auto 18px;object-fit:cover;box-shadow:0 12px 35px rgba(0,0,0,.28)}
      .cs-splash-title{font:700 25px 'Fraunces',serif;letter-spacing:.01em}
      .cs-splash-sub{margin-top:7px;color:#a7acb7;font:400 12px 'IBM Plex Sans',sans-serif;letter-spacing:.04em}
      .cs-splash-line{width:34px;height:2px;background:#c89a3c;margin:18px auto 0;border-radius:2px;animation:csSplashPulse 1s ease-in-out infinite alternate}
      @keyframes csSplashPulse{from{opacity:.35;transform:scaleX(.7)}to{opacity:1;transform:scaleX(1)}}
      @media(max-width:700px){#cs-refresh-btn{right:12px;top:calc(10px + env(safe-area-inset-top));font-size:11px;padding:7px 10px}.cs-splash-title{font-size:23px}}
    `;
    document.head.appendChild(style);
  }

  function createRefresh() {
    if (document.getElementById("cs-refresh-btn")) return;
    const btn = document.createElement("button");
    btn.id = "cs-refresh-btn";
    btn.type = "button";
    btn.textContent = "↻ Refresh";
    btn.title = "Refresh Crossover Shelf";
    btn.setAttribute("aria-label", "Refresh Crossover Shelf");
    btn.addEventListener("click", () => {
      btn.disabled = true;
      btn.textContent = "↻ Refreshing…";
      window.location.reload();
    });
    document.body.appendChild(btn);
  }

  function createSplash() {
    if (document.getElementById("cs-launch-splash")) return;
    const splash = document.createElement("div");
    splash.id = "cs-launch-splash";
    splash.setAttribute("role", "status");
    splash.setAttribute("aria-label", "Loading Crossover Shelf");
    splash.innerHTML = `<div class="cs-splash-inner"><img class="cs-splash-mark" src="icon-192.png" alt=""><div class="cs-splash-title">Crossover Shelf</div><div class="cs-splash-sub">Literary Awards × Genre Fiction</div><div class="cs-splash-line"></div></div>`;
    document.body.appendChild(splash);
    const dismiss = () => {
      splash.classList.add("cs-hidden");
      setTimeout(() => splash.remove(), 320);
    };
    window.requestAnimationFrame(() => setTimeout(dismiss, 850));
  }

  function init() {
    addStyles();
    createSplash();
    createRefresh();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();
