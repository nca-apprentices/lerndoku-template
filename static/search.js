// Search on the doku list. Without JS the server-rendered list is visible.
// With JS, a query runs against the Pagefind index (built from the rendered
// entry pages) and swaps the #browse block for results; clearing the input
// restores the server-rendered page. Pagefind shards its index, so only the
// chunks a query touches are fetched, and the module loads lazily on first
// use.
(function () {
  const root = document.querySelector(".doku-index");
  if (!root) return;

  const input = document.getElementById("doku-search");
  const count = document.getElementById("doku-count");
  const empty = document.getElementById("search-empty");
  const results = document.getElementById("search-results");
  const more = document.getElementById("search-more");
  const browse = document.getElementById("browse");
  const basePath = new URL(root.dataset.base).pathname.replace(/\/$/, "");
  const BATCH = 20;

  let pagefind = null;
  let unavailable = false;
  let current = null;
  let shown = 0;
  let token = 0; // guards against out-of-order async renders
  let timer = null;

  async function loadPagefind() {
    if (unavailable) throw new Error("pagefind unavailable");
    if (!pagefind) {
      try {
        pagefind = await import(basePath + "/pagefind/pagefind.js");
        await pagefind.init();
      } catch (err) {
        // The index is built after `zola build` (Pagefind), so it is absent
        // under `zola serve`. Disable search rather than retry per keystroke.
        unavailable = true;
        throw err;
      }
    }
    return pagefind;
  }

  // Pagefind already prefixes result URLs with its auto-detected base path.
  function resolveUrl(url) {
    if (!basePath || url.startsWith(basePath + "/")) return url;
    return basePath + url;
  }

  function formatDate(iso) {
    const [y, m, d] = iso.split("T")[0].split("-");
    return d + "." + m + "." + y;
  }

  function renderRow(data) {
    const meta = data.meta || {};
    const li = document.createElement("li");
    const card = document.createElement("a");
    card.className = "doku-card";
    card.href = resolveUrl(data.url);
    const metaLine = document.createElement("span");
    metaLine.className = "doku-meta";
    if (meta.date) {
      const time = document.createElement("time");
      time.dateTime = meta.date;
      time.textContent = formatDate(meta.date);
      metaLine.appendChild(time);
      card.appendChild(metaLine);
    }
    const title = document.createElement("span");
    title.className = "doku-title";
    title.textContent = meta.title || "";
    card.appendChild(title);
    if (data.excerpt) {
      card.appendChild(renderExcerpt(data.excerpt));
    }
    li.appendChild(card);
    return li;
  }

  // Pagefind excerpts are escaped text plus <mark> highlights. Rebuild them
  // with DOM methods, keeping only text and <mark>, instead of raw innerHTML.
  function renderExcerpt(excerpt) {
    const summary = document.createElement("span");
    summary.className = "doku-summary";
    const parsed = new DOMParser().parseFromString(excerpt, "text/html");
    for (const node of parsed.body.childNodes) {
      if (node.nodeName === "MARK") {
        const mark = document.createElement("mark");
        mark.textContent = node.textContent;
        summary.appendChild(mark);
      } else {
        summary.appendChild(document.createTextNode(node.textContent));
      }
    }
    return summary;
  }

  // Build a batch of rows off-DOM and swap in one step, so typing does not
  // flash an empty list or shift the page.
  async function buildRows(start) {
    const slice = current.results.slice(start, start + BATCH);
    const datas = await Promise.all(slice.map((result) => result.data()));
    const fragment = document.createDocumentFragment();
    for (const data of datas) fragment.appendChild(renderRow(data));
    return { fragment, length: datas.length };
  }

  function showBrowse() {
    browse.hidden = false;
    results.replaceChildren();
    results.hidden = true;
    empty.hidden = true;
    more.hidden = true;
    count.textContent = "";
  }

  async function run(query) {
    const mine = ++token;
    let pf, found;
    try {
      pf = await loadPagefind();
      found = await pf.search(query);
    } catch (err) {
      return; // index unavailable (e.g. `zola serve`); keep the browse
    }
    if (mine !== token) return; // a newer query superseded this one
    current = found;
    const total = found.results.length;
    if (total === 0) {
      browse.hidden = true;
      results.replaceChildren();
      results.hidden = true;
      empty.hidden = false;
      more.hidden = true;
      count.textContent = "";
      return;
    }
    const { fragment, length } = await buildRows(0);
    if (mine !== token) return; // re-check: data() awaited above
    shown = length;
    results.replaceChildren(fragment);
    results.hidden = false;
    empty.hidden = true;
    browse.hidden = true;
    count.textContent = total + (total === 1 ? " Eintrag" : " Einträge");
    more.hidden = shown >= total;
  }

  async function loadMore() {
    if (!current) return;
    const mine = token;
    const { fragment, length } = await buildRows(shown);
    if (mine !== token) return; // query changed while this batch loaded
    results.appendChild(fragment);
    shown += length;
    more.hidden = shown >= current.results.length;
  }

  input.addEventListener("input", function () {
    const query = input.value.trim();
    clearTimeout(timer);
    if (!query) {
      ++token;
      showBrowse();
      return;
    }
    timer = setTimeout(() => run(query), 150);
  });

  more.addEventListener("click", loadMore);
})();
