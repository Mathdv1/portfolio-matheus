/* ============================================================
   Portfólio — Matheus Souza
   Todo o estilo dinâmico é aplicado via CSSOM (style.setProperty,
   classList...), compatível com a CSP do Vercel (style-src 'self').
   ============================================================ */

const root = document.documentElement;
root.classList.add("js");

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* ignora */ } }
};
const session = {
  get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { sessionStorage.setItem(key, value); } catch { /* ignora */ } }
};

/* ---------- Ano no rodapé ---------- */
$("#year").textContent = new Date().getFullYear();

/* ---------- Menu mobile ---------- */
const menuBtn = $("#menu-btn");
const navLinks = $("#nav-links");

function setMenu(open) {
  navLinks.classList.toggle("open", open);
  menuBtn.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
}
menuBtn.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
$$("a", navLinks).forEach((link) => link.addEventListener("click", () => setMenu(false)));

/* ---------- Paletas de cor ---------- */
const themePicker = $("#theme-picker");
const themeToggle = $("#theme-toggle");
const THEMES = ["aurora", "neon", "sunset", "ocean"];

function applyTheme(name, save = true) {
  if (!THEMES.includes(name)) name = "aurora";
  root.dataset.theme = name;
  if (save) store.set("theme", name);
  readThemeColors();
}

themeToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  const open = !themePicker.classList.contains("open");
  themePicker.classList.toggle("open", open);
  themeToggle.setAttribute("aria-expanded", String(open));
});
$$("[data-theme-set]").forEach((button) => {
  button.addEventListener("click", () => {
    applyTheme(button.dataset.themeSet);
    themePicker.classList.remove("open");
    themeToggle.setAttribute("aria-expanded", "false");
  });
});
document.addEventListener("click", (event) => {
  if (!themePicker.contains(event.target)) {
    themePicker.classList.remove("open");
    themeToggle.setAttribute("aria-expanded", "false");
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") { themePicker.classList.remove("open"); setMenu(false); }
});

/* ---------- Toast + copiar Discord ---------- */
const toast = $("#toast");
let toastTimer = 0;

function showToast(title, text) {
  $("#toast-title").textContent = title;
  $("#toast-text").textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

async function copyDiscord() {
  const username = "mathshenq";
  try {
    await navigator.clipboard.writeText(username);
  } catch {
    const temp = document.createElement("textarea");
    temp.value = username;
    temp.setAttribute("readonly", "");
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
  }
  showToast("Discord copiado!", username);
}
$("#discord-link")?.addEventListener("click", copyDiscord);
$("#discord-contact")?.addEventListener("click", copyDiscord);

/* ---------- Barra de progresso, header e menu ativo ---------- */
const header = $("#header");
const sections = $$("main section[id]");
const navAnchors = $$(".nav-links a");

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  root.style.setProperty("--p", max > 0 ? (window.scrollY / max).toFixed(4) : "0");
  header.classList.toggle("scrolled", window.scrollY > 10);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
sections.forEach((section) => sectionObserver.observe(section));

/* ---------- Cores do tema para o canvas ---------- */
let themeRGB = [[139, 123, 255], [53, 224, 255], [255, 122, 217]];

function hexToRgb(hex) {
  const value = hex.trim().replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function readThemeColors() {
  const styles = getComputedStyle(root);
  const colors = ["--a1", "--a2", "--a3"].map((name) => styles.getPropertyValue(name)).filter(Boolean);
  if (colors.length === 3) themeRGB = colors.map(hexToRgb);
}

applyTheme(store.get("theme") || "aurora", false);

/* ---------- Partículas interativas ---------- */
const canvas = $("#particles");
const ctx = canvas.getContext("2d");
const pointer = { x: -9999, y: -9999 };
let particles = [];
let cw = 0;
let ch = 0;
let dpr = 1;
let particleFrame = 0;

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cw = window.innerWidth;
  ch = window.innerHeight;
  canvas.width = Math.floor(cw * dpr);
  canvas.height = Math.floor(ch * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = clamp(Math.floor((cw * ch) / 17000), 28, 90);
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * cw,
    y: Math.random() * ch,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.8 + 0.6,
    depth: Math.random() * 0.8 + 0.2,
    c: Math.floor(Math.random() * 3)
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, cw, ch);
  const scrollShift = window.scrollY * 0.04;
  const link = 130;

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < -20) p.x = cw + 20; else if (p.x > cw + 20) p.x = -20;
    if (p.y < -20) p.y = ch + 20; else if (p.y > ch + 20) p.y = -20;

    const dx = p.x - pointer.x;
    const dy = p.y - pointer.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 150 && dist > 0) {
      const force = (150 - dist) / 150;
      p.x += (dx / dist) * force * 1.6;
      p.y += (dy / dist) * force * 1.6;
    }
  }

  for (let i = 0; i < particles.length; i++) {
    const a = particles[i];
    const ay = (((a.y - scrollShift * a.depth) % ch) + ch) % ch;
    const [r, g, b] = themeRGB[a.c];

    ctx.beginPath();
    ctx.fillStyle = `rgba(${r},${g},${b},${0.35 + a.depth * 0.45})`;
    ctx.arc(a.x, ay, a.r * (0.8 + a.depth), 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      const c = particles[j];
      const cy = (((c.y - scrollShift * c.depth) % ch) + ch) % ch;
      const d = Math.hypot(a.x - c.x, ay - cy);
      if (d < link) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - d / link) * 0.22})`;
        ctx.lineWidth = 1;
        ctx.moveTo(a.x, ay);
        ctx.lineTo(c.x, cy);
        ctx.stroke();
      }
    }
  }
  particleFrame = requestAnimationFrame(drawParticles);
}

function startParticles() {
  cancelAnimationFrame(particleFrame);
  resizeCanvas();
  if (reduceMotion.matches) { drawParticles(); cancelAnimationFrame(particleFrame); return; }
  drawParticles();
}
window.addEventListener("resize", () => { resizeCanvas(); });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) cancelAnimationFrame(particleFrame);
  else if (!reduceMotion.matches) drawParticles();
});
startParticles();

/* ---------- Cursor, spotlight, tilt e magnetismo ---------- */
const glow = $("#cursor-glow");
const ring = $("#cursor-ring");
let ringX = 0;
let ringY = 0;
let glowX = 0;
let glowY = 0;
let cursorFrame = 0;

function cursorLoop() {
  ringX += (pointer.x - ringX) * 0.22;
  ringY += (pointer.y - ringY) * 0.22;
  glowX += (pointer.x - glowX) * 0.08;
  glowY += (pointer.y - glowY) * 0.08;
  ring.style.transform = `translate(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px)`;
  glow.style.transform = `translate(${glowX.toFixed(1)}px, ${glowY.toFixed(1)}px)`;
  cursorFrame = requestAnimationFrame(cursorLoop);
}

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;

  if (finePointer.matches && !root.classList.contains("has-cursor")) {
    ringX = glowX = pointer.x;
    ringY = glowY = pointer.y;
    root.classList.add("has-cursor");
    if (!cursorFrame) cursorLoop();
  }

  const hot = event.target.closest?.("a, button, .tilt, .spot");
  ring.classList.toggle("hot", Boolean(hot));
}, { passive: true });

window.addEventListener("pointerleave", () => { pointer.x = pointer.y = -9999; });
document.addEventListener("mouseleave", () => { pointer.x = pointer.y = -9999; });

/* Spotlight que segue o mouse dentro de cada cartão */
$$(".spot").forEach((el) => {
  el.addEventListener("pointermove", (event) => {
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
});

/* Inclinação 3D + brilho */
$$(".tilt").forEach((el) => {
  const strength = parseFloat(el.dataset.tilt) || 10;
  const glare = $(".glare", el);

  el.addEventListener("pointermove", (event) => {
    if (reduceMotion.matches || event.pointerType === "touch") return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    el.style.setProperty("--ry", `${((px - 0.5) * strength * 2).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${((0.5 - py) * strength * 2).toFixed(2)}deg`);
    if (glare) {
      glare.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
      glare.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
    }
  });
  el.addEventListener("pointerleave", () => {
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  });
});

/* Botões magnéticos */
$$(".magnetic").forEach((el) => {
  el.addEventListener("pointermove", (event) => {
    if (reduceMotion.matches || event.pointerType === "touch") return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) * 0.28;
    const y = (event.clientY - (rect.top + rect.height / 2)) * 0.28;
    el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
  });
  el.addEventListener("pointerleave", () => { el.style.translate = "0px 0px"; });
});

/* ---------- Marquee infinito (duplica o conteúdo) ---------- */
const track = $("#marquee-track");
if (track) {
  const items = [...track.children];
  const clone = document.createDocumentFragment();
  items.forEach((item) => clone.appendChild(item.cloneNode(true)));
  track.appendChild(clone);
}

/* ---------- Revelar ao rolar ---------- */
$$(".stagger").forEach((group) => {
  $$(":scope > .reveal", group).forEach((child, index) => child.style.setProperty("--d", `${index * 90}ms`));
});

const counterDone = new WeakSet();

function runCounter(el) {
  if (counterDone.has(el)) return;
  counterDone.add(el);
  const target = parseInt(el.dataset.count, 10);
  if (reduceMotion.matches) { el.textContent = target; return; }
  const start = performance.now();
  const duration = 1400;
  const step = (now) => {
    const t = clamp((now - start) / duration, 0, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in");
    $$("[data-count]", entry.target).forEach(runCounter);
    if (entry.target.id === "terminal") startTerminal();
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });

function startReveal() {
  $$(".reveal").forEach((el) => revealObserver.observe(el));
}

/* ---------- Máquina de escrever (cargos) ---------- */
const typedEl = $("#typed");
const roles = [
  "Desenvolvedor em evolução",
  "Criador de projetos",
  "Estudante de JavaScript",
  "Explorador de Node.js"
];
let typingStarted = false;

async function typeRoles() {
  if (typingStarted) return;
  typingStarted = true;
  if (reduceMotion.matches) return;
  let index = 0;
  typedEl.textContent = "";
  for (;;) {
    const word = roles[index % roles.length];
    for (let i = 1; i <= word.length; i++) {
      typedEl.textContent = word.slice(0, i);
      await sleep(55);
    }
    await sleep(1700);
    for (let i = word.length - 1; i >= 0; i--) {
      typedEl.textContent = word.slice(0, i);
      await sleep(28);
    }
    await sleep(300);
    index++;
  }
}

/* ---------- Terminal da seção "Sobre" ---------- */
const terminalBody = $("#terminal-body");
let terminalStarted = false;

const terminalScript = [
  { cmd: "whoami", out: "matheus-souza" },
  { cmd: "cat foco.txt", out: "programação, projetos e muita curiosidade" },
  { cmd: "ls objetivos/", out: "aprender/  construir/  evoluir/" },
  { cmd: "echo $STATUS", out: "em evolução constante ✦" }
];

function line(parts) {
  const row = document.createElement("div");
  parts.forEach(([cls, text]) => {
    const span = document.createElement("span");
    span.className = cls;
    span.textContent = text;
    row.appendChild(span);
  });
  terminalBody.appendChild(row);
  return row;
}

async function startTerminal() {
  if (terminalStarted) return;
  terminalStarted = true;
  const instant = reduceMotion.matches;

  for (const step of terminalScript) {
    const row = line([["p", "➜ "], ["hl", "~ "], ["c", ""]]);
    const cmd = row.lastChild;
    const cursor = document.createElement("span");
    cursor.className = "cur";
    row.appendChild(cursor);

    for (let i = 1; i <= step.cmd.length; i++) {
      cmd.textContent = step.cmd.slice(0, i);
      if (!instant) await sleep(55);
    }
    if (!instant) await sleep(260);
    cursor.remove();
    line([["o", step.out]]);
    if (!instant) await sleep(320);
  }
  const last = line([["p", "➜ "], ["hl", "~ "]]);
  const cursor = document.createElement("span");
  cursor.className = "cur";
  last.appendChild(cursor);
}

/* ---------- Pré-carregamento ---------- */
const preloader = $("#preloader");
const bootText = $("#boot-text");
let bootFinished = false;

function finishBoot() {
  if (bootFinished) return;
  bootFinished = true;
  preloader.classList.add("done");
  document.body.classList.remove("locked");
  startReveal();
  typeRoles();
  session.set("booted", "1");
  setTimeout(() => preloader.remove(), 1200);
}

async function runBoot() {
  const lines = [
    ["> iniciando portfólio", "..."],
    ["> carregando estilo", " ✓"],
    ["> compilando criatividade", " ✓"],
    ["> pronto para decolar", " 🚀"]
  ];
  preloader.addEventListener("click", finishBoot);

  for (let i = 0; i < lines.length; i++) {
    if (bootFinished) return;
    const row = document.createElement("div");
    const base = document.createElement("span");
    const tail = document.createElement("span");
    tail.className = "ok";
    row.append(base, tail);
    bootText.appendChild(row);

    for (let c = 1; c <= lines[i][0].length; c++) {
      base.textContent = lines[i][0].slice(0, c);
      await sleep(14);
    }
    tail.textContent = lines[i][1];
    $(".boot-bar").style.setProperty("--p", String(((i + 1) / lines.length) * 100));
    await sleep(230);
  }
  await sleep(250);
  finishBoot();
}

if (reduceMotion.matches || session.get("booted") === "1") {
  preloader.remove();
  bootFinished = true;
  startReveal();
  typeRoles();
} else {
  document.body.classList.add("locked");
  runBoot();
  setTimeout(finishBoot, 4500); // segurança
}

/* ---------- Easter egg: código Konami ---------- */
const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let konamiIndex = 0;

document.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  konamiIndex = key === konami[konamiIndex] ? konamiIndex + 1 : key === konami[0] ? 1 : 0;
  if (konamiIndex === konami.length) {
    konamiIndex = 0;
    const on = document.body.classList.toggle("party");
    showToast(on ? "Modo festa ativado 🎉" : "Modo festa desativado", on ? "↑ ↑ ↓ ↓ ← → ← → B A" : "voltando ao normal");
  }
});
