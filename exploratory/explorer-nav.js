/**
 * Shared mobile-friendly tab strip for exploratory HTML files.
 * Include with: <script src="…/explorer-nav.js" data-base=".." data-group="design-system"></script>
 * data-base = relative path to exploratory/ (folder that contains index.html)
 */
(function () {
  const script = document.currentScript;
  if (!script) return;
  const base = (script.getAttribute("data-base") || ".").replace(/\/$/, "");
  const group = script.getAttribute("data-group") || "";
  const active = script.getAttribute("data-active") || "";

  const LINKS = {
    hub: { label: "Hub", href: base + "/index.html" },
    ideation: [
      {
        label: "Decisions",
        href: base + "/../portfolio/ideation/design-decision-approaches.html",
        id: "decisions",
      },
    ],
    "design-system": [
      { label: "Blueprint", href: base + "/design-system/design-system-agent-blueprint.html", id: "blueprint" },
      { label: "Checklist", href: base + "/design-system/design-system-checklist.html", id: "checklist" },
      { label: "Components", href: base + "/design-system/design-system-components.html", id: "components" },
      { label: "Motion", href: base + "/design-system/design-system-motion.html", id: "motion" },
      { label: "Neon grid", href: base + "/design-system/design-system-neon-grid.html", id: "neon" },
      { label: "Agent UI", href: base + "/design-system/design-system-agent-ui.html", id: "agent-ui" },
      { label: "Architecture", href: base + "/design-system/agent-ui-architecture.html", id: "architecture" },
    ],
    archive: [
      { label: "Agent UI legacy", href: base + "/archive/Agent-UI.html", id: "agent-ui-legacy" },
      { label: "Shader flow", href: base + "/archive/shader-flow.html", id: "shader" },
    ],
  };

  const style = document.createElement("style");
  style.textContent = `
    .exp-nav {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: stretch; gap: 0;
      background: rgba(14,16,19,.94);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid #262b33;
      font: 12.5px/1.2 "IBM Plex Sans", ui-sans-serif, -apple-system, "Segoe UI", sans-serif;
    }
    .exp-nav a {
      flex: 0 0 auto;
      color: #8b93a1;
      text-decoration: none;
      padding: 12px 12px;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
      border-right: 1px solid #1c2027;
    }
    .exp-nav a:hover { color: #e8eaed; background: #1a1e24; }
    .exp-nav a.active { color: #cfe0ff; background: #243044; }
    .exp-nav .hub {
      font-weight: 650;
      color: #e8eaed;
      background: #181c22;
    }
    .exp-nav .tabs {
      display: flex;
      flex: 1 1 auto;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      overscroll-behavior-x: contain;
    }
    .exp-nav .tabs::-webkit-scrollbar { display: none; }
    body.exp-nav-padded { padding-top: 0; }
  `;
  document.head.appendChild(style);

  const nav = document.createElement("nav");
  nav.className = "exp-nav";
  nav.setAttribute("aria-label", "Exploratory files");

  const hub = document.createElement("a");
  hub.className = "hub";
  hub.href = LINKS.hub.href;
  hub.textContent = "Hub";
  nav.appendChild(hub);

  const tabs = document.createElement("div");
  tabs.className = "tabs";
  tabs.setAttribute("role", "navigation");

  const items = LINKS[group] || [];
  items.forEach((item) => {
    const a = document.createElement("a");
    a.href = item.href;
    a.textContent = item.label;
    if (active && (active === item.id || active === item.label)) a.classList.add("active");
    tabs.appendChild(a);
  });

  // Always expose other groups as short jumps after siblings
  const jumps = [
    { label: "Ideation", href: LINKS.hub.href + "?group=ideation", show: group !== "ideation" },
    { label: "Design system", href: LINKS.hub.href + "?group=design-system", show: group !== "design-system" },
    { label: "Archive", href: LINKS.hub.href + "?group=archive", show: group !== "archive" },
  ];
  jumps.forEach((j) => {
    if (!j.show) return;
    const a = document.createElement("a");
    a.href = j.href;
    a.textContent = j.label;
    a.style.color = "#6f7787";
    tabs.appendChild(a);
  });

  nav.appendChild(tabs);
  document.body.insertBefore(nav, document.body.firstChild);
  document.body.classList.add("exp-nav-padded");
})();
