# Product Requirement Document (PRD)
## Project Name: Admin Dashboard Control Panel
**Version:** 1.0  
**Date:** June 17, 2026  
**Author:** Product Management Team  
**Status:** Draft  

---

## 1. Executive Summary & Objective
Tujuan dari proyek ini adalah membangun halaman Dashboard Admin sebagai pusat kendali terpusat (*centralized control panel*). Sistem ini berfungsi untuk memantau performa bisnis secara *real-time*, mengelola data operasional (CRUD), serta mengatur hak akses pengguna demi efisiensi kerja tim internal dan keamanan data perusahaan.

---

## 2. User Personas & Roles
Sistem ini akan diakses oleh beberapa tingkat pengguna dengan hak akses yang berbeda (Role-Based Access Control / RBAC):
1. **Super Admin:** Memiliki akses penuh ke seluruh sistem, termasuk pengaturan keuangan, log keamanan, dan manajemen akun admin lainnya.
2. **Operations/Content Manager:** Berwenang mengelola data operasional (produk, transaksi, verifikasi user) namun tidak bisa mengubah konfigurasi sistem atau melihat log teknis.
3. **Viewer/Analyst:** Hanya memiliki akses *read-only* untuk melihat grafik statistik dan mengunduh laporan.

---

## 3. Key Features & Functional Requirements

### 3.1. Authentication & Security (Autentikasi)
*   **FR-01:** Pengguna harus melakukan *login* menggunakan email dan kata sandi yang terenkripsi.
*   **FR-02:** Sistem wajib mendukung *Two-Factor Authentication* (2FA) untuk level akun Super Admin.
*   **FR-03:** *Session Timeout* otomatis jika admin tidak aktif dalam waktu 30 menit.

### 3.2. Layout Utama & Navigasi
*   **FR-04 Sidebar (Menu Samping):** Navigasi vertikal yang dapat disembunyikan (*collapsible*). Menu mencakup: Dashboard, Manajemen Pengguna, Manajemen Konten/Produk, Laporan, Keamanan, dan Pengaturan.
*   **FR-05 Header:** Berisi kolom pencarian global, ikon lonceng notifikasi (aktivitas *real-time*), dan *dropdown* profil pengguna untuk *logout*.

### 3.3. Modul Ringkasan & Visualisasi Data (Main Dashboard)
*   **FR-06 Info Cards (Widget):** Menampilkan metrik angka utama di bagian paling atas (misal: Total Pendapatan, Pengguna Baru, Transaksi Aktif) dilengkapi dengan indikator tren persentase naik/turun dibanding periode sebelumnya.
*   **FR-07 Chart Analytics:**
    *   *Line/Bar Chart:* Visualisasi tren performa bulanan/harian.
    *   *Pie/Donut Chart:* Visualisasi pembagian kategori data (misal: Produk terlaris, status transaksi).
*   **FR-08 Date Filter:** Fitur penyaringan data dashboard berdasarkan rentang waktu (Hari Ini, 7 Hari Terakhir, 30 Hari Terakhir, Kustom).

### 3.4. Manajemen Data Utama (CRUD Engine)
*   **FR-09 Data Tables:** Menampilkan data pengguna atau produk dalam bentuk tabel yang rapi.
*   **FR-10 Fitur Tabel:** Wajib memiliki fungsi *Searching* (pencarian), *Sorting* (pengurutan kolom), *Filtering* (penyaringan kategori), dan *Pagination* (pembatasan 10, 25, 50 data per halaman).
*   **FR-11 Modul Aksi:** Menyediakan tombol Tambah Data, Detail (Read), Ubah (Update), dan Hapus (Delete). Khusus aksi hapus wajib memunculkan jendela konfirmasi (*pop-up modal*).

### 3.5. Audit Trail & Log Sistem
*   **FR-12 Activity Logs:** Sistem harus mencatat setiap aksi krusial yang dilakukan oleh admin (Siapa, Melakukan Apa, Kapan, dan IP Address-nya) untuk kebutuhan forensik keamanan jika terjadi kesalahan data.

---

## 4. Non-Functional Requirements (NFR)

*   **Performance:** Halaman dashboard utama harus termuat kurang dari 2 detik pada kecepatan internet standar. Pengambilan data tabel yang besar wajib menggunakan metode *server-side pagination*.
*   **Responsiveness:** Tampilan harus adaptif (*responsive layout*). Minimal dapat diakses dengan baik di perangkat Tablet (iPad/Android Tablet) dan Desktop (Resolusi 1280x720 ke atas).
*   **Scalability:** Arsitektur database harus mampu menangani pembacaan data hingga 50.000 baris per menit tanpa penurunan performa.

---

## 5. UI/UX & Design Guidelines
*   **Tema:** Menggunakan *Clean Light Mode* untuk ruang kerja administratif konvensional, atau *Modern Dark Mode* untuk dashboard analitik intensif.
*   **Keterbacaan:** Menggunakan font bertipe sans-serif (seperti *Inter* atau *Roboto*) dengan kontras warna teks dan latar belakang yang memenuhi standar WCAG 2.1 (aksesibilitas).
*   **Umpan Balik Visual:** Setiap aksi sukses (simpan/hapus) harus memunculkan notifikasi *Toast* (pesan melayang di sudut layar) berwarna hijau, dan warna merah jika gagal.

---

## 6. Success Metrics (KPI)
*   Mengurangi waktu pengolahan data operasional oleh tim internal sebesar 40%.
*   Nol insiden kebocoran data akibat kesalahan hak akses (*privilege escalation*).
*   Tingkat kepuasan internal user (System Usability Scale) mencapai skor minimal 75.