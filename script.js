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


// Efeito parallax sutil
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canUseParallax = !reduceMotion && window.matchMedia("(min-width: 769px)").matches;

if (canUseParallax) {
  const hero = document.querySelector(".hero");
  const heroText = document.querySelector(".hero-text");
  const photo = document.querySelector(".profile-photo-card");
  const codeCard = document.querySelector(".code-card");

  [heroText, photo, codeCard].forEach((el) => el?.classList.add("parallax-smooth"));

  let mouseX = 0;
  let mouseY = 0;
  let scrollY = window.scrollY;
  let ticking = false;

  function renderParallax() {
    if (heroText) {
      heroText.style.transform = `translate3d(${mouseX * -6}px, ${mouseY * -4 + scrollY * 0.025}px, 0)`;
    }

    if (photo) {
      photo.style.transform = `translate3d(${mouseX * 12}px, ${mouseY * 10 + scrollY * -0.035}px, 0)`;
    }

    if (codeCard) {
      codeCard.style.transform = `translateX(-50%) rotate(-4deg) translate3d(${mouseX * -16}px, ${mouseY * 14 + scrollY * -0.055}px, 0)`;
    }

    document.querySelectorAll(".section-title").forEach((el) => {
      const rect = el.getBoundingClientRect();
      const offset = (window.innerHeight * 0.5 - rect.top) * 0.018;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });

    document.querySelectorAll(".skill-card, .project-card").forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      const offset = (window.innerHeight * 0.5 - rect.top) * (0.008 + (index % 3) * 0.002);
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });

    ticking = false;
  }

  function requestParallax() {
    if (!ticking) {
      window.requestAnimationFrame(renderParallax);
      ticking = true;
    }
  }

  hero?.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();
    mouseX = (event.clientX - rect.left) / rect.width - 0.5;
    mouseY = (event.clientY - rect.top) / rect.height - 0.5;
    requestParallax();
  });

  hero?.addEventListener("mouseleave", () => {
    mouseX = 0;
    mouseY = 0;
    requestParallax();
  });

  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
    requestParallax();
  }, { passive: true });

  window.addEventListener("resize", requestParallax);
  requestParallax();
}
