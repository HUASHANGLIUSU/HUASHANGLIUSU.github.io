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
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = motionPreference.matches;

motionPreference.addEventListener("change", (event) => {
  reducedMotion = event.matches;
});

function applyTheme(theme) {
  root.dataset.theme = theme;
  if (themeIcon) {
    themeIcon.textContent = theme === "light" ? "☀" : "☾";
  }
  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      theme === "light"
        ? (isEnglish ? "Toggle dark mode" : "切换深色模式")
        : (isEnglish ? "Toggle light mode" : "切换浅色模式")
    );
  }
}

function closeMenu() {
  if (!navMenu || !menuToggle) return;
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
if (year) {
  year.textContent = new Date().getFullYear();
}

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

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  });
}

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });
}

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

document.querySelectorAll(".project-carousel").forEach((carousel) => {
  const section = carousel.closest("section") || carousel.parentElement;
  const previousButton = section.querySelector("[data-carousel-prev]");
  const nextButton = section.querySelector("[data-carousel-next]");
  const toggleButton = section.querySelector("[data-carousel-toggle]");
  const cards = Array.from(carousel.querySelectorAll(".project-card"));
  if (!cards.length) return;

  let activeIndex = 0;
  let autoplayTimer = null;
  let resumeTimer = null;
  let userPaused = false;
  let hoverPaused = false;
  let focusPaused = false;
  let interactionPaused = false;
  let pointerStartX = null;
  let pointerLastX = null;
  let pointerLastTime = 0;
  let pointerVelocity = 0;
  let activePointerId = null;
  let pointerStartCardIndex = null;
  let dragged = false;

  const carouselHead = carousel.previousElementSibling?.classList.contains("carousel-head")
    ? carousel.previousElementSibling
    : section.querySelector(".carousel-head");
  const carouselStatus = document.createElement("div");
  carouselStatus.className = "carousel-status";
  carouselStatus.setAttribute("aria-label", isEnglish ? "Project position" : "项目位置");
  carouselStatus.innerHTML = `
    <span class="carousel-counter" aria-live="polite">
      <strong data-carousel-current>01</strong>
      <span aria-hidden="true">/</span>
      <span>${String(cards.length).padStart(2, "0")}</span>
    </span>
    <div class="carousel-dots" role="group" aria-label="${isEnglish ? "Choose a project" : "选择项目"}"></div>
  `;
  const dotsContainer = carouselStatus.querySelector(".carousel-dots");
  const currentCounter = carouselStatus.querySelector("[data-carousel-current]");
  const dotButtons = cards.map((card, index) => {
    const dot = document.createElement("button");
    const projectName = card.querySelector("h3")?.textContent?.trim() || String(index + 1);
    dot.className = "carousel-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", isEnglish ? `Show project: ${projectName}` : `查看项目：${projectName}`);
    dotsContainer.append(dot);
    return dot;
  });
  carouselHead?.insertBefore(carouselStatus, carouselHead.querySelector(".carousel-controls"));

  const normalizeIndex = (index) => (index + cards.length) % cards.length;

  const updateHeight = () => {
    const maximumCardHeight = Math.max(...cards.map((card) => card.offsetHeight));
    if (!Number.isFinite(maximumCardHeight)) return;
    carousel.style.height = `${Math.ceil(maximumCardHeight + 74)}px`;
  };

  const setControlTabbable = (card, tabbable) => {
    card.querySelectorAll("a, button, input, select, textarea, [tabindex]").forEach((control) => {
      if (!control.hasAttribute("data-carousel-tabindex")) {
        control.dataset.carouselTabindex = control.getAttribute("tabindex") || "";
      }
      if (tabbable) {
        const originalTabIndex = control.dataset.carouselTabindex;
        if (originalTabIndex) control.setAttribute("tabindex", originalTabIndex);
        else control.removeAttribute("tabindex");
      } else {
        control.setAttribute("tabindex", "-1");
      }
    });
  };

  const updateCards = () => {
    cards.forEach((card, index) => {
      let offset = index - activeIndex;
      if (offset > cards.length / 2) offset -= cards.length;
      if (offset < -cards.length / 2) offset += cards.length;

      card.classList.remove("is-active", "is-prev", "is-next", "is-before", "is-after");
      card.classList.add("is-visible");

      if (offset === 0) card.classList.add("is-active");
      else if (offset === -1) card.classList.add("is-prev");
      else if (offset === 1) card.classList.add("is-next");
      else if (offset < 0) card.classList.add("is-before");
      else card.classList.add("is-after");

      const isActive = offset === 0;
      const isAdjacent = Math.abs(offset) === 1;
      card.setAttribute("aria-hidden", String(!isActive && !isAdjacent));
      if (isActive) card.setAttribute("aria-current", "true");
      else card.removeAttribute("aria-current");
      setControlTabbable(card, isActive);
    });

    carousel.dataset.activeIndex = String(activeIndex);
    if (currentCounter) currentCounter.textContent = String(activeIndex + 1).padStart(2, "0");
    dotButtons.forEach((dot, index) => {
      const isCurrent = index === activeIndex;
      dot.classList.toggle("is-active", isCurrent);
      if (isCurrent) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    window.requestAnimationFrame(updateHeight);
  };

  const goTo = (index) => {
    const nextIndex = normalizeIndex(index);
    if (nextIndex === activeIndex) return;
    activeIndex = nextIndex;
    updateCards();
  };

  const move = (direction) => goTo(activeIndex + direction);

  const stopAutoplay = () => {
    window.clearInterval(autoplayTimer);
    autoplayTimer = null;
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (reducedMotion || userPaused || hoverPaused || focusPaused || interactionPaused || cards.length < 2) return;
    autoplayTimer = window.setInterval(() => {
      if (!document.hidden) move(1);
    }, 5200);
  };

  const pauseThenResume = () => {
    interactionPaused = true;
    stopAutoplay();
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      interactionPaused = false;
      startAutoplay();
    }, 8000);
  };

  const manualScroll = (direction) => {
    pauseThenResume();
    move(direction);
  };

  const clearDragPresentation = () => {
    cards.forEach((card) => {
      card.style.removeProperty("--carousel-drag-x");
      card.style.removeProperty("--carousel-drag-y");
      card.style.removeProperty("--carousel-card-scale");
      card.style.removeProperty("opacity");
    });
    carousel.removeAttribute("data-drag-direction");
  };

  const updateDragPresentation = (distance) => {
    const activeCard = cards[activeIndex];
    if (!activeCard) return;

    const cardWidth = activeCard.offsetWidth || carousel.offsetWidth;
    const maximumDistance = Math.max(1, cardWidth * 0.78);
    const limitedDistance = Math.max(-maximumDistance, Math.min(maximumDistance, distance));
    const progress = Math.min(1, Math.abs(limitedDistance) / maximumDistance);
    const direction = limitedDistance < 0 ? 1 : -1;
    const incomingCard = cards[normalizeIndex(activeIndex + direction)];
    const outgoingCard = cards[normalizeIndex(activeIndex - direction)];
    const dragX = `${limitedDistance}px`;

    [activeCard, incomingCard, outgoingCard].forEach((card) => {
      card.style.setProperty("--carousel-drag-x", dragX);
    });

    activeCard.style.setProperty("--carousel-drag-y", `${Math.round(progress * 38)}px`);
    activeCard.style.setProperty("--carousel-card-scale", String(1 - progress * 0.18));
    activeCard.style.opacity = String(1 - progress * 0.48);

    incomingCard.style.setProperty("--carousel-drag-y", `${Math.round(-progress * 38)}px`);
    incomingCard.style.setProperty("--carousel-card-scale", String(0.82 + progress * 0.18));
    incomingCard.style.opacity = String(0.52 + progress * 0.48);

    outgoingCard.style.setProperty("--carousel-drag-y", `${Math.round(progress * 10)}px`);
    outgoingCard.style.setProperty("--carousel-card-scale", String(0.82 - progress * 0.08));
    outgoingCard.style.opacity = String(0.52 * (1 - progress * 0.72));
    carousel.dataset.dragDirection = direction > 0 ? "next" : "previous";
  };

  const finishDrag = (event, cancelled = false) => {
    if (pointerStartX === null || (activePointerId !== null && event.pointerId !== activePointerId)) return;

    const distance = event.clientX - pointerStartX;
    const activeCardWidth = cards[activeIndex]?.offsetWidth || carousel.offsetWidth;
    const distanceThreshold = Math.min(110, activeCardWidth * 0.2);
    const shouldMove = !cancelled && (
      Math.abs(distance) >= distanceThreshold
      || (Math.abs(distance) >= 24 && Math.abs(pointerVelocity) >= 0.45)
    );
    const direction = distance < 0 ? 1 : -1;
    const pressedCardIndex = pointerStartCardIndex;
    const wasDragged = dragged;

    if (activePointerId !== null && carousel.hasPointerCapture?.(activePointerId)) {
      carousel.releasePointerCapture(activePointerId);
    }
    carousel.classList.remove("is-dragging");
    void carousel.offsetWidth;
    if (shouldMove) move(direction);
    else if (!cancelled && !wasDragged && pressedCardIndex !== null && pressedCardIndex !== activeIndex) {
      pauseThenResume();
      goTo(pressedCardIndex);
    }
    clearDragPresentation();

    pointerStartX = null;
    pointerLastX = null;
    pointerLastTime = 0;
    pointerVelocity = 0;
    activePointerId = null;
    pointerStartCardIndex = null;
    window.setTimeout(() => {
      dragged = false;
    }, 0);
  };

  dotButtons.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      pauseThenResume();
      goTo(index);
    });
  });

  previousButton?.addEventListener("click", () => {
    manualScroll(-1);
  });
  nextButton?.addEventListener("click", () => {
    manualScroll(1);
  });
  toggleButton?.addEventListener("click", () => {
    userPaused = !userPaused;
    toggleButton.setAttribute("aria-pressed", String(userPaused));
    toggleButton.setAttribute("aria-label", userPaused
      ? (isEnglish ? "Resume project autoplay" : "继续项目自动播放")
      : (isEnglish ? "Pause project autoplay" : "暂停项目自动播放"));
    toggleButton.title = userPaused
      ? (isEnglish ? "Resume autoplay" : "继续自动播放")
      : (isEnglish ? "Pause autoplay" : "暂停自动播放");
    if (userPaused) stopAutoplay();
    else startAutoplay();
  });
  carousel.addEventListener("pointerenter", () => {
    hoverPaused = true;
    stopAutoplay();
  });
  carousel.addEventListener("pointerleave", () => {
    hoverPaused = false;
    startAutoplay();
  });
  cards.forEach((card, index) => {
    card.addEventListener("click", (event) => {
      if (index === activeIndex) return;
      event.preventDefault();
      event.stopPropagation();
      pauseThenResume();
      goTo(index);
    });
  });

  carousel.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || pointerStartX !== null) return;
    const pressedCard = event.target.closest(".project-card");
    pointerStartX = event.clientX;
    pointerLastX = event.clientX;
    pointerLastTime = event.timeStamp;
    pointerVelocity = 0;
    activePointerId = event.pointerId;
    pointerStartCardIndex = pressedCard ? cards.indexOf(pressedCard) : null;
    dragged = false;
    pauseThenResume();
  });
  carousel.addEventListener("pointermove", (event) => {
    if (pointerStartX === null || event.pointerId !== activePointerId) return;
    const distance = event.clientX - pointerStartX;
    const elapsed = Math.max(1, event.timeStamp - pointerLastTime);
    pointerVelocity = (event.clientX - pointerLastX) / elapsed;
    pointerLastX = event.clientX;
    pointerLastTime = event.timeStamp;
    if (!dragged && Math.abs(distance) > 6) {
      dragged = true;
      carousel.classList.add("is-dragging");
      carousel.setPointerCapture?.(event.pointerId);
    }
    if (dragged) updateDragPresentation(distance);
    if (dragged) event.preventDefault();
  }, { passive: false });
  carousel.addEventListener("pointerup", (event) => {
    finishDrag(event);
  });
  carousel.addEventListener("pointercancel", (event) => {
    finishDrag(event, true);
  });
  carousel.addEventListener("click", (event) => {
    if (!dragged) return;
    event.preventDefault();
    event.stopPropagation();
    dragged = false;
  }, true);
  carousel.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    manualScroll(event.key === "ArrowRight" ? 1 : -1);
  });
  carousel.addEventListener("focusin", () => {
    focusPaused = true;
    stopAutoplay();
  });
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      focusPaused = false;
      startAutoplay();
    }
  });
  cards.forEach((card) => {
    card.querySelectorAll("img").forEach((image) => image.addEventListener("load", updateHeight, { once: true }));
  });
  motionPreference.addEventListener("change", startAutoplay);
  window.addEventListener("resize", () => {
    updateHeight();
    startAutoplay();
  }, { passive: true });
  updateCards();
  startAutoplay();
});

if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".project-card, .skill-card, .award-card, .contact-card, .hero-panel, .detail-panel").forEach((card) => {
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
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
  });

  document.querySelectorAll(".btn").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      button.style.setProperty("--magnet-x", `${(x * 0.12).toFixed(1)}px`);
      button.style.setProperty("--magnet-y", `${(y * 0.16).toFixed(1)}px`);
    }, { passive: true });

    button.addEventListener("pointerleave", () => {
      button.style.removeProperty("--magnet-x");
      button.style.removeProperty("--magnet-y");
    });
  });
}

if (copyButton && copyStatus) {
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
}

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });
}
