/* GEKARD v2.0 — анимации: появление при прокрутке, счётчики, линия процесса, шапка, табы */
(function () {
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); if (e.target.dataset.count) count(e.target); } });
  }, { threshold: .18 }) : null;
  document.querySelectorAll('.rv,[data-count]').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });
  function count(el) {
    var to = parseFloat(el.dataset.count), suf = el.dataset.suf || '', t0 = null, d = 1600;
    function f(t) { t0 = t0 || t; var k = Math.min(1, (t - t0) / d), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      el.innerHTML = (el.dataset.plain ? String(v) : v.toLocaleString('ru-RU')) + '<span>' + suf + '</span>'; if (k < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }
  var hdr = document.querySelector('.hdr'), line = document.querySelector('.process .line i'), proc = document.querySelector('.process');
  function onScroll() {
    if (hdr) hdr.classList.toggle('solid', scrollY > 60);
    if (line && proc) { var r = proc.getBoundingClientRect(), vh = innerHeight, k = Math.max(0, Math.min(1, (vh * .6 - r.top) / r.height)); line.style.height = (k * 100) + '%'; }
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  document.querySelectorAll('.tabs').forEach(function (tb) {
    tb.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      tb.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
      document.querySelectorAll('.tabpane[data-g="' + tb.dataset.g + '"]').forEach(function (p) { p.classList.toggle('on', p.dataset.t === b.dataset.t); });
    });
  });
})();
