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

function initials() {
  return [CONFIG.couple.groom.nick[0], CONFIG.couple.bride.nick[0]];
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
  $('#openBtn').append(
    el('span', { class: 'seal', 'aria-hidden': 'true' }, el('span', { class: 'seal-text', text: initials().join('') })),
    el('span', { class: 'seal-label' }, [icon('mail-open'), 'Buka Undangan']),
  );
  $('#openBtn').addEventListener('click', openInvitation);
}

function startReveal() {
  const items = $$('.section-inner > *:not(.timeline), .moment');
  items.forEach(node => {
    node.classList.add('reveal');
    node.style.setProperty('--d', Math.min([...node.parentElement.children].indexOf(node), 4));
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  items.forEach(node => observer.observe(node));
}

function openInvitation() {
  const cover = $('#cover');
  cover.classList.add('is-open');
  document.body.classList.remove('is-locked');
  document.body.classList.add('is-opened');
  music.src = CONFIG.music;
  music.play().catch(() => {});
  startReveal();
  $('#app').focus({ preventScroll: true });
}

function ornament(name, cls = '') {
  return el('span', { class: `orn o-${name} ${cls}`.trim(), 'aria-hidden': 'true' });
}

function monogram(cls = '') {
  const [a, b] = initials();
  return el('div', { class: `monogram ${cls}`.trim(), 'aria-hidden': 'true' }, [
    ornament('ranting-1', 'mono-orn mono-orn-left'),
    el('div', { class: 'mono-ring' }, [
      el('span', { text: a }),
      el('span', { class: 'mono-amp', text: '&' }),
      el('span', { text: b }),
    ]),
    ornament('ranting-1', 'mono-orn'),
  ]);
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
    monogram('opening-mono'),
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
    el('span', { class: 'person-initial', text: p.nick[0], 'aria-hidden': 'true' }),
    el('div', { class: 'arch' }, el('img', { src: p.photo, alt: p.name, loading: 'lazy', width: 600, height: 800 })),
    el('figcaption', {}, [
      el('h3', { class: 'person-nick', text: p.nick }),
      el('p', { class: 'person-name', text: p.name }),
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

const MONTHS = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];

function stamp(label) {
  const [month, year] = label.toLowerCase().split(' ');
  return `${String(MONTHS.indexOf(month) + 1).padStart(2, '0')} '${year.slice(2)}`;
}

function renderStory() {
  const box = section('kisah', 'Kisah cinta', 'section-alt');
  const film = el('ol', { class: 'timeline film' }, CONFIG.story.map(item =>
    el('li', { class: 'moment' }, [
      el('span', { class: 'visually-hidden', text: item.date }),
      el('h3', { class: 'moment-title', text: item.title }),
      el('p', { text: item.text }),
      el('span', { class: 'stamp', text: stamp(item.date), 'aria-hidden': 'true' }),
    ])
  ));
  box.append(el('h2', { class: 'section-title', text: 'Cerita Kami' }), film);
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

function calendar(date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: 'numeric', day: 'numeric' })
    .formatToParts(date).map(p => [p.type, Number(p.value)]));
  const first = new Date(Date.UTC(parts.year, parts.month - 1, 1)).getUTCDay();
  const total = new Date(Date.UTC(parts.year, parts.month, 0)).getUTCDate();
  const title = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(date);

  const cells = ['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'].map(d => el('span', { class: 'cal-head', text: d }));
  for (let i = 0; i < (first + 6) % 7; i++) cells.push(el('span'));
  for (let d = 1; d <= total; d++) {
    const cell = el('span', { class: 'cal-day', text: d });
    if (d === parts.day) {
      cell.classList.add('is-day');
      cell.insertAdjacentHTML('beforeend', '<svg class="ring" viewBox="0 0 60 60" aria-hidden="true"><path pathLength="1" d="M31 6C47 5 56 18 55 32 53 47 40 55 27 54 13 52 5 41 6 28 8 15 19 7 35 8"/></svg>');
    }
    cells.push(cell);
  }

  return el('div', { class: 'calendar', role: 'img', 'aria-label': `Kalender ${title}, tanggal ${parts.day} ditandai` }, [
    el('p', { class: 'cal-title serif', text: title }),
    el('div', { class: 'cal-grid' }, cells),
  ]);
}

function renderEvents() {
  const box = section('acara', 'Waktu dan tempat');
  const countdown = el('div', { class: 'countdown', role: 'timer', 'aria-label': 'Hitung mundur' });

  box.append(
    el('p', { class: 'eyebrow', text: 'Simpan tanggalnya' }),
    el('h2', { class: 'section-title', text: CONFIG.dateLabel }),
    calendar(new Date(CONFIG.date)),
    countdown,
    el('div', { class: 'invite-card' }, [
      ornament('ranting-2', 'card-orn card-orn-top'),
      ornament('ranting-2', 'card-orn card-orn-bottom'),
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
    ]),
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
  const form = el('form', { class: 'rsvp-form panel', novalidate: '' }, [
    field('rsvpName', 'Nama', nameInput),
    statusField,
    field('rsvpMessage', 'Ucapan & doa', message, counter),
    el('button', { class: 'btn-main', type: 'submit' }, [icon('send'), 'Kirim Ucapan']),
    note,
  ]);

  const tally = el('div', { class: 'tally' });
  const track = el('ul', { class: 'guestbook', 'aria-label': 'Daftar ucapan' });
  const step = dir => {
    const card = track.querySelector('.wish');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: dir * ((card?.offsetWidth || 300) + gap), behavior: 'smooth' });
  };
  const nav = el('div', { class: 'gb-nav' }, [
    el('button', { class: 'gb-btn', type: 'button', 'aria-label': 'Ucapan sebelumnya' }, icon('nav-arrow-left')),
    el('button', { class: 'gb-btn', type: 'button', 'aria-label': 'Ucapan berikutnya' }, icon('nav-arrow-right')),
  ]);
  nav.children[0].addEventListener('click', () => step(-1));
  nav.children[1].addEventListener('click', () => step(1));

  const wishModal = new bootstrap.Modal($('#wishModal'));
  const openWish = w => {
    $('#wishModalName').textContent = w.name;
    $('#wishModalText').textContent = w.message;
    wishModal.show();
  };

  const draw = () => {
    const all = [...loadWishes(), ...CONFIG.dummyWishes];
    const count = key => all.filter(w => w.status === key).length;
    tally.replaceChildren(...Object.entries(STATUS).map(([key, label]) =>
      el('p', { class: 'tally-item' }, [el('span', { class: 'tally-num serif', text: count(key) }), el('span', { text: label })])
    ));

    track.replaceChildren(...all.map(w => {
      const time = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(w.time));
      const text = el('p', { class: 'wish-text', text: w.message });
      const read = el('button', { class: 'wish-read', type: 'button', text: 'Baca semua', hidden: '' });
      read.addEventListener('click', () => openWish(w));
      requestAnimationFrame(() => { read.hidden = text.scrollHeight <= text.clientHeight + 1; });
      return el('li', { class: 'wish' }, [
        el('span', { class: 'wish-quote', text: '“', 'aria-hidden': 'true' }),
        text,
        read,
        el('div', { class: 'wish-foot' }, [
          el('p', { class: 'wish-name', text: w.name }),
          el('p', { class: 'wish-meta', text: `${STATUS[w.status] || ''}, ${time}` }),
        ]),
      ]);
    }));
  };

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
    setError('rsvpStatus', status ? '' : 'Pilih status kehadiran dulu.');
    setError('rsvpMessage', text ? '' : 'Tulis ucapan singkat untuk mempelai.');
    if (!name || !status || !text) {
      note.textContent = '';
      form.querySelector('[aria-invalid="true"], .choices input')?.focus();
      return;
    }

    const saved = saveWishes([{ name, status, message: text, time: new Date().toISOString() }, ...loadWishes()]);
    note.textContent = saved
      ? 'Terima kasih, konfirmasi dan ucapan sudah tersimpan.'
      : 'Browser ini tidak bisa menyimpan data. Coba matikan mode privat.';
    message.value = '';
    counter.textContent = '0 / 300';
    form.querySelectorAll('input[name="status"]').forEach(r => { r.checked = false; });
    draw();
    track.scrollTo({ left: 0, behavior: 'smooth' });
  });

  box.append(
    el('h2', { class: 'section-title', text: 'Konfirmasi Kehadiran' }),
    el('p', { class: 'section-lead', text: 'Mohon konfirmasi sebelum 5 Desember 2026. Doa dan ucapan juga bisa dititipkan di sini.' }),
    form,
    el('div', { class: 'gb-head' }, [
      el('h3', { class: 'wishes-title', text: 'Doa & Ucapan' }),
      nav,
    ]),
    tally,
    track,
  );
  draw();
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = el('textarea', { style: 'position:fixed;opacity:0' });
    area.value = text;
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

function copyButton(text, label) {
  const btn = el('button', { class: 'copy-btn', type: 'button', 'aria-label': label }, [icon('copy'), el('span', { text: 'Salin' })]);
  btn.addEventListener('click', async () => {
    const ok = await copyText(text);
    btn.replaceChildren(icon(ok ? 'check' : 'copy'), el('span', { text: ok ? 'Tersalin' : 'Gagal' }));
    btn.classList.toggle('is-done', ok);
    clearTimeout(btn.timer);
    btn.timer = setTimeout(() => {
      btn.replaceChildren(icon('copy'), el('span', { text: 'Salin' }));
      btn.classList.remove('is-done');
    }, 2000);
  });
  return btn;
}

function renderGift() {
  const { accounts, receiver, address } = CONFIG.gift;
  const box = section('hadiah', 'Amplop digital', 'section-alt');
  const [a, b] = initials();

  const card = el('div', { class: 'env-card', id: 'giftCard' }, accounts.map(acc =>
    el('div', { class: 'account' }, [
      el('div', {}, [
        el('p', { class: 'account-bank', text: acc.bank }),
        el('p', { class: 'account-number', text: acc.number.replace(/(\d{4})(?=\d)/g, '$1 ') }),
        el('p', { class: 'account-holder', text: `a.n. ${acc.holder}` }),
      ]),
      copyButton(acc.number, `Salin nomor rekening ${acc.bank}`),
    ])
  ));

  const envelope = el('div', { class: 'envelope' }, [
    el('div', { class: 'env-back', 'aria-hidden': 'true' }),
    el('div', { class: 'env-flap', 'aria-hidden': 'true' }, [
      el('div', { class: 'flap-inner' }),
      el('div', { class: 'flap-outer' }, el('span', { class: 'env-seal' }, el('span', { text: `${a}${b}` }))),
    ]),
    card,
    el('div', { class: 'env-pocket', 'aria-hidden': 'true' }),
  ]);
  const stage = el('div', { class: 'env-stage' }, el('div', { class: 'env-room' }, envelope));
  const toggle = el('button', { class: 'btn-main env-toggle', type: 'button', 'aria-controls': 'giftCard', 'aria-expanded': 'false' });

  const fit = () => {
    stage.style.setProperty('--env-h', `${envelope.offsetHeight}px`);
    stage.style.setProperty('--card-h', `${card.offsetHeight}px`);
  };
  const setOpen = open => {
    stage.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.replaceChildren(icon('mail-open'), open ? 'Tutup amplop' : 'Buka amplop');
    card.inert = !open;
  };
  toggle.addEventListener('click', () => setOpen(!stage.classList.contains('is-open')));
  envelope.addEventListener('click', e => {
    if (!e.target.closest('.env-card')) setOpen(!stage.classList.contains('is-open'));
  });
  const sizer = new ResizeObserver(fit);
  sizer.observe(card);
  sizer.observe(envelope);
  setOpen(matchMedia('(prefers-reduced-motion: reduce)').matches);

  box.append(
    el('h2', { class: 'section-title', text: 'Tanda Kasih' }),
    el('p', { class: 'section-lead', text: 'Kehadiran dan doa restu sudah sangat berarti bagi kami. Jika ingin mengirim hadiah, bisa lewat amplop di bawah.' }),
    stage,
    toggle,
    el('div', { class: 'gift-address' }, [
      icon('gift'),
      el('div', {}, [
        el('p', { class: 'account-bank', text: 'Kirim kado' }),
        el('p', { class: 'gift-receiver', text: receiver }),
        el('p', { class: 'account-holder', text: address }),
      ]),
      copyButton(`${receiver}, ${address}`, 'Salin alamat kirim kado'),
    ]),
  );
}

function renderClosing() {
  const box = section('penutup', 'Penutup', 'closing');
  box.append(
    el('div', { class: 'closing-photo' }, el('img', { src: CONFIG.hero[3], alt: `${CONFIG.couple.short} bergandengan`, loading: 'lazy', width: 1600, height: 1067 })),
    el('h2', { class: 'section-title', text: 'Terima Kasih' }),
    el('p', { class: 'closing-text', text: 'Merupakan kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.' }),
    el('p', { class: 'closing-text', text: 'Wassalamu’alaikum Warahmatullahi Wabarakatuh' }),
    el('div', { class: 'closing-sign' }, [
      monogram('closing-mono'),
      el('p', { text: 'Kami yang berbahagia,' }),
      el('p', { class: 'closing-names serif', text: CONFIG.couple.short }),
    ]),
  );
  $('#app').append(el('footer', { class: 'foot' }, el('p', { text: `${CONFIG.couple.short}, 2026` })));
}

const NAV = [
  ['home', 'home', 'Pembuka'],
  ['mempelai', 'heart', 'Mempelai'],
  ['acara', 'calendar', 'Acara'],
  ['galeri', 'media-image', 'Galeri'],
  ['rsvp', 'chat-bubble', 'Ucapan'],
  ['hadiah', 'gift', 'Tanda kasih'],
];

function renderDock() {
  const dock = $('#dock');
  const links = NAV.map(([id, ic, label]) =>
    el('a', { class: 'dock-link', href: `#${id}`, 'aria-label': label, title: label }, icon(ic)));

  const musicBtn = el('button', { class: 'dock-link dock-music', type: 'button', 'aria-label': 'Musik', 'aria-pressed': 'false' }, icon('sound-off'));
  const syncMusic = () => {
    const playing = !music.paused;
    musicBtn.setAttribute('aria-pressed', String(playing));
    musicBtn.setAttribute('aria-label', playing ? 'Matikan musik' : 'Putar musik');
    musicBtn.replaceChildren(playing
      ? el('span', { class: 'eq', 'aria-hidden': 'true' }, [el('span'), el('span'), el('span')])
      : icon('sound-off'));
  };
  musicBtn.addEventListener('click', () => {
    if (music.paused) music.play().catch(() => {});
    else music.pause();
  });
  music.addEventListener('play', syncMusic);
  music.addEventListener('pause', syncMusic);

  dock.append(...links, el('span', { class: 'dock-sep', 'aria-hidden': 'true' }), musicBtn);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => a.classList.toggle('is-active', a.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  NAV.forEach(([id]) => observer.observe($(`#${id}`)));
}

const STAGE_MAP = { home: 0, mempelai: 0, kisah: 1, acara: 1, galeri: 2, rsvp: 2, hadiah: 3, penutup: 3 };

function renderStage() {
  const media = matchMedia('(min-width: 992px)');
  const build = () => {
    if (!media.matches || $('#stage').childElementCount) return;
    const imgs = CONFIG.hero.map((src, i) =>
      el('img', { class: `stage-img${i === 0 ? ' is-on' : ''}`, src, alt: '', loading: i === 0 ? 'eager' : 'lazy' }));
    $('#stage').append(el('div', { class: 'stage-arch' }, [
      el('div', { class: 'stage-frame' }, imgs),
      ornament('ranting-1', 'stage-orn'),
    ]));

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const index = STAGE_MAP[entry.target.id] ?? 0;
        imgs.forEach((img, i) => img.classList.toggle('is-on', i === index));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(STAGE_MAP).forEach(id => observer.observe($(`#${id}`)));
  };
  build();
  media.addEventListener('change', build);
}

document.addEventListener('DOMContentLoaded', () => {
  document.title = `The Wedding of ${CONFIG.couple.short}`;
  renderCover();
  renderOpening();
  renderCouple();
  renderStory();
  renderEvents();
  renderGallery();
  renderRsvp();
  renderGift();
  renderClosing();
  renderDock();
  renderStage();
});
