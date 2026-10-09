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
  ...document.querySelectorAll(".section-tag, .section-title, .section-content > p, .info-card, .skill-card, .project-card, .contact-card > div:first-child, .contact-item, .footer .container")
];
const layers = [heroText, photo, codeCard, ...scrollLayers].filter(Boolean);
const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));
let active = false;
let frame = 0;
let mouseX = 0;
let mouseY = 0;
let pointerSection = null;

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
    const previousY = parseFloat(getComputedStyle(element).translate.split(" ")[1]) || 0;
    const center = rect.top - previousY + rect.height / 2;
    const isHeading = element.matches(".section-title, .section-tag");
    const speed = isHeading ? 0.12 : 0.08 + (index % 3) * 0.025;
    return clamp((window.innerHeight / 2 - center) * speed, isHeading ? 48 : 56);
  });

  const heroX = pointerSection === hero ? mouseX : 0;
  const heroY = pointerSection === hero ? mouseY : 0;
  moveLayer(heroText, heroX * -18, heroY * -12 + heroScroll * 0.05);
  moveLayer(photo, heroX * 42, heroY * 30 - heroScroll * 0.08);
  moveLayer(codeCard, heroX * -50, heroY * 36 - heroScroll * 0.11);
  scrollLayers.forEach((element, index) => {
    const hovered = element.closest(".section, .footer") === pointerSection;
    const direction = index % 2 ? -1 : 1;
    // Contatos têm menos movimento para continuar fáceis de clicar.
    const depth = element.matches(".contact-item") ? 4 : 10 + (index % 3) * 4;
    moveLayer(element, hovered ? mouseX * depth * direction : 0,
      offsets[index] + (hovered ? mouseY * depth * 0.6 : 0));
  });
}

function requestParallax() {
  if (active && !frame) frame = window.requestAnimationFrame(renderParallax);
}

function updateParallax() {
  active = !motionPreference.matches && desktopPointer.matches;
  mouseX = 0;
  mouseY = 0;
  pointerSection = null;
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

document.addEventListener("pointermove", (event) => {
  if (!active) return;
  pointerSection = event.target.closest(".section, .footer");
  if (pointerSection) {
    const rect = pointerSection.getBoundingClientRect();
    mouseX = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, 1);
    mouseY = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, 1);
  } else {
    mouseX = 0;
    mouseY = 0;
  }
  requestParallax();
}, { passive: true });

document.documentElement.addEventListener("pointerleave", () => {
  mouseX = 0;
  mouseY = 0;
  pointerSection = null;
  requestParallax();
});

window.addEventListener("scroll", requestParallax, { passive: true });
window.addEventListener("resize", requestParallax);
motionPreference.addEventListener("change", updateParallax);
desktopPointer.addEventListener("change", updateParallax);
updateParallax();
