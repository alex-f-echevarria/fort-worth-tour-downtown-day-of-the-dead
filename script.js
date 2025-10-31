(function () {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach((carousel) => {
    const viewport = carousel.querySelector('.carousel-viewport');
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(track?.children || []);
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    const dotsWrap = carousel.querySelector('.carousel-dots');

    if (!viewport || !track || !slides.length) return;

    // Build dots if they aren't there already
    if (dotsWrap && !dotsWrap.children.length) {
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        b.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(b);
      });
    }
    const dots = dotsWrap ? Array.from(dotsWrap.children) : [];

    const indexFromScroll = () => {
      const w = viewport.clientWidth || 1;
      return Math.round(viewport.scrollLeft / w);
    };
    const updateDots = (i) => dots.forEach((d, k) => d.setAttribute('aria-selected', String(k === i)));
    const goTo = (i) => {
      const w = viewport.clientWidth;
      viewport.scrollTo({ left: i * w, behavior: 'smooth' });
      updateDots(i);
    };

    prevBtn?.addEventListener('click', () => goTo(Math.max(0, indexFromScroll() - 1)));
    nextBtn?.addEventListener('click', () => goTo(Math.min(slides.length - 1, indexFromScroll() + 1)));

    // Keep dots in sync when the user swipes
    let ticking = false;
    viewport.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateDots(indexFromScroll());
          ticking = false;
        });
        ticking = true;
      }
    });

    // --- The crucial part: reflow when the carousel becomes visible ---
    // 1) After first image loads (covers lazy loading / cache misses)
    const firstImg = slides[0]?.querySelector('img');
    if (firstImg && !firstImg.complete) {
      firstImg.addEventListener('load', () => goTo(0), { once: true });
    }

    // 2) When the viewport becomes visible in the page (e.g., tab switch)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) goTo(indexFromScroll() || 0);
      });
    }, { threshold: 0.1 });
    io.observe(viewport);

    // 3) On resize, re-snap to the current slide to avoid half-blank
    new ResizeObserver(() => goTo(indexFromScroll() || 0)).observe(viewport);

    // 4) First paint
    window.addEventListener('load', () => goTo(0));
  });
})();