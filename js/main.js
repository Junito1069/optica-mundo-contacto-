const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.getElementById("siteHeader");
window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 24), { passive: true });

const stage = document.getElementById("eyewearStage");
const frame = stage.querySelector(".hero-frame");
if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
  stage.addEventListener("pointermove", (event) => {
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    frame.style.transform = `rotateY(${x * 7}deg) rotateX(${y * -5}deg) translate3d(${x * 12}px, ${y * 8}px, 0)`;
  });
  stage.addEventListener("pointerleave", () => { frame.style.transform = ""; });
}

const cursorDot = document.querySelector(".cursor-dot");
const cursorLabel = document.querySelector(".cursor-label");
if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
  document.body.classList.add("has-custom-cursor");
  window.addEventListener("pointermove", (event) => {
    cursorDot.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    cursorLabel.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  });
  document.querySelectorAll("a, button, [data-cursor]").forEach((element) => {
    element.addEventListener("pointerenter", () => {
      cursorLabel.textContent = element.dataset.cursor || "VIEW";
      document.body.classList.add("cursor-active");
    });
    element.addEventListener("pointerleave", () => document.body.classList.remove("cursor-active"));
  });
}

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .15 });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
menuToggle.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  mobileMenu.setAttribute("aria-hidden", String(!open));
  menuToggle.setAttribute("aria-expanded", String(open));
});
mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => menuToggle.click()));

const searchOverlay = document.getElementById("searchOverlay");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const products = [
  { name: "AXIS 01", type: "OPTICAL FRAME / ONYX" },
  { name: "ARC 02", type: "SUNGLASSES / SMOKE" },
  { name: "VECTOR 03", type: "OPTICAL FRAME / SILVER" }
];
document.querySelectorAll("[data-search-open]").forEach((button) => button.addEventListener("click", () => {
  searchOverlay.classList.add("open");
  searchOverlay.setAttribute("aria-hidden", "false");
  setTimeout(() => searchInput.focus(), 250);
}));
function closeSearch() {
  searchOverlay.classList.remove("open");
  searchOverlay.setAttribute("aria-hidden", "true");
}
document.querySelector("[data-search-close]").addEventListener("click", closeSearch);
window.addEventListener("keydown", (event) => { if (event.key === "Escape") closeSearch(); });
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();
  const matches = products.filter((product) => `${product.name} ${product.type}`.toLowerCase().includes(query));
  searchResults.innerHTML = query ? (matches.length
    ? matches.map((product) => `<div>${product.name}<span>${product.type}</span></div>`).join("")
    : "<div>NO OBJECTS FOUND</div>") : "";
});