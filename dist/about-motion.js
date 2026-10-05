(() => {
  const cards = [...document.querySelectorAll('.about-brand, .studio-mark, .home-product-card, .catalogue-art')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reset = card => {
    card.style.removeProperty('--tilt-angle');
    card.style.removeProperty('--glare-x');
    card.style.removeProperty('--glare-y');
    card.classList.remove('is-tilting');
  };
  cards.forEach(card => {
    card.addEventListener('pointermove', event => {
      if (!fine.matches || reduced.matches || document.body.classList.contains('motion-paused')) return;
      const box = card.getBoundingClientRect();
      const x = Math.max(-.5, Math.min(.5, (event.clientX - box.left) / box.width - .5));
      const y = Math.max(-.5, Math.min(.5, (event.clientY - box.top) / box.height - .5));
      card.style.setProperty('--tilt-x', String(-y || .0001));
      card.style.setProperty('--tilt-y', String(x || .0001));
      card.style.setProperty('--tilt-angle', `${Math.hypot(x, y) * 8}deg`);
      card.style.setProperty('--glare-x', `${(x + .5) * 100}%`);
      card.style.setProperty('--glare-y', `${(y + .5) * 100}%`);
      card.classList.add('is-tilting');
    });
    card.addEventListener('pointerleave', () => reset(card));
    card.addEventListener('pointercancel', () => reset(card));
  });
  const resetAll = () => cards.forEach(reset);
  reduced.addEventListener('change', resetAll);
  fine.addEventListener('change', resetAll);
  window.addEventListener('qixarc-motion', resetAll);
})();
