import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initMusicPlayer, retainSongScroll } from '../src/scripts/music-player.js';

function setup(count = 2) {
  const element = () => ({ dataset: {}, textContent: '', attrs: {}, disabled: false, listeners: {}, setAttribute(k,v) { this.attrs[k] = v; }, addEventListener(k,v) { this.listeners[k] = v; } });
  const audio = { ...element(), paused: true, currentTime: 0, plays: 0, play() { this.paused = false; this.plays++; this.listeners.play?.(); return Promise.resolve(); }, pause() { this.paused = true; this.listeners.pause?.(); }, load() {} };
  const controls = { audio, play: element(), previous: element(), next: element(), status: element(), title: element() };
  const tracks = Array.from({ length: count }, (_, i) => ({ title: `Track ${i}`, src: `/music/${i}.m4a` }));
  initMusicPlayer(controls, tracks);
  return controls;
}

test('music waits for a click, toggles playback and wraps the playlist', async () => {
  const c = setup();
  assert.equal(c.audio.plays, 0);
  assert.equal(c.audio.src, '/music/0.m4a');
  await c.play.listeners.click();
  assert.equal(c.play.attrs['aria-label'], '暂停音乐');
  c.next.listeners.click();
  assert.equal(c.audio.src, '/music/1.m4a');
  assert.equal(c.audio.paused, false);
  c.next.listeners.click();
  assert.equal(c.audio.src, '/music/0.m4a');
  c.previous.listeners.click();
  assert.equal(c.audio.src, '/music/1.m4a');
  await c.play.listeners.click();
  assert.equal(c.audio.paused, true);
  c.next.listeners.click();
  assert.equal(c.audio.paused, true);
});

test('one song disables switching and replays when ended', async () => {
  const c = setup(1);
  assert.equal(c.next.disabled, true);
  assert.equal(c.previous.disabled, true);
  await c.play.listeners.click();
  c.audio.listeners.ended();
  assert.equal(c.audio.currentTime, 0);
  assert.equal(c.audio.plays, 2);
});

test('playback rejection and media errors show a retryable message', async () => {
  const c = setup();
  c.audio.play = () => Promise.reject(new Error('failed'));
  await c.play.listeners.click();
  assert.match(c.status.textContent, /无法播放/);
  assert.equal(c.play.attrs['aria-label'], '播放音乐');
  c.audio.listeners.error();
  assert.match(c.status.textContent, /无法播放/);
});

test('initializing a retained player again does not reset playback or duplicate controls', async () => {
  const c = setup();
  await c.play.listeners.click();
  c.audio.currentTime = 37;
  initMusicPlayer(c, [{ title: 'Track 0', src: '/music/0.m4a' }]);
  assert.equal(c.audio.paused, false);
  assert.equal(c.audio.currentTime, 37);
  assert.equal(c.audio.plays, 1);
});


test('song scrolling retains its animation phase across page swaps', () => {
  let time = 100;
  let animation = { currentTime: 4200, playState: 'running' };
  const listeners = {};
  const document = {
    addEventListener(name, callback) { listeners[name] = callback; },
    querySelector() { return { getAnimations: () => [animation] }; },
  };
  retainSongScroll(document, () => time);
  listeners['astro:before-swap']();
  animation = { currentTime: 0, playState: 'running' };
  time = 350;
  listeners['astro:after-swap']();
  assert.equal(animation.currentTime, 4450);
  animation.playState = 'paused';
  listeners['astro:before-swap']();
  animation = { currentTime: 0, playState: 'paused' };
  time = 700;
  listeners['astro:after-swap']();
  assert.equal(animation.currentTime, 4450);
});

test('song scrolling follows playback and stops on pause or failure', async () => {
  const c = setup();
  assert.equal(c.title.dataset.playing, 'false');
  await c.play.listeners.click();
  assert.equal(c.title.dataset.playing, 'true');
  await c.play.listeners.click();
  assert.equal(c.title.dataset.playing, 'false');
  await c.play.listeners.click();
  c.audio.listeners.error();
  assert.equal(c.title.dataset.playing, 'false');
});
