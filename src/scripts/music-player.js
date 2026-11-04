const initializedAudio = new WeakSet();

export function initMusicPlayer({ audio, play, previous, next, status, title }, tracks) {
  if (!tracks.length || initializedAudio.has(audio)) return;
  initializedAudio.add(audio);
  let index = 0;
  let request = 0;
  function render(playing = !audio.paused) {
    play.dataset.playing = String(playing);
    title.dataset.playing = String(playing);
    play.setAttribute('aria-label', playing ? '暂停音乐' : '播放音乐');
    play.setAttribute('title', playing ? '暂停音乐' : '播放音乐');
    play.setAttribute('aria-pressed', String(playing));
  }
  function failure() {
    render(false);
    status.textContent = '音乐暂时无法播放，请重试或切换歌曲。';
  }
  async function start() {
    const current = ++request;
    status.textContent = '';
    try { await audio.play(); }
    catch { if (current === request) failure(); }
  }
  function select(offset = 0, resume = false) {
    request++;
    audio.pause();
    index = (index + offset + tracks.length) % tracks.length;
    audio.src = tracks[index].src;
    audio.load();
    title.textContent = tracks[index].title;
    title.setAttribute('title', tracks[index].title);
    status.textContent = '';
    if (resume) void start();
  }
  play.addEventListener('click', () => {
    if (audio.paused) return start();
    request++;
    audio.pause();
  });
  previous.addEventListener('click', () => select(-1, !audio.paused));
  next.addEventListener('click', () => select(1, !audio.paused));
  previous.disabled = next.disabled = tracks.length < 2;
  audio.addEventListener('play', () => render(true));
  audio.addEventListener('pause', () => render(false));
  audio.addEventListener('error', failure);
  audio.addEventListener('ended', () => {
    if (tracks.length > 1) select(1, true);
    else { audio.currentTime = 0; void start(); }
  });
  select();
  render(false);
}

// Persisted DOM can still have its CSS animation recreated during a body swap.
// Carry the animation clock forward so the marquee never jumps back to the start.
export function retainSongScroll(document, now = () => performance.now()) {
  let state;
  document.addEventListener('astro:before-swap', () => {
    const animation = document.querySelector('.music-title-text')?.getAnimations()[0];
    state = animation && typeof animation.currentTime === 'number'
      ? { time: animation.currentTime, at: now(), running: animation.playState === 'running' }
      : undefined;
  });
  document.addEventListener('astro:after-swap', () => {
    if (!state) return;
    const animation = document.querySelector('.music-title-text')?.getAnimations()[0];
    if (animation) animation.currentTime = state.time + (state.running ? now() - state.at : 0);
    state = undefined;
  });
}
