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


/* ============================================================
   Parallax de fundo: símbolos de programação desfocados
   - 3 camadas de profundidade (longe, meio, perto)
   - cada símbolo sobe/desce em velocidade própria conforme a rolagem
   - ao sair por um lado da tela, reaparece pelo outro (loop infinito)
   - também balança no eixo X e gira levemente
   - todo o estilo é aplicado via CSSOM (compatível com a CSP do Vercel)
   ============================================================ */
const SVG_NS = "http://www.w3.org/2000/svg";

const SVG_SHAPES = {
  hex: [["polygon", { points: "12 2 21 7 21 17 12 22 3 17 3 7" }]],
  ring: [["circle", { cx: 12, cy: 12, r: 9 }]],
  tri: [["polygon", { points: "12 3 22 20 2 20" }]],
  branch: [
    ["circle", { cx: 6, cy: 5, r: 2.5 }],
    ["circle", { cx: 6, cy: 19, r: 2.5 }],
    ["circle", { cx: 18, cy: 9, r: 2.5 }],
    ["path", { d: "M6 7.5v9M18 11.5c0 4-12 1.5-12 5" }]
  ],
  dots: [5, 12, 19].flatMap((cy) =>
    [5, 12, 19].map((cx) => ["circle", { cx, cy, r: 1.4, fill: "currentColor", stroke: "none" }])
  )
};

// Camadas: speed = quanto o símbolo acompanha a rolagem (menor = mais "distante")
const BG_DEPTHS = [
  { speed: 0.12, blur: 5, opacity: 0.22 }, // 0: longe
  { speed: 0.30, blur: 3, opacity: 0.28 }, // 1: meio
  { speed: 0.60, blur: 9, opacity: 0.16 }  // 2: perto (bokeh grande)
];

const BG_COLORS = ["#6ea8ff", "#91f0d0", "#cdd8e8"];

// [conteúdo, x (0–1 da largura), y inicial (0–1), tamanho px, camada, cor, rotação, giro por px rolado]
const BG_SYMBOLS = [
  // Longe
  ["{ }",      0.06, 0.10, 38, 0, 0, -12,  0.010],
  ["</>",      0.88, 0.22, 34, 0, 1,   8, -0.008],
  ["svg:hex",  0.30, 0.45, 40, 0, 2,   0,  0.020],
  ["01",       0.72, 0.58, 30, 0, 0,   0,  0],
  ["=>",       0.14, 0.72, 36, 0, 1,  -6,  0.008],
  ["svg:dots", 0.52, 0.86, 34, 0, 2,   0,  0],
  ["( )",      0.94, 0.78, 32, 0, 0,  10, -0.010],
  ["//",       0.42, 0.05, 30, 0, 1,   0,  0],
  ["svg:ring", 0.64, 0.35, 36, 0, 0,   0,  0],
  ["&&",       0.22, 0.92, 30, 0, 2,   0,  0],
  // Meio
  ["svg:branch", 0.10, 0.30, 56, 1, 0,   0,  0.016],
  ["[ ]",        0.80, 0.08, 52, 1, 1,   6, -0.012],
  [">_",         0.36, 0.28, 48, 1, 2,   0,  0],
  ["svg:tri",    0.90, 0.50, 50, 1, 0,  14,  0.024],
  [";",          0.56, 0.62, 64, 1, 1,   0,  0],
  ["<div>",      0.20, 0.55, 44, 1, 2,  -8,  0.010],
  ["svg:hex",    0.70, 0.90, 58, 1, 1,   0, -0.020],
  ["#",          0.04, 0.80, 50, 1, 0,   0,  0.014],
  ["!==",        0.48, 0.75, 44, 1, 0,   0,  0],
  ["{ }",        0.84, 0.34, 60, 1, 2,  10,  0.010],
  // Perto
  ["{ }",        0.02, 0.20, 140, 2, 0, -10,  0.012],
  ["</>",        0.78, 0.60, 120, 2, 1,   6, -0.010],
  ["svg:hex",    0.40, 0.88, 130, 2, 0,   0,  0.020],
  ["svg:ring",   0.92, 0.12, 110, 2, 1,   0,  0],
  ["( )",        0.30, 0.50, 120, 2, 2,   0,  0]
];

const bgLayer = document.createElement("div");
bgLayer.className = "bg-symbols";
bgLayer.setAttribute("aria-hidden", "true");
document.body.prepend(bgLayer);

const mobileViewport = window.matchMedia("(max-width: 680px)");
let bgItems = [];
let bgTarget = 0;
let bgCurrent = 0;
let bgFrame = 0;

function createSvgShape(name) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  (SVG_SHAPES[name] || []).forEach(([tag, attrs]) => {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    svg.appendChild(node);
  });
  return svg;
}

function buildBackgroundSymbols() {
  bgLayer.replaceChildren();
  bgItems = [];

  const small = mobileViewport.matches;
  const list = small ? BG_SYMBOLS.filter((_, index) => index % 2 === 0) : BG_SYMBOLS;
  const scale = small ? 0.7 : 1;

  list.forEach(([content, x, base, size, depth, color, rotation, spin], index) => {
    const layer = BG_DEPTHS[depth];
    const element = document.createElement("div");
    element.className = `bg-symbol depth-${depth}`;

    if (content.startsWith("svg:")) {
      element.appendChild(createSvgShape(content.slice(4)));
    } else {
      element.textContent = content;
    }

    const px = size * scale;
    element.style.fontSize = `${px}px`;
    element.style.color = BG_COLORS[color];
    element.style.opacity = String(layer.opacity);
    element.style.filter = `blur(${layer.blur * (small ? 0.8 : 1)}px)`;

    bgLayer.appendChild(element);
    bgItems.push({
      element,
      x,
      base,
      speed: layer.speed,
      margin: px * 1.5 + layer.blur * 3,
      rotation,
      spin,
      sway: 14 + depth * 14,
      wave: 380 + index * 53,
      phase: index * 1.7
    });
  });

  drawBackgroundSymbols(bgCurrent);
}

const wrap = (value, range) => ((value % range) + range) % range;

function drawBackgroundSymbols(scroll) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const still = motionPreference.matches;

  bgItems.forEach((item) => {
    const range = vh + item.margin * 2;
    const offset = still ? 0 : scroll * item.speed;
    const y = wrap(item.base * range - offset, range) - item.margin;
    const sway = still ? 0 : Math.sin(scroll / item.wave + item.phase) * item.sway;
    const x = item.x * vw + sway;
    const angle = item.rotation + (still ? 0 : scroll * item.spin);

    item.element.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    item.element.style.rotate = `${angle.toFixed(2)}deg`;
  });
}

function tickBackground() {
  // Inércia: o fundo "alcança" a rolagem aos poucos, o que reforça a profundidade.
  bgCurrent += (bgTarget - bgCurrent) * 0.12;
  if (Math.abs(bgTarget - bgCurrent) < 0.1) bgCurrent = bgTarget;
  drawBackgroundSymbols(bgCurrent);
  bgFrame = bgCurrent !== bgTarget ? window.requestAnimationFrame(tickBackground) : 0;
}

function onBackgroundScroll() {
  if (motionPreference.matches) return;
  bgTarget = window.scrollY;
  if (!bgFrame) bgFrame = window.requestAnimationFrame(tickBackground);
}

function onBackgroundResize() {
  drawBackgroundSymbols(bgCurrent);
}

window.addEventListener("scroll", onBackgroundScroll, { passive: true });
window.addEventListener("resize", onBackgroundResize);
mobileViewport.addEventListener("change", buildBackgroundSymbols);
motionPreference.addEventListener("change", () => {
  bgTarget = bgCurrent = window.scrollY;
  drawBackgroundSymbols(bgCurrent);
});

bgTarget = bgCurrent = window.scrollY;
buildBackgroundSymbols();
