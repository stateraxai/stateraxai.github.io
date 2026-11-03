import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const source = readFileSync(new URL('../src/scripts/site.js', import.meta.url), 'utf8');
const quote = '面对不可预测的世界，构建一种自我稳定的能力。';

function boot({ instant = '2026-11-03T12:00:00Z', reduced = false, blockStorage = false, aboutPage = false, visitorZone = 'Asia/Shanghai' } = {}) {
  let now = new Date(instant).getTime();
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  function element(attrs = {}) {
    let text = '';
    const node = { attrs, dataset: {}, children: [], className: '', hidden: false, listeners: {}, style: { setProperty() {} },
      get textContent() { return this.children.length ? this.children.map(child => child.textContent).join('') : text; },
      set textContent(value) { this.children = []; text = value; },
      append(child) { this.children.push(child); },
      replaceChildren(fragment) { this.children = fragment.children; text = ''; },
      setAttribute(key, value) { this.attrs[key] = value; },
      getAttribute(key) { return this.attrs[key]; },
      addEventListener(event, callback) { this.listeners[event] = callback; },
    };
    node.classList = {
      add(...names) { node.className = [...new Set([...node.className.split(' ').filter(Boolean), ...names])].join(' '); },
      remove(...names) { node.className = node.className.split(' ').filter(name => !names.includes(name)).join(' '); },
    };
    return node;
  }
  const root = { dataset: { theme: 'dark' } };
  const elements = Object.fromEntries(['theme-toggle', 'current-date', 'current-weekday', 'hero-title', 'typewriter'].map(id => [id, element()]));
  elements['hero-title'].attrs['aria-label'] = quote;
  if (aboutPage) { delete elements['hero-title']; delete elements.typewriter; }
  const meta = element();
  const timers = new Map();
  const intervals = [];
  const saved = new Map();
  let nextId = 0;
  const motion = { matches: reduced, addEventListener(_, callback) { this.listener = callback; } };
  runInNewContext(source, {
    document: { documentElement: root, hidden: false, getElementById: id => elements[id], querySelector: () => meta, querySelectorAll: () => [], addEventListener() {}, createElement: () => element(), createDocumentFragment: () => element(), createTextNode(text) { const node = element(); node.textContent = text; return node; } },
    localStorage: { setItem(key, value) { if (blockStorage) throw Error('blocked'); saved.set(key, value); } },
    Date: Clock, Intl: { DateTimeFormat: function(locale, options) { return new Intl.DateTimeFormat(locale, { timeZone: visitorZone, ...options }); } }, matchMedia: () => motion,
    setTimeout(callback) { timers.set(++nextId, callback); return nextId; },
    clearTimeout(id) { timers.delete(id); },
    setInterval(callback) { intervals.push(callback); },
  });
  function step() { const [id, callback] = timers.entries().next().value; timers.delete(id); callback(); }
  return { root, elements, meta, timers, intervals, motion, saved, step,
    setTime(value) { now = new Date(value).getTime(); },
    finish() { let limit = 100; while (timers.size && limit-- > 0) step(); assert.ok(limit > 0, 'typing must finish'); },
  };
}

test('date and weekday are separate and both advance after local midnight', () => {
  const page = boot({ instant: '2026-11-03T15:59:00Z' });
  assert.equal(page.elements['current-date'].dateTime, '2026-11-03');
  assert.equal(page.elements['current-date'].textContent, '2026年11月3日');
  assert.equal(page.elements['current-weekday'].textContent, '星期二');
  page.setTime('2026-11-03T16:01:00Z');
  page.intervals[0]();
  assert.equal(page.elements['current-date'].dateTime, '2026-11-04');
  assert.equal(page.elements['current-weekday'].textContent, '星期三');
});

test('weekday stays correct across a year boundary', () => {
  const page = boot({ instant: '2027-01-01T04:00:00Z' });
  assert.equal(page.elements['current-date'].textContent, '2027年1月1日');
  assert.equal(page.elements['current-weekday'].textContent, '星期五');
  page.setTime('2027-01-04T04:00:00Z');
  page.intervals[0]();
  assert.equal(page.elements['current-weekday'].textContent, '星期一');
});

test('visitors see their own local date rather than a fixed Shanghai date', () => {
  const instant = '2026-11-03T00:30:00Z';
  const westCoast = boot({ instant, visitorZone: 'America/Los_Angeles' });
  const shanghai = boot({ instant, visitorZone: 'Asia/Shanghai' });
  assert.equal(westCoast.elements['current-date'].dateTime, '2026-11-02');
  assert.equal(westCoast.elements['current-weekday'].textContent, '星期一');
  assert.equal(shanghai.elements['current-date'].dateTime, '2026-11-03');
  assert.equal(shanghai.elements['current-weekday'].textContent, '星期二');
});

test('pixel characters appear in order and finish on the exact requested sentence', () => {
  const page = boot();
  const output = page.elements.typewriter;
  assert.equal(output.textContent.replace(/[\n\u200b]/g, ''), quote);
  assert.equal(output.dataset.typing, 'true');
  const tiles = output.children.filter(child => child.className.includes('pixel-char'));
  assert.equal(tiles.length, Array.from(quote).length);
  assert.ok(tiles.every(tile => tile.className.includes('is-pending')));
  page.step();
  assert.ok(tiles[0].className.includes('is-revealing'));
  page.step();
  assert.ok(!tiles[0].className.includes('is-pending'));
  assert.ok(tiles[1].className.includes('is-revealing'));
  page.finish();
  assert.equal(output.textContent.replace(/[\n\u200b]/g, ''), quote);
  assert.equal(output.dataset.typing, 'false');
  assert.equal(page.timers.size, 0);
  assert.ok(tiles.every(tile => !tile.className.includes('is-pending')));
});

test('reduced motion displays the complete sentence without animation', () => {
  const page = boot({ reduced: true });
  assert.equal(page.elements.typewriter.textContent.replace(/[\n\u200b]/g, ''), quote);
  assert.equal(page.timers.size, 0);
});

test('enabling reduced motion during typing cancels the remaining animation', () => {
  const page = boot();
  page.step();
  page.motion.listener({ matches: true });
  assert.equal(page.elements.typewriter.textContent.replace(/[\n\u200b]/g, ''), quote);
  assert.equal(page.timers.size, 0);
});

test('theme switches both ways with matching button state and browser color', () => {
  const page = boot();
  const button = page.elements['theme-toggle'];
  button.listeners.click();
  assert.equal(page.root.dataset.theme, 'light');
  assert.equal(button.attrs['aria-label'], '切换深色模式');
  assert.equal(button.attrs['aria-pressed'], 'false');
  assert.equal(page.meta.attrs.content, '#f7f8f4');
  assert.equal(page.saved.get('stochidem-theme'), 'light');
  button.listeners.click();
  assert.equal(page.root.dataset.theme, 'dark');
  assert.equal(button.attrs['aria-label'], '切换浅色模式');
  assert.equal(page.meta.attrs.content, '#121413');
});

test('theme switching still works when persistent storage is blocked', () => {
  const page = boot({ blockStorage: true });
  assert.doesNotThrow(() => page.elements['theme-toggle'].listeners.click());
  assert.equal(page.root.dataset.theme, 'light');
});

test('the about page keeps date and theme controls without a homepage title', () => {
  const page = boot({ aboutPage: true });
  assert.equal(page.elements['current-date'].dateTime, '2026-11-03');
  assert.equal(page.timers.size, 0);
  page.elements['theme-toggle'].listeners.click();
  assert.equal(page.root.dataset.theme, 'light');
});
