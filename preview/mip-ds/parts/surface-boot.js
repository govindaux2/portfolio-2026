(function () {
  var params = new URLSearchParams(location.search);
  var surface = params.get("surface") === "light" ? "light" : "dark";
  document.documentElement.dataset.dsSurface = surface;
  document.documentElement.classList.add("ds-surface-" + surface);
  // Help parent know when ready
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "mip-ds-surface", surface: surface, href: location.href }, "*");
    }
  } catch (e) {}
})();
