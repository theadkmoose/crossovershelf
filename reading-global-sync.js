/* Crossover Shelf — global reading-history bridge + inline personal rating
 * Synchronizes the personal reading layer from the application's complete BOOKS dataset,
 * and provides an immediate, live-updating personal rating control when a book is marked Read.
 */
(() => {
  "use strict";

  const STORE = "crossoverShelfReadingHistoryV1";
  const STATUS_KEY = "crossover-shelf-status-v1";
  const SYNC_MARK = "crossoverShelfGlobalReadingSyncV1";
  const RATING_EVENT = "crossoverShelfPersonalRatingChanged";

  const keyFor = (title, author = "") =>
    `${String(title || "").trim().toLowerCase()}::${String(author || "").replace(/^by\s+/i, "").trim().toLowerCase()}`;

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) { return fallback; }
  }

  function saveStore(data) {
    try { localStorage.setItem(STORE, JSON.stringify(data)); } catch (_) {}
  }

  function syncGlobalReadingHistory() {
    const books = Array.isArray(window.BOOKS) ? window.BOOKS : [];
    if (!books.length) return;

    const history = loadJson(STORE, {});
    const status = loadJson(STATUS_KEY, {});
    let changed = false;

    books.forEach(book => {
      if (!book || !book.title) return;
      const key = keyFor(book.title, book.author);
      const appStatus = status[book.id];
      let mapped = null;
      if (appStatus === "read") mapped = "read";
      else if (appStatus === "want") mapped = "want-to-read";
      else if (appStatus === "currently-reading") mapped = "currently-reading";
      else if (appStatus === "dnf") mapped = "dnf";
      if (!mapped) return;

      const existing = history[key] || {
        title: book.title,
        author: book.author || "",
        createdAt: new Date().toISOString()
      };

      if (existing.status !== mapped) { existing.status = mapped; changed = true; }
      if (!existing.title) { existing.title = book.title; changed = true; }
      if (!existing.author && book.author) { existing.author = book.author; changed = true; }
      if (mapped === "currently-reading" && !existing.startedAt) {
        existing.startedAt = new Date().toISOString(); changed = true;
      }
      if (mapped === "read" && !existing.finishedAt) {
        const finished = (() => {
          try { return JSON.parse(localStorage.getItem("crossover-shelf-book-meta-v1") || "{}")[book.id]?.finished || ""; }
          catch (_) { return ""; }
        })();
        existing.finishedAt = finished ? new Date(`${finished}T12:00:00`).toISOString() : null;
        changed = true;
      }
      history[key] = existing;
    });

    if (changed) saveStore(history);
    try { localStorage.setItem(SYNC_MARK, String(Date.now())); } catch (_) {}
  }

  const css = `
    .cs-inline-rating{margin:14px 0 4px;padding:14px 16px;border:1px solid currentColor;border-radius:12px;background:rgba(200,154,60,.07)}
    .cs-inline-rating-label{display:block;margin-bottom:7px;font:600 .72rem 'IBM Plex Mono',monospace;letter-spacing:.08em;text-transform:uppercase;opacity:.72}
    .cs-inline-rating-stars{display:flex;align-items:center;gap:2px}
    .cs-inline-rating-star{appearance:none;border:0;background:transparent;padding:0 2px;margin:0;color:#a8a8a8;font-size:30px;line-height:1;cursor:pointer;transition:transform .08s ease,color .08s ease}
    .cs-inline-rating-star.selected{color:#c89a3c}
    .cs-inline-rating-star:active{transform:scale(.88)}
    .cs-inline-rating-value{margin-left:9px;font:500 .8rem 'IBM Plex Mono',monospace;opacity:.72;min-width:38px}
    @media (prefers-reduced-motion:no-preference){.cs-inline-rating-star{transition:transform .08s ease,color .08s ease}}
  `;

  function installCss() {
    if (document.getElementById("cs-inline-rating-style")) return;
    const style = document.createElement("style");
    style.id = "cs-inline-rating-style";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function cleanText(s) {
    return String(s || "").replace(/\s+/g, " ").trim();
  }

  function findBookIdentity() {
    // The detail modal has the title in its large heading and the author in the byline.
    // Use the currently open modal rather than the underlying grid.
    const candidates = [...document.querySelectorAll("[role='dialog'], .modal, .book-modal, .detail-modal")]
      .filter(el => {
        const r = el.getBoundingClientRect();
        const st = getComputedStyle(el);
        return r.width > 250 && r.height > 250 && st.display !== "none" && st.visibility !== "hidden";
      });
    const root = candidates.sort((a,b) => b.getBoundingClientRect().width*b.getBoundingClientRect().height - a.getBoundingClientRect().width*a.getBoundingClientRect().height)[0] || document.body;

    const heading = [...root.querySelectorAll("h1,h2,h3")].find(h => cleanText(h.textContent) && cleanText(h.textContent).length < 140);
    if (!heading) return null;
    const title = cleanText(heading.textContent).replace(/^\s*[A-FS]\s*Tier\s*[·•-]\s*\d+\/100\s*/i, "");
    if (!title || /my reading|reading history/i.test(title)) return null;

    let author = "";
    const byline = [...root.querySelectorAll("p,div,span")].find(el => /^by\s+/i.test(cleanText(el.textContent)) && cleanText(el.textContent).length < 180);
    if (byline) author = cleanText(byline.textContent).replace(/^by\s+/i, "").split(/\s+[·•]\s+/)[0].trim();
    return { title, author, root };
  }

  function getRecord(identity) {
    if (!identity) return null;
    const history = loadJson(STORE, {});
    return { history, key: keyFor(identity.title, identity.author), record: history[keyFor(identity.title, identity.author)] || { title: identity.title, author: identity.author, status: "read" } };
  }

  function dispatchRating(record) {
    try { window.dispatchEvent(new CustomEvent(RATING_EVENT, { detail: record })); } catch (_) {}
  }

  function showInlineRating(identity, force = false) {
    if (!identity || !identity.root) return;
    const existing = identity.root.querySelector(".cs-inline-rating");
    if (existing && !force) return;
    if (existing) existing.remove();

    const state = getRecord(identity);
    if (!state) return;
    const rating = Number(state.record.rating) || 0;
    const box = document.createElement("div");
    box.className = "cs-inline-rating";
    box.innerHTML = `<span class="cs-inline-rating-label">Your rating</span><div class="cs-inline-rating-stars" aria-label="Rate this book from 1 to 5 stars"></div>`;
    const stars = box.querySelector(".cs-inline-rating-stars");
    const value = document.createElement("span");
    value.className = "cs-inline-rating-value";
    stars.appendChild(value);

    const render = selected => {
      [...stars.querySelectorAll("button")].forEach(btn => btn.classList.toggle("selected", Number(btn.dataset.rating) <= selected));
      value.textContent = selected ? `${selected}/5` : "Not rated";
    };

    for (let n = 1; n <= 5; n++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cs-inline-rating-star";
      btn.dataset.rating = String(n);
      btn.setAttribute("aria-label", `${n} star${n === 1 ? "" : "s"}`);
      btn.textContent = "★";
      btn.addEventListener("click", () => {
        const chosen = Number(btn.dataset.rating);
        const current = loadJson(STORE, {});
        const k = keyFor(identity.title, identity.author);
        const rec = current[k] || { title: identity.title, author: identity.author, status: "read" };
        rec.rating = chosen;
        rec.status = "read";
        rec.finishedAt = rec.finishedAt || new Date().toISOString();
        current[k] = rec;
        saveStore(current);
        render(chosen);
        dispatchRating(rec);
      });
      stars.insertBefore(btn, value);
    }
    render(rating);

    // Place directly after the reading-status control when possible.
    const statusHeading = [...identity.root.querySelectorAll("h4,h5,h6,label,p,div")].find(el => cleanText(el.textContent).toUpperCase() === "READING STATUS");
    const statusArea = statusHeading?.parentElement || [...identity.root.querySelectorAll("button")].find(b => cleanText(b.textContent) === "Read")?.parentElement;
    if (statusArea?.parentElement) statusArea.parentElement.insertBefore(box, statusArea.nextSibling);
    else identity.root.appendChild(box);
  }

  function isReadClick(target) {
    const b = target?.closest?.("button");
    if (!b) return false;
    const text = cleanText(b.textContent).toLowerCase();
    return text === "read" || text === "✓ read";
  }

  function wire() {
    document.addEventListener("click", e => {
      if (!isReadClick(e.target)) return;
      // Let the app finish its own status/localStorage update first.
      setTimeout(() => {
        const identity = findBookIdentity();
        if (!identity) return;
        const state = getRecord(identity);
        if (state?.record) {
          state.record.status = "read";
          const h = state.history;
          h[state.key] = state.record;
          saveStore(h);
        }
        showInlineRating(identity, true);
      }, 80);
    }, true);

    const observer = new MutationObserver(() => {
      const identity = findBookIdentity();
      if (!identity) return;
      const state = getRecord(identity);
      if (state?.record?.status === "read") showInlineRating(identity);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function start() {
    installCss();
    syncGlobalReadingHistory();
    wire();
    setInterval(syncGlobalReadingHistory, 1200);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
