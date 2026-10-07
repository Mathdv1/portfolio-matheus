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
