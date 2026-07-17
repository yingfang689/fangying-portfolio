const MAX_ATTEMPTS = 3;
const LOAD_TIMEOUT = 15000;

document.querySelectorAll(".pages img").forEach((img) => {
  const source = img.dataset.src || img.getAttribute("src");
  const loader = document.createElement("div");
  const retryButton = document.createElement("button");
  let attempts = 0;
  let timer;
  let requestId = 0;

  loader.className = "image-loader";
  retryButton.className = "retry-button";
  retryButton.type = "button";
  retryButton.textContent = "重新加载";
  retryButton.hidden = true;
  loader.appendChild(retryButton);
  img.parentNode.insertBefore(loader, img);
  loader.appendChild(img);

  const success = () => {
    clearTimeout(timer);
    loader.classList.remove("is-failed");
    loader.classList.add("is-loaded");
    retryButton.hidden = true;
  };

  const fail = (id) => {
    if (id !== requestId || loader.classList.contains("is-loaded")) return;
    clearTimeout(timer);
    img.removeAttribute("src");
    if (attempts < MAX_ATTEMPTS) {
      setTimeout(load, 500 * attempts);
    } else {
      loader.classList.add("is-failed");
      retryButton.hidden = false;
    }
  };

  const load = () => {
    attempts += 1;
    requestId += 1;
    const id = requestId;
    loader.classList.remove("is-failed");
    retryButton.hidden = true;
    img.onload = success;
    img.onerror = () => fail(id);
    const separator = source.includes("?") ? "&" : "?";
    img.src = attempts === 1 ? source : `${source}${separator}retry=${Date.now()}`;
    timer = setTimeout(() => fail(id), LOAD_TIMEOUT);
  };

  retryButton.addEventListener("click", () => {
    attempts = 0;
    load();
  });

  if (img.complete && img.naturalWidth > 0) {
    success();
  } else if (img.dataset.src && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        load();
      }
    }, { rootMargin: "900px 0px" });
    observer.observe(loader);
  } else {
    load();
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
}
