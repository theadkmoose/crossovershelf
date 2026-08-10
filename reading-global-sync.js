/* Crossover Shelf — personal reading status + immediate star rating bridge */
(() => {
  "use strict";

  // Prevent duplicate copies of this bridge from running at the same time.
  if (window.__CROSSOVER_SHELF_RATING_BRIDGE_V2__) return;
  window.__CROSSOVER_SHELF_RATING_BRIDGE_V2__ = true;

  const STORE = "crossoverShelfReadingHistoryV1";
  const STATUS_KEY = "crossover-shelf-status-v1";
  const RATING_EVENT = "crossoverShelfPersonalRatingChanged";
  const clean = s => String(s || "").replace(/\s+/g, " ").trim();
  const keyFor = (title, author = "") =>
    `${clean(title).toLowerCase()}::${clean(author).replace(/^by\s+/i, "").toLowerCase()}`;

  const load = (key, fallback = {}) => {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch (_) { return fallback; }
  };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };

  function injectStyle() {
    if (document.getElementById("cs-rating-style")) return;
    const style = document.createElement("style");
    style.id = "cs-rating-style";
    style.textContent = `
      .cs-rating-box{display:block!important;width:100%!important;box-sizing:border-box;margin:14px 0 18px;padding:16px 18px;border:1px solid var(--ink-line,#d9ceb0);border-radius:14px;background:rgba(200,154,60,.09);position:relative;z-index:5}
      .cs-rating-label{display:block;margin:0 0 8px;font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:inherit;opacity:.78}
      .cs-rating-row{display:flex!important;align-items:center!important;gap:3px!important;min-height:48px}
      .cs-rating-star{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:44px!important;height:44px!important;padding:0!important;margin:0!important;border:0!important;background:transparent!important;box-shadow:none!important;border-radius:8px!important;font-size:34px!important;line-height:1!important;cursor:pointer!important;touch-action:manipulation!important;color:#9a9a9a!important;opacity:1!important}
      .cs-rating-star.is-on{color:#c89a3c!important}
      .cs-rating-value{margin-left:9px;font:500 13px 'IBM Plex Mono',monospace;opacity:.8}
      .cs-rating-star:active{transform:scale(.9)}
      .cs-rating-star:focus-visible{outline:2px solid #c89a3c;outline-offset:2px}
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

  function readButtons() {
    return [...document.querySelectorAll("button")].filter(b => visible(b) && clean(b.textContent).toLowerCase() === "read");
  }

  function findTitle(start) {
    let node = start;
    for (let i = 0; i < 10 && node; i++, node = node.parentElement) {
      const headings = [...node.querySelectorAll("h1,h2,h3")].filter(visible);
      const heading = headings.find(h => {
        const t = clean(h.textContent);
        return t && !/my reading|reading history|overview|crossovers|king|r\/fantasy/i.test(t);
      });
      if (heading) return clean(heading.textContent).replace(/^[A-FS]\s*Tier\s*[·•-]\s*\d+\/100\s*/i, "");
    }
    return "";
  }

  function findAuthor(start) {
    let node = start;
    for (let i = 0; i < 10 && node; i++, node = node.parentElement) {
      const els = [...node.querySelectorAll("p,div,span")].filter(visible);
      const by = els.find(el => {
        const t = clean(el.textContent);
        return /^by\s+/i.test(t) && t.length < 180 && !el.querySelector("h1,h2,h3");
      });
      if (by) return clean(by.textContent).replace(/^by\s+/i, "").split(/\s+[·•]\s+/)[0].trim();
    }
    return "";
  }

  function recordFor(title, author) {
    const history = load(STORE, {});
    const key = keyFor(title, author);
    const record = history[key] || { title, author, status: "read" };
    return { history, key, record };
  }

  function saveRating(title, author, rating) {
    const { history, key, record } = recordFor(title, author);
    record.title = title;
    record.author = author;
    record.status = "read";
    record.rating = rating;
    record.finishedAt = record.finishedAt || new Date().toISOString();
    history[key] = record;
    save(STORE, history);

    const statuses = load(STATUS_KEY, {});
    const books = Array.isArray(window.CrossoverShelfBooks) ? window.CrossoverShelfBooks : [];
    const book = books.find(b => keyFor(b?.title, b?.author) === key);
    if (book?.id) { statuses[book.id] = "read"; save(STATUS_KEY, statuses); }

    try { window.dispatchEvent(new CustomEvent(RATING_EVENT, {detail: record})); } catch (_) {}
    try { window.dispatchEvent(new CustomEvent("crossover-shelf-reading-synced", {detail: record})); } catch (_) {}
  }

  function render(box, rating) {
    [...box.querySelectorAll(".cs-rating-star")].forEach(btn => {
      const n = Number(btn.dataset.rating);
      const on = n <= rating;
      btn.classList.toggle("is-on", on);
      btn.textContent = on ? "★" : "☆";
    });
    const value = box.querySelector(".cs-rating-value");
    if (value) value.textContent = rating ? `${rating}/5` : "Not rated";
  }

  function modalScope(start) {
    // The active book modal is the smallest ancestor that contains both the
    // book heading and the Reading Status controls. Keeping all DOM work
    // inside this scope prevents duplicate boxes from other rendered layers.
    let node = start;
    for (let i = 0; i < 12 && node; i++, node = node.parentElement) {
      if (findTitle(node) && [...node.querySelectorAll("button")].some(b => visible(b) && clean(b.textContent).toLowerCase() === "read")) {
        return node;
      }
    }
    return start?.parentElement || null;
  }

  function removeDuplicateBoxes(scope, identity) {
    if (!scope) return null;
    const matches = [...scope.querySelectorAll(".cs-rating-box")].filter(b => b.dataset.bookKey === identity);
    if (!matches.length) return null;
    const keep = matches[0];
    matches.slice(1).forEach(b => b.remove());
    return keep;
  }

  function insertRating(readButton) {
    if (!readButton || !visible(readButton)) return;

    const scope = modalScope(readButton);
    if (!scope) return;
    const title = findTitle(scope);
    if (!title) return;
    const author = findAuthor(scope);
    const identity = keyFor(title, author);

    // One rating box per currently open book modal — never one per rerender.
    const existing = removeDuplicateBoxes(scope, identity);
    if (existing) {
      const { record } = recordFor(title, author);
      render(existing, Number(record.rating) || 0);
      return;
    }

    // Mark the Reading Status host so repeated MutationObserver callbacks do
    // not create another box during the app's rerender cycle.
    const host = readButton.parentElement;
    if (!host) return;
    if (host.dataset.csRatingBookKey === identity) return;
    host.dataset.csRatingBookKey = identity;

    const { record } = recordFor(title, author);
    const box = document.createElement("div");
    box.className = "cs-rating-box";
    box.dataset.bookKey = identity;
    box.innerHTML = `<span class="cs-rating-label">Your rating</span><div class="cs-rating-row" role="radiogroup" aria-label="Your rating"></div>`;
    const row = box.querySelector(".cs-rating-row");
    const value = document.createElement("span");
    value.className = "cs-rating-value";
    row.appendChild(value);

    for (let n = 1; n <= 5; n++) {
      const star = document.createElement("button");
      star.type = "button";
      star.className = "cs-rating-star";
      star.dataset.rating = String(n);
      star.setAttribute("aria-label", `${n} out of 5 stars`);
      star.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        render(box, n);
        saveRating(title, author, n);
      });
      row.insertBefore(star, value);
    }
    render(box, Number(record.rating) || 0);

    // Place exactly one box directly after the Reading Status control row.
    host.insertAdjacentElement("afterend", box);
  }

  function onReadClick(e) {
    const button = e.target?.closest?.("button");
    if (!button || !visible(button) || clean(button.textContent).toLowerCase() !== "read") return;
    [100, 300].forEach(delay => setTimeout(() => {
      const current = readButtons().find(b => modalScope(b) === modalScope(button)) || button;
      insertRating(current);
    }, delay));
  }

  function init() {
    injectStyle();
    document.addEventListener("click", onReadClick, true);
    setTimeout(() => readButtons().forEach(insertRating), 250);

    const observer = new MutationObserver(() => {
      // Only inspect the currently visible Reading Status controls. The
      // per-host marker + scoped duplicate removal makes this idempotent.
      readButtons().forEach(insertRating);
    });
    observer.observe(document.body, {childList:true, subtree:true});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();
