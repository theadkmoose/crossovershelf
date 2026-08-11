/* Crossover Shelf — single reading-state store + lightweight rating UI */
(() => {
  "use strict";

  const HISTORY = "crossoverShelfReadingHistoryV1";
  const STATUS_KEY = "crossover-shelf-status-v1";
  const RATING_EVENT = "crossoverShelfPersonalRatingChanged";
  const SYNC_EVENT = "crossover-shelf-reading-synced";

  const clean = value => String(value ?? "").replace(/\s+/g, " ").trim();
  const normalizeStatus = value => ({
    read: "read",
    reading: "currently-reading",
    "currently-reading": "currently-reading",
    want: "want-to-read",
    "want-to-read": "want-to-read",
    dnf: "dnf"
  }[value] || "unread");
  const legacyKey = (title, author = "") =>
    `${clean(title).toLowerCase()}::${clean(author).replace(/^by\s+/i, "").toLowerCase()}`;

  const load = (key, fallback = {}) => {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch (_) { return fallback; }
  };
  const save = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  };

  const books = () => Array.isArray(window.CrossoverShelfBooks) ? window.CrossoverShelfBooks : [];

  function migrateLegacyRecords() {
    const history = load(HISTORY, {});
    const statusMap = load(STATUS_KEY, {});
    let changed = false;
    books().forEach(book => {
      if (!book?.id || !book.title) return;
      const canonical = String(book.id);
      const oldKey = legacyKey(book.title, book.author);
      const old = history[oldKey];
      const current = history[canonical];
      if (old && !current) {
        history[canonical] = { ...old, bookId: canonical, title: book.title, author: book.author || "" };
        delete history[oldKey];
        changed = true;
      } else if (current && current.bookId !== canonical) {
        current.bookId = canonical;
        changed = true;
      }
      const status = normalizeStatus(statusMap[book.id]);
      if (status !== "unread") {
        const record = history[canonical] || { bookId: canonical, title: book.title, author: book.author || "" };
        if (record.status !== status) { record.status = status; changed = true; }
        if (status === "currently-reading" && !record.startedAt) { record.startedAt = new Date().toISOString(); changed = true; }
        if (status === "read" && !record.finishedAt) { record.finishedAt = new Date().toISOString(); changed = true; }
        if (status === "dnf" && !record.dnfAt) { record.dnfAt = new Date().toISOString(); changed = true; }
        history[canonical] = record;
      }
    });
    if (changed) save(HISTORY, history);
    return history;
  }

  const ReadingStore = {
    getAll() {
      return Object.values(migrateLegacyRecords()).filter(record => record && record.title);
    },
    get(bookId) {
      if (!bookId) return null;
      return migrateLegacyRecords()[String(bookId)] || null;
    },
    setStatus(bookId, status, metadata = {}) {
      if (!bookId) return null;
      const normalized = normalizeStatus(status);
      const history = migrateLegacyRecords();
      const book = books().find(item => String(item?.id) === String(bookId));
      const key = String(bookId);
      const record = history[key] || {
        bookId: key,
        title: metadata.title || book?.title || "",
        author: metadata.author || book?.author || ""
      };
      record.status = normalized;
      if (normalized === "currently-reading" && !record.startedAt) record.startedAt = new Date().toISOString();
      if (normalized === "read" && !record.finishedAt) record.finishedAt = new Date().toISOString();
      if (normalized === "dnf" && !record.dnfAt) record.dnfAt = new Date().toISOString();
      history[key] = record;
      save(HISTORY, history);
      const statuses = load(STATUS_KEY, {});
      statuses[bookId] = normalized;
      save(STATUS_KEY, statuses);
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: record }));
      return record;
    },
    setRating(bookId, rating, metadata = {}) {
      if (!bookId) return null;
      const value = Math.max(1, Math.min(5, Number(rating) || 0));
      if (!value) return null;
      const history = migrateLegacyRecords();
      const book = books().find(item => String(item?.id) === String(bookId));
      const key = String(bookId);
      const record = history[key] || {
        bookId: key,
        title: metadata.title || book?.title || "",
        author: metadata.author || book?.author || ""
      };
      record.rating = value;
      history[key] = record;
      save(HISTORY, history);
      window.dispatchEvent(new CustomEvent(RATING_EVENT, { detail: record }));
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: record }));
      return record;
    }
  };
  window.CrossoverShelfReadingStore = ReadingStore;

  function injectStyle() {
    if (document.getElementById("cs-rating-style")) return;
    const style = document.createElement("style");
    style.id = "cs-rating-style";
    style.textContent = `
      .cs-rating-box{display:block!important;width:100%!important;box-sizing:border-box;margin:14px 0 18px;padding:16px 18px;border:1px solid var(--ink-line,#d9ceb0);border-radius:14px;background:rgba(200,154,60,.09);position:relative;z-index:5}
      .cs-rating-label{display:block;margin:0 0 8px;font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:inherit;opacity:.78}
      .cs-rating-row{display:flex!important;align-items:center!important;gap:3px!important;min-height:48px}
      .cs-rating-star{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:44px!important;height:44px!important;padding:0!important;margin:0!important;border:0!important;background:transparent!important;box-shadow:none!important;border-radius:8px!important;font-size:34px!important;line-height:1!important;cursor:pointer!important;touch-action:manipulation!important;color:#9a9a9a!important;opacity:1!important}
      .cs-rating-star.is-on{color:#c89a3c!important}.cs-rating-value{margin-left:9px;font:500 13px 'IBM Plex Mono',monospace;opacity:.8}.cs-rating-star:active{transform:scale(.9)}.cs-rating-star:focus-visible{outline:2px solid #c89a3c;outline-offset:2px}
      @media(max-width:700px){.cs-rating-box{padding:14px 15px}.cs-rating-star{width:42px!important;height:42px!important;font-size:32px!important}}
    `;
    document.head.appendChild(style);
  }

  function visible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
  }
  function readButton(button) {
    return button && visible(button) && clean(button.textContent).toLowerCase() === "read";
  }
  function findTitle(start) {
    let node = start;
    for (let i = 0; i < 10 && node; i++, node = node.parentElement) {
      const heading = [...node.querySelectorAll("h1,h2,h3")].find(h => visible(h) && clean(h.textContent) && !/my reading|reading history|overview|crossovers|king|r\/fantasy/i.test(clean(h.textContent)));
      if (heading) return clean(heading.textContent).replace(/^[A-FS]\s*Tier\s*[·•-]\s*\d+\/100\s*/i, "");
    }
    return "";
  }
  function findAuthor(start) {
    let node = start;
    for (let i = 0; i < 10 && node; i++, node = node.parentElement) {
      const by = [...node.querySelectorAll("p,div,span")].find(el => visible(el) && /^by\s+/i.test(clean(el.textContent)) && clean(el.textContent).length < 180 && !el.querySelector("h1,h2,h3"));
      if (by) return clean(by.textContent).replace(/^by\s+/i, "").split(/\s+[·•]\s+/)[0].trim();
    }
    return "";
  }
  function render(box, rating) {
    box.querySelectorAll(".cs-rating-star").forEach(button => {
      const on = Number(button.dataset.rating) <= rating;
      button.classList.toggle("is-on", on);
      button.textContent = on ? "★" : "☆";
    });
    const value = box.querySelector(".cs-rating-value");
    if (value) value.textContent = rating ? `${rating}/5` : "Not rated";
  }
  function insertRating(readButton) {
    if (!readButton || !visible(readButton)) return;
    const host = readButton.parentElement;
    if (!host) return;
    const title = findTitle(host);
    if (!title) return;
    const author = findAuthor(host);
    const identity = legacyKey(title, author);
    document.querySelectorAll(".cs-rating-box").forEach(box => {
      if (box.dataset.bookKey !== identity) box.remove();
    });
    if (document.querySelector(`.cs-rating-box[data-book-key="${CSS.escape(identity)}"]`)) return;
    const booksList = books();
    const book = booksList.find(item => legacyKey(item?.title, item?.author) === identity);
    const record = book ? ReadingStore.get(book.id) : load(HISTORY, {})[identity];
    const box = document.createElement("div");
    box.className = "cs-rating-box";
    box.dataset.bookKey = identity;
    box.innerHTML = `<span class="cs-rating-label">Your rating</span><div class="cs-rating-row" role="radiogroup" aria-label="Your rating"></div>`;
    const row = box.querySelector(".cs-rating-row");
    for (let n = 1; n <= 5; n++) {
      const star = document.createElement("button");
      star.type = "button";
      star.className = "cs-rating-star";
      star.dataset.rating = String(n);
      star.setAttribute("aria-label", `${n} out of 5 stars`);
      star.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        render(box, n);
        if (book?.id) ReadingStore.setRating(book.id, n, { title, author });
        else {
          const history = load(HISTORY, {});
          history[identity] = { ...(history[identity] || {}), title, author, rating: n };
          save(HISTORY, history);
        }
      });
      row.appendChild(star);
    }
    const value = document.createElement("span");
    value.className = "cs-rating-value";
    row.appendChild(value);
    render(box, Number(record?.rating) || 0);
    host.parentElement?.insertBefore(box, host.nextSibling);
  }

  function onReadClick(event) {
    const button = event.target?.closest?.("button");
    if (!readButton(button)) return;
    // Wait for the app's own click handler to finish. No polling, observer, or repeated timers.
    requestAnimationFrame(() => requestAnimationFrame(() => insertRating(button)));
  }

  function init() {
    injectStyle();
    migrateLegacyRecords();
    document.addEventListener("click", onReadClick, true);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
