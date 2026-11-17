/* Поведение страницы. Тексты и цифры — в config.js. */
(function () {
  "use strict";

  var SITE = window.SITE || {};

  var UI = {
    ru: {
      "nav.label": "Разделы",
      "nav.portfolio": "Портфолио",
      "nav.about": "О себе",
      "nav.contacts": "Контакты",
      "hero.more": "Смотреть портфолио",
      "sec.portfolio": "Портфолио",
      "sec.about": "О себе",
      "bio.label": "Биография",
      "stats.label": "Параметры",
      "contacts.label": "Контакты",
      "f.languages": "Языки",
      "m.height": "Рост",
      "m.bust": "Грудь",
      "m.waist": "Талия",
      "m.hips": "Бёдра",
      "m.size": "Размер",
      "m.shoes": "Обувь",
      "m.hair": "Волосы",
      "m.eyes": "Глаза",
      "m.city": "Город",
      "m.travel": "Поездки",
      "c.phone": "Телефон",
      "c.telegram": "Telegram",
      "c.instagram": "Instagram",
      "c.email": "Почта",
      "lb.label": "Просмотр фото",
      "lb.close": "Закрыть",
      "lb.prev": "Предыдущее фото",
      "lb.next": "Следующее фото",
      "meta.title": "Милена Беляева — модель",
      "meta.description": "Беляева Милена Романовна — модель, Москва, готова к поездкам. Рост 170 см, 80-60-88, размер XS, обувь 37–38. Портфолио и контакты.",
      "skip": "К содержанию",
      "external": "откроется в новой вкладке"
    },
    en: {
      "nav.label": "Sections",
      "nav.portfolio": "Portfolio",
      "nav.about": "About",
      "nav.contacts": "Contacts",
      "hero.more": "View portfolio",
      "sec.portfolio": "Portfolio",
      "sec.about": "About",
      "bio.label": "Biography",
      "stats.label": "Measurements",
      "contacts.label": "Contacts",
      "f.languages": "Languages",
      "m.height": "Height",
      "m.bust": "Bust",
      "m.waist": "Waist",
      "m.hips": "Hips",
      "m.size": "Size",
      "m.shoes": "Shoes",
      "m.hair": "Hair",
      "m.eyes": "Eyes",
      "m.city": "City",
      "m.travel": "Travel",
      "c.phone": "Phone",
      "c.telegram": "Telegram",
      "c.instagram": "Instagram",
      "c.email": "Email",
      "lb.label": "Photo viewer",
      "lb.close": "Close",
      "lb.prev": "Previous photo",
      "lb.next": "Next photo",
      "meta.title": "Milena Belyaeva — Model",
      "meta.description": "Milena Belyaeva is a model based in Moscow, available to travel. Height 170 cm, 80-60-88, size XS, shoes 37–38. Portfolio and contacts.",
      "skip": "Skip to content",
      "external": "opens in a new tab"
    }
  };

  var lang = readLang();
  var photos = Array.prototype.slice.call(document.querySelectorAll(".js-photo"));
  var lb = document.getElementById("lightbox");
  var lbImg = lb.querySelector(".lb__img");
  var lbCur = document.getElementById("lb-cur");
  var lbTotal = document.getElementById("lb-total");
  var current = 0;
  var open = false;
  var scrollY = 0;
  var lastFocus = null;

  lbTotal.textContent = pad(photos.length);

  function readLang() {
    try {
      var saved = localStorage.getItem("milena-lang");
      if (saved === "en" || saved === "ru") return saved;
    } catch (e) {}
    return "ru";
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function textOf(dict) {
    if (!dict) return "";
    if (typeof dict === "string") return dict;
    if (Object.prototype.hasOwnProperty.call(dict, lang) && dict[lang] != null) return dict[lang];
    return dict.ru || "";
  }

  function measureText(key) {
    var bag = SITE.measurements || {};
    var value = bag[key];
    if (value && typeof value === "object") {
      var localized = (value[lang] || value.ru || "").trim();
      return localized || "—";
    }
    if (typeof value === "string" && value.trim()) return value.trim();
    return "—";
  }

  function safeUrl(href) {
    try {
      var url = new URL(href, "https://milena-belaeva.ru");
      if (url.protocol !== "http:" && url.protocol !== "https:" && url.protocol !== "mailto:" && url.protocol !== "tel:") {
        return "";
      }
      return url.href;
    } catch (e) {
      return "";
    }
  }

  function contactItems() {
    var c = SITE.contacts || {};
    var items = [];

    var phone = (c.phone || "").trim();
    if (phone) {
      items.push({
        href: "tel:" + phone.replace(/[^\d+]/g, ""),
        label: phone,
        kind: "c.phone",
        external: false
      });
    }

    var tg = (c.telegram || "").trim();
    if (tg) {
      if (/^https?:\/\//i.test(tg)) {
        var tgMatch = tg.match(/t\.me\/([^/?#]+)/i);
        items.push({ href: tg, label: tgMatch ? "@" + tgMatch[1] : "Telegram", kind: "c.telegram", external: true });
      } else {
        var tgHandle = tg.replace(/^@/, "");
        items.push({ href: "https://t.me/" + tgHandle, label: "@" + tgHandle, kind: "c.telegram", external: true });
      }
    }

    var ig = (c.instagram || "").trim();
    if (ig) {
      if (/^https?:\/\//i.test(ig)) {
        var igMatch = ig.match(/instagram\.com\/([^/?#]+)/i);
        items.push({ href: ig, label: igMatch ? "@" + igMatch[1] : "Instagram", kind: "c.instagram", external: true });
      } else {
        var igHandle = ig.replace(/^@/, "");
        items.push({ href: "https://instagram.com/" + igHandle, label: "@" + igHandle, kind: "c.instagram", external: true });
      }
    }

    var email = (c.email || "").trim().replace(/^mailto:/i, "");
    if (email) items.push({ href: "mailto:" + email, label: email, kind: "c.email", external: false });

    return items.filter(function (item) { return safeUrl(item.href); });
  }

  function renderContacts() {
    var list = document.getElementById("booking-list");
    var block = document.getElementById("contact");
    var nav = document.getElementById("nav-contacts");
    var items = contactItems();
    list.textContent = "";

    items.forEach(function (item) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      var href = safeUrl(item.href);
      var kind = document.createElement("span");
      var value = document.createElement("span");
      kind.className = "booking__kind";
      kind.textContent = UI[lang][item.kind] || "";
      value.className = "booking__value";
      value.textContent = item.label;
      a.href = href;
      a.appendChild(kind);
      a.appendChild(value);
      if (item.external) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.setAttribute("aria-label", (UI[lang][item.kind] || item.label) + " " + item.label + ", " + UI[lang].external);
      }
      li.appendChild(a);
      list.appendChild(li);
    });

    var show = items.length > 0;
    block.hidden = !show;
    nav.hidden = !show;
  }

  function applyLang(next) {
    lang = next === "en" ? "en" : "ru";
    try { localStorage.setItem("milena-lang", lang); } catch (e) {}

    document.documentElement.lang = lang;
    document.title = UI[lang]["meta.title"];
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", UI[lang]["meta.description"]);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (UI[lang][key] != null) el.textContent = UI[lang][key];
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (UI[lang][key] != null) el.setAttribute("aria-label", UI[lang][key]);
    });

    document.querySelectorAll("[data-config]").forEach(function (el) {
      var text = textOf(SITE[el.getAttribute("data-config")]);
      el.textContent = text;
      if (el.classList.contains("hero__ru")) el.hidden = !text;
    });

    document.querySelectorAll("[data-measure]").forEach(function (el) {
      el.textContent = measureText(el.getAttribute("data-measure"));
    });

    photos.forEach(function (btn) {
      var img = btn.querySelector("img");
      var alt = lang === "en" ? btn.getAttribute("data-alt-en") : btn.getAttribute("data-alt-ru");
      if (img && alt) img.alt = alt;
    });
    if (open) lbImg.alt = photos[current].querySelector("img").alt;

    document.querySelectorAll(".lang button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-set-lang") === lang ? "true" : "false");
    });

    renderContacts();
  }

  document.querySelectorAll(".lang button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(btn.getAttribute("data-set-lang"));
    });
  });

  function syncHeader() {
    var bar = document.querySelector(".topbar");
    if (!bar) return;
    document.documentElement.style.setProperty("--header-h", bar.offsetHeight + "px");
  }

  syncHeader();
  window.addEventListener("resize", syncHeader);

  var bar = document.querySelector(".topbar");
  function onScroll() {
    bar.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var sections = ["portfolio", "about", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        document.querySelectorAll(".nav a").forEach(function (a) {
          if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "page");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    sections.forEach(function (section) { observer.observe(section); });
  }

  var year = document.getElementById("year");
  if (year) {
    var y = String(new Date().getFullYear());
    year.textContent = y;
    year.setAttribute("datetime", y);
  }

  function lockScroll() {
    scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = "-" + scrollY + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockScroll() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollY);
  }

  function show(index) {
    current = (index + photos.length) % photos.length;
    var btn = photos[current];
    var full = btn.getAttribute("data-full");
    var fallback = btn.getAttribute("data-fallback");
    lbImg.classList.remove("is-in");
    var loader = new Image();
    loader.onload = function () {
      lbImg.src = loader.src;
      lbImg.alt = btn.querySelector("img").alt || "";
      lbImg.classList.add("is-in");
    };
    loader.onerror = function () {
      if (fallback && loader.src.indexOf(fallback) === -1) loader.src = fallback;
    };
    loader.src = full;
    lbCur.textContent = pad(current + 1);
    [current - 1, current + 1].forEach(function (i) {
      var neighbor = photos[(i + photos.length) % photos.length];
      var pre = new Image();
      pre.src = neighbor.getAttribute("data-full");
    });
  }

  function openAt(index) {
    lastFocus = document.activeElement;
    show(index);
    open = true;
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    lb.inert = false;
    lockScroll();
    lb.querySelector(".lb__close").focus();
  }

  function closeLb() {
    if (!open) return;
    open = false;
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    lb.inert = true;
    unlockScroll();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  photos.forEach(function (btn, index) {
    btn.addEventListener("click", function () { openAt(index); });
  });

  lb.querySelector(".lb__close").addEventListener("click", closeLb);
  lb.querySelector(".lb__nav--prev").addEventListener("click", function () { show(current - 1); });
  lb.querySelector(".lb__nav--next").addEventListener("click", function () { show(current + 1); });

  lb.addEventListener("click", function (event) {
    if (event.target.closest("button") || event.target.closest(".lb__img")) return;
    closeLb();
  });

  document.addEventListener("keydown", function (event) {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeLb();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      show(current + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(current - 1);
    } else if (event.key === "Tab") {
      var focusable = Array.prototype.slice.call(lb.querySelectorAll("button"));
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  var touchX = 0;
  var touchY = 0;
  var tracking = false;
  lb.addEventListener("touchstart", function (event) {
    if (event.touches.length !== 1) return;
    tracking = true;
    touchX = event.touches[0].clientX;
    touchY = event.touches[0].clientY;
  }, { passive: true });

  lb.addEventListener("touchend", function (event) {
    if (!tracking) return;
    tracking = false;
    var t = event.changedTouches[0];
    var dx = t.clientX - touchX;
    var dy = t.clientY - touchY;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) show(current + 1);
    else show(current - 1);
  }, { passive: true });

  lb.inert = true;
  applyLang(lang);
  syncHeader();
})();
