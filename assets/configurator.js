/* Конфигуратор двери GEKARD.
   Цены опций — с gekard.ru (раздел «Дополнительные опции», сентябрь 2026). Базовая цена — «от» по модели.
   Итог — ориентир; точная стоимость — по расчёту инженера (размер, класс, RAL, опции). */
(function () {
  const root = document.getElementById('cfg');
  if (!root) return;
  const M = JSON.parse(root.dataset.model); // {name, base, kind, leaves, cls, glass, grille, sizes}
  const RAL = [
    ['7035', '#cbd0cc', 'Светло-серый'], ['9016', '#f1f0ea', 'Белый'], ['7024', '#474a50', 'Графит'],
    ['8017', '#45322e', 'Шоколад'], ['9005', '#0e0e10', 'Чёрный'], ['3000', '#a72920', 'Огненно-красный'],
    ['5005', '#1e4f8a', 'Сигнальный синий'], ['6005', '#114232', 'Зелёный мох'], ['1015', '#e6d2b5', 'Слоновая кость'], ['7016', '#383e42', 'Антрацит']
  ];
  const FINISH = {
    powder: { t: 'Порошковая эмаль (гладкая)', p: 0, tex: null },
    shagreen: { t: 'Порошковая эмаль «шагрень»', p: 0, tex: 'shagreen', note: 'цена по запросу' },
    hammer: { t: 'Молотковая эмаль', p: 0, tex: 'hammer', note: 'цена по запросу' },
    mdf: { t: 'Накладная панель МДФ (декор)', p: 0, tex: 'mdf', note: 'по запросу; влияет на сертификацию — согласовать с инженером' },
    hpl: { t: 'Облицовка HPL / антивандальная', p: 0, tex: 'hpl', note: 'по запросу; влияет на сертификацию' }
  };
  const HANDLE = {
    lever: { t: 'Нажимная ручка FUARO (база)', p: 0 },
    pull: { t: 'Ручка-скоба', p: 0, note: 'по запросу' },
    panic: { t: 'Антипаника Push-bar', p: 10000 }
  };
  const LOCK = {
    fuaro: { t: 'Замок FUARO + цилиндр Apecs (база)', p: 0 },
    em: { t: 'Электромеханический замок (СКУД)', p: 0, note: 'по запросу' },
    none: { t: 'Без замка (защёлка)', p: 0 }
  };
  const OPT = {
    closer: { t: 'Доводчик DOORLOCK', p: 3000 },
    threshold: { t: 'Выпадающий порог', p: 1700 },
    kick: { t: 'Отбойник нерж.', p: 5000 },
    glass: { t: 'Противопожарное остекление', p: 5100 },
    grille: { t: 'Вентиляционная решётка', p: 2500 },
    transom: { t: 'Фрамуга', p: 11000 },
    seal: { t: 'Дымогазонепроницаемое исполнение (S)', p: 0, note: 'по классу модели' }
  };
  if (M.glass) { OPT.glass.p = 0; OPT.glass.t += ' (в базе модели)'; }
  if (M.grille) { OPT.grille.p = 0; OPT.grille.t += ' (в базе модели)'; }
  // базовая цена по числу створок (прайс gekard.ru: однопольные от 15 600, двупольные от 23 100); полуторные — по расчёту
  const BASE = M.baseByLeaves || { 1: M.base, 2: M.base };
  const S = {
    leaves: M.leaves || 1, w: M.w || 900, h: M.h || 2100, cls: M.cls || 'EI60', ral: '7035', color: '#cbd0cc',
    finish: 'powder', handle: 'lever', lock: 'fuaro', hinge: 'right',
    opt: { closer: false, threshold: false, kick: false, glass: !!M.glass, grille: !!M.grille, transom: false, seal: M.cls && M.cls.startsWith('EIS') }
  };
  const $ = (s) => root.querySelector(s);
  const fmt = (n) => n.toLocaleString('ru-RU') + ' ₽';

  function chips(el, dict, key, cb) {
    el.innerHTML = '';
    Object.entries(dict).forEach(([k, v]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (S[key] === k ? ' on' : '');
      b.textContent = v.t + (v.p ? ` · +${v.p.toLocaleString('ru-RU')} ₽` : '');
      b.onclick = () => { S[key] = k; render(); cb && cb(); };
      el.appendChild(b);
    });
  }
  function build() {
    const sw = $('#sw'); sw.innerHTML = '';
    RAL.forEach(([code, hex, name]) => {
      const d = document.createElement('div'); d.className = 'sw' + (S.ral === code ? ' on' : ''); d.style.background = hex; d.title = `RAL ${code} — ${name}`;
      d.innerHTML = `<span>${code}</span>`; d.onclick = () => { S.ral = code; S.color = hex; render(); }; sw.appendChild(d);
    });
    $('#ralx').oninput = (e) => { const v = e.target.value.replace(/\D/g, ''); if (v.length === 4) { S.ral = v; S.color = '#9aa3ab'; render(); } };
    chips($('#finish'), FINISH, 'finish'); chips($('#handle'), HANDLE, 'handle'); chips($('#lock'), LOCK, 'lock');
    const le = $('#leaves'); le.innerHTML = '';
    [[1, 'Однопольная'], [1.5, 'Полуторная'], [2, 'Двупольная']].forEach(([v, t]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (S.leaves === v ? ' on' : ''); b.textContent = t;
      b.onclick = () => { S.leaves = v; if (v > 1 && S.w < 1200) S.w = v === 2 ? 1500 : 1300; if (v === 1 && S.w > 1100) S.w = 900; $('#w').value = S.w; render(); }; le.appendChild(b);
    });
    const ce = $('#cls'); ce.innerHTML = '';
    ['EI30', 'EI60', 'EIS60', 'EI90', 'EIS90'].forEach((c) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (S.cls === c ? ' on' : ''); b.textContent = c;
      b.onclick = () => { S.cls = c; S.opt.seal = c.startsWith('EIS'); render(); }; ce.appendChild(b);
    });
    const oe = $('#opts'); oe.innerHTML = '';
    Object.entries(OPT).forEach(([k, v]) => {
      const l = document.createElement('label'); l.className = 'chip' + (S.opt[k] ? ' on' : '');
      l.innerHTML = `<input type="checkbox" ${S.opt[k] ? 'checked' : ''} style="display:none">${v.t}${v.p ? ' · +' + v.p.toLocaleString('ru-RU') + ' ₽' : ''}`;
      l.onclick = (e) => { e.preventDefault(); if (k === 'seal') return; S.opt[k] = !S.opt[k]; render(); }; oe.appendChild(l);
    });
    $('#hinge').onchange = (e) => { S.hinge = e.target.value; render(); };
  }
  function tex(id, kind) {
    if (kind === 'hammer') return `<pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="3" fill="rgba(255,255,255,.10)"/><circle cx="11" cy="10" r="3.4" fill="rgba(0,0,0,.10)"/></pattern>`;
    if (kind === 'shagreen') return `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="rgba(0,0,0,.10)"/><circle cx="5" cy="4" r=".8" fill="rgba(255,255,255,.12)"/></pattern>`;
    if (kind === 'mdf') return `<pattern id="${id}" width="200" height="24" patternUnits="userSpaceOnUse"><path d="M0 6 C60 2 120 12 200 6 M0 16 C70 12 130 22 200 16" stroke="rgba(0,0,0,.12)" fill="none"/></pattern>`;
    if (kind === 'hpl') return `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="rgba(255,255,255,.04)"/></pattern>`;
    return '';
  }
  function leaf(x, y, w, h, active, hingeLeft) {
    const f = FINISH[S.finish]; let s = '';
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${S.color}" stroke="rgba(0,0,0,.35)"/>`;
    if (f.tex) s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="url(#tx)"/>`;
    if (S.finish === 'mdf') s += `<rect x="${x + 14}" y="${y + 18}" width="${w - 28}" height="${h - 36}" rx="2" fill="none" stroke="rgba(0,0,0,.25)"/><rect x="${x + 26}" y="${y + 30}" width="${w - 52}" height="${h * 0.38}" fill="none" stroke="rgba(0,0,0,.18)"/><rect x="${x + 26}" y="${y + h * 0.5}" width="${w - 52}" height="${h * 0.42 - 30}" fill="none" stroke="rgba(0,0,0,.18)"/>`;
    if (S.opt.glass) { const gw = Math.min(w * 0.42, 90), gh = h * 0.28; s += `<rect x="${x + (w - gw) / 2}" y="${y + h * 0.14}" width="${gw}" height="${gh}" rx="2" fill="#bcd3e2" stroke="#6b7c88" stroke-width="3"/><path d="M${x + (w - gw) / 2 + 8} ${y + h * 0.14 + gh - 10} l${gw * 0.5} ${-gh * 0.6}" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`; }
    if (S.opt.grille) { const gw = Math.min(w * 0.55, 120), gh = h * 0.12, gx = x + (w - gw) / 2, gy = y + h * 0.8; s += `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="#2b2e33" rx="2"/>`; for (let i = 1; i < 7; i++) s += `<line x1="${gx + 4}" x2="${gx + gw - 4}" y1="${gy + i * gh / 7}" y2="${gy + i * gh / 7}" stroke="#8a929c" stroke-width="2"/>`; }
    if (S.opt.kick) s += `<rect x="${x + 4}" y="${y + h - 34}" width="${w - 8}" height="28" fill="url(#steel)" stroke="#9aa3ab"/>`;
    const hx = hingeLeft ? x + 3 : x + w - 9;
    [0.1, 0.5, 0.88].forEach((k) => s += `<rect x="${hx}" y="${y + h * k}" width="6" height="26" rx="2" fill="#6b7078"/>`);
    if (active) {
      const hxh = hingeLeft ? x + w - 34 : x + 12, hy = y + h * 0.52;
      if (S.handle === 'panic') s += `<rect x="${x + 16}" y="${hy - 8}" width="${w - 32}" height="16" rx="8" fill="url(#steel)" stroke="#555"/><rect x="${x + 22}" y="${hy - 14}" width="16" height="28" rx="3" fill="#333"/><rect x="${x + w - 38}" y="${hy - 14}" width="16" height="28" rx="3" fill="#333"/>`;
      else if (S.handle === 'pull') s += `<rect x="${hxh + 8}" y="${hy - 60}" width="8" height="120" rx="4" fill="#1d1f23"/>`;
      else s += `<rect x="${hxh}" y="${hy - 30}" width="14" height="70" rx="3" fill="#1d1f23"/><rect x="${hingeLeft ? hxh - 26 : hxh}" y="${hy - 6}" width="40" height="10" rx="5" fill="#1d1f23"/>`;
      if (S.lock !== 'none') s += `<circle cx="${hxh + 7}" cy="${hy + 30}" r="5" fill="#b8a36a"/>`;
      if (S.lock === 'em') s += `<rect x="${hxh - 2}" y="${hy - 70}" width="18" height="26" rx="3" fill="#222"/><circle cx="${hxh + 7}" cy="${hy - 57}" r="3" fill="#2ecc71"/>`;
    }
    return s;
  }
  function svg() {
    const W = 520, H = 640, fr = 16;
    const doorW = S.leaves === 1 ? 260 : S.leaves === 1.5 ? 360 : 420;
    const tH = S.opt.transom ? 90 : 0;
    const doorH = 520 - tH, x0 = (W - doorW) / 2, y0 = 40 + tH;
    let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Визуализация двери"><defs>${tex('tx', FINISH[S.finish].tex)}<linearGradient id="steel" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e9ecef"/><stop offset="1" stop-color="#9aa3ab"/></linearGradient></defs>`;
    s += `<rect x="0" y="${H - 80}" width="${W}" height="80" fill="#c9ccd2"/>`;
    s += `<rect x="${x0 - fr}" y="${40 - fr}" width="${doorW + fr * 2}" height="${doorH + tH + fr}" fill="${S.color}" stroke="rgba(0,0,0,.4)"/>`;
    if (S.opt.transom) s += `<rect x="${x0}" y="40" width="${doorW}" height="${tH - 8}" fill="#bcd3e2" stroke="#6b7c88" stroke-width="4"/>`;
    const hl = S.hinge === 'left';
    if (S.leaves === 1) s += leaf(x0, y0, doorW, doorH, true, hl);
    else { const a = S.leaves === 1.5 ? doorW * 0.64 : doorW / 2, p = doorW - a; if (hl) { s += leaf(x0, y0, a, doorH, true, true) + leaf(x0 + a, y0, p, doorH, false, false); } else { s += leaf(x0, y0, p, doorH, false, true) + leaf(x0 + p, y0, a, doorH, true, false); } }
    if (S.opt.closer) { const cx = hl ? x0 + 14 : x0 + doorW - 104; s += `<rect x="${cx}" y="${y0 + 8}" width="90" height="20" rx="4" fill="#2b2e33"/><path d="M${cx + (hl ? 88 : 2)} ${y0 + 18} l${hl ? 50 : -50} -14" stroke="#2b2e33" stroke-width="6"/>`; }
    if (S.opt.threshold) s += `<rect x="${x0}" y="${y0 + doorH - 5}" width="${doorW}" height="5" fill="#888"/>`;
    s += `<text x="${W / 2}" y="${H - 38}" text-anchor="middle" font-family="Roboto Condensed,Arial" font-size="20" font-weight="700" fill="#15171c">${S.cls} · ${S.w}×${S.h} мм · RAL ${S.ral}</text>`;
    s += `<rect x="${x0 + 10}" y="${y0 + 10}" width="44" height="16" rx="2" fill="#fff" stroke="#e41014"/><text x="${x0 + 32}" y="${y0 + 22}" text-anchor="middle" font-size="10" font-family="Arial" fill="#e41014">${S.cls}</text>`;
    return s + '</svg>';
  }
  function total() {
    const b = BASE[S.leaves]; let p = b || 0, notes = [], lines = [];
    if (b == null) notes.push('Базовая цена для этого типа — по расчёту');
    const std = S.w <= (S.leaves === 1 ? 1000 : 1600) && S.h <= 2100;
    [['finish', FINISH], ['handle', HANDLE], ['lock', LOCK]].forEach(([k, d]) => { const v = d[S[k]]; p += v.p; lines.push(v.t); if (v.note) notes.push(v.t + ': ' + v.note); });
    Object.entries(S.opt).forEach(([k, on]) => { if (on) { p += OPT[k].p; lines.push(OPT[k].t); if (OPT[k].note) notes.push(OPT[k].t + ': ' + OPT[k].note); } });
    if (!std) notes.push('Нестандартный размер — цена и срок (от 15 дней) по расчёту; максимум 2400×1900 по полотну уточнить с КБ');
    if (M.cls && S.cls !== M.cls) notes.push(`Класс ${S.cls} отличается от базовой модели (${M.cls}) — цена по расчёту`);
    return { p, notes, lines, std };
  }
  function render() {
    build();
    $('#stage').innerHTML = svg();
    const t = total();
    $('#total').textContent = BASE[S.leaves] ? 'от ' + fmt(t.p) : 'Цена по расчёту';
    $('#lines').innerHTML = [`${S.leaves === 1 ? 'Однопольная' : S.leaves === 1.5 ? 'Полуторная' : 'Двупольная'}, ${S.cls}, ${S.w}×${S.h} мм, открывание ${S.hinge === 'left' ? 'левое' : 'правое'}`, `Цвет RAL ${S.ral}`].concat(t.lines).map((l) => `<li>${l}</li>`).join('');
    $('#notes').innerHTML = t.notes.map((n) => `<li>${n}</li>`).join('');
    const body = `Модель: ${M.name}\n` + Array.from($('#lines').querySelectorAll('li')).map((l) => '— ' + l.textContent).join('\n') + `\nОриентир: ${$('#total').textContent}\n`;
    $('#send').href = 'mailto:dveri@vt-metall.ru?subject=' + encodeURIComponent('Расчёт: ' + M.name) + '&body=' + encodeURIComponent(body + '\nКоличество: \nОбъект: \nТелефон: ');
    $('#copy').onclick = () => { navigator.clipboard && navigator.clipboard.writeText(body); $('#copy').textContent = 'Скопировано'; };
  }
  $('#w').value = S.w; $('#h').value = S.h;
  $('#w').oninput = (e) => { S.w = +e.target.value || S.w; render(); };
  $('#h').oninput = (e) => { S.h = +e.target.value || S.h; render(); };
  render();
})();
