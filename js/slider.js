/* Смажена кава — слайдер «Найпопулярніші мікси» (Swiper.js v11, підключений через CDN).
   Ініціалізація чекає на завантаження DOM, а наявність бібліотеки перевіряється окремо:
   якщо CDN недоступний, сторінка не ламається, а слайди просто йдуть стовпчиком. */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const root = document.querySelector(".top-mixes-swiper");
  if (!root || typeof Swiper === "undefined") return;

  // Автопрокрутку не вмикаємо, якщо користувач просив мінімум анімацій.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const swiper = new Swiper(root, {
    rewind: true, // після останнього слайда повертаємось на перший (без дублів слайдів у DOM)
    spaceBetween: 24,
    grabCursor: true,
    autoplay: reduceMotion ? false : { delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true },
    pagination: { el: ".top-mixes-pagination", clickable: true },
    navigation: { prevEl: ".top-mixes-prev", nextEl: ".top-mixes-next" },
    a11y: {
      prevSlideMessage: "Попередній мікс",
      nextSlideMessage: "Наступний мікс",
      paginationBulletMessage: "Перейти до міксу {{index}}",
      slideLabelMessage: "Мікс {{index}} з {{slidesLength}}",
    },
    breakpoints: {
      320: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });

  // Кнопка «Пауза / Відтворити»: користувач сам керує автопрокруткою (доступність).
  const pauseBtn = document.getElementById("mixesPause");
  if (pauseBtn) {
    if (reduceMotion) {
      pauseBtn.hidden = true;
    } else {
      pauseBtn.addEventListener("click", () => {
        const paused = pauseBtn.getAttribute("aria-pressed") === "true";
        if (paused) swiper.autoplay.start();
        else swiper.autoplay.stop();
        pauseBtn.setAttribute("aria-pressed", String(!paused));
        pauseBtn.textContent = paused ? "Пауза" : "Відтворити";
      });
    }
  }
});
