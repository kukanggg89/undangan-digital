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

function renderStory() {
  const box = section('kisah', 'Kisah cinta', 'section-alt');
  const list = el('ol', { class: 'timeline' }, CONFIG.story.map(item =>
    el('li', { class: 'moment' }, [
      el('p', { class: 'moment-date', text: item.date }),
      el('div', { class: 'moment-body' }, [
        el('h3', { class: 'moment-title', text: item.title }),
        el('p', { text: item.text }),
      ]),
    ])
  ));
  box.append(el('h2', { class: 'section-title', text: 'Cerita Kami' }), list);
}

function gcalDate(iso) {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function calendarUrl() {
  const first = CONFIG.events[0];
  const last = CONFIG.events[CONFIG.events.length - 1];
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Pernikahan ${CONFIG.couple.short}`,
    dates: `${gcalDate(first.start)}/${gcalDate(last.end)}`,
    location: `${first.place}, ${first.address}`,
    details: CONFIG.events.map(e => `${e.name}: ${e.time}`).join('\n'),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function mapsUrl(ev) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ev.place}, ${ev.address}`)}`;
}

function startCountdown(box) {
  const target = new Date(CONFIG.date).getTime();
  const units = [['hari', 86400000], ['jam', 3600000], ['menit', 60000], ['detik', 1000]];
  const cells = units.map(([label]) => {
    const num = el('span', { class: 'count-num', text: '00' });
    box.append(el('div', { class: 'count-cell' }, [num, el('span', { class: 'count-label', text: label })]));
    return num;
  });

  const tick = () => {
    let left = target - Date.now();
    if (left <= 0) {
      clearInterval(timer);
      box.replaceChildren(el('p', { class: 'count-done', text: 'Acara telah berlangsung. Terima kasih atas doa dan kehadirannya.' }));
      return;
    }
    units.forEach(([, size], i) => {
      const val = Math.floor(left / size);
      left -= val * size;
      cells[i].textContent = String(val).padStart(2, '0');
    });
  };
  const timer = setInterval(tick, 1000);
  tick();
}

function renderEvents() {
  const box = section('acara', 'Waktu dan tempat');
  const day = new Date(CONFIG.date);
  const fmt = opts => new Intl.DateTimeFormat('id-ID', { ...opts, timeZone: 'Asia/Jakarta' }).format(day);
  const countdown = el('div', { class: 'countdown', role: 'timer', 'aria-label': 'Hitung mundur' });

  box.append(
    el('p', { class: 'eyebrow', text: 'Simpan tanggalnya' }),
    el('div', { class: 'bigdate' }, [
      el('span', { class: 'bigdate-day', text: fmt({ weekday: 'long' }) }),
      el('span', { class: 'bigdate-num serif', text: fmt({ day: 'numeric' }) }),
      el('span', { class: 'bigdate-month', text: fmt({ month: 'long', year: 'numeric' }) }),
    ]),
    countdown,
    el('div', { class: 'events' }, CONFIG.events.map(ev =>
      el('div', { class: 'event' }, [
        el('h3', { class: 'event-name', text: ev.name }),
        el('p', { class: 'event-line' }, [icon('clock'), el('span', { text: ev.time })]),
      ])
    )),
    el('p', { class: 'event-line venue' }, [icon('map-pin'), el('span', {}, [
      el('strong', { text: CONFIG.events[0].place }),
      el('br'),
      CONFIG.events[0].address,
    ])]),
    el('div', { class: 'event-actions' }, [
      el('a', { class: 'btn-main', href: mapsUrl(CONFIG.events[0]), target: '_blank', rel: 'noopener' }, [icon('map-pin'), 'Lihat Lokasi']),
      el('a', { class: 'btn-main btn-line', href: calendarUrl(), target: '_blank', rel: 'noopener' }, [icon('calendar-plus'), 'Simpan Tanggal']),
    ]),
  );
  startCountdown(countdown);
}

document.addEventListener('DOMContentLoaded', () => {
  document.title = `The Wedding of ${CONFIG.couple.short}`;
  renderCover();
  $('#stageImg').src = CONFIG.hero[0];
  renderOpening();
  renderCouple();
  renderStory();
  renderEvents();
});
