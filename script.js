(() => {
  // Keep bookmarks from the former single-page profile useful.
  if (document.body.dataset.page === "index") {
    const oldSections = {
      "#research": "research.html", "#work": "research.html",
      "#publications": "publications.html", "#approach": "experience.html#skills",
      "#presentations-title": "conferences.html",
    };
    const redirectOldSection = () => {
      const target = oldSections[window.location.hash];
      if (target) window.location.replace(target);
    };
    redirectOldSection();
    window.addEventListener("hashchange", redirectOldSection);
  }

  const groups = [...document.querySelectorAll(".publication-group")];
  const filters = [...document.querySelectorAll("[data-filter]")];
  if (!groups.length) return;
  const status = document.querySelector("#filter-result");
  const known = new Set(["all", ...groups.map((group) => group.id)]);

  function renderFilter() {
    const hash = window.location.hash.slice(1);
    // Individual article permalinks reveal their containing category too.
    const articleGroup = document.getElementById(hash)?.closest(".publication-group");
    const selected = known.has(hash) ? hash : articleGroup?.id || "published";
    let count = 0;
    groups.forEach((group) => {
      group.hidden = selected !== "all" && group.id !== selected;
      if (!group.hidden) count += group.querySelectorAll(".publication").length;
    });
    filters.forEach((filter) => {
      if (filter.dataset.filter === selected) filter.setAttribute("aria-current", "true");
      else filter.removeAttribute("aria-current");
    });
    const label = filters.find((filter) => filter.dataset.filter === selected)?.childNodes[0].textContent.trim();
    status.textContent = `${count} ${count === 1 ? "record" : "records"} · ${label}`;
    if (articleGroup && !known.has(hash)) document.getElementById(hash).scrollIntoView();
  }

  filters.forEach((filter) => filter.addEventListener("click", (event) => {
    // Preserve native link behavior for open-in-new-tab and modified clicks.
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const nextHash = `#${filter.dataset.filter}`;
    if (location.hash !== nextHash) history.pushState(null, "", nextHash);
    renderFilter();
  }));
  window.addEventListener("hashchange", renderFilter);
  window.addEventListener("popstate", renderFilter);
  renderFilter();
})();
