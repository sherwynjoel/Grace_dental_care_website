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

  /* ── Cookie consent ──────────────────────────────────── */
  (function () {
    const banner  = document.getElementById('cookieBanner');
    const accept  = document.getElementById('cookieAccept');
    const decline = document.getElementById('cookieDecline');
    if (!banner) return;

    if (localStorage.getItem('grace_cookie_consent')) {
      banner.style.display = 'none';
    } else {
      setTimeout(() => banner.classList.add('visible'), 1800);
    }

    function dismiss(val) {
      localStorage.setItem('grace_cookie_consent', val);
      banner.classList.remove('visible');
      setTimeout(() => { banner.style.display = 'none'; }, 500);
    }

    if (accept)  accept.addEventListener('click',  () => dismiss('accepted'));
    if (decline) decline.addEventListener('click', () => dismiss('declined'));
  })();

  /* ── Emergency banner ────────────────────────────────── */
  (function () {
    const banner   = document.getElementById('emergencyBanner');
    const closeBtn = document.getElementById('emergencyClose');
    if (!banner) return;

    function showBanner() {
      banner.classList.add('show');
      document.body.classList.add('emergency-active');
    }
    function hideBanner() {
      banner.classList.remove('show');
      document.body.classList.remove('emergency-active');
    }

    const now  = new Date();
    const day  = now.getDay();
    const hour = now.getHours();
    const isOpen = day >= 1 && day <= 6 && hour >= 9 && hour < 20;

    if (isOpen && !sessionStorage.getItem('grace_emergency_closed')) {
      showBanner(); /* Show immediately so layout is correct from first paint */
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        hideBanner();
        sessionStorage.setItem('grace_emergency_closed', '1');
      });
    }
  })();

  /* ── Sticky book button ──────────────────────────────── */
  (function () {
    const btn = document.getElementById('stickyBook');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
  })();

  /* ── Exit-intent popup ───────────────────────────────── */
  (function () {
    const popup    = document.getElementById('exitPopup');
    const closeBtn = document.getElementById('exitPopupClose');
    if (!popup) return;

    let triggered = false;
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !triggered && !sessionStorage.getItem('grace_exit_shown')) {
        triggered = true;
        sessionStorage.setItem('grace_exit_shown', '1');
        popup.classList.add('visible');
      }
    });

    function closePopup() { popup.classList.remove('visible'); }
    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    popup.addEventListener('click', (e) => { if (e.target === popup) closePopup(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopup(); });
  })();

  /* ── WhatsApp chat popup ─────────────────────────────── */
  (function () {
    const fab      = document.getElementById('waFab');
    const popup    = document.getElementById('waPopup');
    const closeBtn = document.getElementById('waPopupClose');
    if (!fab || !popup) return;

    fab.addEventListener('click', () => {
      const isOpen = popup.classList.toggle('open');
      popup.setAttribute('aria-hidden', String(!isOpen));
      fab.setAttribute('aria-expanded', String(isOpen));
    });

    function closeWa() {
      popup.classList.remove('open');
      popup.setAttribute('aria-hidden', 'true');
      fab.setAttribute('aria-expanded', 'false');
    }
    if (closeBtn) closeBtn.addEventListener('click', closeWa);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeWa(); });
  })();

  /* ── Newsletter form ─────────────────────────────────── */
  (function () {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn   = form.querySelector('button[type="submit"]');
      if (!input || !input.validity.valid) return;
      const orig = btn.textContent;
      btn.textContent = 'Subscribed! ✓';
      btn.disabled    = true;
      input.value     = '';
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3500);
    });
  })();

  /* ── Calendar Booking Widget ─────────────────────────── */
  (function () {
    const grid       = document.getElementById('calGrid');
    if (!grid) return;

    const monthLabel = document.getElementById('calMonthLabel');
    const prevBtn    = document.getElementById('calPrev');
    const nextBtn    = document.getElementById('calNext');
    const panel1     = document.getElementById('calPanel1');
    const panel2     = document.getElementById('calPanel2');
    const panel3     = document.getElementById('calPanel3');
    const dateLabel  = document.getElementById('calDateLabel');
    const slotsWrap  = document.getElementById('calSlots');
    const confirmTxt = document.getElementById('calConfirmDetail');
    const waBtn      = document.getElementById('calWABtn');
    const backDate   = document.getElementById('calBackDate');
    const backTime   = document.getElementById('calBackTime');

    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const SLOTS  = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM'];

    let viewDate = new Date();
    let selDate  = null;
    let selTime  = null;

    function setStep(n) {
      [1, 2, 3].forEach(i => {
        const ind = document.getElementById('calStepInd' + i);
        if (!ind) return;
        ind.classList.toggle('active', i === n);
        ind.classList.toggle('done',   i < n);
      });
    }

    function renderCalendar() {
      const year  = viewDate.getFullYear();
      const month = viewDate.getMonth();
      monthLabel.textContent = MONTHS[month] + ' ' + year;

      const firstDay  = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();
      const today     = new Date(); today.setHours(0,0,0,0);

      grid.innerHTML = '';

      for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement('span');
        blank.className = 'cal-day';
        grid.appendChild(blank);
      }

      for (let d = 1; d <= totalDays; d++) {
        const date      = new Date(year, month, d);
        const isPast    = date < today;
        const isSunday  = date.getDay() === 0;
        const isToday   = date.toDateString() === today.toDateString();
        const isSel     = selDate && date.toDateString() === selDate.toDateString();

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = d;
        btn.className = 'cal-day' +
          (isPast || isSunday ? ' cal-day--disabled' : ' cal-day--available') +
          (isSel    ? ' cal-day--selected' : '') +
          (isToday  ? ' cal-day--today'    : '');
        btn.disabled = isPast || isSunday;

        if (!isPast && !isSunday) {
          btn.addEventListener('click', () => {
            selDate = new Date(year, month, d);
            renderCalendar();
            showPanel(2);
            const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
            dateLabel.textContent = selDate.toLocaleDateString('en-IN', opts);
            buildSlots();
          });
        }
        grid.appendChild(btn);
      }
    }

    function buildSlots() {
      slotsWrap.innerHTML = '';
      SLOTS.forEach(t => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cal-slot' + (selTime === t ? ' cal-slot--selected' : '');
        btn.textContent = t;
        btn.addEventListener('click', () => {
          selTime = t;
          slotsWrap.querySelectorAll('.cal-slot').forEach(b => b.classList.remove('cal-slot--selected'));
          btn.classList.add('cal-slot--selected');
          setTimeout(() => showConfirm(), 320);
        });
        slotsWrap.appendChild(btn);
      });
    }

    function showConfirm() {
      const opts   = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
      const dStr   = selDate.toLocaleDateString('en-IN', opts);
      confirmTxt.textContent = dStr + ' at ' + selTime;
      const msg    = encodeURIComponent('Hi, I\'d like to book an appointment at Grace Dental Care on ' + dStr + ' at ' + selTime + '. Please confirm my slot. Thank you!');
      waBtn.href   = 'https://wa.me/918015329529?text=' + msg;
      showPanel(3);
    }

    function showPanel(n) {
      panel1.classList.toggle('hidden', n !== 1);
      panel2.classList.toggle('hidden', n !== 2);
      panel3.classList.toggle('hidden', n !== 3);
      setStep(n);
    }

    prevBtn.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); });
    nextBtn.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); });
    backDate.addEventListener('click', () => { showPanel(1); });
    backTime.addEventListener('click', () => { showPanel(2); buildSlots(); });

    renderCalendar();
  })();

  /* ── Dental Quiz ─────────────────────────────────────── */
  (function () {
    const startBtn  = document.getElementById('quizStartBtn');
    if (!startBtn) return;

    const intro     = document.getElementById('quizIntro');
    const active    = document.getElementById('quizActive');
    const body      = document.getElementById('quizBody');
    const progress  = document.getElementById('quizProgressBar');

    const questions = [
      {
        text: "What's your main dental concern?",
        options: [
          { icon: '⚡', label: 'Pain or toothache',            tag: 'emergency' },
          { icon: '✨', label: 'I want a better smile',         tag: 'cosmetic'  },
          { icon: '🦷', label: 'Missing teeth',                 tag: 'implants'  },
          { icon: '📐', label: 'Crooked or misaligned teeth',   tag: 'ortho'     },
          { icon: '🌿', label: 'Gum problems or sensitivity',   tag: 'gum'       },
          { icon: '✓',  label: 'Routine check-up / cleaning',   tag: 'general'   }
        ]
      },
      {
        text: 'How soon are you looking to get treated?',
        options: [
          { icon: '🚨', label: 'Urgently — within days',        tag: 'urgent'    },
          { icon: '📅', label: 'Within the next few weeks',     tag: 'soon'      },
          { icon: '🔍', label: 'Just exploring my options',     tag: 'exploring' }
        ]
      }
    ];

    const results = {
      emergency: { title: 'Emergency / Root Canal',       desc: 'Tooth pain usually signals infection or nerve damage. We\'ll relieve your pain quickly and save your tooth.',                                      btn: 'Book Emergency Slot'          },
      cosmetic:  { title: 'Smile Makeover & Veneers',     desc: 'From whitening to full smile design — we\'ll craft a personalised plan so you can preview your results before we begin.',                          btn: 'Book a Smile Consultation'    },
      implants:  { title: 'Dental Implants',              desc: 'The most natural-looking, permanent solution for missing teeth. Book a consultation to check your suitability.',                                    btn: 'Book Implant Consultation'    },
      ortho:     { title: 'Braces / Clear Aligners',      desc: 'Straighten your smile discreetly. Our orthodontist will recommend the best fit — aligners or braces — for your lifestyle.',                        btn: 'Book Orthodontic Consultation' },
      gum:       { title: 'Laser Gum Therapy',            desc: 'Gum disease is highly treatable with our painless laser therapy. Acting early prevents tooth loss and protects your overall health.',              btn: 'Book Gum Assessment'          },
      general:   { title: 'General Check-up & Cleaning',  desc: 'Prevention is always better than cure. A routine visit catches problems early and keeps your smile fresh and healthy.',                           btn: 'Book a Check-up'              }
    };

    let answers = [];

    function setProgress(step) {
      progress.style.width = Math.round((step / questions.length) * 100) + '%';
    }

    function showQuestion(idx) {
      const q = questions[idx];
      setProgress(idx);
      body.innerHTML =
        '<p class="quiz-q-count">Question ' + (idx + 1) + ' of ' + questions.length + '</p>' +
        '<h3 class="quiz-q-text">' + q.text + '</h3>' +
        '<div class="quiz-options">' +
          q.options.map(o =>
            '<button type="button" class="quiz-option" data-tag="' + o.tag + '">' +
              '<span class="quiz-option-icon">' + o.icon + '</span>' +
              '<span>' + o.label + '</span>' +
            '</button>'
          ).join('') +
        '</div>';

      body.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
          body.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          answers[idx] = btn.dataset.tag;
          setTimeout(() => {
            if (idx + 1 < questions.length) showQuestion(idx + 1);
            else showResult();
          }, 380);
        });
      });
    }

    function showResult() {
      setProgress(questions.length);
      const r = results[answers[0]] || results.general;
      body.innerHTML =
        '<div class="quiz-result">' +
          '<div class="quiz-result-badge">✓ Your personalised recommendation</div>' +
          '<h3 class="quiz-result-title">' + r.title + '</h3>' +
          '<p class="quiz-result-desc">' + r.desc + '</p>' +
          '<div class="quiz-result-actions">' +
            '<a href="contact.html" class="btn btn--gold btn--lg">' + r.btn + '</a>' +
            '<button type="button" class="btn btn--outline" id="quizRetake">Retake Quiz</button>' +
          '</div>' +
        '</div>';
      document.getElementById('quizRetake').addEventListener('click', restartQuiz);
    }

    function restartQuiz() {
      answers = [];
      active.classList.add('hidden');
      intro.classList.remove('hidden');
      setProgress(0);
    }

    startBtn.addEventListener('click', () => {
      intro.classList.add('hidden');
      active.classList.remove('hidden');
      answers = [];
      showQuestion(0);
    });
  })();

})();
