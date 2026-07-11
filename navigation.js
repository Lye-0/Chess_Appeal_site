const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector(".site-nav");
const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

if (menuButton && siteNav) {
  const setMenuState = (isOpen) => {
    siteNav.classList.toggle("is-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "メニューを閉じる" : "メニューを開く"
    );
  };

  menuButton.addEventListener("click", () => {
    setMenuState(!siteNav.classList.contains("is-open"));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });
}

const appealPage = document.querySelector(".appeal-page");

if (appealPage) {
  const header = document.querySelector(".site-header");
  const revealTargets = document.querySelectorAll(
    ".appeal-page .section-label, .appeal-page h2, .appeal-page .section-text, .appeal-page .small-card, .appeal-page .feature-card, .appeal-page .ui-points article, .appeal-page .screen-card, .appeal-page .flow-card, .appeal-page .benefit-card"
  );

  revealTargets.forEach((element) => element.classList.add("reveal-item"));

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px" }
    );

    revealTargets.forEach((element) => revealObserver.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  }

  const syncHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}
