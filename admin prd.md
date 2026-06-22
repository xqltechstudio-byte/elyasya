# Product Requirement Document (PRD)
## Project: Dashboard Admin Elyasya Corp - Company Profile

### 1. Document Control & Overview
* **Project Name:** Elyasya Corp Company Profile - Admin Dashboard
* **Version:** 1.0
* **Date:** June 23, 2026
* **Author:** Product Team
* **Status:** Draft

---

### 2. Executive Summary & Objective
Elyasya Corp memerlukan sebuah website Company Profile yang dinamis. Agar pengelolaan konten, portofolio, dan pesan dari calon klien dapat dilakukan secara mandiri tanpa ketergantungan pada tim developer, diperlukan sebuah **Dashboard Admin** yang intuitif, aman, dan efisien.

**Tujuan Utama:**
1.  Memberikan akses kepada manajemen/admin Elyasya Corp untuk memperbarui informasi perusahaan secara *real-time*.
2.  Mengelola portofolio proyek dan layanan terbaru untuk meningkatkan *brand trust*.
3.  Menampung dan mengorganisasi pesan masuk (*leads*) dari halaman kontak website utama.

---

### 3. User Personas & Roles
1.  **Super Admin (Management / IT Team):** Memiliki akses penuh ke seluruh fitur dashboard, termasuk manajemen akun admin lain dan pengaturan sistem.
2.  **Content Editor (Marketing / PR Team):** Memiliki akses untuk mengubah konten website (artikel, portofolio, halaman statis) dan melihat pesan masuk, namun tidak bisa mengubah konfigurasi sistem atau akun lain.

---

### 4. Functional Requirements (Fitur Dashboard)

#### 4.1. Autentikasi & Keamanan (User Authentication)
* **Login Page:** Form input email dan password dengan enkripsi standar.
* **Forgot Password:** Fitur reset password via email tautan verifikasi.
* **Session Management:** Auto-logout jika tidak ada aktivitas selama 60 menit demi keamanan.

#### 4.2. Ringkasan Utama (Main Dashboard Summary)
* **Metrik Ringkas (Widget):** Total pesan masuk, pesan belum dibaca, jumlah portofolio aktif, dan grafik kunjungan website sederhana bulanan (Integrasi API Analytics sederhana).
* **Recent Activities:** Daftar 5 pesan masuk terbaru dan update konten terakhir.

#### 4.3. Manajemen Konten (CMS - Content Management System)
* **Halaman Statis (About Us, Visi & Misi):** Text editor (WYSIWYG) untuk memperbarui deskripsi perusahaan dan sejarah singkat.
* **Manajemen Layanan (Services):** Fitur CRUD (Create, Read, Update, Delete) untuk jenis layanan yang ditawarkan (Ikon/Gambar, Judul, Deskripsi).
* **Manajemen Portofolio (Projects/Portfolio):**
    * Form tambah proyek: Judul, Kategori, Foto Utama, Galeri Foto, Deskripsi Proyek, dan Tahun Selesai.
    * Fitur untuk menyembunyikan (*draft*) atau menerbitkan (*publish*) portofolio.
* **Manajemen Tim (Team Members):** Upload foto, Nama, Jabatan, dan tautan LinkedIn anggota tim/manajemen.

#### 4.4. Manajemen Pesan Masuk (Inquiry & Lead Management)
* **Inbox Table:** Menampilkan daftar pesan masuk dari contact form website utama (Nama, Email, Subjek, Tanggal).
* **Detail Pesan:** Klik pesan untuk membaca isi lengkap dan mengubah status pesan.
* **Status Tanda:** Penanda status pesan: *Unread*, *Read*, dan *Archived/Followed Up*.

#### 4.5. Pengaturan Website (Site & SEO Settings)
* **General Settings:** Mengubah Logo perusahaan, Favicon, alamat kantor, email kontak, dan nomor WhatsApp.
* **Social Media Links:** Input tautan untuk Instagram, LinkedIn, Facebook, dan YouTube.
* **SEO Meta Control:** Input kolom *Meta Title*, *Meta Description*, dan *Keywords* untuk optimasi SEO dasar di Google.

---

### 5. Non-Functional Requirements (NFR)
* **Responsiveness:** Dashboard harus responsif dan nyaman diakses melalui Desktop, Tablet, maupun Smartphone (Mobile Friendly).
* **Performance:** Waktu pemuatan halaman dashboard tidak boleh lebih dari 2 detik pada koneksi internet standar.
* **Security:** Proteksi terhadap SQL Injection, XSS, dan wajib menggunakan protokol HTTPS.
* **Scalability:** Struktur basis data harus modular agar mudah jika di kemudian hari ingin ditambahkan fitur e-commerce atau modul karir/rekrutmen.

---

### 6. Timeline & Milestones (Tentatif)
* **Minggu 1:** Finalisasi PRD & Perancangan UI/UX Wireframe Dashboard.
* **Minggu 2-3:** Pengembangan Backend (Database, API, Auth) & Frontend Dashboard.
* **Minggu 4:** Integrasi dengan Website Utama Elyasya Corp & Pengujian (QA/UAT).
* **Minggu 5:** Deployment (Go-Live) dan Pelatihan Penggunaan (*Handover*)