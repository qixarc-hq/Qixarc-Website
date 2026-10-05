(() => {
  const route = document.querySelector('.timeline-route');
  if (!route) return;
  const milestones = [...route.querySelectorAll('[data-milestone]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  function updateTimeline() {
    queued = false;
    const bounds = route.getBoundingClientRect();
    const first = milestones[0].getBoundingClientRect();
    const last = milestones[milestones.length - 1].getBoundingClientRect();
    const start = first.top + 10;
    const length = last.top - first.top;
    const progress = Math.max(0, Math.min(length, innerHeight * .52 - start));
    route.style.setProperty('--route-length', `${length}px`);
    route.style.setProperty('--route-progress', `${progress}px`);
    milestones.forEach(item => item.classList.toggle('is-reached', item.getBoundingClientRect().top + 10 <= start + progress + 1));
    route.classList.toggle('timeline-in-view', bounds.bottom > 0 && bounds.top < innerHeight);
  }
  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(updateTimeline); }
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  new ResizeObserver(schedule).observe(route);
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (!reduced.matches && !document.body.classList.contains('motion-paused')) {
        entry.target.animate([{ opacity: .2, transform: 'translateY(28px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 850, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
      reveal.unobserve(entry.target);
    });
  }, { threshold: .15 });
  milestones.forEach(item => reveal.observe(item));
  updateTimeline();
})();
