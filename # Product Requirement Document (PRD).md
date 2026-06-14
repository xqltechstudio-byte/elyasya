# Product Requirement Document (PRD)
## Pengembangan Website Company Profile - Elyasya Corp

| Atribut | Detail |
| :--- | :--- |
| **Nama Proyek** | Website Company Profile Elyasya Corp |
| **Versi** | 1.0 |
| **Tanggal** | 13 Juni 2026 |
| **Status** | Draft Finansial & Teknis |
| **Pemilik Proyek** | Elyasya Corp Management |

---

## 1. Latar Belakang & Tujuan
Elyasya Corp adalah sebuah holding company yang menaungi 5 pilar bisnis yang sangat beragam: **Design Interior, Management, Hijab, Kedai Sembako, dan Travel Agent**. Saat ini, perusahaan membutuhkan sebuah platform digital terpusat berbentuk website *company profile* (profil perusahaan). 

### Tujuan Utama:
1. **Brand Identity:** Membangun kredibilitas dan citra profesional Elyasya Corp sebagai konglomerasi modern.
2. **One-Stop Portal:** Menjadi pintu gerbang utama bagi klien, mitra, dan konsumen untuk mengenal seluruh lini bisnis perusahaan.
3. **Lead Generation:** Mengarahkan lalu lintas (traffic) pengunjung ke masing-masing channel bisnis spesifik untuk meningkatkan konversi/penjualan.

---

## 2. Profil Pengguna (User Persona)
1. **Calon Mitra Bisnis / Investor:** Mencari informasi legalitas, struktur perusahaan, stabilitas ekonomi, dan portofolio holding untuk potensi kerja sama.
2. **Klien Retail / End-User:** Konsumen yang ingin membeli hijab, memesan tiket travel, menyewa jasa interior, atau mencari lokasi kedai sembako.
3. **Klien Korporat (B2B):** Perusahaan yang membutuhkan jasa *Management* atau *Design Interior* skala besar.

---

## 3. Arsitektur Informasi & Struktur Halaman
Website akan menggunakan struktur multi-page dengan navigasi yang intuitif:

```
[Home]
  ├── Tentang Kami (Tentang Elyasya Corp, Visi & Misi, Struktur Organisasi)
  ├── Lini Bisnis (Dropdown / Hub Page)
  │     ├── Design Interior
  │     ├── Management
  │     ├── Hijab
  │     ├── Kedai Sembako
  │     └── Travel Agent
  ├── Media & Berita (Artikel, Kegiatan Perusahaan, CSR)
  └── Kontak Kami (Formulir, WhatsApp, Lokasi Maps)
```

---

## 4. Ruang Lingkup Fitur (Feature Scope)

### 4.1. Fitur Utama Website (Core Features)
* **Hero Section Dinamis:** Banner utama di halaman beranda yang menampilkan *showcase* visual dari ke-5 lini bisnis secara bergantian (carousel/slider).
* **Business Unit Explorer:** Komponen interaktif di beranda yang memberikan ringkasan singkat tentang setiap unit bisnis beserta tombol "Selengkapnya" menuju halaman spesifik unit tersebut.
* **Integration Call-to-Action (CTA):** Setiap halaman lini bisnis memiliki CTA unik (misal: tombol chat WhatsApp langsung ke admin hijab, atau form booking untuk travel).
* **Content Management System (CMS):** Panel admin (misal menggunakan WordPress atau Headless CMS) untuk memperbarui artikel, portofolio desain interior, atau paket travel secara mandiri tanpa coding.
* **Responsive Web Design (RWD):** Optimasi penuh untuk tampilan Mobile, Tablet, dan Desktop.

### 4.2. Detail Konten Per Lini Bisnis
1.  **Design Interior:**
    * Galeri Portofolio (Before/After project).
    * Formulir pengajuan konsultasi atau kalkulator estimasi biaya awal.
2.  **Management:**
    * Daftar layanan (konsultasi bisnis, manajemen aset, dll.).
    * Testimoni klien korporat dan *case studies*.
3.  **Hijab:**
    * Katalog produk (bukan e-commerce penuh, melainkan *lookbook* produk terbaru).
    * Link integrasi langsung ke Shopee/Tokopedia/WhatsApp Store.
4.  **Kedai Sembako:**
    * Informasi lokasi cabang (integrasi Google Maps).
    * Daftar produk unggulan atau program kemitraan/agen lokal.
5.  **Travel Agent:**
    * Daftar paket tour/umroh/open trip aktif.
    * Fitur *check availability* sederhana yang terhubung ke WhatsApp operasional.

---

## 5. Kebutuhan Non-Fungsional (Non-Functional Requirements)

### 5.1. Performa & Kecepatan (Performance)
* Kecepatan *loading* halaman utama di bawah 3 detik (diuji dengan Google PageSpeed Insights).
* Kompresi gambar otomatis (menggunakan format WebP) untuk katalog hijab dan portofolio interior agar tidak membebani kuota data pengguna mobile.

### 5.2. Keamanan (Security)
* Implementasi SSL Certificate (HTTPS).
* Perlindungan standar dari serangan brute force pada halaman admin CMS.
* Sistem backup data berkala (mingguan/bulanan).

### 5.3. SEO (Search Engine Optimization)
* Struktur URL yang ramah SEO (misal: `elyasyacorp.com/bisnis/design-interior`).
* Meta tags, meta description, dan alt-text pada setiap gambar.
* Pemasangan Google Analytics dan Google Search Console.

---

## 6. Rencana Desain & Estetika (UI/UX)
* **Tone & Mood:** Profesional, Modern, Elegan, namun Tetap Ramah (Warm).
* **Palet Warna Utama:** Kombinasi warna korporat yang netral (seperti Navy Blue, Slate Grey, atau Rich Emerald) dipadukan dengan aksen warna emas/putih untuk memberikan kesan premium. *Setiap halaman lini bisnis diizinkan memiliki sub-aksen warna yang mewakili karakter bisnis masing-masing (misal: Hijab dengan warna pastel, Kedai Sembako dengan hijau segar).*

---

## 7. Rencana Rilis & Fase Pengembangan
Pengembangan dibagi menjadi 3 fase utama untuk memastikan kualitas:

* **Fase 1: Desain & Prototyping (Minggu 1-2)**
    * Pembuatan Wireframe & UI Design di Figma.
    * Persetujuan *look & feel* dari pihak manajemen Elyasya Corp.
* **Fase 2: Development & Integration (Minggu 3-5)**
    * Koding Front-end & Integrasi CMS back-end.
    * Penyusunan konten materi dari ke-5 lini bisnis.
* **Fase 3: QA, Testing & Launch (Minggu 6)**
    * Uji coba fungsionalitas fitur, responsive layout, dan link eksternal.
    * Deployment ke production server/hosting utama.

---

## 8. Kriteria Keberhasilan (Success Criteria)
* Website dapat diakses dengan lancar tanpa error 404 pada seluruh tautan internal/eksternal.
* Manajemen Elyasya Corp dapat mengubah konten teks/gambar pada CMS secara mandiri.
* Setiap tombol CTA berfungsi dan mengarah ke admin/aplikasi tujuan yang benar tanpa delay.