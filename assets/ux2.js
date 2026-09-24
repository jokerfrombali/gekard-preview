/* GEKARD v2: лайтбокс фото, кнопка «наверх» с прогрессом */
(function () {
  // --- лайтбокс
  var imgs = [].slice.call(document.querySelectorAll('.card img.ph, .showc-card img, .certs img, .hscroll img, .zoomable, .pstrip img, .step img'));
  if (imgs.length) {
    var lb = document.createElement('div'); lb.className = 'lb';
    lb.innerHTML = '<button class="lbx" aria-label="Закрыть">✕</button><button class="lbp" aria-label="Назад">‹</button><figure><img alt=""><figcaption></figcaption><a class="btn lbgo" href="#">Подробнее о модели</a></figure><button class="lbn" aria-label="Вперёд">›</button>';
    document.body.appendChild(lb);
    var cur = 0, im = lb.querySelector('img'), cap = lb.querySelector('figcaption'), go = lb.querySelector('.lbgo');
    function show(i) {
      cur = (i + imgs.length) % imgs.length; var s = imgs[cur];
      im.src = s.currentSrc || s.src; im.alt = s.alt; cap.textContent = s.alt || '';
      var a = s.closest('a'); if (a && a.getAttribute('href') && a.getAttribute('href').charAt(0) !== '#') { go.href = a.href; go.style.display = ''; } else go.style.display = 'none';
      lb.classList.add('on'); document.documentElement.style.overflow = 'hidden';
    }
    function hide() { lb.classList.remove('on'); document.documentElement.style.overflow = ''; }
    imgs.forEach(function (el, i) {
      el.classList.add('zoomable');
      el.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); show(i); });
    });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lbx')) hide(); });
    lb.querySelector('.lbp').onclick = function () { show(cur - 1); };
    lb.querySelector('.lbn').onclick = function () { show(cur + 1); };
    document.addEventListener('keydown', function (e) { if (!lb.classList.contains('on')) return; if (e.key === 'Escape') hide(); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
  }
  // --- кнопка «наверх»
  var b = document.createElement('button'); b.className = 'totop'; b.setAttribute('aria-label', 'Наверх');
  b.innerHTML = '<svg class="ring" viewBox="0 0 58 58"><circle class="bg" cx="29" cy="29" r="26"/><circle class="fg" cx="29" cy="29" r="26" stroke-dasharray="163.4" stroke-dashoffset="163.4"/></svg><svg class="ar" viewBox="0 0 24 24"><path fill="currentColor" d="M12 5l7 7-1.4 1.4L13 8.8V20h-2V8.8l-4.6 4.6L5 12z"/></svg>';
  document.body.appendChild(b);
  var fg = b.querySelector('.fg');
  b.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  function upd() {
    var h = document.documentElement.scrollHeight - innerHeight, k = h > 0 ? scrollY / h : 0;
    b.classList.toggle('on', scrollY > Math.min(h * 0.35, innerHeight * 1.5));
    fg.style.strokeDashoffset = 163.4 * (1 - k);
  }
  addEventListener('scroll', upd, { passive: true }); upd();
})();
