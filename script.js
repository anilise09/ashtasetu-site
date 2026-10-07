const screens = {
  discover: { file: 'discover.webp', alt: 'Discover screen with a synthetic prototype profile', caption: 'Discover • find people who fit your pace' },
  explore: { file: 'explore.webp', alt: 'Explore screen from the AshtaSetu prototype', caption: 'Explore • follow what sparks your interest' },
  openers: { file: 'openers.webp', alt: 'A new chat suggesting first lines from what you share with a synthetic test profile', caption: 'Connect • start with something you share' },
  chat: { file: 'chat.webp', alt: 'Chat screen from the AshtaSetu prototype', caption: 'Chat • keep the conversation going' },
};

const tabs = [...document.querySelectorAll('.preview-tab')];
const image = document.querySelector('#preview-image');
const caption = document.querySelector('#screen-caption');
const panel = document.querySelector('#preview-panel');

function selectTab(tab, focus = false) {
  const screen = screens[tab.dataset.screen];
  if (!screen) return;
  for (const item of tabs) {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  }
  image.src = `assets/screens/${screen.file}`;
  image.alt = screen.alt;
  caption.textContent = screen.caption;
  panel.setAttribute('aria-labelledby', tab.id);
  if (focus) tab.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    selectTab(tabs[next], true);
  });
});

const menu = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('#nav-links');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  navLinks.classList.toggle('is-open', open);
});
navLinks.addEventListener('click', (event) => {
  if (!event.target.closest('a')) return;
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open menu');
  navLinks.classList.remove('is-open');
});
document.querySelector('#year').textContent = new Date().getFullYear();

// The mascots: AshtaSetu's dancing couple, cut out, in the header, the footer and at the top of the home page's
// hero. They dance in one place. The dance is a transparent WebM, used only where transparent WebM plays properly
// (not Safari or anything on iOS) and never for reduced motion; everywhere else the cut-out still stands. Nothing
// plays while it is off screen.
const stillPlease = window.matchMedia('(prefers-reduced-motion: reduce)');
const ua = navigator.userAgent;
const appleWebKit = /iP(hone|ad|od)/.test(ua) || (/Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\/|OPR\//.test(ua));
const canDance = () => !stillPlease.matches && !appleWebKit && !!document.createElement('video').canPlayType('video/webm; codecs="vp9"');
const mascots = [...document.querySelectorAll('[data-mascot]')];
const onScreen = new Map();
function danceVideo(box) {
  let video = box.querySelector('video');
  if (!video) {
    video = document.createElement('video');
    Object.assign(video, { muted: true, loop: true, playsInline: true, preload: 'auto' });
    video.setAttribute('aria-hidden', 'true');
    video.src = 'assets/mascot/couple-waltz.webm';
    video.addEventListener('playing', () => box.classList.add('dancing'), { once: true });
    box.appendChild(video);
  }
  return video;
}
function updateMascots() {
  for (const box of mascots) {
    if (onScreen.get(box) && canDance()) { danceVideo(box).play().catch(() => {}); continue; }
    const video = box.querySelector('video');
    if (!video) continue;
    video.pause();
    if (stillPlease.matches) { video.currentTime = 0; box.classList.remove('dancing'); }
  }
}
if (mascots.length && 'IntersectionObserver' in window) {
  const watcher = new IntersectionObserver((entries) => {
    for (const entry of entries) onScreen.set(entry.target, entry.isIntersecting);
    updateMascots();
  });
  mascots.forEach((box) => watcher.observe(box));
  stillPlease.addEventListener('change', updateMascots);
}

// The hosts' speech bubble steps through its lines, a few seconds each, fading between them.
const hosts = document.querySelector('.hosts[data-lines]');
if (hosts) {
  const bubble = hosts.querySelector('.hosts-bubble');
  const lines = JSON.parse(hosts.dataset.lines);
  let line = 0;
  setInterval(() => {
    if (document.hidden || getComputedStyle(hosts).display === 'none') return;
    bubble.classList.add('fade');
    setTimeout(() => {
      line = (line + 1) % lines.length;
      bubble.textContent = lines[line];
      bubble.classList.remove('fade');
    }, 280);
  }, 5200);
}
