/* ============================================================
   GRACE DENTAL CARE — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Navbar scroll behaviour ─────────────────────────── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    /* Active link highlight */
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar__link').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ── Mobile menu ─────────────────────────────────────── */
  const hamburger = document.querySelector('.navbar__hamburger');
  const mobileNav = document.querySelector('.navbar__mobile');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('.navbar__mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
    /* Close on outside click */
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && mobileNav.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── Scroll reveal (IntersectionObserver) ────────────── */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => observer.observe(el));
  }

  /* ── Animated counters ───────────────────────────────── */
  function animateCounter(el) {
    const raw = el.dataset.target || '0';
    const target = parseInt(raw.replace(/,/g, ''), 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      /* Ease out */
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterEls = document.querySelectorAll('[data-counter]');
  if (counterEls.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counterEls.forEach(el => counterObserver.observe(el));
  }

  /* ── Before / After slider ───────────────────────────── */
  document.querySelectorAll('.compare-container').forEach(container => {
    const afterEl = container.querySelector('.compare-after');
    const handleBar = container.querySelector('.compare-handle-bar');
    const handleBtn = container.querySelector('.compare-handle-btn');
    let dragging = false;

    function updateSlider(x) {
      const rect = container.getBoundingClientRect();
      let pct = ((x - rect.left) / rect.width) * 100;
      pct = Math.max(2, Math.min(98, pct));
      if (afterEl)    afterEl.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      if (handleBar)  handleBar.style.left = `${pct}%`;
      if (handleBtn)  handleBtn.style.left = `${pct}%`;
    }

    /* Mouse */
    container.addEventListener('mousedown', (e) => { dragging = true; updateSlider(e.clientX); });
    window.addEventListener('mousemove', (e) => { if (dragging) updateSlider(e.clientX); });
    window.addEventListener('mouseup', () => { dragging = false; });

    /* Touch */
    container.addEventListener('touchstart', (e) => { dragging = true; updateSlider(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchmove', (e) => { if (dragging) updateSlider(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchend', () => { dragging = false; });
  });

  /* ── FAQ accordion ───────────────────────────────────── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      /* Close all */
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      /* Toggle current */
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── Treatment category filter ───────────────────────── */
  const catBtns = document.querySelectorAll('.treat-category-btn');
  const treatItems = document.querySelectorAll('[data-category]');
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      treatItems.forEach(item => {
        if (cat === 'all' || item.dataset.category === cat) {
          item.style.display = '';
          item.style.animation = 'scaleIn 0.35s ease';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  /* ── Results category filter ─────────────────────────── */
  const resultCatBtns = document.querySelectorAll('.result-category');
  const resultItems = document.querySelectorAll('[data-result]');
  resultCatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      resultCatBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.result;
      resultItems.forEach(item => {
        if (cat === 'all' || item.dataset.result === cat) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  /* ── Scroll to top ───────────────────────────────────── */
  const scrollTopBtn = document.querySelector('.scroll-top');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Contact form ────────────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      const success = document.querySelector('.form-success');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      /* Simulate async send — replace with real API */
      setTimeout(() => {
        contactForm.reset();
        btn.textContent = 'Send Message';
        btn.disabled = false;
        if (success) {
          success.classList.add('visible');
          setTimeout(() => success.classList.remove('visible'), 5000);
        }
      }, 1400);
    });
  }

  /* ── Smooth anchor scroll ────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 96;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── Marquee pause on hover ──────────────────────────── */
  document.querySelectorAll('.marquee-track').forEach(track => {
    track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
    track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
  });

})();
