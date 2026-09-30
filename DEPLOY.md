# 🚀 Panduan Deploy — menjadikan Jeda “aplikasi beneran” di HP

Folder `deploy/` adalah **PWA (Progressive Web App)** lengkap:

```
deploy/
├── index.html              aplikasi (satu halaman, tanpa dependensi eksternal)
├── manifest.webmanifest    identitas aplikasi: nama, ikon, mode standalone
├── sw.js                   service worker → offline penuh + update otomatis
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-maskable-512.png   (untuk ikon launcher Android ber-bentuk bebas)
    └── apple-touch-icon.png    (ikon home screen iOS)
```

Setelah di-host lewat **https://**, di HP ia bisa di-install: muncul di layar
utama dengan ikon sendiri, terbuka *fullscreen* tanpa address bar, dan
**tetap berfungsi tanpa internet** (service worker menyimpan app shell).

---

## A. Pilih cara hosting (semua gratis)

### Opsi 1 — Netlify Drop (paling cepat, tanpa git)
1. Buka <https://app.netlify.com/drop> (login dulu kalau diminta).
2. **Seret seluruh folder `deploy/`** ke kotak yang tersedia.
   Punya file **`jeda-deploy.zip`**? Seret ZIP-nya langsung — Netlify Drop
   menerima arsip zip dan mengekstraknya otomatis, jadi tidak perlu dibongkar dulu.
3. Beberapa detik kemudian dapat URL seperti `https://jeda-sr.netlify.app`.
4. (Opsional) Ganti nama subdomain di *Site settings → Change site name*.

> ⚠️ Yang di-upload adalah **isi folder `deploy/`** (index.html, manifest.webmanifest,
> sw.js, icons/), **bukan** file `Jeda-SpacedRepetition.html`. File tunggal itu adalah
> versi portabel untuk dikirim lewat WA/email dan dibuka langsung — kalau di-upload
> sendirian aplikasinya tetap jalan, tapi fitur install & offline-nya tidak ikut.

### Opsi 2 — GitHub Pages
1. Buat repo baru, mis. `jeda`.
2. Upload **isi folder `deploy/`** ke root repo (bukan foldernya, tapi isinya:
   `index.html`, `manifest.webmanifest`, `sw.js`, `icons/`).
3. *Settings → Pages → Branch:* `main` / folder `/ (root)` → **Save**.
4. Tunggu 1–2 menit, buka `https://<username>.github.io/jeda/`.
   > Penting: service worker memakai `scope: "./"` sehingga tetap aman walau
   > di-host di subfolder seperti di atas.

### Opsi 3 — Cloudflare Pages
1. <https://pages.cloudflare.com> → *Create a project → Direct upload*.
2. Seret folder `deploy/` → **Deploy**.
3. Dapat URL `https://<nama>.pages.dev`.

### Opsi 4 — Server lokal satu Wi-Fi (tanpa internet publik)
```bash
cd deploy
python3 -m http.server 8000
```
Cari IP laptop (`ipconfig` di Windows, `ip a` / `ifconfig` di Linux/Mac),
lalu di HP buka `http://192.168.x.x:8000/`.
> Catatan: lewat `http://` IP lokal, browser tetap mengizinkan service worker
> (localhost & IP privat dianggap aman), tetapi beberapa fitur instal
> paling mulus lewat `https://`. Untuk pemakaian pribadi di rumah ini sudah cukup.

---

## A2. Langkah mana dikerjakan di perangkat mana?

Tidak semua langkah harus di HP. Inilah pembagian yang paling mulus:

| Langkah | Perangkat | Kenapa |
|---|---|---|
| 1. Upload folder `deploy/` ke hosting | **Laptop / PC** | Folder `deploy/` ada di laptop; Netlify Drop & GitHub Pages paling mudah lewat browser desktop (drag-and-drop folder tidak didukung browser HP). |
| 2. Cek URL berfungsi | **Laptop / PC** | Sekalian memastikan manifest & service worker termuat tanpa error sebelum dibagikan ke HP. |
| 3. Install jadi aplikasi | **HP** (Android Chrome / iOS Safari) | Di sinilah tujuan akhirnya: ikon di layar utama HP. |
| 3b. (Opsional) Install juga di laptop | **Laptop** (Chrome/Edge) | Klik ikon instal di ujung address bar → jadi jendela aplikasi desktop sendiri. |
| 4. Pakai sehari-hari | **HP dan/atau laptop** | Aplikasi jalan di browser mana pun. Notifikasi kalender datang ke perangkat yang meng-import `.ics`. |

Catatan penting:

- **Kalau kamu hanya mau pakai di laptop**, langkah 3 boleh dilewati sepenuhnya: cukup bookmark URL-nya, atau buka langsung `Jeda-SpacedRepetition.html` tanpa hosting sama sekali.
- **Data tersimpan per perangkat.** Install di HP dan di laptop menghasilkan dua “salinan” data yang tidak saling sinkron otomatis. Pindahkan lewat **Pengaturan → Backup JSON**, atau jadikan kalender (`.ics`) sebagai sumber jadwal bersama.
- Setelah install, **update aplikasi cukup dari laptop**: upload ulang folder `deploy/`, lalu HP akan menawarkan “Versi baru tersedia — Muat ulang sekarang” saat dibuka berikutnya.

---

## B. Install di HP setelah URL jadi

**Android (Chrome/Edge)**
1. Buka URL-nya.
2. Biasanya muncul prompt **“Instal aplikasi”** otomatis; jika tidak:
   menu **⋮ → Instal aplikasi / Tambahkan ke layar utama**.
   (Di dalam aplikasi juga ada tombol **Instal Aplikasi** di sidebar & Pengaturan
   yang muncul begitu browser menawarkan instalasi.)
3. Ikon Jeda muncul di launcher; membukanya tampil fullscreen dan bisa offline.

**iPhone / iPad (Safari)**
1. Buka URL-nya di **Safari**.
2. Tombol **Bagikan** → **Tambahkan ke Layar Utama** → **Tambahkan**.
3. Terbuka fullscreen seperti aplikasi native (meta `apple-mobile-web-app-capable`
   sudah terpasang).

**Laptop (Chrome/Edge)**
- Ikon instal di ujung kanan address bar → klik → **Instal**.
- Jadi jendela aplikasi sendiri di desktop.

---

## C. Update aplikasi di kemudian hari

1. Edit `deploy/index.html` (atau bangun ulang dari sumber lewat
   `python3 tools/make-single-file.py` untuk versi satu file).
2. Upload ulang ke hosting yang sama.
3. Service worker di HP mendeteksi versi baru di latar belakang dan menampilkan
   dialog **“Versi baru tersedia — Muat ulang sekarang”**.
4. Data pengguna **tidak hilang** saat update: semuanya di `localStorage`
   perangkat, tidak disentuh service worker.

> Bila mengubah strategi cache, naikkan `VERSION` di `sw.js`
> (mis. `jeda-cache-v2`) supaya cache lama dibuang saat activate.

---

## D. Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| Prompt instal tidak muncul | Harus lewat `https://` (atau IP privat), manifest + SW harus termuat tanpa error, dan ikon 192 & 512 px harus ada. Cek tab *Application → Manifest* di DevTools. |
| Offline tidak jalan | Pastikan `sw.js` ter-upload satu level dengan `index.html`, dan sudah pernah dibuka sekali saat online (app shell di-cache saat install). |
| iOS tidak bisa install dari Chrome | Instalasi iOS hanya dari **Safari**. |
| Data tidak ikut pindah perangkat | Memang per perangkat. Pindahkan lewat **Pengaturan → Backup JSON**, atau andalkan export `.ics`. |
| Mau kembali ke versi satu file | Pakai `Jeda-SpacedRepetition.html` di root repo ini — bisa dikirim lewat WA/email dan dibuka langsung, tanpa hosting. |

---

## E. Struktur repo

| Path | Isi |
|---|---|
| `deploy/` | PWA siap upload (folder ini yang di-deploy) |
| `Jeda-SpacedRepetition.html` | Versi satu file portabel (dibangun otomatis dari `deploy/index.html`) |
| `tools/make-single-file.py` | Skrip pembangun versi satu file |
| `README.md` | Dokumentasi aplikasi + dasar riset passing grade |
| `preview/` | Tangkapan layar UI |
