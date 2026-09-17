# Stats Server Dashboard

Sebuah dashboard pemantauan server (*server monitoring*) yang ringan, cantik, dan *real-time*. Proyek ini dibuat khusus untuk para **Homelab Enthusiast** dan siapa saja yang ingin memantau kondisi server atau mini PC mereka dari browser dengan tampilan yang modern.

![Stats Server Preview](https://via.placeholder.com/800x400?text=Preview+Dashboard)

## 📌 Apa Saja yang Ditampilkan?
- **CPU / Prosesor**: Pemakaian prosesor saat ini, spesifikasi, dan suhu.
- **Memori (RAM & Swap)**: Sisa kapasitas memori untuk memastikan server Anda tidak kepenuhan.
- **Penyimpanan (Storage)**: Mengetahui sisa ruang hardisk/SSD Anda.
- **Jaringan (Network)**: Lalu lintas internet masuk (In) dan keluar (Out).
- **Proses Berjalan**: 5 program/proses yang paling banyak memakan *resource* CPU.
- **Web Server Aktif**: Otomatis mendeteksi website yang sedang menyala di server Anda (Apache / Nginx).

---

## 🚀 Cara Instalasi (Deploy)

Aplikasi ini tidak membutuhkan *database* atau konfigurasi rumit. Sangat cocok untuk pemula!

**Persyaratan Sistem:**
- Sistem Operasi **Linux** (misal: Ubuntu, Debian, Proxmox LXC, dll). *Tidak akan berfungsi penuh di Windows karena bergantung pada sistem file Linux.*
- Web Server (Apache, Nginx, atau sejenisnya).
- PHP (Versi 7.4 atau yang lebih baru).

**Langkah-langkah:**
1. Pastikan server Anda sudah memiliki web server dan PHP. Jika belum (untuk Ubuntu/Debian), jalankan perintah ini di terminal:
   ```bash
   sudo apt update
   sudo apt install apache2 php libapache2-mod-php
   ```
2. Unduh (*clone*) kode proyek ini dan letakkan di dalam folder publik web server Anda (biasanya di `/var/www/html`):
   ```bash
   cd /var/www/html
   # Hapus file index default bawaan apache (jika ada)
   sudo rm index.html 
   
   # Clone repositori (Pastikan Anda sudah menginstall git)
   sudo git clone https://github.com/kucingcoder/stats-server.git .
   ```
3. Buka browser Anda dan masukkan IP Address server Anda (misal: `http://192.168.1.100`). Dashboard Anda sudah bisa digunakan!

---

## 🛠️ Cara Pengembangan (Development)

Bagi Anda yang ingin mengutak-atik kode atau mengubah desainnya, proyek ini dibuat sangat sederhana (Vanilla) tanpa menggunakan *framework* rumit.

- **`index.php`**: Ini adalah jantung aplikasi. File ini berfungsi sebagai tampilan halaman muka (HTML) sekaligus bertindak sebagai *backend* API. Jika file ini diakses dengan link `index.php?api=true`, file ini akan membaca status dari server Linux (seperti dari folder `/proc`) dan mengembalikan data berformat JSON.
- **`style.css`**: Semua kode warna, tata letak (*layout*), dan animasi (efek *glassmorphism*, robot melayang, dll) diatur di sini.
- **`script.js`**: Kode JavaScript yang bertugas meminta data terbaru ke `index.php?api=true` setiap 2 detik dan langsung memperbarui angka di layar tanpa perlu me-*refresh* halaman.

**Tips Modifikasi:**
- Jika ingin mengganti warna dominan, buka `style.css` dan cari bagian `:root { ... }` di bagian paling atas.
- Jika ingin mengubah interval *refresh*, buka `script.js` dan ubah angka pada `const REFRESH_RATE = 2000;` (dalam milidetik).

---
