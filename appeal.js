const appealSite = document.querySelector(".appeal-site");

if (appealSite) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const header = appealSite.querySelector(".site-header");
  const hero = appealSite.querySelector(".story-hero");
  const heroFrames = [...appealSite.querySelectorAll(".story-frame")];
  const heroStatuses = [...appealSite.querySelectorAll(".story-stage-status span")];
  const storyStage = appealSite.querySelector(".story-stage");
  const screensSection = appealSite.querySelector(".story-screens");
  const screenCards = [...appealSite.querySelectorAll(".screen-card")];
  const flowSection = appealSite.querySelector(".story-flow");
  const flowCards = [...appealSite.querySelectorAll(".flow-card")];
  const mapItems = [...appealSite.querySelectorAll("[data-story-map]")];
  const navLinks = [...appealSite.querySelectorAll('.site-nav a[href^="#"]')];
  const chapters = [...appealSite.querySelectorAll("[data-story-chapter]")];
  const revealTargets = [
    ...appealSite.querySelectorAll(
      ".section-label, h2, .section-text, .quote-card, .photo-card, .small-card, .feature-card, .benefit-card"
    ),
  ];

  const clamp = (value, minimum = 0, maximum = 1) =>
    Math.min(Math.max(value, minimum), maximum);

  const progressThrough = (section, leadIn = 0, tailOut = 0) => {
    if (!section) return 0;
    const available = section.offsetHeight - window.innerHeight;
    if (available <= 0) return 0;
    const rawProgress = clamp((window.scrollY - section.offsetTop) / available);
    const activeRange = Math.max(1 - leadIn - tailOut, 0.01);
    return clamp((rawProgress - leadIn) / activeRange);
  };

  const progressThroughMobileStage = (stage) => {
    if (!stage) return 0;
    const bounds = stage.getBoundingClientRect();
    const startLine = window.innerHeight * 0.78;
    const travel = window.innerHeight * 0.62 + bounds.height;
    return clamp((startLine - bounds.top) / Math.max(travel, 1));
  };

  const documentOffsetTop = (element) => {
    let offset = 0;
    let current = element;
    while (current) {
      offset += current.offsetTop;
      current = current.offsetParent;
    }
    return offset;
  };

  const progressThroughPinnedMobileStage = (stage) => {
    if (!stage) return 0;
    const stickyTop = 88;
    const start = documentOffsetTop(stage.parentElement) - stickyTop;
    const travel = window.innerHeight * 1.25;
    return clamp((window.scrollY - start) / Math.max(travel, 1));
  };

  const setActiveFrame = (nextIndex) => {
    heroFrames.forEach((frame, index) => {
      const active = index === nextIndex;
      frame.classList.toggle("is-active", active);
      frame.classList.toggle("was-active", index < nextIndex);
    });
    heroStatuses.forEach((status, index) =>
      status.classList.toggle("is-active", index === nextIndex)
    );
  };

  let ticking = false;

  const updateStory = () => {
    ticking = false;

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pageProgress = scrollable > 0 ? clamp(window.scrollY / scrollable) : 0;
    appealSite.style.setProperty("--s5-page-progress", String(pageProgress));
    header?.style.setProperty("--s5-page-progress", String(pageProgress));
    header?.classList.toggle("is-scrolled", window.scrollY > 28);
    const screensBounds = screensSection?.getBoundingClientRect();
    const screenTourActive = Boolean(
      screensBounds &&
      screensBounds.top <= 0 &&
      screensBounds.bottom >= window.innerHeight
    );
    appealSite.classList.toggle("is-screen-tour-active", screenTourActive);

    if (!reducedMotion) {
      const heroProgress = window.innerWidth <= 640
        ? progressThroughPinnedMobileStage(storyStage)
        : window.innerWidth <= 980
          ? progressThroughMobileStage(storyStage)
          : progressThrough(hero, 0.06, 0.04);
      const copyExit = clamp((heroProgress - 0.52) / 0.36);
      appealSite.style.setProperty("--hero-copy-y", `${copyExit * -110}px`);
      appealSite.style.setProperty("--hero-copy-scale", String(1 - copyExit * 0.06));
      appealSite.style.setProperty("--hero-copy-opacity", String(1 - copyExit * 0.63));
      appealSite.style.setProperty("--hero-stage-y", `${(0.5 - heroProgress) * 48}px`);
      appealSite.style.setProperty("--hero-stage-scale", String(0.94 + heroProgress * 0.13));
      appealSite.style.setProperty("--hero-orbit-y", `${heroProgress * 150}px`);
      appealSite.style.setProperty("--hero-orbit-x", `${heroProgress * 110}px`);
      appealSite.style.setProperty("--hero-orbit-r", `${heroProgress * 95}deg`);
      appealSite.style.setProperty("--halo-a-r", `${heroProgress * 190}deg`);
      appealSite.style.setProperty("--halo-b-r", `${heroProgress * -260}deg`);

      const heroIndex = Math.min(
        heroFrames.length - 1,
        Math.floor(heroProgress * heroFrames.length)
      );
      setActiveFrame(Math.max(heroIndex, 0));

      const screensProgress = progressThrough(screensSection, 0.1, 0.05);
      const screenCopyExit = clamp((screensProgress - 0.02) / 0.18);
      const screenStageProgress = clamp((screensProgress - 0.13) / 0.17);
      const screenCardProgress = clamp((screensProgress - 0.22) / 0.78);
      const screenStageStart = window.innerWidth <= 980 ? 250 : 320;
      const screenStageEnd = window.innerWidth <= 980 ? 52 : 62;
      screensSection?.style.setProperty(
        "--screens-copy-opacity",
        String(1 - screenCopyExit)
      );
      screensSection?.style.setProperty(
        "--screens-copy-y",
        `${screenCopyExit * -52}px`
      );
      screensSection?.style.setProperty(
        "--screens-stage-top",
        `${screenStageStart - (screenStageStart - screenStageEnd) * screenStageProgress}px`
      );
      screensSection?.style.setProperty("--screen-tour-progress", String(screenCardProgress));
      const screenPosition = screenCardProgress * screenCards.length;
      const activeScreenIndex = Math.min(
        screenCards.length - 1,
        Math.floor(screenPosition)
      );
      const activeScreenPhase = clamp(screenPosition - activeScreenIndex);

      screenCards.forEach((card, index) => {
        const distance = index - activeScreenIndex;
        const active = distance === 0;
        const previous = distance < 0;
        const x = previous ? -96 : distance * 15;
        const y = previous ? -120 : distance * 19;
        const scale = active
          ? 1
          : previous
            ? 0.9
            : Math.max(0.82, 1 - distance * 0.035);
        const opacity = active
          ? 1
          : previous
            ? 0
            : Math.max(0.22, 0.72 - distance * 0.1);
        const imageScale = active ? 1.015 - activeScreenPhase * 0.015 : 1.01;
        const imageShift = active ? (0.5 - activeScreenPhase) * 4 : 0;

        card.classList.toggle("is-screen-active", active);
        card.style.setProperty("--screen-x", `${x}px`);
        card.style.setProperty("--screen-y", `${y}px`);
        card.style.setProperty("--screen-image-scale", String(imageScale));
        card.style.setProperty("--screen-image-x", `${imageShift}px`);
        card.style.setProperty("--screen-depth", `${distance * -34}px`);
        card.style.setProperty("--screen-r", `${previous ? -4 : distance * 1.35}deg`);
        card.style.setProperty("--screen-scale", String(scale));
        card.style.setProperty("--screen-opacity", String(opacity));
        card.style.setProperty("--screen-z", String(active ? 100 : 100 - distance));
      });

      const flowProgress = progressThrough(flowSection, 0.14, 0.08);
      const flowIndex = Math.min(
        flowCards.length - 1,
        Math.floor(flowProgress * flowCards.length)
      );
      flowCards.forEach((card, index) =>
        card.classList.toggle("is-story-active", index === Math.max(flowIndex, 0))
      );

      appealSite.querySelectorAll(".quote-card").forEach((card) => {
        const bounds = card.getBoundingClientRect();
        const progress = clamp(
          (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)
        );
        card.style.setProperty("--quote-y", `${(0.5 - progress) * 72}px`);
        card.style.setProperty("--quote-r", `${(0.5 - progress) * 3}deg`);
      });

      appealSite.querySelectorAll(".feature-grid .photo-card").forEach((card, index) => {
        const bounds = card.getBoundingClientRect();
        const progress = clamp(
          (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)
        );
        card.style.setProperty("--image-x", `${(0.5 - progress) * (index % 2 ? -30 : 30)}px`);
        card.style.setProperty("--image-y", `${(0.5 - progress) * 62}px`);
        card.style.setProperty("--image-r", `${(0.5 - progress) * 2.8}deg`);
        card.style.setProperty("--image-scale", String(0.96 + progress * 0.07));
      });

      appealSite.querySelectorAll(".feature-card").forEach((card, index) => {
        const bounds = card.getBoundingClientRect();
        const progress = clamp(
          (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)
        );
        const wave = Math.sin(progress * Math.PI + index * 0.55);
        card.style.setProperty("--feature-y", `${wave * -16}px`);
      });

      appealSite.querySelectorAll(".benefit-card").forEach((card, index) => {
        const bounds = card.getBoundingClientRect();
        const progress = clamp(
          (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)
        );
        card.style.setProperty("--benefit-y", `${(0.5 - progress) * (index ? -56 : 56)}px`);
        card.style.setProperty("--benefit-r", `${(0.5 - progress) * (index ? -2 : 2)}deg`);
      });

      const cta = appealSite.querySelector(".cta-section");
      const ctaCard = appealSite.querySelector(".cta-card");
      if (cta && ctaCard) {
        const bounds = cta.getBoundingClientRect();
        const progress = clamp(
          (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)
        );
        ctaCard.style.setProperty("--cta-scale", String(0.92 + progress * 0.1));
      }
    }

    let currentChapter = chapters[0];
    chapters.forEach((chapter) => {
      if (chapter.getBoundingClientRect().top <= window.innerHeight * 0.48) {
        currentChapter = chapter;
      }
    });

    const chapterId =
      currentChapter?.id || currentChapter?.dataset.storyChapter || "top";
    mapItems.forEach((item) =>
      item.classList.toggle("is-current", item.dataset.storyMap === chapterId)
    );
    navLinks.forEach((link) =>
      link.classList.toggle("is-current", link.getAttribute("href") === `#${chapterId}`)
    );
  };

  const scheduleStoryUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateStory);
  };

  if (!reducedMotion) {
    appealSite.classList.add("story-enhanced");
    revealTargets.forEach((element) => element.classList.add("story-reveal"));

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries, revealObserver) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -52px" }
      );
      revealTargets.forEach((element) => observer.observe(element));
    } else {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
    }

    window.setTimeout(() => {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
    }, 1400);

    if (finePointer && storyStage) {
      storyStage.addEventListener("pointermove", (event) => {
        const bounds = storyStage.getBoundingClientRect();
        const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
        const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
        const activeFrame = appealSite.querySelector(".story-frame.is-active");
        activeFrame?.style.setProperty("--frame-x", `${horizontal * 18}px`);
        activeFrame?.style.setProperty("--frame-y", `${vertical * 14}px`);
        activeFrame?.style.setProperty("--frame-rx", `${vertical * -4}deg`);
        activeFrame?.style.setProperty("--frame-ry", `${-4 + horizontal * 7}deg`);
      });

      storyStage.addEventListener("pointerleave", () => {
        heroFrames.forEach((frame) => {
          frame.style.setProperty("--frame-x", "0px");
          frame.style.setProperty("--frame-y", "0px");
          frame.style.setProperty("--frame-rx", "0deg");
          frame.style.setProperty("--frame-ry", "-4deg");
        });
      });
    }
  } else {
    flowCards.forEach((card) => card.classList.add("is-story-active"));
  }

  window.addEventListener("scroll", scheduleStoryUpdate, { passive: true });
  window.addEventListener("resize", scheduleStoryUpdate);

  setActiveFrame(0);
  updateStory();
}

