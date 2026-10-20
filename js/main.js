const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'text') node.textContent = val;
    else if (key === 'class') node.className = val;
    else if (key === 'style') node.style.cssText = val;
    else node.setAttribute(key, val);
  }
  for (const child of [].concat(children)) {
    if (child) node.append(child);
  }
  return node;
}

function icon(name) {
  return el('span', { class: `ic i-${name}`, 'aria-hidden': 'true' });
}

function guestName() {
  const raw = new URLSearchParams(location.search).get('to');
  const name = raw ? raw.replace(/\s+/g, ' ').trim().slice(0, 60) : '';
  return name || 'Tamu Undangan';
}

const music = new Audio();
music.loop = true;
music.preload = 'none';

function renderCover() {
  $('#coverImg').src = CONFIG.cover;
  $('#coverNames').textContent = CONFIG.couple.short;
  $('#coverDate').textContent = CONFIG.dateLabel;
  $('#guestName').textContent = guestName();
  $('#openBtn').append(icon('mail-open'), 'Buka Undangan');
  $('#openBtn').addEventListener('click', openInvitation);
}

function openInvitation() {
  const cover = $('#cover');
  cover.classList.add('is-open');
  document.body.classList.remove('is-locked');
  document.body.classList.add('is-opened');
  music.src = CONFIG.music;
  music.play().catch(() => {});
  $('#app').focus({ preventScroll: true });
}

document.addEventListener('DOMContentLoaded', () => {
  document.title = `The Wedding of ${CONFIG.couple.short}`;
  renderCover();
  $('#stageImg').src = CONFIG.hero[0];
});
