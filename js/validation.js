/* Смажена кава — клієнтська валідація форм акаунта (реєстрація та вхід).
   Vanilla JS, без бібліотек. Реального надсилання на сервер немає.

   Правила показу помилок:
   - після відкриття сторінки помилок немає;
   - під час першого введення помилка не показується, лише зелений стан, коли значення вже коректне;
   - blur виконує фінальну перевірку поля й показує помилку або успіх;
   - після blur поле перевіряється на кожне input;
   - submit перевіряє всі поля й ставить фокус на перше з помилкою. */
(() => {
  "use strict";

  /* ---------- 1. Регулярні вирази ---------- */
  // Тег: латиниця, цифри, _; починається з літери; 3–20 символів.
  const REGEX_USERNAME = /^[A-Za-z][A-Za-z0-9_]{2,19}$/;
  // Нік: 2–30 символів, літери будь-якою мовою, цифри, пробіл, дефіс, апостроф;
  // починається й закінчується літерою або цифрою.
  const REGEX_NICKNAME = /^(?=.{2,30}$)[\p{L}\p{N}](?:[\p{L}\p{N} '’-]*[\p{L}\p{N}])$/u;
  // Емейл: щось@щось.зона (зона від 2 символів), без пробілів.
  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  // Телефон: строго +380 і 9 цифр.
  const REGEX_PHONE = /^\+380\d{9}$/;

  /* ---------- 2. Функції валідації ----------
     Кожна повертає текст помилки або порожній рядок, якщо значення коректне. */
  function validateUsername(value) {
    if (!value) return "Введіть тег";
    if (/\s/.test(value)) return "Тег не може містити пробіли";
    if (!/^[A-Za-z]/.test(value)) return "Тег має починатися з латинської літери";
    if (/[^A-Za-z0-9_]/.test(value)) return "Використовуйте лише латинські літери, цифри та символ _";
    if (value.length < 3) return "Тег має містити щонайменше 3 символи";
    if (value.length > 20) return "Тег має містити не більше 20 символів";
    return REGEX_USERNAME.test(value) ? "" : "Перевірте тег";
  }

  function validateNickname(value) {
    if (!value.trim()) return "Введіть нік";
    if (/[<>]/.test(value)) return "Нік не може містити символи < і >";
    if (value !== value.trim()) return "Приберіть пробіли на початку та в кінці";
    if (value.length < 2) return "Нік має містити щонайменше 2 символи";
    if (value.length > 30) return "Нік має містити не більше 30 символів";
    return REGEX_NICKNAME.test(value)
      ? ""
      : "Використовуйте літери, цифри, пробіл, дефіс або апостроф. Нік має починатися й закінчуватися літерою чи цифрою";
  }

  function validateEmail(raw) {
    const value = raw.trim(); // випадкові пробіли після вставки не вважаємо помилкою
    if (!value) return "Введіть електронну пошту";
    if (!value.includes("@")) return "В адресі бракує символу @";
    return REGEX_EMAIL.test(value) ? "" : "Введіть коректну адресу, наприклад user@gmail.com";
  }

  function validatePhone(value) {
    if (!value) return "Введіть номер телефону";
    if (/[\s()-]/.test(value)) return "Приберіть пробіли, дужки та дефіси: номер має виглядати як +380501234567";
    if (!value.startsWith("+380")) return "Номер має починатися з +380, наприклад +380501234567";
    const rest = value.slice(4);
    if (/\D/.test(rest)) return "Після +380 мають бути лише цифри";
    if (rest.length !== 9) return `Після +380 має бути рівно 9 цифр, зараз: ${rest.length}`;
    return REGEX_PHONE.test(value) ? "" : "Перевірте номер телефону";
  }

  function validateAgreement(checked) {
    return checked ? "" : "Підтвердіть згоду, щоб продовжити";
  }

  /* ---------- 3. Керування станами UI ---------- */
  const BORDER_NORMAL = ["border-espresso/50"];
  const BORDER_ERROR = ["border-red-500"];
  const BORDER_SUCCESS = ["border-green-500"];
  const RING_ERROR = ["ring-2", "ring-red-500", "ring-offset-2"]; // для чекбокса (його рамку задає style.css)
  const STATUS_BASE = "mb-5 rounded-xl px-4 py-3 text-sm font-medium ";
  const STATUS_ERROR = STATUS_BASE + "bg-red-100 text-red-800";
  const STATUS_SUCCESS = STATUS_BASE + "bg-green-100 text-green-800";

  const byId = (id) => document.getElementById(id);

  // Прибирає й додає класи рамки залежно від стану поля.
  function setFieldClasses(input, state) {
    if (input.type === "checkbox") {
      RING_ERROR.forEach((c) => input.classList.toggle(c, state === "error"));
      return;
    }
    input.classList.remove(...BORDER_NORMAL, ...BORDER_ERROR, ...BORDER_SUCCESS);
    input.classList.add(...(state === "error" ? BORDER_ERROR : state === "success" ? BORDER_SUCCESS : BORDER_NORMAL));
  }

  function showError(input, message) {
    const errorEl = byId(`${input.id}Error`);
    const okEl = byId(`${input.id}Ok`);
    input.setAttribute("aria-invalid", "true");
    setFieldClasses(input, "error");
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
    if (okEl) okEl.classList.add("hidden");
  }

  function showSuccess(input) {
    const errorEl = byId(`${input.id}Error`);
    const okEl = byId(`${input.id}Ok`);
    input.setAttribute("aria-invalid", "false");
    setFieldClasses(input, "success");
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
    if (okEl) okEl.classList.remove("hidden");
  }

  function clearError(input) {
    const errorEl = byId(`${input.id}Error`);
    const okEl = byId(`${input.id}Ok`);
    input.setAttribute("aria-invalid", "false");
    setFieldClasses(input, "normal");
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
    if (okEl) okEl.classList.add("hidden");
  }

  function showStatus(form, type, text) {
    const el = form.querySelector("[data-form-status]");
    if (!el) return;
    el.textContent = text;
    el.className = type === "error" ? STATUS_ERROR : STATUS_SUCCESS;
  }

  function hideStatus(form) {
    const el = form.querySelector("[data-form-status]");
    if (!el) return;
    el.textContent = "";
    el.className = "hidden";
  }

  /* ---------- 4. Повідомлення про успіх (модальне вікно) ---------- */
  const dialog = byId("successDialog");
  const canUseDialog = dialog && typeof dialog.showModal === "function";

  // Відкриває вікно «Акаунт створено». Текст вставляємо через textContent (без HTML).
  function openSuccessDialog({ tag, nick }) {
    byId("successText").textContent = `Вітаємо, ${nick}! Ваш акаунт @${tag} створено.`;
    dialog.showModal(); // затемнює фон, тримає фокус усередині, Escape закриває
    document.documentElement.classList.add("overflow-hidden");
  }

  if (canUseDialog) {
    // Клік по затемненню (поза вікном) теж закриває; фокус повертається на кнопку «Надіслати».
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => document.documentElement.classList.remove("overflow-hidden"));
  }

  /* ---------- 5. Підключення форм ---------- */
  // Для кожної форми: id поля і функція, що повертає текст помилки.
  const FORMS = [
    {
      id: "feedbackForm",
      success: "Форма успішно пройшла клієнтську валідацію. Демонстрація успішного надсилання: дані нікуди не передаються.",
      // Дані для вікна беремо до очищення форми.
      getDetails: () => ({ tag: byId("username").value, nick: byId("nickname").value.trim() }),
      onSuccess: openSuccessDialog,
      fields: [
        ["username", (el) => validateUsername(el.value)],
        ["nickname", (el) => validateNickname(el.value)],
        ["email", (el) => validateEmail(el.value)],
        ["phone", (el) => validatePhone(el.value)],
        ["agreement", (el) => validateAgreement(el.checked)],
      ],
    },
    {
      id: "loginForm",
      success: "Емейл пройшов клієнтську валідацію. Демонстрація входу: перевірки акаунта на сервері немає.",
      fields: [["loginEmail", (el) => validateEmail(el.value)]],
    },
  ];

  function initForm({ id, fields, success, getDetails, onSuccess }) {
    const form = byId(id);
    if (!form) return;
    const submitBtn = form.querySelector('[type="submit"]');
    const items = fields.map(([fieldId, validate]) => ({ input: byId(fieldId), validate }));
    let touched = new WeakSet(); // поля, з якими користувач уже взаємодіяв (blur / change)
    let busy = false;

    // Показує результат перевірки поля. Повертає true, якщо поле коректне.
    function render(item) {
      const message = item.validate(item.input);
      if (message) showError(item.input, message);
      else showSuccess(item.input);
      return !message;
    }

    items.forEach((item) => {
      const { input } = item;
      const isCheckbox = input.type === "checkbox";

      // input: поки користувач вперше вводить значення, червоних помилок немає.
      // Після першого blur або вже показаної помилки стан оновлюється на кожну зміну.
      input.addEventListener(isCheckbox ? "change" : "input", () => {
        hideStatus(form);
        if (isCheckbox) touched.add(input);
        if (touched.has(input) || input.getAttribute("aria-invalid") === "true") {
          render(item);
        } else if (!item.validate(input)) {
          showSuccess(input);
        } else {
          clearError(input);
        }
      });

      // blur: фінальна перевірка поля.
      input.addEventListener("blur", () => {
        touched.add(input);
        render(item);
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault(); // реального надсилання немає
      if (busy) return; // захист від швидкого повторного натискання

      let firstInvalid = null;
      let errors = 0;
      items.forEach((item) => {
        touched.add(item.input);
        if (!render(item)) {
          errors += 1;
          if (!firstInvalid) firstInvalid = item.input;
        }
      });

      if (firstInvalid) {
        showStatus(form, "error", `Перевірте форму: полів з помилками — ${errors}.`);
        firstInvalid.focus();
        return;
      }

      // Імітація успішного надсилання.
      busy = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-busy", "true");
      }
      setTimeout(() => {
        const details = getDetails ? getDetails() : null;
        form.reset();
        items.forEach(({ input }) => clearError(input));
        touched = new WeakSet();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute("aria-busy");
          submitBtn.focus(); // сюди повернеться фокус після закриття вікна
        }
        if (onSuccess && canUseDialog) onSuccess(details);
        else showStatus(form, "success", success); // запасний варіант, якщо <dialog> недоступний
        busy = false;
      }, 400);
    });
  }

  FORMS.forEach(initForm);
})();
