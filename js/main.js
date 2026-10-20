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

function renderGallery() {
  const box = section('galeri', 'Galeri', 'section-alt');
  const grid = el('div', { class: 'gallery' }, CONFIG.gallery.map((photo, i) =>
    el('button', { class: 'shot', type: 'button', 'data-index': i, 'aria-label': `Buka foto ${i + 1}` },
      el('img', { src: photo.src, width: photo.w, height: photo.h, alt: `Foto ${CONFIG.couple.short} ${i + 1}`, loading: 'lazy' }))
  ));
  box.append(el('h2', { class: 'section-title', text: 'Galeri' }), grid);

  const modalEl = $('#lightbox');
  const modal = new bootstrap.Modal(modalEl);
  let current = 0;

  const show = i => {
    current = (i + CONFIG.gallery.length) % CONFIG.gallery.length;
    $('#lbImg').src = CONFIG.gallery[current].src;
    $('#lbImg').alt = `Foto ${CONFIG.couple.short} ${current + 1}`;
  };

  grid.addEventListener('click', e => {
    const shot = e.target.closest('.shot');
    if (!shot) return;
    show(Number(shot.dataset.index));
    modal.show();
  });
  $('.lb-prev').addEventListener('click', () => show(current - 1));
  $('.lb-next').addEventListener('click', () => show(current + 1));
  modalEl.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
}

const STORE_KEY = 'rsvp-raka-nadia';
const STATUS = { hadir: 'Hadir', ragu: 'Masih ragu', tidak: 'Tidak hadir' };

function loadWishes() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveWishes(list) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

function field(id, label, control, hint) {
  return el('div', { class: 'field' }, [
    el('label', { class: 'field-label', for: id, text: label }),
    control,
    hint,
    el('p', { class: 'field-error', id: `${id}Error`, 'aria-live': 'polite' }),
  ]);
}

function renderRsvp() {
  const box = section('rsvp', 'Konfirmasi kehadiran dan ucapan');
  const guest = guestName();
  const nameInput = el('input', { class: 'input', id: 'rsvpName', name: 'name', maxlength: 60, autocomplete: 'name' });
  if (guest !== 'Tamu Undangan') nameInput.value = guest;

  const choices = el('div', { class: 'choices', role: 'radiogroup', 'aria-labelledby': 'rsvpStatusLabel' },
    Object.entries(STATUS).map(([value, label]) =>
      el('label', { class: 'choice' }, [
        el('input', { type: 'radio', name: 'status', value }),
        el('span', { text: label }),
      ])
    ));

  const message = el('textarea', { class: 'input', id: 'rsvpMessage', name: 'message', rows: 4, maxlength: 300 });
  const counter = el('p', { class: 'field-hint', text: '0 / 300' });
  message.addEventListener('input', () => { counter.textContent = `${message.value.length} / 300`; });

  const statusField = el('div', { class: 'field' }, [
    el('p', { class: 'field-label', id: 'rsvpStatusLabel', text: 'Kehadiran' }),
    choices,
    el('p', { class: 'field-error', id: 'rsvpStatusError', 'aria-live': 'polite' }),
  ]);

  const note = el('p', { class: 'form-note', role: 'status' });
  const form = el('form', { class: 'rsvp-form', novalidate: '' }, [
    field('rsvpName', 'Nama', nameInput),
    statusField,
    field('rsvpMessage', 'Ucapan & doa', message, counter),
    el('button', { class: 'btn-main', type: 'submit' }, [icon('send'), 'Kirim']),
    note,
  ]);

  const tally = el('div', { class: 'tally' });
  const list = el('ul', { class: 'wishes' });
  const more = el('button', { class: 'btn-main btn-line wishes-more', type: 'button' });
  let expanded = false;

  const draw = () => {
    const all = [...loadWishes(), ...CONFIG.dummyWishes];
    const count = key => all.filter(w => w.status === key).length;
    tally.replaceChildren(...Object.entries(STATUS).map(([key, label]) =>
      el('p', { class: 'tally-item' }, [el('span', { class: 'tally-num serif', text: count(key) }), el('span', { text: label })])
    ));

    const shown = expanded ? all : all.slice(0, 4);
    list.replaceChildren(...shown.map(w => {
      const time = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(w.time));
      return el('li', { class: 'wish' }, [
        el('div', { class: 'wish-head' }, [
          el('p', { class: 'wish-name', text: w.name }),
          el('p', { class: `wish-status is-${w.status}`, text: STATUS[w.status] || '' }),
        ]),
        el('p', { class: 'wish-text', text: w.message }),
        el('p', { class: 'wish-time', text: time }),
      ]);
    }));
    more.hidden = all.length <= 4;
    more.textContent = expanded ? 'Tampilkan lebih sedikit' : `Lihat semua ucapan (${all.length})`;
  };

  more.addEventListener('click', () => { expanded = !expanded; draw(); });

  const setError = (id, msg) => {
    $(`#${id}Error`).textContent = msg;
    const input = $(`#${id}`);
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const status = form.status.value;
    const text = message.value.trim();
    setError('rsvpName', name ? '' : 'Nama belum diisi.');
    setError('rsvpStatus', status ? '' : 'Pilih salah satu dulu ya.');
    setError('rsvpMessage', text ? '' : 'Tulis ucapan singkat untuk mempelai.');
    if (!name || !status || !text) {
      note.textContent = '';
      form.querySelector('[aria-invalid="true"], .choices input')?.focus();
      return;
    }

    const saved = saveWishes([{ name, status, message: text, time: new Date().toISOString() }, ...loadWishes()]);
    note.textContent = saved
      ? 'Terima kasih, konfirmasi dan ucapanmu sudah tersimpan.'
      : 'Browser ini tidak bisa menyimpan data. Coba matikan mode privat.';
    message.value = '';
    counter.textContent = '0 / 300';
    form.querySelectorAll('input[name="status"]').forEach(r => { r.checked = false; });
    draw();
  });

  box.append(
    el('h2', { class: 'section-title', text: 'Konfirmasi Kehadiran' }),
    el('p', { class: 'section-lead', text: 'Mohon konfirmasi sebelum 5 Desember 2026, sekalian titip doa untuk kami.' }),
    form,
    el('h3', { class: 'wishes-title', text: 'Ucapan dari tamu' }),
    tally,
    list,
    more,
  );
  draw();
}

document.addEventListener('DOMContentLoaded', () => {
  document.title = `The Wedding of ${CONFIG.couple.short}`;
  renderCover();
  $('#stageImg').src = CONFIG.hero[0];
  renderOpening();
  renderCouple();
  renderStory();
  renderEvents();
  renderGallery();
  renderRsvp();
});
