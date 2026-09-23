/* Конструктор люков и ворот GEKARD. Прайса на сайте нет — итог «по расчёту», конфигурация уходит менеджеру. */
(function () {
  const root = document.getElementById('hgcfg');
  if (!root) return;
  const M = JSON.parse(root.dataset.model); // {name, kind:'hatch'|'gate', cls, w, h, leaves}
  const $ = (s) => root.querySelector(s);
  const RAL = [['7035','#cbd0cc'],['9016','#f1f0ea'],['7024','#474a50'],['8017','#45322e'],['9005','#0e0e10'],['3000','#a72920'],['5005','#1e4f8a'],['6005','#114232']];
  const HATCH = {
    place: { t: 'Установка', v: { wall: 'в стену', floor: 'в пол / перекрытие', ceil: 'в потолок', roof: 'выход на кровлю' } },
    lock: { t: 'Запирание', v: { key: 'замок под ключ', tri: 'под трёхгранник', push: 'нажимной (невидимка)', pad: 'под навесной замок' } },
    lift: { t: 'Открывание', v: { hinge: 'на петлях', gas: 'газлифты / амортизаторы', spring: 'пружины' } },
    face: { t: 'Лицевая поверхность', v: { paint: 'под покраску / RAL', tile: 'под плитку (поддон)', none: 'стальная' } }
  };
  const GATE = {
    type: { t: 'Тип', v: { swing: 'распашные', slide: 'откатные', lift: 'подъёмные' } },
    wicket: { t: 'Калитка', v: { no: 'без калитки', yes: 'встроенная калитка' } },
    auto: { t: 'Управление', v: { manual: 'ручное', drive: 'электропривод', aps: 'закрытие по сигналу АПС' } },
    ins: { t: 'Утепление', v: { no: 'нет', yes: 'утеплённые' } }
  };
  const G = M.kind === 'hatch' ? HATCH : GATE;
  const S = { w: M.w, h: M.h, cls: M.cls === '—' ? 'не нормируется' : M.cls, ral: '7035', color: '#cbd0cc', ins: false };
  Object.entries(G).forEach(([k, g]) => S[k] = Object.keys(g.v)[0]);
  if (M.kind === 'hatch' && /кровл/i.test(M.name)) S.place = 'roof';
  if (M.kind === 'hatch' && /наполь/i.test(M.name)) S.place = 'floor';
  if (M.kind === 'hatch' && /ревиз/i.test(M.name)) { S.face = 'tile'; S.lock = 'push'; }
  if (M.kind === 'gate' && /откат/i.test(M.name)) S.type = 'slide';

  function chipGroup(host, key, g) {
    const box = document.createElement('div'); box.className = 'opt';
    box.innerHTML = `<h4>${g.t}</h4><div class="chips"></div>`;
    Object.entries(g.v).forEach(([k, t]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (S[key] === k ? ' on' : ''); b.textContent = t;
      b.onclick = () => { S[key] = k; render(); }; box.querySelector('.chips').appendChild(b);
    });
    host.appendChild(box);
  }
  function svg() {
    const W = 520, H = 460;
    let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    if (M.kind === 'hatch') {
      const k = Math.min(300 / S.w, 300 / S.h), w = S.w * k, h = S.h * k, x = (W - w) / 2, y = (H - h) / 2 - 20;
      s += `<rect x="0" y="0" width="${W}" height="${H}" fill="${S.place === 'floor' ? '#d9d4cc' : '#e4e6ea'}"/>`;
      if (S.face === 'tile') for (let i = 0; i < 9; i++) for (let j = 0; j < 8; j++) s += `<rect x="${i * 60}" y="${j * 60}" width="58" height="58" fill="#eef0f2" stroke="#cfd3d8"/>`;
      s += `<rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 20}" fill="#9aa3ab"/>`;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${S.face === 'tile' ? '#eef0f2' : S.color}" stroke="#555"/>`;
      if (S.face === 'tile') for (let i = 0; i < 4; i++) s += `<line x1="${x + i * w / 4}" x2="${x + i * w / 4}" y1="${y}" y2="${y + h}" stroke="#cfd3d8"/>`;
      const cx = x + w - 30, cy = y + h / 2;
      if (S.lock === 'key') s += `<circle cx="${cx}" cy="${cy}" r="9" fill="#b8a36a"/><rect x="${cx - 2}" y="${cy - 5}" width="4" height="10" fill="#333"/>`;
      if (S.lock === 'tri') s += `<circle cx="${cx}" cy="${cy}" r="10" fill="#666"/><path d="M${cx} ${cy - 5} l5 8 h-10z" fill="#222"/>`;
      if (S.lock === 'pad') s += `<rect x="${cx - 12}" y="${cy - 6}" width="24" height="12" fill="#444"/><path d="M${cx - 6} ${cy - 6} v-8 a6 6 0 0 1 12 0 v8" stroke="#444" stroke-width="3" fill="none"/>`;
      if (S.lift !== 'hinge') s += `<line x1="${x + 20}" y1="${y + h - 20}" x2="${x + w / 3}" y2="${y + h / 3}" stroke="#333" stroke-width="5" stroke-dasharray="${S.lift === 'spring' ? '4 3' : '0'}"/>`;
      if (S.cls !== 'не нормируется') s += `<rect x="${x + 10}" y="${y + 10}" width="46" height="16" fill="#fff" stroke="#e41014"/><text x="${x + 33}" y="${y + 22}" font-size="10" text-anchor="middle" fill="#e41014">${S.cls}</text>`;
    } else {
      const k = Math.min(440 / S.w, 330 / S.h), w = S.w * k, h = S.h * k, x = (W - w) / 2, y = 40;
      s += `<rect width="${W}" height="${H}" fill="#e4e6ea"/><rect y="${y + h}" width="${W}" height="${H - y - h}" fill="#c9ccd2"/>`;
      s += `<rect x="${x - 12}" y="${y - 12}" width="${w + 24}" height="${h + 12}" fill="#8a929c"/>`;
      const panel = (px, pw) => { let r = `<rect x="${px}" y="${y}" width="${pw}" height="${h}" fill="${S.color}" stroke="#444"/>`; for (let i = 1; i < 6; i++) r += `<line x1="${px}" x2="${px + pw}" y1="${y + i * h / 6}" y2="${y + i * h / 6}" stroke="rgba(0,0,0,.15)"/>`; return r; };
      if (S.type === 'swing') s += panel(x, w / 2) + panel(x + w / 2, w / 2);
      else if (S.type === 'slide') { s += panel(x, w); s += `<rect x="${x - 12}" y="${y - 22}" width="${w * 1.6}" height="8" fill="#555"/>`; }
      else { s += panel(x, w); for (let i = 1; i < 6; i++) s += `<line x1="${x}" x2="${x + w}" y1="${y + i * h / 6}" y2="${y + i * h / 6}" stroke="#333" stroke-width="2"/>`; }
      if (S.wicket === 'yes') { const ww = 60 * k * 15, wx = x + w * 0.62, wh = Math.min(h * 0.62, 2000 * k); s += `<rect x="${wx}" y="${y + h - wh}" width="${Math.max(ww, 40)}" height="${wh}" fill="none" stroke="#111" stroke-width="3"/><rect x="${wx + Math.max(ww, 40) - 12}" y="${y + h - wh / 2}" width="6" height="18" fill="#111"/>`; }
      if (S.auto !== 'manual') s += `<rect x="${x + w - 50}" y="${y - 34}" width="40" height="22" rx="3" fill="#2b2e33"/><circle cx="${x + w - 16}" cy="${y - 23}" r="4" fill="${S.auto === 'aps' ? '#e41014' : '#2ecc71'}"/>`;
      if (S.cls !== 'не нормируется') s += `<rect x="${x + 10}" y="${y + 10}" width="46" height="16" fill="#fff" stroke="#e41014"/><text x="${x + 33}" y="${y + 22}" font-size="10" text-anchor="middle" fill="#e41014">${S.cls}</text>`;
    }
    s += `<text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-family="Roboto Condensed,Arial" font-weight="700" font-size="18" fill="#15171c">${S.cls} · ${S.w}×${S.h} мм · RAL ${S.ral}</text>`;
    return s + '</svg>';
  }
  function render() {
    const host = $('#hgopts'); host.innerHTML = '';
    const sz = document.createElement('div'); sz.className = 'opt';
    sz.innerHTML = `<h4>Размер ${M.kind === 'hatch' ? 'люка' : 'проёма'}, мм</h4><div class="row2"><label class="small">Ширина<input type="number" id="hw" value="${S.w}" step="10" style="width:100%;padding:10px;border:1px solid #cfd5da;border-radius:8px"></label><label class="small">Высота<input type="number" id="hh" value="${S.h}" step="10" style="width:100%;padding:10px;border:1px solid #cfd5da;border-radius:8px"></label></div>`;
    host.appendChild(sz);
    sz.querySelector('#hw').onchange = (e) => { S.w = +e.target.value || S.w; render(); };
    sz.querySelector('#hh').onchange = (e) => { S.h = +e.target.value || S.h; render(); };
    chipGroup(host, 'cls', { t: 'Огнестойкость', v: Object.fromEntries(['не нормируется', 'EI30', 'EI45', 'EI60', 'EIS60', 'EI90'].map((c) => [c, c])) });
    const c = document.createElement('div'); c.className = 'opt'; c.innerHTML = '<h4>Цвет RAL</h4><div class="swatches"></div>';
    RAL.forEach(([code, hex]) => { const d = document.createElement('div'); d.className = 'sw' + (S.ral === code ? ' on' : ''); d.style.background = hex; d.innerHTML = `<span>${code}</span>`; d.onclick = () => { S.ral = code; S.color = hex; render(); }; c.querySelector('.swatches').appendChild(d); });
    host.appendChild(c);
    Object.entries(G).forEach(([k, g]) => chipGroup(host, k, g));
    if (M.kind === 'hatch') chipGroup(host, 'insul', { t: 'Утепление', v: { no: 'нет', yes: 'утеплённый' } });
    $('#hgstage').innerHTML = svg();
    const lines = [`${M.name}`, `Размер ${S.w}×${S.h} мм`, `Огнестойкость: ${S.cls}`, `RAL ${S.ral}`].concat(Object.entries(G).map(([k, g]) => `${g.t}: ${g.v[S[k]]}`));
    if (S.insul === 'yes') lines.push('Утеплённый');
    $('#hglines').innerHTML = lines.map((l) => `<li>${l}</li>`).join('');
    $('#hgsend').href = 'mailto:dveri@vt-metall.ru?subject=' + encodeURIComponent('Расчёт: ' + M.name) + '&body=' + encodeURIComponent(lines.map((l) => '— ' + l).join('\n') + '\nКоличество: \nОбъект: \nТелефон: ');
  }
  render();
})();
