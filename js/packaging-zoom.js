/* Смажена кава — збільшення дизайну упаковки (Fancybox v5, підключений через CDN).
   Скрипт не малює пакет сам: він бере той SVG, який конструктор зараз показує в #bag-preview.
   Тому будь-які нові деталі упаковки, додані до renderBag() у landing.js
   (ґудзики, клапан, текстури, більше тексту), автоматично потрапляють і в збільшений вигляд. */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const preview = document.getElementById("bag-preview");
  const button = document.getElementById("bag-zoom");
  if (!preview || !button || typeof Fancybox === "undefined") return; // без бібліотеки сторінка працює як раніше

  // Кнопку показуємо лише коли Fancybox справді завантажився.
  button.classList.remove("hidden");
  button.classList.add("inline-flex");
  preview.classList.add("cursor-zoom-in");

  const iconCache = new Map();

  // SVG, завантажений як зображення, не підтягує зовнішні файли,
  // тому іконку етикетки вбудовуємо в нього як data-URI.
  async function inlineIcon(svg) {
    const match = svg.match(/<image[^>]*href="([^"]+\.svg)"/);
    if (!match) return svg;
    const url = match[1];
    try {
      if (!iconCache.has(url)) {
        const text = await (await fetch(url)).text();
        iconCache.set(url, "data:image/svg+xml;charset=utf-8," + encodeURIComponent(text));
      }
      return svg.replace(url, iconCache.get(url));
    } catch {
      return svg; // іконка не завантажилась — показуємо пакет без неї
    }
  }

  // Збирає великий самостійний SVG із поточного превʼю.
  async function buildBigSvg() {
    const live = preview.querySelector("svg");
    if (!live) return null;
    const clone = live.cloneNode(true);
    clone.setAttribute("width", "900"); // власний розмір: вектор лишається чітким при зумі
    clone.setAttribute("height", "1200");
    clone.removeAttribute("aria-hidden");
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = 'text{font-family:Manrope,system-ui,sans-serif}.serif{font-family:"Source Serif 4",Georgia,serif}';
    clone.prepend(style);
    const svg = await inlineIcon(new XMLSerializer().serializeToString(clone));
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  async function openZoom() {
    const src = await buildBigSvg();
    if (!src) return;
    const title = (document.getElementById("pack-title") || {}).value || "Мій пробний мікс";
    Fancybox.show(
      [{ src, type: "image", caption: `«${title.trim() || "Мій пробний мікс"}»: дизайн упаковки, 250 г` }],
      {
        showClass: "f-fadeIn", // плавна поява
        hideClass: "f-fadeOut", // плавне зникнення
        Carousel: { transition: "fade" },
        Images: { zoom: true, Panzoom: { maxScale: 4 } }, // зум до ×4: колесо, щипок, подвійний клік
        Toolbar: { display: { left: [], middle: [], right: ["zoomIn", "zoomOut", "toggle1to1", "fullscreen", "close"] } },
        dragToClose: true, // на телефоні закриває свайп вниз
        placeFocusBack: true, // після закриття фокус повертається на кнопку
        trapFocus: true,
      }
    );
  }

  button.addEventListener("click", openZoom);
  preview.addEventListener("click", openZoom);
});
