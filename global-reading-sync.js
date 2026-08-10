/* Crossover Shelf — global reading-history bridge
 * Imports the main app's reading statuses from every built-in/custom shelf
 * into the personal My Reading history store without depending on visible cards.
 */
(() => {
  "use strict";

  const HISTORY_KEY = "crossoverShelfReadingHistoryV1";
  const STATUS_KEY = "crossover-shelf-status-v1";

  const keyFor = (title, author = "") =>
    `${String(title || "").trim().toLowerCase()}::${String(author || "").replace(/^by\s+/i, "").trim().toLowerCase()}`;

  function load(key) {
    try { return JSON.parse(localStorage.getItem(key) || "{}"); }
    catch (_) { return {}; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (_) {}
  }

  function sync() {
    const books = Array.isArray(window.CrossoverShelfBooks) ? window.CrossoverShelfBooks : [];
    const appStatus = load(STATUS_KEY);
    const history = load(HISTORY_KEY);
    let changed = false;

    books.forEach(book => {
      if (!book || !book.title) return;
      const status = appStatus[book.id];
      if (!status || status === "unread") return;

      const key = keyFor(book.title, book.author);
      const existing = history[key] || {
        title: book.title,
        author: book.author || "",
        createdAt: new Date().toISOString()
      };

      const normalized = status === "read" ? "read"
        : status === "want" ? "want-to-read"
        : status === "currently-reading" ? "currently-reading"
        : status === "dnf" ? "dnf"
        : null;

      if (!normalized) return;

      if (existing.status !== normalized) {
        existing.status = normalized;
        changed = true;
      }
      if (normalized === "currently-reading" && !existing.startedAt) {
        existing.startedAt = new Date().toISOString();
        changed = true;
      }
      if (normalized === "read" && !existing.finishedAt) {
        const meta = load("crossover-shelf-book-meta-v1")[book.id];
        existing.finishedAt = meta?.finished || null;
        changed = true;
      }
      if (normalized === "dnf" && !existing.dnfAt) {
        existing.dnfAt = new Date().toISOString();
        changed = true;
      }

      history[key] = existing;
    });

    if (changed) save(HISTORY_KEY, history);
    window.dispatchEvent(new CustomEvent("crossover-shelf-reading-synced"));
  }

  sync();
  setTimeout(sync, 1000);
  setTimeout(sync, 3000);
})();
