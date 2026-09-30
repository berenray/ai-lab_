/* AI LAB / Воркшоп 06.10 — посилання в бот, аналітика, таймер, липка кнопка */
(() => {
  const cfg = window.WORKSHOP_CONFIG || {};
  const ctas = [...document.querySelectorAll('[data-cta]')];

  /* --- поява блоків при скролі, як на claude/ --- */
  const revealables = [...document.querySelectorAll('.reveal')];
  revealables
    .filter((el) => el.hasAttribute('data-stagger'))
    .forEach((el) => [...el.children].forEach((child, i) => child.style.setProperty('--i', String(i))));

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    revealables.forEach((el) => io.observe(el));
  }

  /* --- джерело і посилання в бот ---
     utm_source -> start=ws0610_<source>. Без UTM — web.
     Telegram пропускає лише [A-Za-z0-9_-] і до 64 символів. */
  const params = new URLSearchParams(location.search);
  const prefix = `${cfg.campaign || 'ws0610'}_`;
  const source =
    (params.get('utm_source') || '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 64 - prefix.length) || 'web';
  const botUrl = `https://t.me/${cfg.botUsername}?start=${prefix}${source}`;

  ctas.forEach((a) => { a.href = botUrl; });

  /* --- аналітика ---
     Meta Pixel і Clarity, як на інших лендингах. Кожен клік по кнопці
     реєстрації йде подією з назвою кнопки: hero, bonus, audience,
     program, speaker, final, sticky. */
  if (cfg.fbPixelId) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    fbq('init', cfg.fbPixelId);
    fbq('track', 'PageView');
  }

  if (cfg.clarityId) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', cfg.clarityId);
    clarity('set', 'utm_source', source);
    clarity('set', 'campaign', cfg.campaign);
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'workshop_view', utm_source: source, campaign: cfg.campaign });

  ctas.forEach((a) => {
    a.addEventListener('click', () => {
      const button = a.dataset.cta;
      const data = { button, utm_source: source, campaign: cfg.campaign };
      if (window.fbq) fbq('trackCustom', 'WorkshopRegisterClick', data);
      if (window.clarity) {
        clarity('set', 'register_button', button);
        clarity('event', 'register_click');
      }
      if (window.gtag) gtag('event', 'register_click', data);
      window.dataLayer.push({ event: 'register_click', ...data });
    });
  });

  /* --- кодове слово ---
     Якщо подарунок не затвердили, ховаємо плашку в програмі
     і другу фразу у фіналі. */
  if (cfg.codewordGift === false) {
    document.querySelectorAll('[data-codeword]').forEach((el) => { el.hidden = true; });
  }

  /* --- таймер ---
     До старту — Д:Г:Х:С, під час ефіру — «Ефір уже йде»,
     після — «Воркшоп завершився». Нулі не показуємо ніколи:
     у нуль таймер не доходить, бо в момент старту змінюється стан. */
  const countdown = document.getElementById('countdown');
  if (countdown) {
    const start = new Date(cfg.startsAt).getTime();
    const end = start + (cfg.durationMinutes || 90) * 60000;
    const states = {};
    countdown.querySelectorAll('[data-state]').forEach((el) => { states[el.dataset.state] = el; });
    const cells = {};
    countdown.querySelectorAll('[data-unit]').forEach((el) => {
      cells[el.dataset.unit] = { box: el, num: el.querySelector('b') };
    });
    const daysColon = countdown.querySelector('[data-colon="d"]');
    const pad = (n) => String(n).padStart(2, '0');
    let current = null;
    let interval;

    const show = (state) => {
      if (state === current) return;
      current = state;
      Object.entries(states).forEach(([name, el]) => { el.hidden = name !== state; });
    };

    const tick = () => {
      if (Number.isNaN(start)) return;
      const now = Date.now();
      if (now >= end) { show('after'); clearInterval(interval); return; }
      if (now >= start) { show('live'); return; }

      show('before');
      const s = Math.ceil((start - now) / 1000);
      const d = Math.floor(s / 86400);
      cells.d.box.hidden = d === 0;
      if (daysColon) daysColon.hidden = d === 0;
      cells.d.num.textContent = pad(d);
      cells.h.num.textContent = pad(Math.floor((s % 86400) / 3600));
      cells.m.num.textContent = pad(Math.floor((s % 3600) / 60));
      cells.s.num.textContent = pad(s % 60);
    };

    tick();
    interval = setInterval(tick, 1000);
  }

  /* --- відео Івана ---
     Спершу постер і кнопка, iframe вантажимо тільки після кліку. */
  const video = document.getElementById('ivan-video');
  if (video && cfg.ivanVideoUrl) {
    video.hidden = false;
    if (cfg.ivanVideoPoster) video.style.backgroundImage = `url("${cfg.ivanVideoPoster}")`;
    video.querySelector('.video__play').addEventListener('click', () => {
      const src = new URL(cfg.ivanVideoUrl);
      src.searchParams.set('autoplay', '1');
      video.innerHTML = `<iframe src="${src}" title="Історія Івана" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    }, { once: true });
  }

  /* --- липка кнопка ---
     Зʼявляється, коли кнопка першого екрана пішла за верхній край,
     і ховається, щойно на екрані будь-яка інша кнопка реєстрації
     (зокрема фінальна) — у кожен момент видно лише одну. */
  const sticky = document.getElementById('sticky');
  const heroBtn = document.querySelector('[data-cta="hero"]');
  const finalBtn = document.querySelector('[data-cta="final"]');
  const inline = ctas.filter((a) => a.dataset.cta !== 'sticky' && a.dataset.cta !== 'hero');

  if (sticky && heroBtn && finalBtn) {
    const stickyBtn = sticky.querySelector('a');
    let visible = false;

    const onScreen = (el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };

    /* scroll і так приходить не частіше за кадр, тому рахуємо одразу:
       лише читання розмірів, запис — тільки коли стан змінився */
    const update = () => {
      const pastHero = heroBtn.getBoundingClientRect().bottom < 0;
      const beforeFinal = finalBtn.getBoundingClientRect().top > window.innerHeight;
      const next = pastHero && beforeFinal && !inline.some(onScreen);
      if (next === visible) return;
      visible = next;
      sticky.classList.toggle('is-visible', visible);
      sticky.setAttribute('aria-hidden', String(!visible));
      stickyBtn.tabIndex = visible ? 0 : -1;
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();
