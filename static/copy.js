// Adds a copy button to code blocks. Line numbers (```lang,linenos) are
// excluded from the copied text. Without JS there is simply no button.
(function () {
  const parseIcon = (svg) =>
    new DOMParser().parseFromString(svg, "image/svg+xml").documentElement;

  const copyIcon = parseIcon(
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" ' +
      'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="9" y="9" width="13" height="13" rx="2"/>' +
      '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  );
  const checkIcon = parseIcon(
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" ' +
      'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M20 6 9 17l-5-5"/></svg>',
  );

  function setState(button, icon, label) {
    button.replaceChildren(icon.cloneNode(true));
    button.setAttribute("aria-label", label);
    button.title = label;
  }

  for (const pre of document.querySelectorAll(".prose-body pre")) {
    const code = pre.querySelector("code");
    if (!code) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-button";
    setState(button, copyIcon, "Kopieren");
    button.addEventListener("click", async () => {
      const clone = code.cloneNode(true);
      for (const ln of clone.querySelectorAll(".giallo-ln")) ln.remove();
      try {
        await navigator.clipboard.writeText(clone.textContent.replace(/\n$/, ""));
      } catch (err) {
        return; // clipboard unavailable (insecure context); keep quiet
      }
      setState(button, checkIcon, "Kopiert");
      button.classList.add("copied");
      setTimeout(() => {
        setState(button, copyIcon, "Kopieren");
        button.classList.remove("copied");
      }, 2000);
    });
    pre.appendChild(button);
  }
})();
