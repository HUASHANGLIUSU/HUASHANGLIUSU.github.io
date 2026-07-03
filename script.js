const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");
const copyButton = document.querySelector(".copy-email");
const copyStatus = document.querySelector(".copy-status");
const backToTop = document.querySelector(".back-to-top");
const year = document.querySelector("#year");

const storedTheme = localStorage.getItem("theme");
const initialTheme = storedTheme || "dark";
const isEnglish = document.documentElement.lang.startsWith("en");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeIcon.textContent = theme === "light" ? "☀" : "☾";
  themeToggle.setAttribute(
    "aria-label",
    theme === "light"
      ? (isEnglish ? "Toggle dark mode" : "切换深色模式")
      : (isEnglish ? "Toggle light mode" : "切换浅色模式")
  );
}

function closeMenu() {
  navMenu.classList.remove("is-open");
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

function setActiveLink(id) {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
}

applyTheme(initialTheme);
year.textContent = new Date().getFullYear();

function updateScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  root.style.setProperty("--scroll-progress", Math.min(1, Math.max(0, progress)).toFixed(4));

  if (!reducedMotion) {
    root.style.setProperty("--page-shift", `${Math.round(window.scrollY * -0.04)}px`);
  }
}

updateScrollProgress();
window.addEventListener("scroll", updateScrollProgress, { passive: true });

if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
  const cursorGlow = document.createElement("div");
  cursorGlow.className = "cursor-glow";
  cursorGlow.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursorGlow);

  window.addEventListener("pointermove", (event) => {
    root.style.setProperty("--cursor-x", `${event.clientX}px`);
    root.style.setProperty("--cursor-y", `${event.clientY}px`);
    cursorGlow.classList.add("is-active");
  }, { passive: true });

  document.addEventListener("pointerleave", () => {
    cursorGlow.classList.remove("is-active");
  });
}

themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
  localStorage.setItem("theme", nextTheme);
  applyTheme(nextTheme);
});

menuToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  menuToggle.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  },
  {
    rootMargin: "-35% 0px -55% 0px",
    threshold: 0,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14,
  }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".project-card, .skill-card, .award-card, .contact-card, .hero-panel").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const xPercent = x / rect.width;
      const yPercent = y / rect.height;

      card.style.setProperty("--spot-x", `${Math.round(xPercent * 100)}%`);
      card.style.setProperty("--spot-y", `${Math.round(yPercent * 100)}%`);

      if (card.classList.contains("project-card")) {
        card.style.setProperty("--tilt-x", `${((xPercent - 0.5) * 5).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${((0.5 - yPercent) * 5).toFixed(2)}deg`);
      }
    }, { passive: true });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--spot-x");
      card.style.removeProperty("--spot-y");
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
  });
}

copyButton.addEventListener("click", async () => {
  const email = copyButton.dataset.email;

  try {
    await navigator.clipboard.writeText(email);
    copyStatus.textContent = isEnglish ? "Email copied to clipboard." : "邮箱已复制到剪贴板。";
  } catch {
    const helper = document.createElement("textarea");
    helper.value = email;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
    copyStatus.textContent = isEnglish ? "Email copied to clipboard." : "邮箱已复制到剪贴板。";
  }

  window.setTimeout(() => {
    copyStatus.textContent = "";
  }, 2200);
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
