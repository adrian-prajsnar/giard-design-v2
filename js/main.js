(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SLIDE_MS = 6500;

  const catalog = [
    {
      id: "oferta",
      title: "Oferta",
      text: "Projekty, wizualizacje i realizacje",
      keys: ["oferta", "działamy kompleksowo", "inwestycje", "tereny zielone", "ogród", "nowoczesne ogrody", "obsługa", "wizualizacje", "projekty"],
    },
    {
      id: "o-firmie",
      title: "O firmie",
      text: "Tworzymy z pasją",
      keys: ["o firmie", "tworzymy z pasją", "zespół", "projektant", "projektanci", "architekt", "architekci", "specjalizacja", "poznaj nas bliżej", "pasja", "pasją"],
    },
    {
      id: "realizacje",
      title: "Realizacje",
      text: "Nasze projekty",
      keys: ["projekt", "nasze projekty", "realizacje", "rozwiń", "pokaż", "zdjęcia", "ogrody", "galeria"],
    },
    {
      id: "instagram",
      title: "Instagram",
      text: "Zostańmy w kontakcie",
      keys: ["instagram"],
    },
    {
      id: "kontakt",
      title: "Kontakt",
      text: "Telefon, e-mail i media społecznościowe",
      keys: ["skontaktuj się z nami", "kontakt", "facebook", "linkedin", "numer telefonu", "e-mail", "email", "telefon"],
    },
  ];

  const header = document.querySelector(".header");
  const nav = document.querySelector(".nav");
  const burger = document.querySelector(".burger");
  const loader = document.querySelector(".loader");
  const searchPanel = document.querySelector(".search-panel");
  const searchBackdrop = document.querySelector("#search-backdrop");
  let locks = 0;
  let menuOpen = false;
  let lastScroll = 0;

  function lock(on) {
    locks += on ? 1 : -1;
    if (locks < 0) locks = 0;
    document.documentElement.classList.toggle("is-locked", locks > 0);
  }

  function finishLoader() {
    if (!loader || loader.classList.contains("is-done")) return;
    loader.classList.add("is-done");
    document.documentElement.classList.remove("is-loading");
    loader.addEventListener("transitionend", () => loader.remove(), { once: true });
  }

  if (reduced) {
    loader?.remove();
    document.documentElement.classList.remove("is-loading");
  } else {
    window.addEventListener("load", () => setTimeout(finishLoader, 700));
    setTimeout(finishLoader, 2200);
  }

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("is-solid", y > 30 || menuOpen);
    header.classList.toggle("is-hidden", y > lastScroll && y > 240 && !menuOpen && searchPanel.hidden);
    lastScroll = y;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const bar = document.querySelector(".scroll-progress span");
    bar.style.width = `${height > 0 ? (y / height) * 100 : 0}%`;
    bar.style.background = header.classList.contains("is-solid") ? "#1b5b31" : "#dcc1ab";
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    nav.classList.remove("is-open");
    header.classList.remove("is-menu");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menu");
    lock(false);
  }

  function openMenu() {
    closeSearch();
    menuOpen = true;
    nav.classList.add("is-open");
    header.classList.add("is-menu");
    header.classList.remove("is-hidden");
    burger.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Zamknij menu");
    lock(true);
  }

  burger.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 980) closeMenu();
    });
  });

  const sections = [...document.querySelectorAll("main section[id]")];
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        document.querySelectorAll(".nav-links a").forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((section) => spy.observe(section));

  const searchForm = document.querySelector(".search-form");
  const searchInput = document.querySelector("#search-input");
  const searchResults = document.querySelector(".search-results");
  const searchMsg = document.querySelector(".search-msg");
  const searchOpen = document.querySelector("#search-open");
  const searchClose = document.querySelector("#search-close");

  function fold(value) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  const searchTitles = {
    oferta: "Oferta",
    projekty: "Projekty",
    wizualizacje: "Wizualizacje",
    "o-firmie": "O firmie",
    realizacje: "Realizacje",
    instagram: "Instagram",
    kontakt: "Kontakt",
  };

  const searchIndex = Object.keys(searchTitles)
    .map((id) => document.getElementById(id))
    .filter(Boolean)
    .map((element) => ({
      id: element.id,
      title: searchTitles[element.id],
      text: element.innerText.replace(/\s+/g, " ").trim().slice(0, 110),
      hay: fold(element.innerText),
    }));

  function matches(query) {
    const needle = fold(query);
    if (needle.length < 2) return [];
    return searchIndex
      .filter((item) => item.hay.includes(needle) || catalog.some((entry) => entry.id === item.id && entry.keys.some((key) => fold(key).includes(needle))))
      .sort((a, b) => a.hay.length - b.hay.length)
      .slice(0, 5);
  }

  function closeSearch() {
    if (searchPanel.hidden) return;
    searchPanel.hidden = true;
    searchBackdrop.hidden = true;
    searchOpen.setAttribute("aria-expanded", "false");
  }

  function openSearch() {
    if (menuOpen) closeMenu();
    searchBackdrop.hidden = false;
    searchPanel.hidden = false;
    searchOpen.setAttribute("aria-expanded", "true");
    header.classList.remove("is-hidden");
    searchInput.focus();
  }

  function renderResults(query) {
    const found = matches(query);
    searchResults.innerHTML = "";
    if (!query.trim()) {
      searchMsg.textContent = "";
      return;
    }
    if (fold(query).length < 2) {
      searchMsg.textContent = "Wpisz co najmniej dwa znaki, aby wyszukać.";
      return;
    }
    if (!found.length) {
      searchMsg.textContent = "Niestety nie znaleziono wyszukiwanej frazy, spróbuj ponownie...";
      return;
    }
    searchMsg.textContent = "";
    found.forEach((item) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.innerHTML = `<strong>${item.title}</strong><small>${item.text}</small>`;
      button.addEventListener("click", () => goTo(item.id));
      li.append(button);
      searchResults.append(li);
    });
  }

  function goTo(id) {
    closeSearch();
    const target = document.getElementById(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - (header.offsetHeight + 16);
    window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
    target.classList.remove("flash");
    void target.offsetWidth;
    target.classList.add("flash");
  }

  searchOpen.addEventListener("click", () => (searchPanel.hidden ? openSearch() : closeSearch()));
  searchClose.addEventListener("click", closeSearch);
  searchBackdrop.addEventListener("click", closeSearch);
  searchInput.addEventListener("input", () => renderResults(searchInput.value));
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value;
    const found = matches(query);
    if (fold(query).length < 2) {
      renderResults(query);
      return;
    }
    if (!found.length) {
      renderResults(query);
      return;
    }
    searchInput.value = "";
    renderResults("");
    goTo(found[0].id);
  });

  document.addEventListener("click", (event) => {
    if (searchPanel.hidden) return;
    if (event.target.closest(".search-panel") || event.target.closest("#search-open")) return;
    closeSearch();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== searchInput && !event.metaKey && !event.ctrlKey) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      event.preventDefault();
      openSearch();
    }
    if (event.key === "Escape") {
      if (!searchPanel.hidden) closeSearch();
      if (menuOpen) closeMenu();
      if (lightbox.classList.contains("is-open")) closeLightbox();
    }
  });

  const slides = [...document.querySelectorAll(".hero-slide")];
  const heroIndex = document.querySelector(".hero-index");
  const meter = document.querySelector(".hero-bar span");
  const hero = document.querySelector(".hero");
  let current = 0;
  let timer = 0;

  function upgrade(slide) {
    const img = slide.querySelector("img");
    const full = img.dataset.src;
    if (!full || img.getAttribute("src") === full) return;
    img.src = full;
  }

  function restartMeter() {
    meter.classList.remove("is-run");
    if (reduced) {
      meter.style.transform = "scaleX(1)";
      return;
    }
    meter.style.animationDuration = `${SLIDE_MS}ms`;
    void meter.offsetWidth;
    meter.classList.add("is-run");
  }

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
    upgrade(slides[current]);
    upgrade(slides[(current + 1) % slides.length]);
    heroIndex.textContent = String(current + 1).padStart(2, "0");
    restartMeter();
  }

  function play() {
    clearInterval(timer);
    if (reduced) return;
    timer = setInterval(() => showSlide(current + 1), SLIDE_MS);
  }

  document.querySelector(".hero-next").addEventListener("click", () => {
    showSlide(current + 1);
    play();
  });
  document.querySelector(".hero-prev").addEventListener("click", () => {
    showSlide(current - 1);
    play();
  });

  let touchX = 0;
  hero.addEventListener("touchstart", (event) => {
    touchX = event.touches[0].clientX;
  }, { passive: true });
  hero.addEventListener("touchend", (event) => {
    const delta = event.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) < 48) return;
    showSlide(current + (delta < 0 ? 1 : -1));
    play();
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.classList.contains("is-open") || menuOpen || !searchPanel.hidden) return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (event.key === "ArrowRight") showSlide(current + 1);
    if (event.key === "ArrowLeft") showSlide(current - 1);
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") play();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInterval(timer);
    else play();
  });

  showSlide(0);
  play();

  document.querySelectorAll(".offer-card").forEach((card) => {
    card.addEventListener("focusin", () => {
      document.querySelectorAll(".offer-card").forEach((item) => item.classList.toggle("is-active", item === card));
    });
  });

  const gallery = document.querySelector(".gallery");
  const galleryWrap = document.querySelector(".gallery-wrap");
  const expandBtn = document.querySelector("#expand-gallery");
  const galleryCount = document.querySelector(".gallery-count");
  const totalShots = 24;

  for (let i = 1; i <= totalShots; i++) {
    const button = document.createElement("button");
    button.type = "button";
    const shapes = ["lg", "tall", "sq", "sq", "wide", "wide"];
    const order = [1, 7, 12, 4, 15, 9, 18, 6, 21, 11, 3, 16, 8, 19, 5, 22, 10, 14, 24, 13, 17, 20, 23, 2];
    const imageNumber = order[i - 1];
    button.className = `gallery-item shape-${shapes[(i - 1) % shapes.length]} reveal${i > 12 ? " is-extra" : ""}`;
    button.dataset.index = String(i);
    button.setAttribute("aria-label", `Powiększ realizację ${i}`);
    const img = document.createElement("img");
    img.src = `public/assets/images/gallery-images/gallery-${imageNumber}.jpg`;
    img.alt = "Zdjęcie pięknie zaprojektowanego ogrodu";
    img.loading = i < 5 ? "eager" : "lazy";
    img.decoding = "async";
    const index = document.createElement("span");
    index.className = "gallery-index";
    index.textContent = String(i).padStart(2, "0");
    button.append(img, index);
    gallery.append(button);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => {
    if (!el.classList.contains("is-extra")) io.observe(el);
  });

  const galleryMore = expandBtn.closest(".gallery-more");

  expandBtn.addEventListener("click", () => {
    if (gallery.classList.contains("is-expanded")) return;

    gallery.classList.add("is-expanded");
    galleryWrap.classList.add("is-expanded");
    expandBtn.setAttribute("aria-expanded", "true");
    galleryCount.textContent = "24 z 24";
    gallery.querySelectorAll(".is-extra").forEach((el, index) => {
      window.setTimeout(() => el.classList.add("is-in"), reduced ? 0 : 40 * index);
    });
    galleryMore?.classList.add("is-hidden");
  });

  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = document.querySelector(".lightbox img");
  const lightboxCount = document.querySelector(".lightbox figcaption");
  const focusable = () => [...lightbox.querySelectorAll("button:not(:disabled)")];
  let shot = 0;
  let lastFocus = null;

  function visibleItems() {
    return [...gallery.querySelectorAll(".gallery-item")].filter(
      (item) => gallery.classList.contains("is-expanded") || !item.classList.contains("is-extra")
    );
  }

  function renderShot() {
    const items = visibleItems();
    const item = items[shot];
    if (!item) return;
    lightboxImg.src = item.querySelector("img").currentSrc || item.querySelector("img").src;
    lightboxImg.alt = `Zdjęcie pięknie zaprojektowanego ogrodu, ${shot + 1} z ${items.length}`;
    lightboxCount.textContent = `${String(shot + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
    lightbox.querySelector(".prev").disabled = shot === 0;
    lightbox.querySelector(".next").disabled = shot === items.length - 1;
  }

  function openLightbox(index) {
    shot = index;
    lastFocus = document.activeElement;
    renderShot();
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add("is-open"));
    lock(true);
    lightbox.querySelector(".lightbox-close").focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lock(false);
    lastFocus?.focus();
    window.setTimeout(() => {
      if (!lightbox.classList.contains("is-open")) lightbox.hidden = true;
    }, reduced ? 0 : 400);
  }

  gallery.addEventListener("click", (event) => {
    const item = event.target.closest(".gallery-item");
    if (!item || item.classList.contains("is-extra") && !gallery.classList.contains("is-expanded")) return;
    openLightbox(visibleItems().indexOf(item));
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".next").addEventListener("click", () => {
    if (shot < visibleItems().length - 1) {
      shot += 1;
      renderShot();
    }
  });
  lightbox.querySelector(".prev").addEventListener("click", () => {
    if (shot > 0) {
      shot -= 1;
      renderShot();
    }
  });
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  let lightboxX = 0;
  lightbox.addEventListener("touchstart", (event) => {
    lightboxX = event.touches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener("touchend", (event) => {
    const delta = event.changedTouches[0].clientX - lightboxX;
    if (Math.abs(delta) < 48) return;
    if (delta < 0 && shot < visibleItems().length - 1) shot += 1;
    if (delta > 0 && shot > 0) shot -= 1;
    renderShot();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "ArrowRight" && shot < visibleItems().length - 1) {
      shot += 1;
      renderShot();
    }
    if (event.key === "ArrowLeft" && shot > 0) {
      shot -= 1;
      renderShot();
    }
    if (event.key !== "Tab") return;
    const items = focusable();
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const form = document.querySelector("#contact-form");
  const status = document.querySelector(".form-status");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const errors = {
      name: name.length < 2 ? "Podaj imię." : "",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Podaj poprawny adres e-mail.",
      message: message.length < 10 ? "Wiadomość powinna mieć co najmniej 10 znaków." : "",
    };
    let invalid = false;
    Object.entries(errors).forEach(([key, text]) => {
      const field = form.querySelector(`[data-for="${key}"]`);
      field.textContent = text;
      form[key].setAttribute("aria-invalid", text ? "true" : "false");
      if (text) invalid = true;
    });
    if (invalid) {
      status.textContent = "";
      return;
    }
    const body = encodeURIComponent(`Imię: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:giarddesign@kontakt.pl?subject=${encodeURIComponent("Zapytanie ze strony GiardDesign")}&body=${body}`;
    status.textContent = "Otwieramy program pocztowy z przygotowaną wiadomością.";
    form.reset();
  });

  document.querySelector("#year").textContent = String(new Date().getFullYear());

  const marqueeGroup = document.querySelector(".marquee-group");
  const marqueeTrack = document.querySelector(".marquee-track");
  function setMarqueeShift() {
    if (!marqueeGroup || !marqueeTrack) return;
    marqueeTrack.style.setProperty("--marquee-shift", `-${marqueeGroup.getBoundingClientRect().width}px`);
  }
  setMarqueeShift();
  window.addEventListener("load", setMarqueeShift);

  if (!reduced && window.innerWidth > 800) {
    const layers = [...document.querySelectorAll("[data-speed]")];
    let frame = 0;
    const update = () => {
      layers.forEach((layer) => {
        const rect = layer.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const shift = (rect.top - window.innerHeight / 2) * Number(layer.dataset.speed);
        layer.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
      });
      frame = 0;
    };
    window.addEventListener("scroll", () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    }, { passive: true });
  }
})();
