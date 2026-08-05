/* AI Lab / інтерактив лендінгу */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- FAQ --- */
  document.querySelectorAll('.faq__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item');
      const open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('.faq__sign').textContent = open ? '×' : '+';
    });
  });

  /* --- таймер до дедлайну бонусів ---
     Дата береться з data-deadline на #timer. Коли час вийшов, показуємо нулі. */
  const timer = document.getElementById('timer');
  if (timer) {
    const deadline = new Date(timer.dataset.deadline).getTime();
    const cells = {};
    timer.querySelectorAll('[data-unit]').forEach((el) => {
      cells[el.dataset.unit] = el;
    });

    const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

    const tick = () => {
      const left = deadline - Date.now();
      if (Number.isNaN(deadline)) return;
      const s = Math.max(0, Math.floor(left / 1000));
      cells.days.textContent = pad(Math.floor(s / 86400));
      cells.hours.textContent = pad(Math.floor((s % 86400) / 3600));
      cells.minutes.textContent = pad(Math.floor((s % 3600) / 60));
      cells.seconds.textContent = pad(s % 60);
    };

    tick();
    setInterval(tick, 1000);
  }

  /* --- поява секцій при скролі --- */
  const revealables = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    revealables.forEach((el) => io.observe(el));
  }
})();
