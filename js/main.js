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

function ornament(name, cls = '') {
  return el('span', { class: `orn o-${name} ${cls}`.trim(), 'aria-hidden': 'true' });
}

function section(id, label, cls = '') {
  const inner = el('div', { class: 'section-inner' });
  const node = el('section', { id, class: `section ${cls}`.trim(), 'aria-label': label }, inner);
  $('#app').append(node);
  return inner;
}

function renderOpening() {
  const o = CONFIG.opening;
  const box = section('home', 'Pembuka', 'opening');
  box.append(
    el('div', { class: 'opening-photo' }, el('img', { src: CONFIG.hero[0], alt: `Foto ${CONFIG.couple.short}`, loading: 'lazy' })),
    ornament('ranting-3', 'opening-orn'),
    el('p', { class: 'opening-greeting serif', text: o.greeting }),
    el('p', { class: 'opening-intro', text: o.intro }),
    el('blockquote', { class: 'quote' }, [
      el('p', { text: o.quote }),
      el('cite', { text: o.source }),
    ]),
  );
}

function person(p, side) {
  return el('figure', { class: `person person-${side}` }, [
    el('div', { class: 'arch' }, el('img', { src: p.photo, alt: p.name, loading: 'lazy', width: 800, height: 1067 })),
    el('figcaption', {}, [
      el('h3', { class: 'person-name', text: p.name }),
      el('p', { class: 'person-parents', text: p.parents }),
    ]),
  ]);
}

function renderCouple() {
  const { groom, bride } = CONFIG.couple;
  const box = section('mempelai', 'Kedua mempelai');
  box.append(
    el('h2', { class: 'section-title', text: 'Kedua Mempelai' }),
    person(groom, 'left'),
    el('p', { class: 'amp serif', text: '&', 'aria-hidden': 'true' }),
    person(bride, 'right'),
  );
}

document.addEventListener('DOMContentLoaded', () => {
  document.title = `The Wedding of ${CONFIG.couple.short}`;
  renderCover();
  $('#stageImg').src = CONFIG.hero[0];
  renderOpening();
  renderCouple();
});
