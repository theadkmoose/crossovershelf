/* Crossover Shelf — global reading-history bridge
 * Synchronizes the personal reading layer from the application's complete BOOKS dataset,
 * rather than only the currently rendered shelf cards.
 */
(() => {
  "use strict";

  const STORE = "crossoverShelfReadingHistoryV1";
  const STATUS_KEY = "crossover-shelf-status-v1";
  const SYNC_MARK = "crossoverShelfGlobalReadingSyncV1";

  const keyFor = (title, author = "") =>
    `${String(title || "").trim().toLowerCase()}::${String(author || "").replace(/^by\s+/i, "").trim().toLowerCase()}`;

  function loadJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || ""); }
    catch (_) { return fallback; }
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

      if (existing.status !== mapped) {
        existing.status = mapped;
        changed = true;
      }
      if (!existing.title) { existing.title = book.title; changed = true; }
      if (!existing.author && book.author) { existing.author = book.author; changed = true; }
      if (mapped === "currently-reading" && !existing.startedAt) {
        existing.startedAt = new Date().toISOString();
        changed = true;
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

  function start() {
    syncGlobalReadingHistory();
    // The main app can change readingStatus without reloading the page.
    // A lightweight periodic sync keeps My Reading global without modifying index.html.
    setInterval(syncGlobalReadingHistory, 1200);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
