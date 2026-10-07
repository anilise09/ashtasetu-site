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

// The mascots dance only for people who welcome motion, and only while they are on screen; otherwise they hold
// their first pose (the poster), so a reduced-motion visitor never sees them move.
const mascots = [...document.querySelectorAll('video[data-mascot]')];
const stillPlease = window.matchMedia('(prefers-reduced-motion: reduce)');
const onScreen = new Map();
function updateMascots() {
  for (const video of mascots) {
    if (!stillPlease.matches && onScreen.get(video)) {
      video.play().catch(() => {});
    } else {
      video.pause();
      if (stillPlease.matches) video.currentTime = 0;
    }
  }
}
if (mascots.length && 'IntersectionObserver' in window) {
  const watcher = new IntersectionObserver((entries) => {
    for (const entry of entries) onScreen.set(entry.target, entry.isIntersecting);
    updateMascots();
  });
  mascots.forEach((video) => watcher.observe(video));
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
