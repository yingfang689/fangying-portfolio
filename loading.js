document.querySelectorAll(".pages img").forEach((img) => {
  const loader = document.createElement("div");
  loader.className = "image-loader";
  img.parentNode.insertBefore(loader, img);
  loader.appendChild(img);

  const reveal = () => loader.classList.add("is-loaded");
  if (img.complete && img.naturalWidth > 0) reveal();
  else {
    img.addEventListener("load", reveal, { once: true });
    img.addEventListener("error", reveal, { once: true });
  }
});
