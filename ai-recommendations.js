/* Crossover Shelf — AI recommendations
 * Browser-only Gemini integration. The API key is stored locally on the device,
 * never committed to the repository, and is sent directly to Google's API.
 */
(() => {
  "use strict";

  const STORAGE_KEY = "crossoverShelfAISettings";
  const CACHE_KEY = "crossoverShelfAIRecommendations";
  const DEFAULT_MODEL = "gemini-2.5-flash";
  const API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models/";

  const esc = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function loadSettings() {
    try {
      return Object.assign({ apiKey: "", model: DEFAULT_MODEL }, JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch (_) {
      return { apiKey: "", model: DEFAULT_MODEL };
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function loadRecommendationCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch (_) { return {}; }
  }

  function saveRecommendationCache(cache) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (_) {}
  }

  function injectStyles() {
    if (document.getElementById("cs-ai-styles")) return;
    const style = document.createElement("style");
    style.id = "cs-ai-styles";
    style.textContent = `
      #cs-ai-settings, #cs-ai-results { position:fixed; inset:0; z-index:9999; display:none; align-items:center; justify-content:center; padding:20px; background:rgba(6,8,12,.78); backdrop-filter:blur(4px); }
      #cs-ai-settings.open, #cs-ai-results.open { display:flex; }
      .cs-ai-panel { width:min(720px,100%); max-height:88vh; overflow:auto; background:var(--ink-2,#1b1f28); color:var(--text,#eee); border:1px solid var(--ink-line,#363b47); border-radius:18px; box-shadow:0 24px 80px rgba(0,0,0,.4); padding:24px; }
      .cs-ai-panel h2 { margin:0 0 6px; font-family:'Fraunces',serif; font-size:1.35rem; }
      .cs-ai-panel .cs-ai-sub { margin:0 0 20px; color:var(--text-dim,#a7acb7); font-size:.82rem; line-height:1.5; }
      .cs-ai-label { display:block; margin:14px 0 6px; font-family:'IBM Plex Mono',monospace; font-size:.68rem; text-transform:uppercase; letter-spacing:.08em; color:var(--text-dim,#a7acb7); }
      .cs-ai-input { width:100%; box-sizing:border-box; border:1px solid var(--ink-line,#363b47); background:var(--ink-3,#242934); color:var(--text,#eee); border-radius:9px; padding:11px 12px; font:inherit; outline:none; }
      .cs-ai-input:focus { border-color:var(--brass,#c89a3c); }
      .cs-ai-actions { display:flex; flex-wrap:wrap; gap:9px; justify-content:flex-end; margin-top:20px; }
      .cs-ai-btn { border:1px solid var(--ink-line,#363b47); background:transparent; color:var(--text,#eee); border-radius:9px; padding:10px 14px; min-height:40px; cursor:pointer; font-weight:600; }
      .cs-ai-btn:hover { border-color:var(--brass,#c89a3c); }
      .cs-ai-btn.primary { background:var(--brass,#c89a3c); color:var(--ink,#12151d); border-color:var(--brass,#c89a3c); }
      .cs-ai-btn.danger { color:#ef9b9b; }
      .cs-ai-note { margin-top:14px; padding:11px 12px; border-radius:9px; background:var(--ink-3,#242934); color:var(--text-faint,#858b98); font-size:.73rem; line-height:1.5; }
      #cs-ai-fab { position:fixed; right:16px; bottom:calc(16px + env(safe-area-inset-bottom)); z-index:100; border:1px solid var(--ink-line,#363b47); background:var(--ink-2,#1b1f28); color:var(--text,#eee); border-radius:999px; padding:9px 13px; cursor:pointer; box-shadow:0 8px 24px rgba(0,0,0,.22); font-size:.76rem; font-weight:700; }
      #cs-ai-fab:hover { border-color:var(--brass,#c89a3c); }
      .cs-ai-recommend-btn { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; margin-top:2px; border:1px solid var(--brass,#c89a3c); background:var(--brass-soft,#efe0b7); color:var(--brass,#5c4009); border-radius:10px; padding:11px 14px; min-height:44px; cursor:pointer; font-weight:700; }
      :root[data-theme="dark"] .cs-ai-recommend-btn { background:rgba(200,154,60,.12); color:var(--brass,#d9b66b); }
      .cs-ai-recommend-btn:disabled { opacity:.65; cursor:wait; }
      .cs-ai-status { margin-top:8px; font-size:.74rem; color:var(--text-dim,#a7acb7); text-align:center; }
      .cs-ai-result { padding:15px 0; border-bottom:1px solid var(--ink-line,#363b47); }
      .cs-ai-result:last-child { border-bottom:0; }
      .cs-ai-result h3 { margin:0 0 3px; font-family:'Fraunces',serif; font-size:1.05rem; }
      .cs-ai-author { color:var(--text-dim,#a7acb7); font-size:.8rem; margin-bottom:8px; }
      .cs-ai-match { display:inline-block; font-family:'IBM Plex Mono',monospace; font-size:.64rem; color:var(--brass,#c89a3c); margin-bottom:7px; }
      .cs-ai-result p { margin:5px 0; font-size:.82rem; line-height:1.5; }
      .cs-ai-result .why { color:var(--text-dim,#a7acb7); }
      .cs-ai-error { padding:12px; background:var(--crimson-soft,#f3d4d4); color:var(--crimson,#9d3535); border-radius:9px; font-size:.8rem; line-height:1.5; }
    `;
    document.head.appendChild(style);
  }

  function createSettingsUI() {
    if (document.getElementById("cs-ai-settings")) return;
    const wrap = document.createElement("div");
    wrap.id = "cs-ai-settings";
    wrap.innerHTML = `
      <div class="cs-ai-panel" role="dialog" aria-modal="true" aria-labelledby="cs-ai-settings-title">
        <h2 id="cs-ai-settings-title">AI Recommendations</h2>
        <p class="cs-ai-sub">Connect Crossover Shelf directly to Gemini. Your key is stored only in this browser's local storage and is not written to GitHub.</p>
        <label class="cs-ai-label" for="cs-ai-key">Gemini API key</label>
        <input class="cs-ai-input" id="cs-ai-key" type="password" autocomplete="off" spellcheck="false" placeholder="Paste your Gemini API key">
        <label class="cs-ai-label" for="cs-ai-model">Model</label>
        <input class="cs-ai-input" id="cs-ai-model" type="text" value="${esc(DEFAULT_MODEL)}" autocomplete="off" spellcheck="false">
        <div class="cs-ai-note">For a personal app, use a dedicated Gemini key with appropriate API restrictions and spending limits. Anyone who can use this browser profile can potentially access a key stored here.</div>
        <div class="cs-ai-actions">
          <button class="cs-ai-btn danger" id="cs-ai-clear" type="button">Remove key</button>
          <button class="cs-ai-btn" id="cs-ai-cancel" type="button">Cancel</button>
          <button class="cs-ai-btn primary" id="cs-ai-save" type="button">Save</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    const settings = loadSettings();
    wrap.querySelector("#cs-ai-key").value = settings.apiKey || "";
    wrap.querySelector("#cs-ai-model").value = settings.model || DEFAULT_MODEL;
    wrap.addEventListener("click", (event) => { if (event.target === wrap) closeSettings(); });
    wrap.querySelector("#cs-ai-cancel").addEventListener("click", closeSettings);
    wrap.querySelector("#cs-ai-save").addEventListener("click", () => {
      saveSettings({
        apiKey: wrap.querySelector("#cs-ai-key").value.trim(),
        model: wrap.querySelector("#cs-ai-model").value.trim() || DEFAULT_MODEL
      });
      closeSettings();
      refreshReadButton();
    });
    wrap.querySelector("#cs-ai-clear").addEventListener("click", () => {
      saveSettings({ apiKey: "", model: DEFAULT_MODEL });
      wrap.querySelector("#cs-ai-key").value = "";
      wrap.querySelector("#cs-ai-model").value = DEFAULT_MODEL;
      refreshReadButton();
    });
  }

  function openSettings() {
    createSettingsUI();
    document.getElementById("cs-ai-settings").classList.add("open");
  }

  function closeSettings() {
    const el = document.getElementById("cs-ai-settings");
    if (el) el.classList.remove("open");
  }

  function createFab() {
    if (document.getElementById("cs-ai-fab")) return;
    const btn = document.createElement("button");
    btn.id = "cs-ai-fab";
    btn.type = "button";
    btn.textContent = "✦ AI";
    btn.title = "AI recommendation settings";
    btn.addEventListener("click", openSettings);
    document.body.appendChild(btn);
  }

  function currentModal() {
    return document.querySelector(".modal-backdrop.open .modal") || document.querySelector(".modal.open");
  }

  function currentBook() {
    const modal = currentModal();
    if (!modal) return null;
    const title = modal.querySelector(".modal-head h2")?.textContent?.trim() || "";
    const by = modal.querySelector(".modal-head .by")?.textContent?.trim() || "";
    if (!title) return null;

    const card = [...document.querySelectorAll(".card")].find((el) =>
      el.querySelector(".card-title")?.textContent?.trim() === title
    );
    const read = !!card?.querySelector('.card-status[data-status="read"]');
    const body = modal.querySelector(".modal-body")?.innerText?.trim() || "";
    return { title, author: by.replace(/^by\s+/i, ""), read, body, modal };
  }

  function readHistory(excludeTitle) {
    return [...document.querySelectorAll(".card")]
      .filter((card) => card.querySelector('.card-status[data-status="read"]'))
      .map((card) => ({
        title: card.querySelector(".card-title")?.textContent?.trim() || "",
        author: card.querySelector(".card-author")?.textContent?.trim() || ""
      }))
      .filter((b) => b.title && b.title !== excludeTitle)
      .slice(0, 80);
  }

  function recommendationCacheKey(book) {
    return `${book.title}::${book.author}`;
  }

  function createResultsUI() {
    if (document.getElementById("cs-ai-results")) return;
    const wrap = document.createElement("div");
    wrap.id = "cs-ai-results";
    wrap.innerHTML = `<div class="cs-ai-panel" role="dialog" aria-modal="true" aria-labelledby="cs-ai-results-title"><h2 id="cs-ai-results-title">Similar books</h2><p class="cs-ai-sub" id="cs-ai-results-sub"></p><div id="cs-ai-results-body"></div><div class="cs-ai-actions"><button class="cs-ai-btn" id="cs-ai-close-results" type="button">Close</button></div></div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener("click", (event) => { if (event.target === wrap) closeResults(); });
    wrap.querySelector("#cs-ai-close-results").addEventListener("click", closeResults);
  }

  function closeResults() {
    document.getElementById("cs-ai-results")?.classList.remove("open");
  }

  function showResults(book, recommendations, cached = false) {
    createResultsUI();
    const wrap = document.getElementById("cs-ai-results");
    wrap.querySelector("#cs-ai-results-title").textContent = `Similar books to ${book.title}`;
    wrap.querySelector("#cs-ai-results-sub").textContent = cached ? "Previously generated recommendations from this device." : "Generated from this book and your Crossover Shelf reading history.";
    const body = wrap.querySelector("#cs-ai-results-body");
    body.innerHTML = recommendations.map((r, i) => `
      <article class="cs-ai-result">
        <h3>${esc(r.title || `Recommendation ${i + 1}`)}</h3>
        <div class="cs-ai-author">${esc(r.author || "Unknown author")}</div>
        ${r.match ? `<div class="cs-ai-match">${esc(r.match)}% MATCH</div>` : ""}
        <p><strong>Why:</strong> ${esc(r.why || "")}</p>
        <p class="why"><strong>Connections:</strong> ${esc(r.connections || "")}</p>
      </article>`).join("");
    wrap.classList.add("open");
  }

  function parseResponse(text) {
    try { return JSON.parse(text); } catch (_) {}
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced) {
      try { return JSON.parse(fenced[1]); } catch (_) {}
    }
    throw new Error("Gemini returned an unreadable recommendation response.");
  }

  async function requestRecommendations(book) {
    const settings = loadSettings();
    if (!settings.apiKey) {
      openSettings();
      throw new Error("Add your Gemini API key in AI settings first.");
    }

    const history = readHistory(book.title);
    const prompt = `You are the recommendation engine for a personal book library. Recommend books that the reader is genuinely likely to enjoy, not merely books with the same broad genre label.

Return exactly 6 recommendations. Do not recommend the book being analyzed or any book in the reader's already-read list. Favor books that are reasonably well-known, real, published books. Do not invent titles or authors.

For each recommendation provide:
- title
- author
- match: an integer from 1 to 100 representing how strong the match is
- why: one concise explanation tailored to the reader
- connections: the strongest shared themes, tone, style, setting, ideas, or reading-history signals

BOOK JUST FINISHED:
Title: ${book.title}
Author: ${book.author}
Details from Crossover Shelf:
${book.body.slice(0, 10000)}

READER'S ALREADY-READ BOOKS:
${history.length ? history.map((b) => `- ${b.title} — ${b.author}`).join("\n") : "No other read books were detected."}

Use the finished book as the primary anchor, and use the reading history to personalize the ranking. Return JSON matching the requested schema only.`;

    const schema = {
      type: "object",
      properties: {
        recommendations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              author: { type: "string" },
              match: { type: "integer" },
              why: { type: "string" },
              connections: { type: "string" }
            },
            required: ["title", "author", "match", "why", "connections"]
          }
        }
      },
      required: ["recommendations"]
    };

    const endpoint = `${API_ROOT}${encodeURIComponent(settings.model || DEFAULT_MODEL)}:generateContent`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": settings.apiKey
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: schema
        }
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error?.message || `Gemini request failed (${response.status}).`;
      throw new Error(message);
    }
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
    if (!text) throw new Error("Gemini returned no recommendations.");
    const parsed = parseResponse(text);
    const recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations;
    if (!Array.isArray(recommendations) || !recommendations.length) throw new Error("Gemini returned no recommendations.");
    return recommendations.slice(0, 6);
  }

  async function generate(book, button, status) {
    const key = recommendationCacheKey(book);
    const cache = loadRecommendationCache();
    if (cache[key]?.recommendations?.length) {
      showResults(book, cache[key].recommendations, true);
      return;
    }

    button.disabled = true;
    button.textContent = "✦ Finding similar books…";
    status.textContent = "Asking Gemini to compare the book with your reading history…";
    try {
      const recommendations = await requestRecommendations(book);
      cache[key] = { generatedAt: new Date().toISOString(), recommendations };
      saveRecommendationCache(cache);
      showResults(book, recommendations, false);
      status.textContent = "Recommendations generated and saved on this device.";
    } catch (error) {
      status.textContent = error.message || "Unable to generate recommendations.";
      if (!document.getElementById("cs-ai-settings")?.classList.contains("open")) {
        const body = currentModal()?.querySelector(".modal-body");
        if (body && !body.querySelector(".cs-ai-error")) {
          const err = document.createElement("div");
          err.className = "cs-ai-error";
          err.textContent = error.message || "Unable to generate recommendations.";
          body.appendChild(err);
        }
      }
    } finally {
      button.disabled = false;
      button.textContent = "✦ Find similar books with AI";
    }
  }

  function refreshReadButton() {
    const book = currentBook();
    if (!book || !book.read) return;
    const body = book.modal.querySelector(".modal-body");
    if (!body || body.querySelector(".cs-ai-recommend-wrap")) return;

    const wrap = document.createElement("div");
    wrap.className = "cs-ai-recommend-wrap";
    wrap.innerHTML = `<button class="cs-ai-recommend-btn" type="button">✦ Find similar books with AI</button><div class="cs-ai-status"></div>`;
    body.appendChild(wrap);
    const button = wrap.querySelector("button");
    const status = wrap.querySelector(".cs-ai-status");
    button.addEventListener("click", () => generate(book, button, status));

    if (!loadSettings().apiKey) {
      status.textContent = "Add a Gemini API key via the ✦ AI button to enable recommendations.";
    }
  }

  function watchModals() {
    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(refreshReadButton);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "data-status"] });
    setInterval(refreshReadButton, 1200);
  }

  function init() {
    injectStyles();
    createFab();
    createSettingsUI();
    watchModals();
    refreshReadButton();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
