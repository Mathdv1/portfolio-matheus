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


// Parallax acionado exclusivamente pela rolagem da página.
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopViewport = window.matchMedia("(min-width: 901px)");
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

function moveLayer(element, x, y) {
  if (element) element.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
}

function renderParallax() {
  frame = 0;
  if (!active) return;

  // Leia as posições antes de aplicar o movimento.
  const heroScroll = clamp(window.scrollY, 700);
  // Luzes de fundo em velocidades diferentes reforçam a profundidade.
  const travel = Math.sin(window.scrollY / 650);
  document.body.style.setProperty("--ambient-x", `${(travel * 45).toFixed(2)}px`);
  document.body.style.setProperty("--ambient-y", `${(travel * 140).toFixed(2)}px`);
  document.body.style.setProperty("--ambient-reverse-x", `${(travel * -35).toFixed(2)}px`);
  document.body.style.setProperty("--ambient-reverse-y", `${(-travel * 100).toFixed(2)}px`);
  const offsets = scrollLayers.map((element, index) => {
    const rect = element.getBoundingClientRect();
    // Remova o deslocamento anterior para evitar realimentação.
    const previousY = parseFloat(getComputedStyle(element).translate.split(" ")[1]) || 0;
    const center = rect.top - previousY + rect.height / 2;
    const isHeading = element.matches(".section-title, .section-tag");
    const speed = isHeading ? 0.12 : 0.08 + (index % 3) * 0.025;
    return clamp((window.innerHeight / 2 - center) * speed, isHeading ? 48 : 56);
  });

  moveLayer(heroText, 0, heroScroll * 0.07);
  moveLayer(photo, 0, -heroScroll * 0.12);
  moveLayer(codeCard, 0, -heroScroll * 0.18);
  scrollLayers.forEach((element, index) => moveLayer(element, 0, offsets[index]));
}

function requestParallax() {
  if (active && !frame) frame = window.requestAnimationFrame(renderParallax);
}

function updateParallax() {
  active = !motionPreference.matches && desktopViewport.matches;
  document.body.classList.toggle("parallax-active", active);
  if (!active) {
    ["--ambient-x", "--ambient-y", "--ambient-reverse-x", "--ambient-reverse-y"]
      .forEach((property) => document.body.style.removeProperty(property));
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

window.addEventListener("scroll", requestParallax, { passive: true });
window.addEventListener("resize", requestParallax);
motionPreference.addEventListener("change", updateParallax);
desktopViewport.addEventListener("change", updateParallax);
updateParallax();
