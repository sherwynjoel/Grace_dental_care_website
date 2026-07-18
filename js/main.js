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
      
      // Calculate scroll progress percentage
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      navbar.style.setProperty('--scroll-percent', scrolled + '%');
    }, { passive: true });

    /* Active link highlight */
    const page = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
    document.querySelectorAll('.navbar__link').forEach(link => {
      let href = link.getAttribute('href') || '';
      href = href.replace(/\.html$/, '').replace(/^\.\/$/, '');
      if (href === page || (page === '' && href === '')) {
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
      if (!open) {
        mobileNav.querySelectorAll('.navbar__mobile-dropdown.open').forEach(el => el.classList.remove('open'));
      }
    });
    mobileNav.querySelectorAll('.navbar__mobile-link, .navbar__mobile-dropdown-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
        mobileNav.querySelectorAll('.navbar__mobile-dropdown.open').forEach(el => el.classList.remove('open'));
      });
    });
    mobileNav.querySelectorAll('.navbar__mobile-dropdown-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const parent = btn.closest('.navbar__mobile-dropdown');
        const isOpen = parent.classList.contains('open');
        mobileNav.querySelectorAll('.navbar__mobile-dropdown.open').forEach(el => {
          if (el !== parent) el.classList.remove('open');
        });
        parent.classList.toggle('open', !isOpen);
      });
    });
    /* Close on outside click */
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && !mobileNav.contains(e.target) && mobileNav.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
        mobileNav.querySelectorAll('.navbar__mobile-dropdown.open').forEach(el => el.classList.remove('open'));
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
  document.querySelectorAll('.compare-container:not(.auto-toggle-slider)').forEach(container => {
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

  /* ── Pediatric Auto-Toggle Slider ──────────────────────── */
  document.querySelectorAll('.compare-container.auto-toggle-slider').forEach(container => {
    const parent = container.closest('.result-item');
    const beforeTag = parent.querySelector('.compare-tag-label--before');
    const afterTag = parent.querySelector('.compare-tag-label--after');
    const afterImg = container.querySelector('.compare-after-img');
    
    function toggleState() {
      const isShowingAfter = container.classList.toggle('show-after');
      if (isShowingAfter) {
        if (afterImg) afterImg.style.opacity = '1';
        if (beforeTag) beforeTag.classList.remove('active');
        if (afterTag) afterTag.classList.add('active');
      } else {
        if (afterImg) afterImg.style.opacity = '0';
        if (beforeTag) beforeTag.classList.add('active');
        if (afterTag) afterTag.classList.remove('active');
      }
    }
    
    let intervalId = setInterval(toggleState, 3000);
    
    container.addEventListener('click', () => {
      clearInterval(intervalId);
      toggleState();
      intervalId = setInterval(toggleState, 3000);
    });
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
      
      const updateWALink = () => {
        const isChange = document.getElementById('calIsChange')?.checked;
        let text = '';
        if (isChange) {
          text = "Hi. I'd like to change my appointment to " + dStr + " at " + selTime + ". Please confirm my changed time slot. Thank you again!";
        } else {
          text = "Hi, I'd like to book an appointment at Grace Dental Care on " + dStr + " at " + selTime + ". Please confirm my slot. Thank you!";
        }
        waBtn.href = 'https://wa.me/918015329529?text=' + encodeURIComponent(text);
      };
      
      const changeCheckbox = document.getElementById('calIsChange');
      if (changeCheckbox) {
        changeCheckbox.checked = false;
        changeCheckbox.onchange = updateWALink;
      }
      updateWALink();
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
          { icon: '', label: 'Pain or toothache',            tag: 'emergency' },
          { icon: '', label: 'I want a better smile',         tag: 'cosmetic'  },
          { icon: '', label: 'Missing teeth',                 tag: 'implants'  },
          { icon: '', label: 'Crooked or misaligned teeth',   tag: 'ortho'     },
          { icon: '', label: 'Gum problems or sensitivity',   tag: 'gum'       },
          { icon: '', label: 'Routine check-up / cleaning',   tag: 'general'   }
        ]
      },
      {
        text: 'How soon are you looking to get treated?',
        options: [
          { icon: '', label: 'Urgently — within days',        tag: 'urgent'    },
          { icon: '', label: 'Within the next few weeks',     tag: 'soon'      },
          { icon: '', label: 'Just exploring my options',     tag: 'exploring' }
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
              (o.icon ? '<span class="quiz-option-icon">' + o.icon + '</span>' : '') +
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

  /* ── Preloader (fallback — primary dismiss is inline script in HTML) ── */
  (function () {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    function dismiss() {
      if (preloader._dismissed) return;
      preloader._dismissed = true;
      preloader.classList.add('done');
      setTimeout(() => { if (preloader.parentNode) preloader.parentNode.removeChild(preloader); }, 650);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(dismiss, 300);
    } else {
      document.addEventListener('DOMContentLoaded', () => setTimeout(dismiss, 300));
    }
    // Hard cap fallback
    setTimeout(dismiss, 2500);
  })();

  /* ── Dark / Light Mode Toggle ────────────────────────── */
  (function () {
    const STORAGE_KEY = 'grace_dark_mode';

    function applyMode(dark) {
      document.body.classList.toggle('dark-mode', dark);
      const btn = document.getElementById('darkToggle');
      if (btn) btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    function injectToggle() {
      const navActions = document.querySelector('.navbar__actions');
      if (!navActions || document.getElementById('darkToggle')) return;
      const btn = document.createElement('button');
      btn.id        = 'darkToggle';
      btn.type      = 'button';
      btn.className = 'dark-toggle';
      btn.setAttribute('aria-label', 'Switch to dark mode');
      btn.innerHTML = `
        <svg class="icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <svg class="icon-sun"  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
      navActions.insertBefore(btn, navActions.firstChild);
      btn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem(STORAGE_KEY, isDark ? '1' : '');
        applyMode(isDark);
      });
    }

    /* Restore saved preference (flicker-free — runs before paint via JS at end of body) */
    const saved = localStorage.getItem(STORAGE_KEY);
    applyMode(saved === '1');

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectToggle);
    } else {
      injectToggle();
    }
  })();

  /* ── Interactive Teeth Map ───────────────────────────── */
  (function () {
    const teeth       = document.querySelectorAll('.tooth');
    const placeholder = document.getElementById('teethPlaceholder');
    const content     = document.getElementById('teethContent');
    const iconEl      = document.getElementById('teethZoneIcon');
    const titleEl     = document.getElementById('teethTitle');
    const descEl      = document.getElementById('teethDesc');
    const listEl      = document.getElementById('teethList');
    if (!teeth.length || !placeholder) return;

    const zoneData = {
      incisor: {
        icon: '',
        title: 'Incisors — Front Teeth',
        desc: 'The 8 incisors (4 upper, 4 lower) are your primary biting teeth and define the front of your smile. They are the most visible and cosmetically important teeth.',
        treatments: ['Composite bonding for chips & gaps', 'Porcelain veneers for smile makeovers', 'Crown after root canal treatment', 'Orthodontic correction for spacing', 'Teeth whitening for staining']
      },
      canine: {
        icon: '',
        title: 'Canines — Corner Teeth',
        desc: 'Canines are the pointed teeth at the corners of your mouth. They are the strongest and longest teeth, guiding your bite and anchoring the smile.',
        treatments: ['Crown or veneer if worn down', 'Root canal if infected', 'Implant if missing (critical for bite guidance)', 'Orthodontic repositioning', 'Laser gum contouring for gummy appearance']
      },
      premolar: {
        icon: '',
        title: 'Premolars — Transition Teeth',
        desc: 'Premolars sit between canines and molars. They help tear and crush food, and are often the teeth extracted for orthodontic space creation.',
        treatments: ['Inlay / onlay for moderate decay', 'Composite or ceramic filling', 'Crown if heavily damaged', 'Root canal treatment', 'Extraction for orthodontic space']
      },
      molar: {
        icon: '',
        title: 'Molars — Back Chewing Teeth',
        desc: 'Molars bear the heaviest chewing load. Wisdom teeth (third molars) often need extraction. Decay in molars is very common due to deep grooves.',
        treatments: ['Deep fissure sealants (prevention)', 'Large composite or ceramic filling', 'Crown for cracked or decayed molar', 'Root canal treatment (multi-canal)', 'Wisdom tooth extraction', 'Implant to replace extracted molar']
      }
    };

    let active = null;

    teeth.forEach(tooth => {
      tooth.addEventListener('click', () => {
        const zone = tooth.dataset.zone;
        if (!zone || !zoneData[zone]) return;

        /* Clicking the same tooth again — deselect */
        if (active === tooth) {
          active.classList.remove('active');
          active = null;
          content.style.display     = 'none';
          placeholder.style.display = '';
          return;
        }

        if (active) active.classList.remove('active');
        active = tooth;
        tooth.classList.add('active');

        const data = zoneData[zone];
        if (iconEl) { iconEl.textContent = data.icon; iconEl.style.display = data.icon ? '' : 'none'; }
        titleEl.textContent = data.title;
        descEl.textContent  = data.desc;
        listEl.innerHTML    = data.treatments.map(t => `<li>${t}</li>`).join('');

        placeholder.style.display = 'none';
        content.style.display     = 'block';
      });
    });
  })();

  /* ── Scroll Progress Bar ─────────────────────────────── */
  (function () {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    window.addEventListener('scroll', () => {
      const el  = document.documentElement;
      const pct = (el.scrollTop || document.body.scrollTop) / (el.scrollHeight - el.clientHeight) * 100;
      bar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
  })();



  /* ── Live Slot Availability Badge ────────────────────── */
  (function () {
    const now  = new Date();
    const day  = now.getDay();
    const hour = now.getHours();
    const isOpen = day >= 1 && day <= 6 && hour >= 9 && hour < 20;
    if (!isOpen) return;

    const slots = hour < 11 ? 5 : hour < 14 ? 3 : hour < 17 ? 4 : 2;
    const times = ['9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
                   '12:00 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM',
                   '4:00 PM','5:00 PM','5:30 PM','6:00 PM','6:30 PM','7:00 PM'];
    const nextSlot = times.find(t => {
      const parts = t.split(':');
      let h = parseInt(parts[0], 10);
      const period = parts[1].split(' ')[1];
      if (period === 'PM' && h !== 12) h += 12;
      return h > hour;
    }) || '—';

    const badge = document.createElement('div');
    badge.className = 'slot-badge';
    badge.innerHTML = `<span class="slot-dot"></span>${slots} slot${slots !== 1 ? 's' : ''} open today · Next: ${nextSlot}`;

    const hero = document.querySelector('.hero__content, .hero__ctas, .hero-inner');
    if (hero) {
      const firstBtn = hero.querySelector('.btn');
      if (firstBtn) firstBtn.parentNode.insertBefore(badge, firstBtn);
      else hero.appendChild(badge);
    }
  })();

  /* ── Page Transitions ────────────────────────────────── */
  (function () {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') ||
          href.startsWith('mailto') || href.startsWith('tel') ||
          link.target === '_blank') return;

      e.preventDefault();
      overlay.classList.add('out');
      setTimeout(() => { window.location.href = href; }, 320);
    });

    window.addEventListener('pageshow', () => {
      requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.remove('out')));
    });
  })();


  /* ── Confetti on Form Success ────────────────────────── */
  (function () {
    const COLORS = ['#C4A35A','#D9BF7F','#FAFAFA','#ef4444','#22c55e','#3b82f6','#a855f7','#f59e0b'];

    window.graceConfetti = function () {
      for (let i = 0; i < 70; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const size  = 6 + Math.random() * 8;
        piece.style.cssText = `
          left:${Math.random() * 100}vw; top:-10px;
          background:${color}; width:${size}px; height:${size}px;
          animation-delay:${Math.random() * 0.9}s;
          border-radius:${Math.random() > 0.5 ? '50%' : '2px'};`;
        document.body.appendChild(piece);
        setTimeout(() => { if (piece.parentNode) piece.parentNode.removeChild(piece); }, 3200);
      }
    };

    const successEl = document.getElementById('formSuccess');
    if (successEl) {
      new MutationObserver(() => {
        if (successEl.classList.contains('visible')) window.graceConfetti();
      }).observe(successEl, { attributes: true, attributeFilter: ['class'] });
    }
  })();

  /* ── WhatsApp Typing Indicator ───────────────────────── */
  (function () {
    const fab   = document.getElementById('waFab');
    const popup = document.getElementById('waPopup');
    if (!fab || !popup) return;

    const msgArea = popup.querySelector('[class*="message"], [class*="body"], [class*="chat"]')
                 || popup.querySelector('div > div');
    if (!msgArea) return;

    let typingTimer = null;
    let replyTimer  = null;
    let replyShown  = false;

    fab.addEventListener('click', () => {
      if (!popup.classList.contains('open') || replyShown) return;
      clearTimeout(typingTimer);
      clearTimeout(replyTimer);

      const typingEl = document.createElement('div');
      typingEl.style.cssText = 'padding:6px 0;';
      typingEl.innerHTML = `
        <div style="background:var(--black-4);border:1px solid var(--gold-border);border-radius:12px 12px 12px 4px;padding:10px 16px;display:inline-block;">
          <span style="font-size:0.7rem;color:var(--gray);display:block;margin-bottom:5px;">Grace Dental is typing</span>
          <div class="wa-typing"><span></span><span></span><span></span></div>
        </div>`;

      typingTimer = setTimeout(() => {
        msgArea.appendChild(typingEl);
        replyTimer = setTimeout(() => {
          if (typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
          const reply = document.createElement('div');
          reply.style.cssText = 'padding:6px 0;animation:fadeUp 0.3s ease both;';
          reply.innerHTML = `
            <div style="background:var(--black-4);border:1px solid var(--gold-border);border-radius:12px 12px 12px 4px;padding:10px 16px;display:inline-block;max-width:85%;">
              <span style="font-size:0.7rem;color:var(--gray);display:block;margin-bottom:4px;">Grace Dental Care</span>
              <p style="font-size:0.85rem;color:var(--white-dim);margin:0;">Hi! 👋 We typically reply in under 5 minutes during clinic hours. How can we help you today?</p>
            </div>`;
          msgArea.appendChild(reply);
          replyShown = true;
        }, 2500);
      }, 1500);
    });
  })();


  /* ── Gallery Filter ──────────────────────────────────── */
  (function () {
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const items      = document.querySelectorAll('.result-item, [data-category]');
    if (!filterBtns.length || !items.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        items.forEach(item => {
          const show = filter === 'all' || item.dataset.category === filter;
          item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          item.style.opacity    = show ? '1' : '0';
          item.style.transform  = show ? '' : 'scale(0.94)';
          item.style.pointerEvents = show ? '' : 'none';
          setTimeout(() => { item.style.visibility = show ? 'visible' : 'hidden'; }, show ? 0 : 300);
        });
      });
    });
  })();

  /* ── Gallery Lightbox ────────────────────────────────── */
  (function () {
    const lightbox = document.getElementById('galleryLightbox');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn  = document.getElementById('lightboxPrev');
    const nextBtn  = document.getElementById('lightboxNext');
    const content  = document.getElementById('lightboxContent');
    const caption  = document.getElementById('lightboxCaption');
    if (!lightbox) return;

    let allItems = [];
    let current  = 0;

    function render() {
      const item  = allItems[current];
      if (!item) return;
      const img   = item.querySelector('img');
      const title = (item.querySelector('h3,h4,h5') || {}).textContent || '';
      content.innerHTML = '';
      if (img) {
        const i = document.createElement('img');
        i.src = img.src; i.alt = title;
        content.appendChild(i);
      } else {
        const clone = item.cloneNode(true);
        clone.style.cssText = 'max-width:500px;pointer-events:none;border-radius:16px;overflow:hidden;';
        content.appendChild(clone);
      }
      if (caption) caption.textContent = title ? `${title}  (${current + 1}/${allItems.length})` : `${current + 1}/${allItems.length}`;
    }

    function open(idx) {
      allItems = Array.from(document.querySelectorAll('.result-item'));
      current  = idx;
      render();
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() { lightbox.classList.remove('open'); document.body.style.overflow = ''; }

    document.addEventListener('click', (e) => {
      if (e.target.closest('.compare-container') || e.target.closest('.result-card__badge') || e.target.closest('.result-card__link')) {
        return;
      }
      const item = e.target.closest('.result-item');
      if (!item) return;
      open(Array.from(document.querySelectorAll('.result-item')).indexOf(item));
    });

    if (closeBtn) closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { current = (current - 1 + allItems.length) % allItems.length; render(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { current = (current + 1) % allItems.length; render(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft'  && prevBtn) prevBtn.click();
      if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
    });
  })();

  /* ── Loyalty Card Counter Animation ─────────────────── */
  (function () {
    const card     = document.getElementById('loyaltyCard');
    const pointsEl = document.getElementById('loyaltyPoints');
    const barEl    = document.getElementById('loyaltyBar');
    if (!card || !pointsEl || !barEl) return;

    const TARGET = 247;
    const MAX    = 500;
    let animated = false;

    new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || animated) return;
      animated = true;

      const dur = 1400, t0 = performance.now();
      (function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        pointsEl.textContent = Math.round(e * TARGET);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);

      setTimeout(() => { barEl.style.width = (TARGET / MAX * 100).toFixed(1) + '%'; }, 80);
    }, { threshold: 0.4 }).observe(card);
  })();

  /* ── Dental Health Score Quiz ────────────────────────── */
  (function () {
    var panel    = document.getElementById('dhsPanel');
    var resultEl = document.getElementById('dhsResult');
    var circle   = document.getElementById('dhsCircle');
    var numEl    = document.getElementById('dhsNum');
    var titleEl  = document.getElementById('dhsTitle');
    var recEl    = document.getElementById('dhsRec');
    var retake   = document.getElementById('dhsRetake');
    if (!panel || !resultEl) return;

    var questions = Array.from(panel.querySelectorAll('.dhs__q'));
    var dots      = Array.from(document.querySelectorAll('.dhs__dot'));
    var lines     = Array.from(document.querySelectorAll('.dhs__line'));
    if (!questions.length) return;

    var CIRC   = 364;
    var scores = [];

    var recs = [
      { min: 80, label: 'Excellent!',
        text: '<strong>Your oral hygiene is outstanding.</strong> Keep up the great habits — twice-yearly professional cleanings will keep your smile perfect. Consider cosmetic options to further enhance your already-great smile.' },
      { min: 60, label: 'Good',
        text: '<strong>You\'re doing well overall.</strong> Small improvements — like daily flossing and reducing sugary snacks — could push your score to Excellent. Book a check-up so we can identify any minor issues early.' },
      { min: 40, label: 'Fair — Needs Attention',
        text: '<strong>Some areas need care.</strong> There may be early signs of gum disease or decay that are best caught now. Most issues at this stage are simple to treat. We\'d love to help you turn this around.' },
      { min:  0, label: 'Your Smile Needs TLC',
        text: '<strong>Don\'t worry — it\'s never too late.</strong> Many patients in a similar situation leave Grace Dental Care with a healthy, confident smile. Book a free consultation with Dr. Sherin for a gentle step-by-step plan.' }
    ];

    function updateTracker(activeIndex) {
      dots.forEach(function(dot, i) {
        dot.classList.remove('active', 'done');
        if (i < activeIndex)        dot.classList.add('done');
        else if (i === activeIndex) dot.classList.add('active');
      });
      lines.forEach(function(line, i) {
        line.classList.toggle('done', i < activeIndex);
      });
    }

    function showQuestion(i) {
      questions.forEach(function(q, j) { q.classList.toggle('active', j === i); });
      updateTracker(i);
    }

    function showResult() {
      panel.style.display    = 'none';
      resultEl.style.display = 'block';
      updateTracker(questions.length);

      var total  = Math.min(scores.reduce(function(a, b) { return a + b; }, 0), 100);
      var offset = CIRC - (total / 100) * CIRC;
      if (circle) setTimeout(function() { circle.style.strokeDashoffset = offset; }, 80);

      var dur = 1400, t0 = performance.now();
      (function tick(now) {
        var p = Math.min((now - t0) / dur, 1);
        if (numEl) numEl.textContent = Math.round((1 - Math.pow(1 - p, 3)) * total);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);

      var rec = recs.find(function(r) { return total >= r.min; });
      if (titleEl) titleEl.textContent = rec.label;
      if (recEl)   recEl.innerHTML     = rec.text;
    }

    panel.addEventListener('click', function(e) {
      var opt = e.target.closest('.dhs__opt');
      if (!opt) return;
      var q = opt.closest('.dhs__q');
      if (!q) return;
      var qi = questions.indexOf(q);
      if (qi === -1) return;

      q.querySelectorAll('.dhs__opt').forEach(function(o) { o.classList.remove('selected'); });
      opt.classList.add('selected');
      scores[qi] = parseInt(opt.dataset.score, 10);

      setTimeout(function() {
        if (qi < questions.length - 1) showQuestion(qi + 1);
        else showResult();
      }, 280);
    });

    if (retake) {
      retake.addEventListener('click', function() {
        scores = [];
        questions.forEach(function(q) {
          q.querySelectorAll('.dhs__opt').forEach(function(o) { o.classList.remove('selected'); });
        });
        if (circle) circle.style.strokeDashoffset = CIRC;
        if (numEl)  numEl.textContent = '0';
        resultEl.style.display = 'none';
        panel.style.display    = '';
        showQuestion(0);
      });
    }

    showQuestion(0);
  })();

  /* ── Redesigned Choose Us card glow effect ──────────── */
  document.querySelectorAll('.choose-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  /* ── Credentials & Certifications Flip (Touch & Keyboard accessibility) ── */
  (function () {
    const cards = document.querySelectorAll('.cert-card');
    cards.forEach(card => {
      const toggleFlip = (e) => {
        // Prevent default click behaviors
        const isFlipped = card.classList.toggle('flipped');
        card.setAttribute('aria-expanded', isFlipped ? 'true' : 'false');
      };
      card.addEventListener('click', toggleFlip);
      card.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggleFlip();
        }
      });
    });
  })();

})();
