(() => {
  const pages = [
    { href: "privacy.html", id: "privacy", en: "Privacy", fr: "Confidentialité" },
    { href: "terms.html", id: "terms", en: "Terms", fr: "Conditions" },
    { href: "support.html", id: "support", en: "Support", fr: "Assistance" },
    { href: "faq.html", id: "faq", en: "FAQ", fr: "FAQ" },
  ];

  const file = (location.pathname.split("/").pop() || "index.html").replace(/\/$/, "") || "index.html";
  const current = file === "" || file === "/" ? "index.html" : file;

  function lang() {
    return localStorage.getItem("pikcal-lang") || (navigator.language || "en").slice(0, 2) === "fr" ? "fr" : "en";
  }

  function setLang(next) {
    localStorage.setItem("pikcal-lang", next);
    document.documentElement.lang = next;
    document.documentElement.dir = "ltr";
    document.querySelectorAll("[data-en]").forEach((el) => {
      const value = el.getAttribute(next === "fr" ? "data-fr" : "data-en");
      if (value != null) el.innerHTML = value;
    });
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const dict = window.PIKCAL_I18N && window.PIKCAL_I18N[next];
      const key = el.getAttribute("data-i18n");
      if (dict && dict[key] != null) el.innerHTML = dict[key];
    });
    document.querySelectorAll(".lang button").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.lang === next);
    });
    document.querySelectorAll(".island nav a[data-en]").forEach((a) => {
      a.textContent = next === "fr" ? a.dataset.fr : a.dataset.en;
    });
    const h1 = document.querySelector("h1");
    if (h1) {
      document.title = `${h1.innerText.replace(/\s+/g, " ").trim()} · PikCal`;
    }
  }

  function mountChrome() {
    const classic = document.body.classList.contains("doc");
    const nav = pages.map((p) =>
      `<a href="${p.href}" class="${current === p.href ? "is-active" : ""}" data-en="${p.en}" data-fr="${p.fr}">${p.en}</a>`
    ).join("");
    const lang = `
        <div class="lang" role="group" aria-label="Language">
          <button type="button" data-lang="en">EN</button>
          <button type="button" data-lang="fr">FR</button>
        </div>`;

    const skip = document.createElement("a");
    skip.className = "skip";
    skip.href = "#content";
    skip.textContent = "Skip to content";
    document.body.prepend(skip);

    if (classic) {
      const top = document.createElement("header");
      top.className = "doc-top";
      top.innerHTML = `
        <a class="brand" href="index.html">
          <img src="logo.png?v=3" width="32" height="32" alt="">
          <strong>PikCal</strong>
        </a>
        <nav>${nav}</nav>
        ${lang}`;
      document.body.prepend(top);
    } else {
      const wrap = document.createElement("div");
      wrap.className = "island-wrap";
      wrap.innerHTML = `
      <div class="island">
        <a class="brand" href="index.html">
          <img src="logo.png?v=3" width="36" height="36" alt="PikCal">
          <strong>PikCal</strong>
        </a>
        <nav>${nav}</nav>
        ${lang}
      </div>`;
      document.body.prepend(wrap);

      const bar = document.createElement("div");
      bar.className = "macro-bar";
      bar.setAttribute("aria-hidden", "true");
      bar.innerHTML = "<i></i><i></i><i></i>";
      document.body.prepend(bar);
    }

    if (!document.querySelector(".site-foot") && !document.querySelector(".doc-foot")) {
      const foot = document.createElement("footer");
      foot.className = classic ? "doc-foot" : "site-foot";
      foot.innerHTML = `
        <span>© 2026 PikCal</span>
        <nav>
          <a href="privacy.html" data-en="Privacy" data-fr="Confidentialité">Privacy</a>
          <a href="terms.html" data-en="Terms" data-fr="Conditions">Terms</a>
          <a href="support.html">Support</a>
          <a href="faq.html">FAQ</a>
          <a href="mailto:support@pikcal.app">support@pikcal.app</a>
        </nav>`;
      document.body.append(foot);
    }

    document.querySelectorAll(".lang button").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });
  }

  function tocSpy() {
    const links = [...document.querySelectorAll(".toc a")];
    const ids = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    if (!ids.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    ids.forEach((el) => io.observe(el));
  }

  function faq() {
    document.querySelectorAll(".faq-q").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        const open = item.classList.contains("is-open");
        document.querySelectorAll(".faq-item").forEach((el) => el.classList.remove("is-open"));
        if (!open) item.classList.add("is-open");
      });
    });
    const input = document.querySelector(".faq-search");
    if (!input) return;
    input.addEventListener("input", () => {
      const q = input.value.toLowerCase().trim();
      document.querySelectorAll(".faq-item").forEach((item) => {
        const hay = (item.dataset.keywords || "") + " " + item.textContent.toLowerCase();
        item.hidden = q.length > 0 && !hay.includes(q);
      });
      document.querySelectorAll("[data-cat]").forEach((cat) => {
        const any = [...cat.querySelectorAll(".faq-item")].some((el) => !el.hidden);
        cat.hidden = !any;
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    mountChrome();
    const initial = localStorage.getItem("pikcal-lang") || ((navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en");
    setLang(initial);
    tocSpy();
    faq();
  });
})();
