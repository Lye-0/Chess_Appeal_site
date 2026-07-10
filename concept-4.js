const conceptFour = document.querySelector(".concept-four");

if (conceptFour) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const header = conceptFour.querySelector(".site-header");
  const frames = [...conceptFour.querySelectorAll(".motion-frame")];
  const dots = [...conceptFour.querySelectorAll(".motion-dot")];
  const stage = conceptFour.querySelector(".motion-stage");
  const screensSection = conceptFour.querySelector("#screens");
  const screensContainer = screensSection?.querySelector(".container");
  const screensTrack = screensSection?.querySelector(".screens-grid");
  const flowSection = conceptFour.querySelector("#flow");
  const flowCards = [...conceptFour.querySelectorAll(".flow-card")];
  const navLinks = [...conceptFour.querySelectorAll('.site-nav a[href^="#"]')];
  const revealTargets = [
    ...conceptFour.querySelectorAll(
      ".section-label, h2, .section-text, .quote-card, .photo-card, .small-card, .feature-card, .screen-card, .flow-card, .benefit-card"
    ),
  ];

  let currentSlide = 0;
  let slideTimer = null;
  let flowTimer = null;
  let flowIndex = 0;
  let ticking = false;

  const clamp = (value, minimum = 0, maximum = 1) =>
    Math.min(Math.max(value, minimum), maximum);

  const showSlide = (nextIndex) => {
    if (!frames.length) return;

    const normalizedIndex = (nextIndex + frames.length) % frames.length;
    const outgoing = frames[currentSlide];

    if (outgoing && outgoing !== frames[normalizedIndex]) {
      outgoing.classList.remove("is-active");
      outgoing.classList.add("is-leaving");
      window.setTimeout(() => outgoing.classList.remove("is-leaving"), 850);
    }

    frames[normalizedIndex].classList.add("is-active");
    dots.forEach((dot, index) => {
      const active = index === normalizedIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-pressed", String(active));
    });
    currentSlide = normalizedIndex;
  };

  const stopCarousel = () => {
    if (slideTimer) window.clearInterval(slideTimer);
    slideTimer = null;
  };

  const startCarousel = () => {
    if (reducedMotion || frames.length < 2) return;
    stopCarousel();
    slideTimer = window.setInterval(() => showSlide(currentSlide + 1), 4200);
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.slideTarget || 0));
      startCarousel();
    });
  });

  stage?.addEventListener("pointerenter", stopCarousel);
  stage?.addEventListener("pointerleave", startCarousel);
  stage?.addEventListener("focusin", stopCarousel);
  stage?.addEventListener("focusout", startCarousel);

  const updateScrollMotion = () => {
    ticking = false;

    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pageProgress = documentHeight > 0 ? window.scrollY / documentHeight : 0;
    header?.style.setProperty("--m4-progress", String(clamp(pageProgress)));

    if (!reducedMotion && window.innerWidth > 980 && screensSection && screensContainer && screensTrack) {
      const availableScroll = screensSection.offsetHeight - window.innerHeight;
      const sectionProgress =
        availableScroll > 0
          ? clamp((window.scrollY - screensSection.offsetTop) / availableScroll)
          : 0;
      const maxTrackShift = Math.max(
        screensTrack.scrollWidth - screensContainer.clientWidth,
        0
      );
      screensTrack.style.setProperty(
        "--m4-track-x",
        `${-maxTrackShift * sectionProgress}px`
      );
    } else {
      screensTrack?.style.setProperty("--m4-track-x", "0px");
    }

    if (!reducedMotion) {
      conceptFour.querySelectorAll(".quote-card").forEach((card) => {
        const bounds = card.getBoundingClientRect();
        const progress = clamp(
          (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)
        );
        card.style.setProperty("--m4-parallax", `${(0.5 - progress) * 54}px`);
      });

      conceptFour.querySelectorAll(".feature-grid .photo-card").forEach((card) => {
        const bounds = card.getBoundingClientRect();
        const progress = clamp(
          (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)
        );
        card.style.setProperty("--m4-image-y", `${(0.5 - progress) * 30}px`);
        card.style.setProperty("--m4-image-scale", String(0.96 + progress * 0.06));
      });
    }

    header?.classList.toggle("is-scrolled", window.scrollY > 30);
  };

  const scheduleScrollMotion = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollMotion);
  };

  window.addEventListener("scroll", scheduleScrollMotion, { passive: true });
  window.addEventListener("resize", scheduleScrollMotion);

  if (!reducedMotion) {
    revealTargets.forEach((element) => element.classList.add("motion-reveal"));
    conceptFour.classList.add("motion-ready");

    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.09, rootMargin: "0px 0px -56px" }
      );

      revealTargets.forEach((element) => revealObserver.observe(element));
    } else {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
    }

    window.setTimeout(() => {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
    }, 1200);

    if (finePointer) {
      window.addEventListener(
        "pointermove",
        (event) => {
          conceptFour.style.setProperty("--pointer-x", `${event.clientX}px`);
          conceptFour.style.setProperty("--pointer-y", `${event.clientY}px`);
        },
        { passive: true }
      );

      stage?.addEventListener("pointermove", (event) => {
        const bounds = stage.getBoundingClientRect();
        const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
        const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
        const activeFrame = frames[currentSlide];
        activeFrame?.style.setProperty("--stage-x", `${horizontal * 18}px`);
        activeFrame?.style.setProperty("--stage-y", `${vertical * 14}px`);
        activeFrame?.style.setProperty("--stage-rx", `${vertical * -4}deg`);
        activeFrame?.style.setProperty("--stage-ry", `${-4 + horizontal * 7}deg`);
      });

      stage?.addEventListener("pointerleave", () => {
        frames.forEach((frame) => {
          frame.style.setProperty("--stage-x", "0px");
          frame.style.setProperty("--stage-y", "0px");
          frame.style.setProperty("--stage-rx", "0deg");
          frame.style.setProperty("--stage-ry", "-4deg");
        });
      });
    }

    if (flowCards.length) {
      flowTimer = window.setInterval(() => {
        const bounds = flowSection?.getBoundingClientRect();
        if (!bounds || bounds.bottom < 0 || bounds.top > window.innerHeight) return;
        flowCards.forEach((card, index) =>
          card.classList.toggle("is-highlighted", index === flowIndex)
        );
        flowIndex = (flowIndex + 1) % flowCards.length;
      }, 1250);
    }

    startCarousel();
  }

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || !entry.target.id) return;
          navLinks.forEach((link) => {
            link.classList.toggle(
              "is-current",
              link.getAttribute("href") === `#${entry.target.id}`
            );
          });
        });
      },
      { threshold: 0.22, rootMargin: "-20% 0px -55%" }
    );

    conceptFour
      .querySelectorAll("main section[id]")
      .forEach((section) => sectionObserver.observe(section));
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopCarousel();
      if (flowTimer) window.clearInterval(flowTimer);
    } else {
      startCarousel();
    }
  });

  showSlide(0);
  updateScrollMotion();
}

