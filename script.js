const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const year = document.getElementById("year");

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
  });
});

year.textContent = new Date().getFullYear();

const discordHeroButton = document.getElementById("discord-link");
const discordContactButton = document.getElementById("discord-contact");
const toast = document.getElementById("toast");

async function copyDiscord() {
  const username = "mathshenq";

  try {
    await navigator.clipboard.writeText(username);
  } catch (error) {
    const temp = document.createElement("textarea");
    temp.value = username;
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
  }

  toast.classList.add("show");
  clearTimeout(window.discordToastTimer);
  window.discordToastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

discordHeroButton?.addEventListener("click", copyDiscord);
discordContactButton?.addEventListener("click", copyDiscord);


// Parallax suave, com camadas independentes do layout e dos efeitos de hover.
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopPointer = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
const hero = document.querySelector(".hero");
const heroText = document.querySelector(".hero-text");
const photo = document.querySelector(".profile-photo-card");
const codeCard = document.querySelector(".code-card");
const scrollLayers = [
  ...document.querySelectorAll(".section-title, .skill-card, .project-card")
];
const layers = [heroText, photo, codeCard, ...scrollLayers].filter(Boolean);
const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));
let active = false;
let frame = 0;
let mouseX = 0;
let mouseY = 0;

function moveLayer(element, x, y) {
  if (element) element.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
}

function renderParallax() {
  frame = 0;
  if (!active) return;

  // Leia as posições antes de aplicar o movimento.
  const heroScroll = clamp(window.scrollY, 700);
  const offsets = scrollLayers.map((element, index) => {
    const rect = element.getBoundingClientRect();
    // Remova o deslocamento anterior para evitar realimentação.
    const previousY = parseFloat(element.style.translate.split(" ")[1]) || 0;
    const center = rect.top - previousY + rect.height / 2;
    return clamp((window.innerHeight / 2 - center) * (0.035 + (index % 3) * 0.008), 24);
  });

  moveLayer(heroText, mouseX * -10, mouseY * -6 + heroScroll * 0.025);
  moveLayer(photo, mouseX * 24, mouseY * 18 - heroScroll * 0.045);
  moveLayer(codeCard, mouseX * -30, mouseY * 22 - heroScroll * 0.065);
  scrollLayers.forEach((element, index) => moveLayer(element, 0, offsets[index]));
}

function requestParallax() {
  if (active && !frame) frame = window.requestAnimationFrame(renderParallax);
}

function updateParallax() {
  active = !motionPreference.matches && desktopPointer.matches;
  mouseX = 0;
  mouseY = 0;
  if (!active) {
    window.cancelAnimationFrame(frame);
    frame = 0;
    layers.forEach((element) => {
      element.style.removeProperty("translate");
      element.style.removeProperty("will-change");
      element.classList.remove("parallax-smooth");
    });
  } else {
    layers.forEach((element) => {
      element.style.willChange = "translate";
      element.classList.add("parallax-smooth");
    });
    requestParallax();
  }
}

hero?.addEventListener("pointermove", (event) => {
  if (!active) return;
  const rect = hero.getBoundingClientRect();
  mouseX = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, 1);
  mouseY = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, 1);
  requestParallax();
}, { passive: true });

hero?.addEventListener("pointerleave", () => {
  mouseX = 0;
  mouseY = 0;
  requestParallax();
});

window.addEventListener("scroll", requestParallax, { passive: true });
window.addEventListener("resize", requestParallax);
motionPreference.addEventListener("change", updateParallax);
desktopPointer.addEventListener("change", updateParallax);
updateParallax();
