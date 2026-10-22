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

  /* Hero video: poster paints first (preload=none). Mobile gets a short compressed cut; desktop gets the full film.
     Source is attached after idle so LCP is the poster, not the MP4. Muted autoplay; reduced-motion stays on poster. */
  var video = $('[data-hero-video]'), vPlay = $('[data-video-play]'), vSound = $('[data-video-sound]');
  if (video) {
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var useMobileVideo = window.matchMedia('(max-width: 760px)').matches
      || !!(conn && (conn.saveData || /2g/.test(conn.effectiveType || '')));
    var sourceLoaded = false;
    var userPaused = false;
    var heroVisible = true;

    var setPlayUi = function () {
      if (!vPlay) return;
      var paused = !sourceLoaded || video.paused;
      vPlay.setAttribute('aria-pressed', String(paused));
      vPlay.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
    };
    var setSoundUi = function () {
      if (!vSound) return;
      var on = !video.muted;
      vSound.setAttribute('aria-pressed', String(on));
      vSound.setAttribute('aria-label', on ? 'Turn video sound off' : 'Turn video sound on');
    };
    var loadSource = function () {
      if (sourceLoaded) return;
      sourceLoaded = true;
      var src = useMobileVideo
        ? (video.getAttribute('data-src-mobile') || 'assets/video/marigold-hero-mobile.mp4')
        : (video.getAttribute('data-src-desktop') || 'assets/video/marigold-hero.mp4');
      var source = document.createElement('source');
      source.src = src;
      source.type = 'video/mp4';
      video.appendChild(source);
      video.load();
    };
    var tryPlay = function () {
      if (reduce || userPaused || document.hidden || !heroVisible) return;
      loadSource();
      var pr = video.play();
      if (pr && pr.catch) pr.catch(function () { setPlayUi(); });
    };

    video.addEventListener('play', setPlayUi);
    video.addEventListener('pause', setPlayUi);
    video.addEventListener('volumechange', setSoundUi);
    if (vPlay) vPlay.addEventListener('click', function () {
      if (!sourceLoaded) {
        userPaused = false;
        loadSource();
        var p0 = video.play();
        if (p0 && p0.catch) p0.catch(function () { setPlayUi(); });
        return;
      }
      if (video.paused) { userPaused = false; video.play(); }
      else { userPaused = true; video.pause(); }
    });
    if (vSound) vSound.addEventListener('click', function () {
      if (!sourceLoaded) loadSource();
      video.muted = !video.muted;
      if (!video.muted) {
        video.volume = 1;
        userPaused = false;
        if (video.paused) video.play();
      }
    });
    setPlayUi(); setSoundUi();

    if (!reduce) {
      if (useMobileVideo) {
        var kickoff = function () { tryPlay(); };
        if ('requestIdleCallback' in window) requestIdleCallback(kickoff, { timeout: 2500 });
        else setTimeout(kickoff, 1500);
      } else {
        setTimeout(tryPlay, 100);
      }
    }

    /* Save bandwidth and CPU: pause while the hero is off screen (unless the visitor paused it). */
    if ('IntersectionObserver' in window) {
      var resume = function () {
        if (heroVisible && !userPaused && !reduce && !document.hidden && sourceLoaded && video.paused) {
          var p2 = video.play();
          if (p2 && p2.catch) p2.catch(function () {});
        }
      };
      new IntersectionObserver(function (en) {
        if (document.hidden) return;
        heroVisible = en[0].isIntersecting;
        if (!heroVisible) { if (sourceLoaded && !video.paused) video.pause(); }
        else resume();
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
  /* Preview column is display:none under 1000px, but browsers may still fetch lazy srcset.
     Strip sources on small screens; restore if the viewport grows to desktop. */
  var previewDesktop = window.matchMedia('(min-width: 1000px)');
  function syncPreviewSources() {
    previewImgs.forEach(function (img) {
      if (previewDesktop.matches) {
        if (!img.getAttribute('src') && img.getAttribute('data-src')) {
          img.setAttribute('src', img.getAttribute('data-src'));
          if (img.getAttribute('data-srcset')) img.setAttribute('srcset', img.getAttribute('data-srcset'));
          if (img.getAttribute('data-sizes')) img.setAttribute('sizes', img.getAttribute('data-sizes'));
        }
      } else {
        if (img.getAttribute('src') && !img.getAttribute('data-src')) {
          img.setAttribute('data-src', img.getAttribute('src'));
          if (img.getAttribute('srcset')) img.setAttribute('data-srcset', img.getAttribute('srcset'));
          if (img.getAttribute('sizes')) img.setAttribute('data-sizes', img.getAttribute('sizes'));
        }
        img.removeAttribute('src');
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
      }
    });
  }
  if (previewImgs.length) {
    syncPreviewSources();
    if (previewDesktop.addEventListener) previewDesktop.addEventListener('change', syncPreviewSources);
    else if (previewDesktop.addListener) previewDesktop.addListener(syncPreviewSources);
  }
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

  /* Seamless loops: duplicate marquee/filmstrip content (clones hidden from assistive tech).
     Filmstrip clones must wait until the strip is near the viewport — cloneNode on lazy images
     at page load forces every gallery asset to download immediately. */
  function duplicateTrack(track) {
    if (track.getAttribute('data-duplicated') === '1') return;
    track.setAttribute('data-duplicated', '1');
    var kids = Array.prototype.slice.call(track.children);
    kids.forEach(function (k) {
      var c = k.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      $$('img', c).forEach(function (img) {
        img.alt = '';
        img.setAttribute('role', 'presentation');
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
      });
      track.appendChild(c);
    });
  }
  $$('[data-marquee]').forEach(duplicateTrack);
  $$('.filmstrip__track').forEach(function (track) {
    if (reduce) return; /* reduced-motion uses a plain scroll strip; no loop clone needed */
    var root = track.closest('[data-filmstrip]') || track;
    if ('IntersectionObserver' in window) {
      var fio = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        fio.disconnect();
        duplicateTrack(track);
      }, { rootMargin: '400px 0px' });
      fio.observe(root);
    } else {
      duplicateTrack(track);
    }
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

  /* Menu page. Kora draws Dinner / Lunch / Happy Hour from the menu data into the kora:data:menu region (the
     "cards" layout, so dish photos are included): one section per menu, all shown, with a row of jump links.
     Here, on top of that: one menu at a time behind tabs in a sticky bar with the open menu's categories, each
     menu's headline (from [data-fm-extras]), section numbers and dish counts, the happy-hour card, and dish
     photos that open in the lightbox. */
  var fmRoot = $('[data-fm-menu]');
  var km = fmRoot && $('.kora-menu', fmRoot);
  if (km) {
    fmRoot.classList.add('is-enhanced');
    var fmMenus = $$('.kora-menu__menu', km);
    var extras = $('[data-fm-extras]');
    var noteIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 10.5v6M12 7.2v.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

    fmMenus.forEach(function (menu) {
      var title = $('.kora-menu__menu-title', menu);
      var intro = extras && $('[data-fm-intro="' + menu.id + '"]', extras);
      var sections = $$('.kora-menu__section', menu);
      if (intro && intro.classList.contains('fm-hh__card')) {
        /* Happy hour: the deal card beside its list, with the days and times from the data. */
        var when = $('.kora-menu__availability', menu), slot = $('[data-fm-when]', intro);
        if (when && slot) {
          var t = when.textContent, comma = t.indexOf(',');
          var strong = document.createElement('strong');
          strong.textContent = (comma > 0 ? t.slice(comma + 1) : t).trim();
          slot.textContent = comma > 0 ? t.slice(0, comma + 1) + ' ' : '';
          slot.appendChild(strong);
          when.remove();
        }
        var hh = document.createElement('div');
        var list = document.createElement('div');
        hh.className = 'fm-hh';
        sections.forEach(function (s) { list.appendChild(s); });
        hh.appendChild(intro);
        hh.appendChild(list);
        (title || menu.firstChild).after(hh);
        sections = [];
      } else if (intro) {
        var desc = $('.kora-menu__menu-desc', menu);
        if (desc) intro.appendChild(desc);
        (title || menu.firstChild).after(intro);
      }
      sections.forEach(function (s, n) {
        var head = document.createElement('div');
        var num = document.createElement('span');
        var count = document.createElement('span');
        var dishes = $$('.kora-menu__item', s).length;
        head.className = 'fm-section__head';
        num.className = 'fm-section__num';
        num.textContent = (n < 9 ? '0' : '') + (n + 1);
        count.className = 'fm-section__count';
        count.textContent = dishes + (dishes === 1 ? ' dish' : ' dishes');
        head.appendChild(num);
        [$('.kora-menu__section-title', s), $('.kora-menu__section-desc', s)].forEach(function (el) { if (el) head.appendChild(el); });
        head.appendChild(count);
        s.insertBefore(head, s.firstChild);
      });
      var note = $('.kora-menu__menu-note', menu);
      if (note) {
        var box = document.createElement('div');
        box.className = 'fm-note';
        box.innerHTML = noteIcon;
        note.before(box);
        box.appendChild(note);
      }
    });

    /* Dishes: dotted leader between name and price; a photo becomes a zoom button that lists the small file and
       shows the full one in the lightbox (every dish photo has -th and -sm sizes beside it). */
    $$('.kora-menu__item', km).forEach(function (item) {
      var head = $('.kora-menu__item-head', item);
      var price = head && $('.kora-menu__item-price, .kora-menu__prices', head);
      if (price) {
        var dots = document.createElement('span');
        dots.className = 'fm-item__dots';
        dots.setAttribute('aria-hidden', 'true');
        head.insertBefore(dots, price);
      }
      var img = $('.kora-menu__item-image', item);
      if (!img) return;
      var full = img.getAttribute('src'), name = ($('.kora-menu__item-name', item) || {}).textContent || '';
      var base = /^(.*)\.webp$/.exec(full);
      if (base && !/-(th|sm)$/.test(base[1])) {
        img.srcset = base[1] + '-th.webp 320w, ' + base[1] + '-sm.webp 800w, ' + full + ' 1600w';
        img.sizes = '80px';
      }
      img.alt = name + ' at Marigold';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fm-thumb';
      btn.setAttribute('data-zoom', full);
      btn.setAttribute('data-caption', name);
      btn.setAttribute('aria-label', 'View a photo of ' + name);
      img.before(btn);
      btn.appendChild(img);
    });

    /* The sticky bar: Kora's menu switcher as the tabs, and each menu's category links (only the open one shows). */
    var bar = document.createElement('div');
    bar.className = 'fm-bar';
    bar.setAttribute('data-fm-bar', '');
    bar.innerHTML = '<div class="wrap"><div class="fm-bar__inner"></div></div>';
    var barInner = $('.fm-bar__inner', bar), barWrap = $('.wrap', bar);
    var switcher = $('.kora-menu__switcher', km);
    if (switcher) {
      switcher.className = 'fm-tabs';
      switcher.setAttribute('role', 'tablist');
      barInner.appendChild(switcher);
    }
    if ($('.fm-thumb', km)) {
      var tip = document.createElement('p');
      tip.className = 'fm-bar__note';
      tip.textContent = 'Tap a dish photo to see it up close';
      barInner.appendChild(tip);
    }
    fmMenus.forEach(function (menu) {
      var nav = $('.kora-menu__nav', menu);
      if (!nav) return;
      nav.className = 'fm-cats';
      nav.setAttribute('data-fm-cats', menu.id);
      barWrap.appendChild(nav);
    });
    fmRoot.before(bar);

    var fmTabs = switcher ? $$('a', switcher) : [];
    var fmSync = function (id) {
      fmMenus.forEach(function (m) { m.hidden = m.id !== id; });
      var open = fmMenus.filter(function (m) { return !m.hidden; })[0];
      fmTabs.forEach(function (tab) {
        var on = !!open && tab.getAttribute('href') === '#' + open.id;
        tab.classList.add('fm-tab');
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
      });
      $$('[data-fm-cats]', bar).forEach(function (c) { c.hidden = !open || c.getAttribute('data-fm-cats') !== open.id; });
      return open;
    };
    fmTabs.forEach(function (tab, i) {
      /* Show the menu, then bring its start just under the header + bar, but only when we are already past it.
         The bar is sticky, so measure the menu, not the bar's offsetTop. */
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        var open = fmSync(tab.getAttribute('href').slice(1));
        if (!open) return;
        if (history.replaceState) history.replaceState(null, '', '#' + open.id);
        var hdrH = header ? header.offsetHeight : 0;
        var target = open.getBoundingClientRect().top + window.scrollY - bar.offsetHeight - hdrH;
        if (target < window.scrollY - 2) {
          if (header) header.classList.remove('is-hidden');   /* scrolling up keeps the header visible */
          window.scrollTo({ top: Math.max(0, target), behavior: reduce ? 'auto' : 'smooth' });
        }
      });
      tab.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = fmTabs[(i + 1) % fmTabs.length];
        if (e.key === 'ArrowLeft') n = fmTabs[(i - 1 + fmTabs.length) % fmTabs.length];
        if (n) { e.preventDefault(); n.click(); n.focus(); }
      });
    });
    /* Open the menu the address points into (a menu, a section or a dish); links made before the menu came
       from data used #dinner, #lunch and #happy-hour. */
    var hash = (location.hash || '').slice(1);
    var legacy = { dinner: 'menu-dinner-menu', lunch: 'menu-lunch-menu', 'happy-hour': 'menu-happy-hour' }[hash];
    var target = hash && document.getElementById(legacy || hash);
    var startMenu = target && (target.closest('.kora-menu__menu') || null);
    fmSync(startMenu ? startMenu.id : fmMenus[0] && fmMenus[0].id);
    if (legacy && history.replaceState) history.replaceState(null, '', '#' + legacy);

    var catLinks = $$('[data-fm-cats] a', bar);
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

  /* Events page (Kora events contract). Events come from the #events-data JSON on the page (Kora's
     website editor appends published events there) merged with live published events from the Kora
     public events API, so an event published in kora-web shows up even before the site is edited. */
  var evRoot = $('[data-events]');
  if (evRoot) (function () {
    var TZ = 'America/New_York';
    var dataEl = document.getElementById('events-data');
    var events = [];
    try { events = (JSON.parse(dataEl.textContent).events || []).slice(); } catch (e) {}
    var calEl = $('[data-cal]', evRoot), listEl = $('[data-ev-list]', evRoot), nextBtn = $('[data-ev-next]', evRoot);
    var modal = $('[data-ev-modal]'), modalBody = modal ? $('[data-ev-modal-body]', modal) : null;
    var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
    var safeUrl = function (u) { return /^(https?:)?\/\//i.test(u || '') || /^[\w.\/-]+$/.test(u || '') ? u : ''; };
    function parts(d, tz) {
      var f = new Intl.DateTimeFormat('en-US', { timeZone: tz || TZ, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(d);
      var g = function (t) { return +f.filter(function (p) { return p.type === t; })[0].value; };
      return { y: g('year'), m: g('month') - 1, d: g('day') };
    }
    function key(p) { return p.y + '-' + p.m + '-' + p.d; }
    function fmt(d, tz, opts) { return new Intl.DateTimeFormat('en-US', Object.assign({ timeZone: tz || TZ }, opts)).format(d); }
    function when(ev) {
      var s = ev._start, e = ev._end, tz = ev.timezone || TZ;
      var day = fmt(s, tz, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      var t = fmt(s, tz, { hour: 'numeric', minute: '2-digit' }) + (e ? ' – ' + fmt(e, tz, { hour: 'numeric', minute: '2-digit' }) : '');
      return { day: day, time: t };
    }
    function prep(list) {
      var seen = {}, out = [];
      list.forEach(function (ev) {
        if (!ev || !ev.title || !ev.start_datetime) return;
        var s = new Date(ev.start_datetime); if (isNaN(s)) return;
        var k = ev.id ? 'id:' + ev.id : ('t:' + ev.title.toLowerCase() + '|' + key(parts(s, ev.timezone)));
        var k2 = 't:' + ev.title.toLowerCase() + '|' + key(parts(s, ev.timezone));
        if (seen[k] || seen[k2]) return;
        seen[k] = seen[k2] = true;
        ev._start = s; ev._end = ev.end_datetime ? new Date(ev.end_datetime) : null;
        ev._key = key(parts(s, ev.timezone));
        out.push(ev);
      });
      return out.sort(function (a, b) { return a._start - b._start; });
    }
    function imgBox(ev, cls) {
      var u = safeUrl(ev.hero_image_url);
      if (!u) return '<div class="ev-img ev-img--empty ' + (cls || '') + '" aria-hidden="true"><svg viewBox="0 0 120 120"><use href="#rosette"/></svg></div>';
      return '<div class="ev-img ' + (cls || '') + '"><img class="ev-img__blur" src="' + esc(u) + '" alt="" aria-hidden="true">' +
             '<img class="ev-img__main" src="' + esc(u) + '" alt="' + esc(ev.title) + '" loading="lazy"></div>';
    }
    function openEvent(ev) {
      if (!modal) return;
      var w = when(ev), u = safeUrl(ev.hero_image_url), t = safeUrl(ev.ticket_url);
      var full = ev.full_description && ev.full_description !== ev.short_description ? '<p class="ev-modal__desc">' + esc(ev.full_description) + '</p>' : '';
      modalBody.innerHTML = (u ? '<div class="ev-modal__media"><img class="ev-img__blur" src="' + esc(u) + '" alt="" aria-hidden="true"><img class="ev-modal__img" src="' + esc(u) + '" alt="' + esc(ev.title) + '"></div>' : '') +
        '<div class="ev-modal__body"><p class="ev-modal__date">' + esc(w.day) + '</p><h2 class="ev-modal__title" id="ev-modal-title">' + esc(ev.title) + '</h2>' +
        '<p class="ev-modal__meta"><span>' + esc(w.time) + '</span><span>' + esc(ev.location_text || 'Marigold, 434 White Plains Rd, Eastchester, NY') + '</span></p>' +
        (ev.short_description ? '<p class="ev-modal__desc">' + esc(ev.short_description) + '</p>' : '') + full +
        '<div class="ev-modal__actions">' + (t ? '<a class="btn btn--primary" href="' + esc(t) + '" target="_blank" rel="noopener">Register / Book</a>' : '') +
        '<a class="btn ' + (t ? 'btn--line' : 'btn--primary') + '" href="https://resy.com/cities/eastchester-ny-ny/venues/marigold" target="_blank" rel="noopener">Reserve a table</a></div></div>';
      modal.scrollTop = 0;
      modal.showModal();
      modal.scrollTop = 0;
    }
    function openDay(list) {
      if (list.length === 1) return openEvent(list[0]);
      var w = when(list[0]);
      modalBody.innerHTML = '<div class="ev-modal__body"><p class="ev-modal__date">' + esc(w.day) + '</p><h2 class="ev-modal__title" id="ev-modal-title">' + list.length + ' events</h2><ul class="ev-modal__day">' +
        list.map(function (ev, i) { return '<li><button class="ev-card__more" type="button" data-day-ev="' + i + '">' + esc(ev.title) + ' · ' + esc(when(ev).time) + ' →</button></li>'; }).join('') + '</ul></div>';
      $$('[data-day-ev]', modalBody).forEach(function (b) { b.addEventListener('click', function () { openEvent(list[+b.getAttribute('data-day-ev')]); }); });
      modal.scrollTop = 0;
      modal.showModal();
      modal.scrollTop = 0;
    }
    if (modal) {
      $('[data-ev-modal-close]', modal).addEventListener('click', function () { modal.close(); });
      modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });
    }
    var today = parts(new Date()), view = { y: today.y, m: today.m };
    function renderCal() {
      var byDay = {};
      events.forEach(function (ev) { (byDay[ev._key] = byDay[ev._key] || []).push(ev); });
      var first = new Date(Date.UTC(view.y, view.m, 1)), startDow = first.getUTCDay();
      var dim = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate(), prevDim = new Date(Date.UTC(view.y, view.m, 0)).getUTCDate();
      var label = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first);
      var dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      var cells = '';
      for (var i = 0; i < 42; i++) {
        var dnum = i - startDow + 1, y = view.y, m = view.m, out = false;
        if (dnum < 1) { m -= 1; dnum = prevDim + dnum; out = true; } else if (dnum > dim) { m += 1; dnum -= dim; out = true; }
        if (m < 0) { m = 11; y -= 1; } if (m > 11) { m = 0; y += 1; }
        var k = y + '-' + m + '-' + dnum, evs = byDay[k] || [], isToday = k === key(today);
        var chips = evs.map(function (ev) { return '<span class="cal__chip" data-ev-id="' + esc(ev._uid) + '">' + esc(ev.title) + '<small>' + esc(fmt(ev._start, ev.timezone, { hour: 'numeric', minute: '2-digit' })) + '</small></span>'; }).join('');
        var lbl = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m, dnum)));
        cells += '<div class="cal__cell' + (out ? ' cal__cell--out' : '') + (evs.length ? ' has-events' : '') + (isToday ? ' is-today' : '') + '"' +
          (evs.length ? ' role="button" tabindex="0" data-day="' + k + '" aria-label="' + esc(lbl + ': ' + evs.map(function (e) { return e.title; }).join(', ')) + '"' : '') +
          '><span class="cal__num">' + dnum + '</span>' + chips + (evs.length ? '<span class="cal__dot" aria-hidden="true"></span>' : '') + '</div>';
      }
      calEl.innerHTML = '<div class="cal__head"><h3 class="cal__month" aria-live="polite">' + label + '</h3><div class="cal__nav">' +
        '<button class="cal__btn" type="button" data-cal-prev aria-label="Previous month"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button>' +
        '<button class="cal__btn" type="button" data-cal-today>Today</button>' +
        '<button class="cal__btn" type="button" data-cal-next aria-label="Next month"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button></div></div>' +
        '<div class="cal__grid" role="grid">' + dows.map(function (d) { return '<div class="cal__dow" role="columnheader">' + d + '</div>'; }).join('') + cells + '</div>';
      $('[data-cal-prev]', calEl).addEventListener('click', function () { view.m -= 1; if (view.m < 0) { view.m = 11; view.y -= 1; } renderCal(); });
      $('[data-cal-next]', calEl).addEventListener('click', function () { view.m += 1; if (view.m > 11) { view.m = 0; view.y += 1; } renderCal(); });
      $('[data-cal-today]', calEl).addEventListener('click', function () { view = { y: today.y, m: today.m }; renderCal(); });
      $$('[data-day]', calEl).forEach(function (cell) {
        var go = function (e) {
          var chip = e.target.closest && e.target.closest('[data-ev-id]');
          var list = byDay[cell.getAttribute('data-day')];
          if (chip) { var one = list.filter(function (x) { return x._uid === chip.getAttribute('data-ev-id'); })[0]; if (one) return openEvent(one); }
          openDay(list);
        };
        cell.addEventListener('click', go);
        cell.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(e); } });
      });
    }
    function renderList() {
      var now = new Date(), up = [], past = [];
      events.forEach(function (ev) { ((ev._end || ev._start) >= now ? up : past).push(ev); });
      var card = function (ev) {
        var w = when(ev);
        return '<li class="ev-card">' + imgBox(ev) + '<div class="ev-card__body"><p class="ev-card__date">' + esc(w.day) + '</p><h3 class="ev-card__title">' + esc(ev.title) + '</h3>' +
          '<p class="ev-card__time">' + esc(w.time) + '</p>' + (ev.short_description ? '<p class="ev-card__desc">' + esc(ev.short_description) + '</p>' : '') +
          '<button class="ev-card__more" type="button" data-open-ev="' + esc(ev._uid) + '">Event details →</button></div></li>';
      };
      var html = '';
      if (up.length) html += '<h3 class="ev-list__group">Upcoming</h3><ul class="ev-list">' + up.map(card).join('') + '</ul>';
      if (past.length) html += '<h3 class="ev-list__group">Past events</h3><ul class="ev-list">' + past.slice().reverse().map(card).join('') + '</ul>';
      listEl.innerHTML = html || '<p class="ev-empty">No events are scheduled right now. Check back soon, or follow us on Instagram for news.</p>';
      $$('[data-open-ev]', listEl).forEach(function (b) {
        b.addEventListener('click', function () { var ev = events.filter(function (x) { return x._uid === b.getAttribute('data-open-ev'); })[0]; if (ev) openEvent(ev); });
      });
    }
    function renderNext() {
      var now = new Date(), nx = events.filter(function (ev) { return (ev._end || ev._start) >= now; })[0];
      if (!nextBtn) return;
      if (!nx) { nextBtn.hidden = true; return; }
      nextBtn.hidden = false;
      nextBtn.textContent = 'Next: ' + nx.title + ', ' + fmt(nx._start, nx.timezone, { month: 'short', day: 'numeric' }) + ' →';
      nextBtn.onclick = function () { var p = parts(nx._start, nx.timezone); view = { y: p.y, m: p.m }; selectView('calendar'); renderCal(); };
    }
    function renderAll() { events.forEach(function (ev, i) { ev._uid = ev._uid || ('e' + i); }); renderCal(); renderList(); renderNext(); }
    var tabs = $$('[data-ev-view]', evRoot);
    function selectView(v) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-ev-view') === v;
        t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { selectView(t.getAttribute('data-ev-view')); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; selectView(n.getAttribute('data-ev-view')); n.focus(); }
      });
    });
    events = prep(events);
    selectView('calendar');
    renderAll();
    var cfg = window.KORA_SITE_CONFIG || {};
    if (cfg.apiBaseUrl && cfg.businessId && window.fetch) {
      fetch(cfg.apiBaseUrl + '/api/v1/public/events?business_id=' + encodeURIComponent(cfg.businessId))
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (!data || !data.events || !data.events.length) return;
          events = prep(events.map(function (e) { return e; }).concat(data.events));
          events.forEach(function (ev, i) { ev._uid = 'e' + i; });
          renderAll();
        })
        .catch(function () {});
    }
  })();

  /* Footer year. */
  var yr = $('[data-year]');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
