"use strict";

const slides = Array.from(document.querySelectorAll(".slide"));
const dotsContainer = document.getElementById("dots");
const previousButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const currentNumber = document.getElementById("currentNumber");
const totalNumber = document.getElementById("totalNumber");
const progressBar = document.getElementById("progressBar");
const autoButton = document.getElementById("autoButton");
const autoIcon = document.getElementById("autoIcon");
const autoText = document.getElementById("autoText");
const celebrateButton = document.getElementById("celebrateButton");
const confettiContainer = document.getElementById("confettiContainer");

let currentSlide = 0;
let autoPlayTimer = null;
let isAutoPlaying = false;
let touchStartX = 0;
let touchEndX = 0;

const AUTO_PLAY_DELAY = 6000;

function formatNumber(number) {
  return String(number).padStart(2, "0");
}

function createDots() {
  slides.forEach((slide, index) => {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = "dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Buka slide ${index + 1}`);
    dot.setAttribute("aria-controls", slide.id);

    dot.addEventListener("click", () => {
      showSlide(index);
      restartAutoPlay();
    });

    dotsContainer.appendChild(dot);
  });
}

function showSlide(index) {
  const normalizedIndex = (index + slides.length) % slides.length;
  const dots = Array.from(document.querySelectorAll(".dot"));

  slides.forEach((slide, slideIndex) => {
    slide.classList.remove("active", "previous");
    slide.setAttribute("aria-hidden", "true");

    if (slideIndex < normalizedIndex) {
      slide.classList.add("previous");
    }
  });

  dots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === normalizedIndex;

    dot.classList.toggle("active", isActive);
    dot.setAttribute("aria-selected", String(isActive));
    dot.tabIndex = isActive ? 0 : -1;
  });

  currentSlide = normalizedIndex;
  slides[currentSlide].classList.add("active");
  slides[currentSlide].classList.remove("previous");
  slides[currentSlide].setAttribute("aria-hidden", "false");

  currentNumber.textContent = formatNumber(currentSlide + 1);
  progressBar.style.width =
    `${((currentSlide + 1) / slides.length) * 100}%`;

  history.replaceState(null, "", `#${slides[currentSlide].id}`);

  if (currentSlide === slides.length - 1) {
    createConfetti(45);
  }
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function previousSlide() {
  showSlide(currentSlide - 1);
}

function startAutoPlay() {
  stopAutoPlay(false);

  isAutoPlaying = true;
  autoIcon.textContent = "Ⅱ";
  autoText.textContent = "Jeda";
  autoButton.setAttribute("aria-pressed", "true");
  autoButton.setAttribute(
    "aria-label",
    "Hentikan pergantian slide otomatis"
  );

  autoPlayTimer = window.setInterval(nextSlide, AUTO_PLAY_DELAY);
}

function stopAutoPlay(updateButton = true) {
  if (autoPlayTimer !== null) {
    window.clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }

  isAutoPlaying = false;

  if (updateButton) {
    autoIcon.textContent = "▶";
    autoText.textContent = "Putar";
    autoButton.setAttribute("aria-pressed", "false");
    autoButton.setAttribute(
      "aria-label",
      "Aktifkan pergantian slide otomatis"
    );
  }
}

function restartAutoPlay() {
  if (isAutoPlaying) {
    startAutoPlay();
  }
}

function toggleAutoPlay() {
  if (isAutoPlaying) {
    stopAutoPlay();
  } else {
    startAutoPlay();
  }
}

function createConfetti(amount = 80) {
  const colors = [
    "#e42127",
    "#ffffff",
    "#ffd447",
    "#143d73",
    "#1d7651"
  ];

  for (let index = 0; index < amount; index += 1) {
    const confetti = document.createElement("span");
    const leftPosition = Math.random() * 100;
    const duration = 2.8 + Math.random() * 3;
    const drift = -130 + Math.random() * 260;
    const rotation = 360 + Math.random() * 900;
    const delay = Math.random() * 0.7;
    const size = 6 + Math.random() * 9;

    confetti.className = "confetti";
    confetti.style.left = `${leftPosition}%`;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size * 1.5}px`;
    confetti.style.background =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius =
      Math.random() > 0.5 ? "50%" : "2px";
    confetti.style.setProperty("--duration", `${duration}s`);
    confetti.style.setProperty("--drift", `${drift}px`);
    confetti.style.setProperty("--rotation", `${rotation}deg`);
    confetti.style.animationDelay = `${delay}s`;

    confettiContainer.appendChild(confetti);

    window.setTimeout(() => {
      confetti.remove();
    }, (duration + delay) * 1000);
  }
}

function handleKeyboard(event) {
  const interactiveElement = ["INPUT", "TEXTAREA", "SELECT"].includes(
    document.activeElement.tagName
  );

  if (interactiveElement) {
    return;
  }

  switch (event.key) {
    case "ArrowRight":
    case "PageDown":
      nextSlide();
      restartAutoPlay();
      break;

    case "ArrowLeft":
    case "PageUp":
      previousSlide();
      restartAutoPlay();
      break;

    case "Home":
      showSlide(0);
      restartAutoPlay();
      break;

    case "End":
      showSlide(slides.length - 1);
      restartAutoPlay();
      break;

    case " ":
      event.preventDefault();
      toggleAutoPlay();
      break;

    default:
      break;
  }
}

function handleTouchStart(event) {
  touchStartX = event.changedTouches[0].clientX;
}

function handleTouchEnd(event) {
  touchEndX = event.changedTouches[0].clientX;
  const swipeDistance = touchStartX - touchEndX;

  if (Math.abs(swipeDistance) < 50) {
    return;
  }

  if (swipeDistance > 0) {
    nextSlide();
  } else {
    previousSlide();
  }

  restartAutoPlay();
}

function getInitialSlide() {
  const slideId = window.location.hash.replace("#", "");
  const matchedIndex = slides.findIndex(
    (slide) => slide.id === slideId
  );

  return matchedIndex >= 0 ? matchedIndex : 0;
}

function initializeSlider() {
  if (!slides.length) {
    return;
  }

  createDots();
  totalNumber.textContent = formatNumber(slides.length);
  showSlide(getInitialSlide());

  previousButton.addEventListener("click", () => {
    previousSlide();
    restartAutoPlay();
  });

  nextButton.addEventListener("click", () => {
    nextSlide();
    restartAutoPlay();
  });

  autoButton.addEventListener("click", toggleAutoPlay);

  if (celebrateButton) {
    celebrateButton.addEventListener("click", () => {
      createConfetti(140);
    });
  }

  document.addEventListener("keydown", handleKeyboard);
  document.addEventListener("touchstart", handleTouchStart, {
    passive: true
  });
  document.addEventListener("touchend", handleTouchEnd, {
    passive: true
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && isAutoPlaying) {
      window.clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    } else if (!document.hidden && isAutoPlaying) {
      autoPlayTimer = window.setInterval(
        nextSlide,
        AUTO_PLAY_DELAY
      );
    }
  });
}

initializeSlider();
