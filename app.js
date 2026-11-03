(() => {
  'use strict';

  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const themeColor = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const dark = theme === 'dark';
    const label = dark ? '切换浅色模式' : '切换深色模式';
    themeToggle.setAttribute('aria-label', label);
    themeToggle.setAttribute('title', label);
    themeToggle.setAttribute('aria-pressed', String(dark));
    themeColor.setAttribute('content', dark ? '#121413' : '#f7f8f4');
  }

  applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark');
  themeToggle.hidden = false;
  themeToggle.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    try { localStorage.setItem('stochidem-theme', theme); } catch { /* 无存储权限时，本次切换仍有效。 */ }
  });

  const weekdayLabel = new Intl.DateTimeFormat('zh-CN', { weekday: 'long' });
  const dateParts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });

  function updateDate() {
    const now = new Date();
    const parts = Object.fromEntries(dateParts.formatToParts(now).map(part => [part.type, part.value]));
    const isoDate = `${parts.year}-${parts.month}-${parts.day}`;
    const time = document.getElementById('current-date');
    time.textContent = `${parts.year}年${Number(parts.month)}月${Number(parts.day)}日`;
    time.dateTime = isoDate;

    document.getElementById('current-weekday').textContent = weekdayLabel.format(now);
  }

  updateDate();
  setInterval(updateDate, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateDate(); });

  const wechatOpen = document.getElementById('wechat-open');
  const wechatDialog = document.getElementById('wechat-dialog');
  const wechatClose = document.getElementById('wechat-close');
  if (wechatOpen && wechatDialog && wechatClose) {
    wechatOpen.addEventListener('click', () => {
      if (wechatDialog.open) return;
      wechatDialog.showModal();
      wechatOpen.setAttribute('aria-expanded', 'true');
      root.classList.add('qr-modal-open');
    });
    wechatClose.addEventListener('click', () => wechatDialog.close());
    wechatDialog.addEventListener('close', () => {
      wechatOpen.setAttribute('aria-expanded', 'false');
      root.classList.remove('qr-modal-open');
    });
    wechatDialog.addEventListener('click', event => {
      if (event.target !== wechatDialog) return;
      const box = wechatDialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) wechatDialog.close();
    });
  }

  const title = document.getElementById('hero-title');
  const output = document.getElementById('typewriter');
  if (!title || !output) return;
  const sentence = title.getAttribute('aria-label').replace('，', '，\n').replace('一种', '一种\u200b');
  const characters = Array.from(sentence);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let timer;
  let index = 0;
  let tiles = [];

  function pixelGlyph(character) {
    const coarse = document.createElement('canvas');
    coarse.width = 14;
    coarse.height = 18;
    const context = coarse.getContext?.('2d');
    if (!context) return null;
    context.font = '14px sans-serif';
    context.textBaseline = 'top';
    context.fillText(character, 0, 1, 14);
    const bitmap = context.getImageData(0, 0, 14, 18);
    for (let i = 3; i < bitmap.data.length; i += 4) bitmap.data[i] = bitmap.data[i] > 80 ? 255 : 0;
    context.putImageData(bitmap, 0, 0);
    const enlarged = document.createElement('canvas');
    enlarged.width = 224;
    enlarged.height = 288;
    const enlargedContext = enlarged.getContext('2d');
    enlargedContext.imageSmoothingEnabled = false;
    enlargedContext.drawImage(coarse, 0, 0, 224, 288);
    return enlarged.toDataURL('image/png');
  }

  function finishTyping() {
    clearTimeout(timer);
    tiles.forEach(tile => tile.classList.remove('is-revealing', 'is-pending'));
    output.dataset.typing = 'false';
  }

  function typeNext() {
    if (index > 0) tiles[index - 1].classList.remove('is-revealing');
    if (index < tiles.length) {
      tiles[index].classList.remove('is-pending');
      tiles[index].classList.add('is-revealing');
      index += 1;
      timer = setTimeout(typeNext, 160);
    } else {
      output.dataset.typing = 'false';
    }
  }

  const fragment = document.createDocumentFragment();
    characters.forEach((character, position) => {
      if (character === '\n' || character === '\u200b') {
        fragment.append(document.createTextNode(character));
        return;
      }
      const tile = document.createElement('span');
      tile.className = 'pixel-char is-pending';
      tile.textContent = character;
      const glyph = pixelGlyph(character);
      if (glyph) {
        tile.dataset.pixel = 'true';
        tile.style.setProperty('--pixel-glyph', `url("${glyph}")`);
      }
      fragment.append(tile);
      tiles.push(tile);
    });
  output.replaceChildren(fragment);
  if (reducedMotion.matches) {
    finishTyping();
  } else {
    output.dataset.typing = 'true';
    timer = setTimeout(typeNext, 200);
  }
  reducedMotion.addEventListener('change', event => { if (event.matches) finishTyping(); });
})();
