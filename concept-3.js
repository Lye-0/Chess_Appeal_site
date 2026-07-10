const conceptPage = document.querySelector(".concept-three");

if (conceptPage) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = conceptPage.querySelector(".site-header");
  const heroStage = conceptPage.querySelector(".hero-visual");
  const heroPanel = conceptPage.querySelector(".hero .photo-card");
  const revealTargets = conceptPage.querySelectorAll(
    ".section-label, h2, .section-text, .small-card, .feature-card, .ui-points article, .screen-card, .flow-card, .benefit-card"
  );

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    header?.style.setProperty("--c3-progress", String(progress));
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });

  if (!prefersReducedMotion) {
    conceptPage.classList.add("c3-motion");
    revealTargets.forEach((element) => element.classList.add("c3-reveal"));

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries, revealObserver) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("c3-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -54px" }
      );

      revealTargets.forEach((element) => observer.observe(element));
    } else {
      revealTargets.forEach((element) => element.classList.add("c3-visible"));
    }

    if (window.matchMedia("(pointer: fine)").matches && heroStage && heroPanel) {
      heroStage.addEventListener("pointermove", (event) => {
        const bounds = heroStage.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        heroPanel.style.transform =
          `perspective(1300px) rotateY(${-6 + x * 5}deg) rotateX(${2 - y * 4}deg) translateZ(20px)`;
      });

      heroStage.addEventListener("pointerleave", () => {
        heroPanel.style.transform =
          "perspective(1300px) rotateY(-6deg) rotateX(2deg) translateZ(20px)";
      });
    }
  }
}

