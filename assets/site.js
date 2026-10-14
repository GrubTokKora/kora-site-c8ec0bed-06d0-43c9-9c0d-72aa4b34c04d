/* Marigold site behaviour: header, announcement bar, reserve popover, mobile menu, hero video,
   open-now status, scroll reveals, count-up, menu tabs + dish preview, parallax, loops, FAQ,
   inquiry-type toggle. The inquiry form submit lives inline in index.html (Kora forms API). */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Header: transparent over the hero, solid after it, hides on scroll down. */
  var header = $('[data-header]');
  var hero = $('.hero, .page-hero');
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    var heroEnd = hero ? hero.offsetTop + hero.offsetHeight - 120 : 80;
    if (header) {
      header.classList.toggle('is-solid', !hero || y > 40);
      var hide = y > lastY && y > heroEnd && !root.classList.contains('menu-open') && !header.contains(document.activeElement);
      header.classList.toggle('is-hidden', hide);
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Shell links point at index.html#section so they work from every page. On the homepage, turn them into
     in-page anchors (smooth scroll, no reload). Mark the nav item for the current page. */
  var page = document.body.getAttribute('data-page') || '';
  if (page === 'home') {
    $$('a[href^="index.html#"]').forEach(function (a) { a.setAttribute('href', a.getAttribute('href').slice(10)); });
  }
  var here = location.pathname.split('/').pop().replace(/\.html$/, '');
  $$('.primary-nav a, .mobile-menu__nav a').forEach(function (a) {
    var target = (a.getAttribute('href') || '').split('#')[0].replace(/\.html$/, '');
    if (target && target !== 'index' && target === here) { a.classList.add('is-current'); a.setAttribute('aria-current', 'page'); }
  });

  /* Announcement bar: one message at a time. */
  var msgs = $$('.announce__msg');
  if (msgs.length > 1 && !reduce) {
    var mi = 0, paused = false;
    var bar = $('[data-announce]');
    bar.addEventListener('mouseenter', function () { paused = true; });
    bar.addEventListener('mouseleave', function () { paused = false; });
    bar.addEventListener('focusin', function () { paused = true; });
    bar.addEventListener('focusout', function () { paused = false; });
    setInterval(function () {
      if (paused || document.hidden) return;
      msgs[mi].classList.remove('is-active');
      mi = (mi + 1) % msgs.length;
      msgs[mi].classList.add('is-active');
    }, 5000);
  }

  /* Reserve popover. */
  var rToggle = $('[data-reserve-toggle]'), rPanel = $('[data-reserve-panel]');
  function closeReserve() { if (rPanel && !rPanel.hidden) { rPanel.hidden = true; rToggle.setAttribute('aria-expanded', 'false'); } }
  if (rToggle && rPanel) {
    rToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = rPanel.hidden;
      rPanel.hidden = !open;
      rToggle.setAttribute('aria-expanded', String(open));
      if (open) { var first = $('a', rPanel); if (first) first.focus({ preventScroll: true }); }
    });
    document.addEventListener('click', function (e) { if (!rPanel.contains(e.target)) closeReserve(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !rPanel.hidden) { closeReserve(); rToggle.focus(); } });
  }

  /* Mobile menu: full-screen circular wipe. */
  var burger = $('[data-burger]'), mm = $('[data-mobile-menu]');
  function setMenu(open) {
    if (!mm) return;
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      mm.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { mm.classList.add('is-open'); }); });
    } else {
      mm.classList.remove('is-open');
      setTimeout(function () { if (!mm.classList.contains('is-open')) mm.hidden = true; }, reduce ? 0 : 600);
    }
  }
  if (burger && mm) {
    burger.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    $$('a', mm).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); burger.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 1000 && root.classList.contains('menu-open')) setMenu(false); });
  }

  /* Hero video: the original full-length film with play/pause and sound controls (it starts muted, as browsers require
     for autoplay). Paused for visitors who prefer reduced motion; they can still press play. */
  var video = $('[data-hero-video]'), vPlay = $('[data-video-play]'), vSound = $('[data-video-sound]');
  if (video) {
    var setPlayUi = function () {
      var paused = video.paused;
      vPlay.setAttribute('aria-pressed', String(paused));
      vPlay.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
    };
    var setSoundUi = function () {
      var on = !video.muted;
      vSound.setAttribute('aria-pressed', String(on));
      vSound.setAttribute('aria-label', on ? 'Turn video sound off' : 'Turn video sound on');
    };
    if (reduce) { video.removeAttribute('autoplay'); video.pause(); }
    else { var pr = video.play(); if (pr && pr.catch) pr.catch(function () { setPlayUi(); }); }
    video.addEventListener('play', setPlayUi);
    video.addEventListener('pause', setPlayUi);
    video.addEventListener('volumechange', setSoundUi);
    if (vPlay) vPlay.addEventListener('click', function () { if (video.paused) video.play(); else video.pause(); });
    if (vSound) vSound.addEventListener('click', function () {
      video.muted = !video.muted;
      if (!video.muted) { video.volume = 1; if (video.paused) video.play(); }
    });
    setPlayUi(); setSoundUi();
    /* Save bandwidth and CPU: pause while the hero is off screen (unless the visitor paused it). */
    if ('IntersectionObserver' in window) {
      var userPaused = false;
      if (vPlay) vPlay.addEventListener('click', function () { userPaused = video.paused; });
      var heroVisible = true;
      var resume = function () {
        if (heroVisible && !userPaused && !reduce && !document.hidden && video.paused) { var p2 = video.play(); if (p2 && p2.catch) p2.catch(function () {}); }
      };
      new IntersectionObserver(function (en) {
        if (document.hidden) return;
        heroVisible = en[0].isIntersecting;
        if (!heroVisible) { if (!video.paused) video.pause(); } else resume();
      }, { threshold: 0.15 }).observe(video.parentElement);
      document.addEventListener('visibilitychange', resume);
    }
  }

  /* Open-now status and today's row, in Eastchester time. */
  var HOURS = { 0: [[690, 1290]], 1: [[690, 900], [990, 1320]], 2: [[690, 900], [990, 1320]], 3: [[690, 900], [990, 1320]],
                4: [[690, 900], [990, 1320]], 5: [[690, 1320]], 6: [[690, 1320]] };
  function fmt(m) { var h = Math.floor(m / 60), mm2 = m % 60, ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + (mm2 ? ':' + String(mm2).padStart(2, '0') : '') + ' ' + ap; }
  try {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    var get = function (t) { var x = parts.filter(function (p2) { return p2.type === t; })[0]; return x ? x.value : ''; };
    var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    var mins = (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10);
    $$('[data-day="' + day + '"]').forEach(function (el) { el.classList.add('is-today'); });  /* hours table + specials week */
    var status = $('[data-open-status]');  /* optional element; the hero no longer shows it */
    if (status && day > -1) {
      var slots = HOURS[day], txt = '', open = false;
      for (var i = 0; i < slots.length; i++) {
        if (mins >= slots[i][0] && mins < slots[i][1]) { open = true; txt = 'Open now until ' + fmt(slots[i][1]); break; }
        if (mins < slots[i][0]) { txt = 'Opens today at ' + fmt(slots[i][0]); break; }
      }
      if (!txt) { var nd = (day + 1) % 7; txt = 'Closed now, opens ' + (nd === day + 1 ? 'tomorrow' : 'tomorrow') + ' at ' + fmt(HOURS[nd][0][0]); }
      status.textContent = txt;
      status.classList.toggle('is-closed', !open);
    }
  } catch (err) {}

  /* Scroll reveals. Observe the element that is NOT clipped (clip-path hides an element from IO). */
  var revealables = $$('[data-reveal], [data-reveal-group]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Count-up numbers. */
  var counters = $$('[data-count-to]');
  if ('IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target, to = parseFloat(el.getAttribute('data-count-to')), dec = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
        var t0 = performance.now(), dur = 1600;
        (function tick(now) {
          var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4), v = to * e;
          el.textContent = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
          if (k < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* Menu tabs (ARIA tabs pattern) and the hover preview of each dish. */
  var tabs = $$('.menu__tab');
  var previewImgs = $$('.menu__preview-img');
  var badge = $('[data-menu-badge]');
  function showDish(li) {
    if (!li) return;
    var key = li.getAttribute('data-dish');
    $$('.dish.is-active').forEach(function (d) { d.classList.remove('is-active'); });
    li.classList.add('is-active');
    if (!key) return;
    previewImgs.forEach(function (img) { img.classList.toggle('is-active', img.getAttribute('data-key') === key); });
    if (badge) badge.textContent = $('.dish__name', li).textContent;
  }
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
    var panel = document.getElementById(tab.getAttribute('aria-controls'));
    showDish(panel && $('.dish', panel));
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') n = tabs[0];
      if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });
  $$('.dish').forEach(function (li) {
    li.addEventListener('mouseenter', function () { showDish(li); });
    li.addEventListener('focusin', function () { showDish(li); });
  });
  if (tabs.length) showDish($('.dish'));

  /* Gentle parallax on a few images (desktop only). */
  var plx = $$('[data-parallax]');
  if (plx.length && !reduce && window.matchMedia('(min-width: 761px)').matches) {
    var ticking = false;
    var run = function () {
      var vh = window.innerHeight;
      plx.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var k = parseFloat(el.getAttribute('data-parallax')) || 0.05;
        var off = (r.top + r.height / 2 - vh / 2) * -k;
        el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    window.addEventListener('resize', run);
    run();
  }

  /* Homepage welcome plate: turns slowly as it scrolls through the viewport. */
  var plate = $('[data-welcome-plate]');
  if (plate && !reduce) {
    var spinTick = false;
    var spin = function () {
      var r = plate.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom > 0 && r.top < vh) {
        var k = (r.top + r.height / 2 - vh / 2) / vh;
        plate.style.transform = 'rotate(' + (k * -24).toFixed(2) + 'deg)';
      }
      spinTick = false;
    };
    window.addEventListener('scroll', function () { if (!spinTick) { spinTick = true; requestAnimationFrame(spin); } }, { passive: true });
    spin();
  }

  /* Seamless loops: duplicate marquee and filmstrip content (clones hidden from assistive tech). */
  $$('[data-marquee], .filmstrip__track').forEach(function (track) {
    var kids = Array.prototype.slice.call(track.children);
    kids.forEach(function (k) {
      var c = k.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      $$('img', c).forEach(function (img) { img.alt = ''; img.setAttribute('role', 'presentation'); });
      track.appendChild(c);
    });
  });

  /* FAQ: animate open/close height. */
  $$('.faq-item').forEach(function (d) {
    var s = $('summary', d), body = $('.faq-item__a', d);
    if (!s || !body || reduce) return;
    s.addEventListener('click', function (e) {
      e.preventDefault();
      if (d.open) {
        var h = body.scrollHeight;
        body.style.height = h + 'px';
        requestAnimationFrame(function () {
          body.style.transition = 'height .4s cubic-bezier(.16,1,.3,1), opacity .3s';
          body.style.height = '0px'; body.style.opacity = '0';
        });
        setTimeout(function () { d.open = false; body.style.cssText = ''; }, 400);
      } else {
        d.open = true;
        var full = body.scrollHeight;
        body.style.height = '0px'; body.style.opacity = '0';
        requestAnimationFrame(function () {
          body.style.transition = 'height .5s cubic-bezier(.16,1,.3,1), opacity .4s';
          body.style.height = full + 'px'; body.style.opacity = '1';
        });
        setTimeout(function () { body.style.cssText = ''; }, 520);
      }
    });
  });

  /* Inquiry type: catering vs private party fields, plus buttons that preselect it. */
  var form = $('[data-inquiry-form]');
  function setType(type) {
    if (!form) return;
    var radio = form.querySelector('input[name="inquiry_type"][value="' + type + '"]');
    if (radio) radio.checked = true;
    $$('[data-when]', form).forEach(function (f) { f.hidden = f.getAttribute('data-when') !== type; });
  }
  if (form) {
    $$('input[name="inquiry_type"]', form).forEach(function (r) { r.addEventListener('change', function () { setType(r.value); }); });
    $$('[data-inquiry]').forEach(function (b) { b.addEventListener('click', function () { setType(b.getAttribute('data-inquiry')); }); });
    var dateInput = form.querySelector('input[type="date"]');
    if (dateInput) { var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset()); dateInput.min = t.toISOString().slice(0, 10); }
  }

  /* Menu page: switch between Dinner / Lunch / Happy Hour, scroll-spy the category bar, dish photo lightbox. */
  var fmTabs = $$('[data-fm-tab]');
  function fmSelect(tab, focus) {
    fmTabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
    var cats = $('[data-fm-cats]');
    if (cats) cats.hidden = tab.getAttribute('data-fm-tab') !== 'dinner';
    /* Bring the start of the chosen menu just under the sticky header + menu bar. The bar is position:sticky, so its
       offsetTop is NOT its place in the flow; measure the panel itself instead. Only scroll when we are already past it. */
    var bar = $('[data-fm-bar]');
    var panelEl = document.getElementById(tab.getAttribute('aria-controls'));
    if (bar && panelEl) {
      var hdrH = header ? header.offsetHeight : 0;
      var target = panelEl.getBoundingClientRect().top + window.scrollY - bar.offsetHeight - hdrH;
      if (target < window.scrollY - 2) {
        if (header) header.classList.remove('is-hidden');   /* scrolling up keeps the header visible */
        window.scrollTo({ top: Math.max(0, target), behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    if (history.replaceState) history.replaceState(null, '', '#' + tab.getAttribute('data-fm-tab'));
  }
  fmTabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { fmSelect(tab); });
    tab.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = fmTabs[(i + 1) % fmTabs.length];
      if (e.key === 'ArrowLeft') n = fmTabs[(i - 1 + fmTabs.length) % fmTabs.length];
      if (n) { e.preventDefault(); fmSelect(n, true); }
    });
  });
  if (fmTabs.length) {
    var initial = (location.hash || '').slice(1);
    var startTab = fmTabs.filter(function (t) { return t.getAttribute('data-fm-tab') === initial; })[0];
    if (startTab) fmSelect(startTab);
  }
  var catLinks = $$('[data-fm-cats] a');
  if (catLinks.length && 'IntersectionObserver' in window) {
    var catIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        catLinks.forEach(function (l) {
          var on = l.getAttribute('href') === '#' + en.target.id;
          l.classList.toggle('is-active', on);
          if (on && l.parentElement.scrollTo) {
            var bar2 = l.parentElement;
            bar2.scrollTo({ left: l.offsetLeft - bar2.clientWidth / 2 + l.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
          }
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    catLinks.forEach(function (l) { var sec = document.getElementById(l.getAttribute('href').slice(1)); if (sec) catIo.observe(sec); });
  }
  var lb = $('[data-lightbox]');
  if (lb && typeof lb.showModal === 'function') {
    var lbImg = $('img', lb), lbCap = $('[data-lightbox-caption]', lb), lastBtn = null;
    $$('[data-zoom]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var img = $('img', btn);
        lastBtn = btn;
        lbImg.src = btn.getAttribute('data-zoom');
        lbImg.alt = img ? img.alt : '';
        lbCap.textContent = btn.getAttribute('data-caption') || '';
        lb.showModal();
      });
    });
    var closeLb = function () { lb.close(); };
    $('[data-lightbox-close]', lb).addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    lb.addEventListener('close', function () { if (lastBtn) lastBtn.focus(); });
  }

  /* Accessibility page: highlight the section in the table of contents. */
  var tocLinks = $$('.a11y__toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var tocIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tocLinks.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    tocLinks.forEach(function (l) { var t = document.getElementById(l.getAttribute('href').slice(1)); if (t) tocIo.observe(t); });
  }

  /* Footer year. */
  var yr = $('[data-year]');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
