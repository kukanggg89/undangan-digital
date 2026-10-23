# Undangan Digital Raka & Nadia

Tugas 4 PBP, bikin undangan pernikahan digital satu halaman. Pasangannya fiktif, cuma buat contoh.

Link: https://undangan-digital-one-chi.vercel.app/?to=Nama%20Tamu

## Fitur

- Nama tamu otomatis dari link, contoh `?to=Budi`
- Cover dulu, undangan baru kebuka setelah klik tombol (musik ikut nyala)
- Profil mempelai sama info acara
- Countdown ke hari H, kalau udah lewat tulisannya ganti
- Tombol buka lokasi di Google Maps sama simpan ke Google Calendar
- Galeri foto, bisa diklik buat lihat gede
- Form konfirmasi kehadiran + ucapan, disimpan di localStorage browser
- Nomor rekening bisa langsung disalin
- Navigasi bawah sama tombol musik on/off
- Responsive di hp, tablet, laptop. Di laptop foto kiri ganti sesuai section

## Teknologi

- HTML, CSS, JavaScript biasa
- Bootstrap 5 (grid, modal galeri)
- Deploy di Vercel

## Cara jalanin

Tinggal buka `index.html`, tapi lebih aman pake local server biar gambarnya kebaca semua, misalnya:

```
python -m http.server 5500
```

terus buka `http://localhost:5500/?to=Nama%20Kamu`

Semua data (nama, tanggal, acara, foto, rekening) ada di `js/config.js`, jadi kalau mau ganti cukup edit file itu.

## Sumber aset

- Foto: [Pexels, juriadi](https://www.pexels.com/id-id/@juriadi/)
- Ornamen daun: [Botanical line art, Freepik](https://www.magnific.com/free-vector/set-botanical-leaf-doodle-wildflower-botanical-line-art-drawings-collection_38431619.htm)
- Ornamen divider: [Ornamental elements, Freepik](https://www.magnific.com/free-vector/ornamental-elements-collection_1075379.htm)
- Ikon: [Iconoir](https://iconoir.com) (MIT)
- Font: Cormorant Upright sama Hanken Grotesk dari Google Fonts
- Musik: Your Love (Juris), piano cover by [Gerard Chua](https://www.youtube.com/watch?v=aCjvCE7XDHg). Musiknya punya pemilik aslinya, di sini cuma dipake buat tugas.
