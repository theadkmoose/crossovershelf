/* Crossover Shelf — legacy compatibility bridge
 *
 * Reading state is owned by CrossoverShelfReadingStore.
 * This file no longer writes the history store or schedules polling.
 * It only imports the app's existing status map through the store when
 * the store is available, preserving compatibility with the main app.
 */
(() => {
  "use strict";

  const STATUS_KEY = "crossover-shelf-status-v1";
  const SYNC_EVENT = "crossover-shelf-reading-synced";

  function loadStatus() {
    try { return JSON.parse(localStorage.getItem(STATUS_KEY) || "{}"); }
    catch (_) { return {}; }
  }

  function syncThroughStore() {
    const store = window.CrossoverShelfReadingStore;
    const books = Array.isArray(window.CrossoverShelfBooks) ? window.CrossoverShelfBooks : [];
    if (!store?.setStatus || !books.length) return false;

    const statuses = loadStatus();
    books.forEach(book => {
      if (!book?.id) return;
      const status = statuses[book.id];
      if (!status || status === "unread") return;
      store.setStatus(book.id, status, { title: book.title || "", author: book.author || "" });
    });
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
    return true;
  }

  function init() {
    // The reading store should normally already be loaded. If script order
    // changes, retry once at DOMContentLoaded rather than polling.
    if (!syncThroughStore()) {
      document.addEventListener("DOMContentLoaded", syncThroughStore, { once: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
