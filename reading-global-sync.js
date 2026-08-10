/* Crossover Shelf — personal reading status + immediate star rating bridge */
(() => {
  "use strict";

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
      if (heading) {
        return clean(heading.textContent).replace(/^[A-FS]\s*Tier\s*[·•-]\s*\d+\/100\s*/i, "");
      }
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

  function insertRating(readButton) {
    if (!readButton || !visible(readButton)) return;
    const host = readButton.parentElement;
    if (!host) return;
    let root = host;
    for (let i = 0; i < 10 && root; i++, root = root.parentElement) {
      if (findTitle(root)) break;
    }
    const title = findTitle(host);
    if (!title) return;
    const author = findAuthor(host);
    const identity = keyFor(title, author);
    const old = [...document.querySelectorAll(".cs-rating-box")].find(b => b.dataset.bookKey === identity);
    if (old) return;

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
        e.stopImmediatePropagation();
        const chosen = Number(star.dataset.rating);
        render(box, chosen);
        saveRating(title, author, chosen);
      }, true);
      row.insertBefore(star, value);
    }
    render(box, Number(record.rating) || 0);

    // Insert immediately after the Reading Status button row.
    const rowParent = host.parentElement;
    if (rowParent) rowParent.insertBefore(box, host.nextSibling);
    else host.appendChild(box);
  }

  function onReadClick(e) {
    const button = e.target?.closest?.("button");
    if (!button || !visible(button) || clean(button.textContent).toLowerCase() !== "read") return;
    // Let the app finish its own status update/rerender, then attach to the resulting DOM.
    [60, 180, 400].forEach(delay => setTimeout(() => {
      const current = readButtons()[0] || button;
      insertRating(current);
    }, delay));
  }

  function init() {
    injectStyle();
    document.addEventListener("click", onReadClick, true);
    // If the modal is already open and Read is already selected, attach immediately.
    setTimeout(() => readButtons().forEach(insertRating), 150);
    const observer = new MutationObserver(() => {
      const buttons = readButtons();
      if (buttons.length) {
        const selected = buttons.find(b => b.matches(".active,[aria-pressed='true'],[aria-selected='true']")) || buttons[0];
        const text = clean(selected.textContent).toLowerCase();
        if (text === "read") insertRating(selected);
      }
    });
    observer.observe(document.body, {childList:true, subtree:true});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();
