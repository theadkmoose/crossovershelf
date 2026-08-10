/* Crossover Shelf — global reading-history bridge + live personal rating in the book detail modal
 * Synchronizes the personal reading layer and adds an immediate, interactive 1–5 star rating
 * whenever the user marks the currently open book Read.
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

  function getBooks() {
    if (Array.isArray(window.CrossoverShelfBooks)) return window.CrossoverShelfBooks;
    if (Array.isArray(window.BOOKS)) return window.BOOKS;
    return [];
  }

  function syncGlobalReadingHistory() {
    const books = getBooks();
    if (!books.length) return;

    const history = loadJson(STORE, {});
    const status = loadJson(STATUS_KEY, {});
    let changed = false;

    books.forEach(book => {
      if (!book || !book.title) return;
      const appStatus = status[book.id];
      let mapped = null;
      if (appStatus === "read") mapped = "read";
      else if (appStatus === "want") mapped = "want-to-read";
      else if (appStatus === "currently-reading") mapped = "currently-reading";
      else if (appStatus === "dnf") mapped = "dnf";
      if (!mapped) return;

      const key = keyFor(book.title, book.author);
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
        const meta = loadJson("crossover-shelf-book-meta-v1", {});
        const finished = meta?.[book.id]?.finished || "";
        existing.finishedAt = finished ? new Date(`${finished}T12:00:00`).toISOString() : new Date().toISOString();
        changed = true;
      }
      if (mapped === "dnf" && !existing.dnfAt) {
        existing.dnfAt = new Date().toISOString();
        changed = true;
      }
      history[key] = existing;
    });

    if (changed) saveStore(history);
    try { localStorage.setItem(SYNC_MARK, String(Date.now())); } catch (_) {}
  }

  const css = `
    .cs-inline-rating{margin:16px 0 8px;padding:16px 18px;border:1px solid var(--ink-line,#d9ceb0);border-radius:14px;background:rgba(200,154,60,.08);box-sizing:border-box;width:100%}
    .cs-inline-rating-label{display:block;margin-bottom:9px;font:600 .72rem 'IBM Plex Mono',monospace;letter-spacing:.1em;text-transform:uppercase;opacity:.72}
    .cs-inline-rating-stars{display:flex;align-items:center;gap:4px;min-height:46px}
    .cs-inline-rating-star{appearance:none;border:0;background:transparent;padding:2px 4px;margin:0;color:#aaa;font-size:36px;line-height:1;cursor:pointer;touch-action:manipulation;transition:transform .08s ease,color .08s ease}
    .cs-inline-rating-star.selected{color:#c89a3c}
    .cs-inline-rating-star:active{transform:scale(.88)}
    .cs-inline-rating-star:focus-visible{outline:2px solid #c89a3c;outline-offset:3px;border-radius:6px}
    .cs-inline-rating-value{margin-left:10px;font:500 .82rem 'IBM Plex Mono',monospace;opacity:.78;min-width:42px}
    @media(max-width:700px){.cs-inline-rating{padding:14px 15px}.cs-inline-rating-star{font-size:34px;padding:3px 3px}.cs-inline-rating-stars{gap:3px}}
  `;

  function installCss() {
    if (document.getElementById("cs-inline-rating-style")) return;
    const style = document.createElement("style");
    style.id = "cs-inline-rating-style";
    style.textContent = css;
    document.head.appendChild(style);
  }

  const cleanText = s => String(s || "").replace(/\s+/g, " ").trim();

  function visible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    return r.width > 250 && r.height > 250 && st.display !== "none" && st.visibility !== "hidden" && st.opacity !== "0";
  }

  function findBookIdentity() {
    const candidates = [...document.querySelectorAll("[role='dialog'], .modal, .book-modal, .detail-modal")].filter(visible);
    const root = candidates.sort((a,b) => {
      const ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
      return (br.width * br.height) - (ar.width * ar.height);
    })[0];
    if (!root) return null;

    // Prefer the largest heading in the visible book modal, excluding navigation/dashboard headings.
    const headings = [...root.querySelectorAll("h1,h2,h3")]
      .map(h => ({el:h,text:cleanText(h.textContent)}))
      .filter(x => x.text && x.text.length < 140 && !/my reading|reading history|overview/i.test(x.text));
    const heading = headings[0]?.el;
    if (!heading) return null;

    const title = cleanText(heading.textContent).replace(/^\s*[A-FS]\s*Tier\s*[·•-]\s*\d+\/100\s*/i, "");
    if (!title) return null;

    let author = "";
    const byline = [...root.querySelectorAll("p,div,span")].find(el => {
      const t = cleanText(el.textContent);
      return /^by\s+/i.test(t) && t.length < 180 && !el.querySelector("h1,h2,h3");
    });
    if (byline) author = cleanText(byline.textContent).replace(/^by\s+/i, "").split(/\s+[·•]\s+/)[0].trim();

    return { title, author, root };
  }

  function getRecord(identity) {
    if (!identity) return null;
    const history = loadJson(STORE, {});
    const key = keyFor(identity.title, identity.author);
    return { history, key, record: history[key] || { title: identity.title, author: identity.author, status: "read" } };
  }

  function dispatchRating(record) {
    try { window.dispatchEvent(new CustomEvent(RATING_EVENT, { detail: record })); } catch (_) {}
    try { window.dispatchEvent(new CustomEvent("crossover-shelf-reading-synced", { detail: record })); } catch (_) {}
  }

  function findInsertionPoint(root) {
    // Most reliable: find the actual Read button and place the rating immediately after its button group.
    const readButton = [...root.querySelectorAll("button")].find(b => cleanText(b.textContent).toLowerCase() === "read");
    if (readButton) {
      const row = readButton.parentElement;
      if (row && row.parentElement) return { parent: row.parentElement, before: row.nextSibling };
    }

    // Fallback: locate the Reading Status heading and place after its containing section.
    const label = [...root.querySelectorAll("h4,h5,h6,label,p,div,span")].find(el => cleanText(el.textContent).toUpperCase() === "READING STATUS");
    if (label) {
      const section = label.closest("section") || label.parentElement;
      if (section?.parentElement) return { parent: section.parentElement, before: section.nextSibling };
    }

    return null;
  }

  function showInlineRating(identity, force = false) {
    if (!identity?.root) return;
    const existing = identity.root.querySelector(".cs-inline-rating");
    if (existing && !force) return;
    if (existing) existing.remove();

    const state = getRecord(identity);
    if (!state) return;
    const rating = Number(state.record.rating) || 0;

    const box = document.createElement("div");
    box.className = "cs-inline-rating";
    box.setAttribute("data-book-rating", keyFor(identity.title, identity.author));
    box.innerHTML = `<span class="cs-inline-rating-label">Your rating</span><div class="cs-inline-rating-stars" aria-label="Rate this book from 1 to 5 stars"></div>`;
    const stars = box.querySelector(".cs-inline-rating-stars");
    const value = document.createElement("span");
    value.className = "cs-inline-rating-value";
    stars.appendChild(value);

    const render = selected => {
      [...stars.querySelectorAll("button")].forEach(btn => {
        const on = Number(btn.dataset.rating) <= selected;
        btn.classList.toggle("selected", on);
        btn.textContent = on ? "★" : "☆";
      });
      value.textContent = selected ? `${selected}/5` : "Not rated";
    };

    for (let n = 1; n <= 5; n++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cs-inline-rating-star";
      btn.dataset.rating = String(n);
      btn.setAttribute("aria-label", `${n} star${n === 1 ? "" : "s"}`);
      btn.textContent = "☆";
      btn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        const chosen = Number(btn.dataset.rating);
        const current = loadJson(STORE, {});
        const k = keyFor(identity.title, identity.author);
        const rec = current[k] || { title: identity.title, author: identity.author, status: "read" };
        rec.rating = chosen;
        rec.status = "read";
        rec.finishedAt = rec.finishedAt || new Date().toISOString();
        current[k] = rec;
        saveStore(current);
        render(chosen); // immediate visual update before any other app work
        dispatchRating(rec);
      }, { capture: true });
      stars.insertBefore(btn, value);
    }
    render(rating);

    const point = findInsertionPoint(identity.root);
    if (point) point.parent.insertBefore(box, point.before || null);
    else identity.root.appendChild(box);
  }

  function isReadClick(target) {
    const b = target?.closest?.("button");
    if (!b) return false;
    const text = cleanText(b.textContent).toLowerCase();
    return text === "read" || text === "✓ read" || text === "✓read";
  }

  function wire() {
    document.addEventListener("click", e => {
      if (!isReadClick(e.target)) return;
      setTimeout(() => {
        const identity = findBookIdentity();
        if (!identity) return;
        const state = getRecord(identity);
        if (state?.record) {
          state.record.status = "read";
          state.record.finishedAt = state.record.finishedAt || new Date().toISOString();
          state.history[state.key] = state.record;
          saveStore(state.history);
        }
        showInlineRating(identity, true);
      }, 120);
    }, true);

    // Covers cases where the app changes status without a click event or rerenders the modal.
    const observer = new MutationObserver(() => {
      const identity = findBookIdentity();
      if (!identity) return;
      const state = getRecord(identity);
      if (state?.record?.status === "read" && !identity.root.querySelector(".cs-inline-rating")) {
        showInlineRating(identity);
      }
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
