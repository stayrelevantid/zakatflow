# Product Requirement Document (PRD): ZakatFlow

> **Versi Dokumen:** 1.0.0  
> **Tanggal:** 30 Maret 2026  
> **Status:** Draft

---

## Daftar Isi

1. [Identitas Proyek](#1-identitas-proyek)
2. [Spesifikasi Teknologi (Tech Stack)](#2-spesifikasi-teknologi-tech-stack)
3. [Fitur Utama & Logika Bisnis (Syariah Compliance)](#3-fitur-utama--logika-bisnis-syariah-compliance)
4. [Arsitektur Infrastruktur (SRE Standards)](#4-arsitektur-infrastruktur-sre-standards)
5. [Spesifikasi Desain (Glassmorphism UI)](#5-spesifikasi-desain-glassmorphism-ui)
6. [Struktur Data Google Sheets (Database)](#6-struktur-data-google-sheets-database)
7. [Halaman & Navigasi Aplikasi](#7-halaman--navigasi-aplikasi)
8. [API Endpoints & Server Logic](#8-api-endpoints--server-logic)
9. [Error Handling & Validasi](#9-error-handling--validasi)
10. [Roadmap Implementasi](#10-roadmap-implementasi)
11. [Acceptance Criteria](#11-acceptance-criteria)

---

## 1. Identitas Proyek

| Field           | Detail                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nama**        | ZakatFlow                                                                                                                                                                    |
| **Deskripsi**   | Aplikasi pencatatan dan kalkulator zakat personal dengan UI Glassmorphism, menggunakan Google Sheets sebagai database, dan dideploy di infrastruktur Kubernetes lokal (k3d). |
| **Owner**       | Paino (DevOps/SRE)                                                                                                                                                           |
| **Target User** | Individu Muslim yang ingin menghitung dan mencatat pembayaran zakat secara digital.                                                                                          |

---

## 2. Spesifikasi Teknologi (Tech Stack)

### 2.1 Frontend

| Komponen   | Teknologi                                       | Keterangan                                         |
| ---------- | ----------------------------------------------- | -------------------------------------------------- |
| Framework  | **SvelteKit**                                   | Reaktif & SSR-ready                                |
| UI Library | **Shadcn UI (Svelte)**                          | Komponen UI modern dan accessible                  |
| Styling    | **Tailwind CSS**                                | Utility-first CSS framework                        |
| Tema       | **Glassmorphism**                               | Transparansi tinggi, blur background, border halus |
| Animasi    | **Svelte Transitions** (`fade`, `fly`, `slide`) | Transisi antar komponen dan halaman                |

### 2.2 Backend & Database

| Komponen | Teknologi                   | Keterangan                                         |
| -------- | --------------------------- | -------------------------------------------------- |
| Server   | **SvelteKit Server Routes** | API endpoints via `+server.ts` / `+page.server.ts` |
| Database | **Google Sheets API v4**    | Server-side integration sebagai data store         |
| Auth     | **Google Service Account**  | Autentikasi server-to-server untuk Sheets API      |
| Adapter  | **adapter-node**            | Untuk build production (Node.js runtime)           |

### 2.3 Infrastruktur

| Komponen      | Teknologi          | Keterangan                             |
| ------------- | ------------------ | -------------------------------------- |
| Container     | **Docker**         | Multi-stage build untuk optimasi image |
| Base Image    | **node:20-alpine** | Lightweight runtime image              |
| Orchestration | **k3d**            | Local Kubernetes cluster               |
| Ingress       | **Traefik**        | Default k3d ingress controller         |
| DNS Lokal     | **zakat.local**    | Custom domain untuk akses lokal        |

---

## 3. Fitur Utama & Logika Bisnis (Syariah Compliance)

### 3.1 Kalkulator Zakat Dinamis

Aplikasi harus mampu menghitung zakat secara otomatis berdasarkan parameter syariah berikut:

#### A. Zakat Fitrah

| Parameter       | Nilai                            |
| --------------- | -------------------------------- |
| **Nisab**       | Per jiwa                         |
| **Kadar Zakat** | 2,5 kg / 3,5 Liter Beras         |
| **Input**       | Jumlah orang/jiwa dalam keluarga |

**Logika Kalkulasi:**

```
zakat_fitrah = jumlah_jiwa × 2.5 kg (atau 3.5 liter beras)
zakat_fitrah_rupiah = jumlah_jiwa × harga_beras_per_kg × 2.5
```

#### B. Zakat Emas & Perak

| Parameter       | Nilai                             |
| --------------- | --------------------------------- |
| **Nisab**       | 85 gram (Emas) / 595 gram (Perak) |
| **Kadar Zakat** | 2,5%                              |
| **Input**       | Berat gram murni                  |

**Logika Kalkulasi:**

```
if (berat_emas >= 85) {
  zakat_emas = berat_emas × harga_emas_per_gram × 0.025
}
if (berat_perak >= 595) {
  zakat_perak = berat_perak × harga_perak_per_gram × 0.025
}
```

#### C. Zakat Penghasilan (Profesi)

| Parameter       | Nilai                       |
| --------------- | --------------------------- |
| **Nisab**       | Setara 85 gram emas / tahun |
| **Kadar Zakat** | 2,5%                        |
| **Input**       | Gaji bulanan atau tahunan   |

**Logika Kalkulasi:**

```
nisab_tahunan = 85 × harga_emas_per_gram
penghasilan_tahunan = gaji_bulanan × 12

if (penghasilan_tahunan >= nisab_tahunan) {
  zakat_penghasilan = penghasilan_tahunan × 0.025
  // Atau per bulan: gaji_bulanan × 0.025
}
```

#### D. Zakat Perdagangan

| Parameter       | Nilai                       |
| --------------- | --------------------------- |
| **Nisab**       | Setara 85 gram emas         |
| **Kadar Zakat** | 2,5%                        |
| **Input**       | Modal, Kas, Piutang, Hutang |

**Logika Kalkulasi:**

```
total_harta_dagang = modal_usaha + kas + piutang_lancar - hutang_jatuh_tempo

if (total_harta_dagang >= nisab) {
  zakat_perdagangan = total_harta_dagang × 0.025
}
```

#### E. Zakat Pertanian

| Parameter       | Nilai                                    |
| --------------- | ---------------------------------------- |
| **Nisab**       | 653 kg gabah (setara ~520 kg beras)      |
| **Kadar Zakat** | 5% (irigasi) / 10% (tadah hujan)         |
| **Input**       | Hasil panen (kg) + toggle metode irigasi |

**Logika Kalkulasi:**

```
if (hasil_panen_kg >= 653) {
  if (metode === "irigasi") {
    zakat_pertanian = hasil_panen_kg × harga_per_kg × 0.05
  } else if (metode === "tadah_hujan") {
    zakat_pertanian = hasil_panen_kg × harga_per_kg × 0.10
  }
}
```

#### F. Zakat Peternakan/Perikanan

| Parameter       | Nilai               |
| --------------- | ------------------- |
| **Nisab**       | Setara 85 gram emas |
| **Kadar Zakat** | 2,5%                |
| **Input**       | Pendapatan bersih   |

**Logika Kalkulasi:**

```
if (pendapatan_bersih >= nisab) {
  zakat_kebun_ikan = pendapatan_bersih × 0.025
}
```

### 3.2 Ringkasan Tabel Kalkulasi

| Kategori          | Nisab (Ambang Batas)      | Kadar Zakat  | Input yang Dibutuhkan                         |
| ----------------- | ------------------------- | ------------ | --------------------------------------------- |
| Zakat Fitrah      | Per jiwa                  | 2,5 kg beras | Jumlah orang/jiwa                             |
| Zakat Emas/Perak  | 85g (Emas) / 595g (Perak) | 2,5% | Gram murni                                    |
| Zakat Penghasilan | Setara 85g emas/tahun | 2,5% | Gaji bulanan/tahunan                          |
| Zakat Perdagangan | Setara 85g emas | 2,5% | Modal + Kas + Piutang - Hutang                |
| Zakat Pertanian   | 653 kg gabah | 5% / 10% | Hasil panen (kg) + toggle irigasi/tadah hujan |
| Zakat Peternakan | Setara 85g emas | 2,5% | Jenis hewan, jumlah, nilai per hewan |
| Zakat Perikanan | Setara 85g emas | 2,5% | Pendapatan bersih |

### 3.3 Manajemen Data (Google Sheets)

| Fitur                 | Deskripsi                                                              |
| --------------------- | ---------------------------------------------------------------------- |
| **Sync Data**         | Membaca/Menulis data transaksi zakat secara real-time ke Google Sheets |
| **Dashboard History** | Menampilkan tabel riwayat pembayaran zakat dengan filter kategori      |
| **CRUD Transaksi**    | Create, Read, Update, Delete data pembayaran zakat                     |
| **Export**            | Data sudah otomatis tersimpan di Google Sheets (bisa diakses langsung) |

---

## 4. Arsitektur Infrastruktur (SRE Standards)

### 4.1 Dockerization

**Dockerfile (Multi-stage Build):**

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["node", "build"]
```

**Prinsip:**

- Memisahkan build environment dan runtime environment
- Menggunakan `adapter-node` untuk output production
- Optimasi image size menggunakan `node:20-alpine`
- Gunakan `.dockerignore` untuk meminimalkan build context

### 4.2 Kubernetes Manifests (k3d)

#### Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: zakat-system
```

#### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zakatflow
  namespace: zakat-system
spec:
  replicas: 2 # 1-2 replika
  selector:
    matchLabels:
      app: zakatflow
  template:
    metadata:
      labels:
        app: zakatflow
    spec:
      containers:
        - name: zakatflow
          image: zakatflow:latest
          ports:
            - containerPort: 3000
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "250m"
              memory: "256Mi"
          envFrom:
            - configMapRef:
                name: zakatflow-config
            - secretRef:
                name: zakatflow-secret
```

#### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: zakatflow-svc
  namespace: zakat-system
spec:
  type: ClusterIP
  selector:
    app: zakatflow
  ports:
    - port: 80
      targetPort: 3000
```

#### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: zakatflow-ingress
  namespace: zakat-system
spec:
  rules:
    - host: zakat.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: zakatflow-svc
                port:
                  number: 80
```

#### ConfigMap & Secret

```yaml
# ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: zakatflow-config
  namespace: zakat-system
data:
  SPREADSHEET_ID: "<your-spreadsheet-id>"

---
# Secret
apiVersion: v1
kind: Secret
metadata:
  name: zakatflow-secret
  namespace: zakat-system
type: Opaque
stringData:
  GOOGLE_AUTH_CREDENTIALS: "<base64-encoded-service-account-json>"
```

### 4.3 Diagram Arsitektur

```
┌──────────────────────────────────────────────────────────┐
│                    k3d Cluster                           │
│                                                          │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐ │
│  │   Traefik    │───▶│  zakatflow   │───▶│  Google     │ │
│  │   Ingress    │    │  Deployment  │    │  Sheets API │ │
│  │              │    │  (1-2 pods)  │    │             │ │
│  └─────────────┘    └──────────────┘    └─────────────┘ │
│        ▲                    │                             │
│        │              ┌─────┴─────┐                      │
│        │              │           │                       │
│        │         ConfigMap    Secret                      │
│        │       (SHEET_ID)  (GOOGLE_CREDS)                │
│        │                                                  │
└────────┼──────────────────────────────────────────────────┘
         │
    zakat.local
    (Browser)
```

---

## 5. Spesifikasi Desain (Glassmorphism UI)

### 5.1 Design Tokens

| Token                | Nilai                                   |
| -------------------- | --------------------------------------- |
| **Background**       | Deep Dark Blue/Slate dengan radial glow |
| **Card Background**  | `bg-white/10`                           |
| **Card Backdrop**    | `backdrop-blur-md`                      |
| **Card Border**      | `border border-white/20`                |
| **Card Shadow**      | `shadow-2xl`                            |
| **Input Focus**      | Border neon glow saat focus             |
| **Input Background** | Transparan (`bg-white/5`)               |
| **Font Primary**     | Inter / Outfit (Google Fonts)           |
| **Accent Color**     | Emerald Green / Teal (warna islami)     |
| **Text Primary**     | `text-white`                            |
| **Text Secondary**   | `text-white/70`                         |

### 5.2 Panduan Visual

```
┌─────────────────────────────────────────────────┐
│  Background: Gradient Dark Blue → Slate         │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│  │          ✦ Radial Glow Effect ✦            │ │
│  │                                             │ │
│  │   ┌───────────────────────────────────┐     │ │
│  │   │  🕌  ZakatFlow                   │     │ │
│  │   │  ─────────────────────────────    │     │ │
│  │   │  Glass Card (blur + transparency) │     │ │
│  │   │                                   │     │ │
│  │   │  ┌─────────────┐ ┌────────────┐   │     │ │
│  │   │  │  Input      │ │  Input     │   │     │ │
│  │   │  │  (neon glow)│ │  (neon)    │   │     │ │
│  │   │  └─────────────┘ └────────────┘   │     │ │
│  │   │                                   │     │ │
│  │   │  ┌────────────────────────────┐   │     │ │
│  │   │  │  Hasil Zakat: Rp X.XXX    │   │     │ │
│  │   │  └────────────────────────────┘   │     │ │
│  │   └───────────────────────────────────┘     │ │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
└─────────────────────────────────────────────────┘
```

### 5.3 Komponen CSS Utama

```css
/* Background utama */
.app-background {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* Radial glow effect */
.app-background::before {
  content: "";
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(
    circle,
    rgba(16, 185, 129, 0.15) 0%,
    transparent 70%
  );
  border-radius: 50%;
}

/* Glass card */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-radius: 1rem;
}

/* Input dengan neon glow */
.glass-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.3s ease;
}

.glass-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
  outline: none;
}
```

### 5.4 Animasi & Transisi

| Animasi           | Trigger                    | Svelte Directive             |
| ----------------- | -------------------------- | ---------------------------- |
| Fade In           | Mount komponen             | `transition:fade`            |
| Fly dari bawah    | Perpindahan kategori zakat | `transition:fly={{ y: 20 }}` |
| Slide             | Sidebar / panel            | `transition:slide`           |
| Scale             | Hover pada card            | CSS `transform: scale(1.02)` |
| Counter Animation | Hasil kalkulasi berubah    | Custom Svelte store          |

---

## 6. Struktur Data Google Sheets (Database)

### 6.1 Sheet: `Transaksi_Zakat`

| Kolom         | Tipe Data  | Deskripsi                                        | Contoh                 |
| ------------- | ---------- | ------------------------------------------------ | ---------------------- |
| `ID`          | `string`   | UUID Unik (`crypto.randomUUID()`)                | `a1b2c3d4-...`         |
| `Tanggal`     | `datetime` | Waktu transaksi dicatat                          | `2026-03-30T08:00:00Z` |
| `Kategori`    | `string`   | Jenis zakat yang dipilih                         | `Zakat Penghasilan`    |
| `Nilai_Harta` | `number`   | Nominal aset/hasil panen yang dihitung (Rp / kg) | `50000000`             |
| `Zakat_Wajib` | `number`   | Hasil kalkulasi sistem (Rp / kg)                 | `1250000`              |
| `Metode`      | `string`   | Keterangan tambahan (e.g., metode irigasi)       | `Irigasi 5%`           |
| `Status`      | `string`   | Status pembayaran: `Belum Bayar` / `Sudah Bayar` | `Sudah Bayar`          |
| `Catatan`     | `string`   | Catatan opsional dari pengguna                   | `Zakat bulan Ramadhan` |

### 6.2 Sheet: `Referensi_Harga`

| Kolom             | Tipe Data  | Deskripsi                         | Contoh       |
| ----------------- | ---------- | --------------------------------- | ------------ |
| `Jenis`           | `string`   | Jenis referensi harga             | `Emas`       |
| `Harga_Per_Unit`  | `number`   | Harga per unit (gram/kg/liter)    | `1100000`    |
| `Satuan`          | `string`   | Satuan unit                       | `gram`       |
| `Terakhir_Update` | `datetime` | Tanggal terakhir harga diperbarui | `2026-03-30` |

---

## 7. Halaman & Navigasi Aplikasi

### 7.1 Sitemap

```
/                     → Landing / Dashboard
/kalkulator           → Kalkulator Zakat (Pilih Kategori)
/kalkulator/fitrah    → Form Zakat Fitrah
/kalkulator/emas      → Form Zakat Emas/Perak
/kalkulator/penghasilan → Form Zakat Penghasilan
/kalkulator/perdagangan → Form Zakat Perdagangan
/kalkulator/pertanian → Form Zakat Pertanian
/kalkulator/peternakan   → Form Zakat Peternakan
/kalkulator/perikanan     → Form Zakat Perikanan
/riwayat              → Riwayat Pembayaran Zakat
/referensi            → Tabel Referensi Harga (Emas, Beras, dll)
```

### 7.2 Deskripsi Halaman

| Halaman             | Deskripsi                                                                   |
| ------------------- | --------------------------------------------------------------------------- |
| **Dashboard (`/`)** | Ringkasan total zakat yang sudah/belum dibayar, chart distribusi kategori   |
| **Kalkulator**      | Pilih kategori zakat → form input → hasil kalkulasi → simpan transaksi      |
| **Riwayat**         | Tabel data transaksi dengan filter kategori, status pembayaran, dan tanggal |
| **Referensi**       | Tabel harga referensi (emas, perak, beras) yang bisa di-update manual       |

---

## 8. API Endpoints & Server Logic

### 8.1 Server Routes (SvelteKit)

| Method   | Endpoint                 | Deskripsi                                 |
| -------- | ------------------------ | ----------------------------------------- |
| `GET`    | `/api/transaksi`         | Ambil semua data transaksi zakat          |
| `POST`   | `/api/transaksi`         | Simpan data transaksi zakat baru          |
| `PUT`    | `/api/transaksi/[id]`    | Update data transaksi berdasarkan ID      |
| `DELETE` | `/api/transaksi/[id]`    | Hapus data transaksi berdasarkan ID       |
| `GET`    | `/api/referensi`         | Ambil data referensi harga                |
| `PUT`    | `/api/referensi/[jenis]` | Update harga referensi                    |
| `POST`   | `/api/kalkulator`        | Hitung zakat berdasarkan input & kategori |

### 8.2 Contoh Request/Response

**POST `/api/kalkulator`**

```json
// Request
{
  "kategori": "penghasilan",
  "gaji_bulanan": 15000000,
  "harga_emas_per_gram": 1100000
}

// Response
{
  "nisab_tahunan": 93500000,
  "penghasilan_tahunan": 180000000,
  "wajib_zakat": true,
  "zakat_wajib": 4500000,
  "kadar": "2.5%",
  "keterangan": "Penghasilan tahunan melebihi nisab"
}
```

**POST `/api/transaksi`**

```json
// Request
{
  "kategori": "Zakat Penghasilan",
  "nilai_harta": 180000000,
  "zakat_wajib": 4500000,
  "metode": "2.5% dari penghasilan tahunan",
  "status": "Belum Bayar",
  "catatan": "Zakat penghasilan tahun 2026"
}

// Response
{
  "success": true,
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "message": "Transaksi berhasil disimpan"
}
```

---

## 9. Error Handling & Validasi

### 9.1 Validasi Input

| Field             | Aturan Validasi                                   |
| ----------------- | ------------------------------------------------- |
| Jumlah Jiwa       | Integer > 0                                       |
| Berat Emas/Perak  | Number > 0, max 2 desimal                         |
| Gaji              | Number > 0                                        |
| Modal/Kas/Piutang | Number >= 0                                       |
| Hutang            | Number >= 0                                       |
| Hasil Panen       | Number > 0 (dalam kg)                             |
| Kategori          | Harus salah satu dari enum kategori yang tersedia |

### 9.2 Error States

| Kode Error | Kondisi                        | Pesan ke User                                                     |
| ---------- | ------------------------------ | ----------------------------------------------------------------- |
| `400`      | Input tidak valid              | "Data yang dimasukkan tidak valid. Silakan periksa kembali."      |
| `404`      | Transaksi tidak ditemukan      | "Data transaksi tidak ditemukan."                                 |
| `500`      | Google Sheets API error        | "Terjadi kesalahan server. Silakan coba lagi."                    |
| `503`      | Koneksi ke Google Sheets gagal | "Layanan sedang tidak tersedia. Silakan coba beberapa saat lagi." |

### 9.3 Notifikasi UI

| Tipe        | Warna         | Penggunaan                                   |
| ----------- | ------------- | -------------------------------------------- |
| **Success** | Emerald/Green | Transaksi berhasil disimpan                  |
| **Warning** | Amber/Yellow  | Harta belum mencapai nisab                   |
| **Error**   | Red           | Input tidak valid / server error             |
| **Info**    | Blue/Teal     | Informasi umum (e.g., "Nisab saat ini: ...") |

---

## 10. Roadmap Implementasi

### Phase 1 — Foundation & UI Setup ✅ COMPLETED

> **Target:** Setup project SvelteKit + Tailwind CSS + Glassmorphism theme

- [x] Inisialisasi project SvelteKit
- [x] Install & konfigurasi Tailwind CSS
- [x] Setup Shadcn UI untuk Svelte
- [x] Implementasi design system Glassmorphism (background, glass cards, inputs)
- [x] Setup layout utama (navbar, sidebar/nav, footer)
- [x] Implementasi halaman Dashboard (placeholder)
- [x] Implementasi navigasi antar halaman

### Phase 2 — Kalkulator & Google Sheets Integration ✅ COMPLETED

> **Target:** Integrasi Google Sheets API + semua form kalkulator zakat

- [x] Setup Google Sheets API v4 (Service Account)
- [x] Buat utility functions untuk Google Sheets CRUD
- [x] Implementasi semua form kalkulator zakat (6 kategori)
- [x] Implementasi logika kalkulasi syariah
- [x] Implementasi API endpoints (`/api/transaksi`, `/api/kalkulator`, `/api/referensi`)
- [x] Simpan hasil kalkulasi ke Google Sheets
- [x] Implementasi halaman Riwayat dengan filter & tabel
- [x] Implementasi halaman Referensi Harga

### Phase 3 — Dockerization & Kubernetes Manifests

> **Target:** Containerize aplikasi & siapkan manifests Kubernetes

- [ ] Buat Dockerfile (multi-stage build)
- [ ] Buat `.dockerignore`
- [ ] Build & test Docker image secara lokal
- [ ] Buat Kubernetes manifests:
  - [ ] Namespace (`zakat-system`)
  - [ ] Deployment (1-2 replika)
  - [ ] Service (ClusterIP)
  - [ ] Ingress (Traefik → `zakat.local`)
  - [ ] ConfigMap & Secret
- [ ] Validasi manifests dengan `kubectl apply --dry-run`

### Phase 4 — Deployment & Testing

> **Target:** Deploy ke k3d dan pengujian end-to-end

- [ ] Buat cluster k3d baru
- [ ] Import Docker image ke k3d
- [ ] Deploy semua manifests ke cluster
- [ ] Konfigurasi `/etc/hosts` untuk `zakat.local`
- [ ] Testing end-to-end:
  - [ ] Akses `zakat.local` via browser
  - [ ] Test semua kalkulator zakat
  - [ ] Test CRUD transaksi ke Google Sheets
  - [ ] Test responsivitas UI
- [ ] Monitoring & troubleshooting

---

## 11. Acceptance Criteria

### Fungsional

- [ ] Semua 6 kategori kalkulator zakat berfungsi dengan kalkulasi yang benar sesuai syariah
- [ ] Data transaksi tersimpan dan terbaca dari Google Sheets secara real-time
- [ ] Filter riwayat berdasarkan kategori dan status berfungsi
- [ ] Referensi harga bisa di-update dan digunakan dalam kalkulasi
- [ ] Validasi input mencegah data tidak valid masuk ke sistem

### Non-Fungsional

- [ ] UI menggunakan tema Glassmorphism yang konsisten di semua halaman
- [ ] Animasi transisi Svelte berjalan smooth (fade, fly, slide)
- [ ] Aplikasi responsive di desktop dan mobile
- [ ] Docker image berukuran < 200MB
- [ ] Pods berjalan stabil di k3d tanpa crash loop
- [ ] Akses via `zakat.local` berjalan lancar melalui Traefik Ingress

---

> **Catatan:** PRD ini adalah living document yang akan diperbarui seiring berjalannya development. Setiap perubahan signifikan harus di-review dan disetujui oleh project owner.
