# 📄 Google Forms Solver

Proyek ini adalah ekstensi *browser* yang dirancang untuk membantu pengguna dalam memvisualisasikan dan berinteraksi dengan struktur pertanyaan serta opsi jawaban dari Google Forms secara *offline* atau dengan fitur tambahan seperti penundaan pengisian.

## 🌟 Fitur Utama

  * **Ekstraksi Data Forms:** Mampu mengambil data struktur formulir, termasuk judul pertanyaan, deskripsi, jenis pertanyaan (*e.g.*, *multiple\_choice*, *text*), dan opsi jawaban langsung dari laman Google Forms yang sedang aktif.
  * **Visualisasi Offline:** Menampilkan struktur pertanyaan yang telah diekstrak dalam antarmuka ekstensi yang terpisah dan terorganisir.
  * **Dukungan Gambar:** Mendukung ekstraksi dan tampilan gambar yang terkait dengan pertanyaan maupun opsi jawaban.
  * **Sistem Cache Jawaban:** Menyimpan progres ekstraksi terakhir secara lokal menggunakan `localStorage` untuk memungkinkan proses yang terinterupsi atau berulang, serta mengimplementasikan *delay* simulasi berdasarkan *cache*.
  * **Reset Data:** Fungsi untuk menghapus *cache* dan memulai proses ekstraksi data dari awal.

## 🚀 Instalasi dan Penggunaan

### Prasyarat

Proyek ini merupakan ekstensi *browser* dan memerlukan *browser* berbasis Chromium (seperti Google Chrome atau Microsoft Edge) untuk instalasi dan pengoperasian.

### Instalasi Ekstensi (Mode Pengembang)

1.  **Unduh Repositori:** *Clone* atau unduh repositori proyek ke komputer lokal Anda.
    ```bash
    git clone https://github.com/Fahmi-XD/google-form-solver.git
    ```
2.  **Buka Halaman Ekstensi:** Buka *browser* Anda dan navigasikan ke halaman manajemen ekstensi (biasanya di `chrome://extensions`).
3.  **Aktifkan Mode Pengembang:** Aktifkan **"Mode Pengembang"** (*Developer Mode*) yang terletak di sudut kanan atas.
4.  **Muat Ekstensi:** Klik tombol **"Muat ekstensi yang belum dikemas"** (*Load unpacked*).
5.  **Pilih Folder:** Pilih direktori utama proyek yang telah Anda unduh.

Ekstensi akan terinstal dan siap digunakan.

### Cara Penggunaan

1.  Buka laman Google Forms yang ingin Anda proses.
2.  Klik ikon ekstensi di bilah alat *browser*.
3.  Klik tombol **"Ambil data forms"** untuk mulai mengekstrak dan menampilkan struktur pertanyaan.

## ⚙️ Struktur Proyek

Proyek ini terdiri dari tiga komponen utama:

| File | Deskripsi |
| :--- | :--- |
| `popup.html` | Struktur antarmuka pengguna (UI) ekstensi yang ditampilkan saat ikon diklik. |
| `popup.js` | Logika sisi klien ekstensi. Mengelola interaksi pengguna (tombol), memproses data yang diterima dari *Content Script*, dan menangani visualisasi UI. |
| `content.js` | (*Asumsi: File ini menangani ekstraksi data dari DOM Forms*) Skrip yang disuntikkan ke laman Google Forms untuk mengekstrak struktur pertanyaan dan mengirimkannya kembali ke `popup.js`. |
| `styles.css` | Penataan gaya visual (CSS) untuk `popup.html`. |

## 💻 Pengembangan Teknis

Pengembangan pada `popup.js` berfokus pada fitur progresif dengan menggunakan `window.localStorage` sebagai mekanisme *caching* untuk melacak nomor pertanyaan terakhir yang telah diproses (`answer-cache`). Implementasi ini mencakup penundaan pembaruan tampilan (**Delay**) untuk mensimulasikan proses asinkron yang memakan waktu, sesuai dengan catatan dalam antarmuka.

## 🤝 Kontribusi

Kontribusi pada proyek ini sangat dihargai. Jika Anda menemukan *bug* atau memiliki saran perbaikan, silakan buat *issue* baru atau kirimkan *pull request*.

-----

## ⚖️ Lisensi

MIT LICENSE