# ISYARA Backend
[![Framework](https://img.shields.io/badge/Framework-Express.js-blue?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-Supabase-green?style=for-the-badge&logo=supabase)](https://supabase.io/)
[![Language](https://img.shields.io/badge/Language-JavaScript-yellow?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Runtime](https://img.shields.io/badge/Runtime-Node.js-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Deployment](https://img.shields.io/badge/Deployment-Railway-purple?style=for-the-badge&logo=railway)](https://railway.app/)
[![API Docs](https://img.shields.io/badge/API_Docs-Swagger-orange?style=for-the-badge&logo=swagger)](https://swagger.io/)
[![Linter](https://img.shields.io/badge/Linter-ESLint-blueviolet?style=for-the-badge&logo=eslint)](https://eslint.org/)

Layanan backend untuk ISYARA, sebuah aplikasi pembelajaran Bahasa Isyarat Indonesia (BISINDO) yang dilengkapi dengan gamifikasi untuk meningkatkan pengalaman belajar.

Backend ini dibangun menggunakan Node.js, Express, dan terintegrasi dengan Supabase untuk layanan database dan autentikasi.

## Tech Stack

* **Framework Backend:** Express.js
* **Database & Autentikasi:** Supabase (PostgreSQL)
* **Bahasa:** JavaScript (ES Modules)
* **Deployment:** Railway
* **Dokumentasi API:** Swagger UI & OpenAPI
* **Linting/Formatting:** ESLint + Prettier

## Cara Replikasi Proyek

Proyek ini telah di-deploy dan kode sumbernya tersedia untuk umum. Berikut adalah cara mereplikasi proyek ini untuk pengembangan atau kontribusi Anda sendiri.

### Prasyarat

* Node.js (v18 atau lebih baru)
* Package manager `npm` atau `yarn`
* Akun Supabase (Tier gratis sudah cukup)
* Akun Google Cloud Platform untuk menyiapkan Google OAuth

### Instalasi & Pengaturan Lokal

1.  **Clone repositori ini:**
    ```sh
    git clone https://github.com/isyara-dev/isyara-backend.git
    cd isyara-backend
    ```

2.  **Instal semua dependensi:**
    ```sh
    npm install
    ```

3.  **Siapkan environment variables:**
    Buat file `.env` di direktori utama proyek. Lalu isi dengan variabel berikut:
    ```env
    # Kredensial Supabase
    SUPABASE_URL="your_supabase_project_url"
    SUPABASE_ANON_KEY="your_supabase_anon_key"
    SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

    # Konfigurasi Server
    PORT=3000
    ```
    Anda bisa mendapatkan kunci Supabase dari dasbor proyek Anda di bawah `Project Settings` > `API`.

### Konfigurasi Supabase

Agar backend berfungsi sepenuhnya, Anda perlu menyiapkan skema database dan fungsi di proyek Supabase Anda.

1.  **Tabel:**
    Berdasarkan controller dan service yang ada, Anda perlu membuat tabel-tabel berikut. Pastikan nama kolom dan tipe datanya sesuai dengan data yang ditangani di dalam controller (misalnya, `controllers/authController.js`, `controllers/progressController.js`).
    * `users`: Menyimpan informasi profil pengguna.
    * `sub_modules`: Berisi materi pembelajaran, seperti huruf atau isyarat individual.
    * `user_progress`: Melacak sub-modul mana yang telah diselesaikan oleh pengguna.
    * `words`: Menyimpan kata-kata untuk permainan tebak kata.
    * `user_scores`: Menyimpan skor terbaik pengguna dalam modul permainan.

2.  **Fungsi PostgreSQL (RPC):**
    Proyek ini menggunakan fungsi PostgreSQL untuk menangani query kompleks seperti menghitung progres dan papan peringkat. Buka `Database` > `Functions` di dasbor Supabase Anda dan buat fungsi-fungsi berikut:
    * `get_leaderboard(p_limit INT)`: Mengambil daftar pengguna teratas berdasarkan skor mereka.
    * `get_module_progress(p_user_id UUID, p_language_id INT)`: Menghitung dan mengembalikan progres penyelesaian setiap modul untuk pengguna tertentu.
    * `get_language_progress(user_id UUID)`: Menghitung dan mengembalikan progres keseluruhan untuk setiap bahasa yang tersedia.

3.  **Row Level Security (RLS):**
    Untuk penggunaan produksi, aktifkan Row Level Security (RLS) pada tabel Anda untuk melindungi data pengguna. Buat kebijakan yang mengatur pengguna mana yang dapat mengakses atau mengubah data. Sebagai contoh, seorang pengguna hanya boleh dapat memperbarui progres dan profilnya sendiri.

### Pengaturan Google OAuth

Untuk mengaktifkan fitur "Login dengan Google", Anda perlu mengonfigurasi Supabase dan Google Cloud.

1.  **Konfigurasi Supabase:**
    * Di dasbor Supabase Anda, buka `Authentication` > `Providers`.
    * Aktifkan provider Google dan isi Client ID serta Client Secret yang akan Anda dapatkan dari Google Cloud.
    * Tambahkan URI pengalihan resmi yang disediakan oleh Supabase (`https://<your-project-ref>.supabase.co/auth/v1/callback`) ke kredensial Google Cloud Anda.

2.  **Konfigurasi Google Cloud Console:**
    * Buka Google Cloud Console dan buat atau pilih sebuah proyek.
    * Buka `APIs & Services` > `Credentials`.
    * Buat sebuah `OAuth 2.0 Client ID`.
    * Tambahkan URL aplikasi frontend Anda (misalnya, `http://localhost:5173` untuk pengembangan) ke `Authorized JavaScript origins`.
    * Tambahkan URL callback Supabase ke `Authorized redirect URIs`.

Untuk panduan langkah demi langkah yang lebih rinci, silakan merujuk ke dokumentasi di dalam repositori ini: `docs/google-auth.md`.

### Menjalankan Aplikasi

* **Mode Pengembangan:**
    Untuk menjalankan server dengan fitur hot-reloading menggunakan `nodemon`:
    ```sh
    npm run dev
    ```
    Setelah berhasil, Anda akan melihat pesan di terminal:

   ```
   ✅ Server running at http://localhost:3000
   📚 Swagger docs available at http://localhost:3000/api-docs
   ```

* **Mode Produksi:**
    Untuk menjalankan server untuk lingkungan produksi:
    ```sh
    npm start
    ```
    Perintah ini menggunakan `node` untuk menjalankan file utama `index.js` secara langsung.

* **Linting:**
    Untuk memeriksa masalah kualitas kode menggunakan ESLint:
    ```sh
    npm run lint
    ```
   

## Autentikasi

Rute yang terproteksi memerlukan JSON Web Token (JWT) yang disediakan oleh Supabase setelah login berhasil. Sertakan token tersebut di header `Authorization` pada setiap permintaan Anda.

**Format:**
Authorization: Bearer <your_supabase_access_token>

## Dokumentasi API

Berikut adalah dokumentasi rinci untuk setiap endpoint yang tersedia di ISYARA Backend.

---

### 1. Health Check

Endpoint ini digunakan untuk memverifikasi status dan kesehatan layanan.

-   **`GET /api/health`**
    -   **Deskripsi:** Memeriksa apakah server berjalan dengan baik.
    -   **Autentikasi:** Publik.
    -   **Respons Sukses (200 OK):**
        ```json
        {
          "status": "ok"
        }
        ```
   

-   **`GET /api/health/db-test`**
    -   **Deskripsi:** Menguji koneksi ke database Supabase dan mengambil satu data sampel.
    -   **Autentikasi:** Publik.
    -   **Respons Sukses (200 OK):**
        ```json
        {
          "status": "ok",
          "message": "Database connection successful",
          "sample": [
            {
              "id": 1,
              "module_id": 1,
              "name": "A",
              "image_url": "[https://example.com/a.png](https://example.com/a.png)",
              "order_index": 1
            }
          ]
        }
        ```
    -   **Respons Gagal (500 Internal Server Error):**
        ```json
        {
            "status": "error",
            "message": "Database connection failed",
            "error": "error_details",
            "code": "error_code"
        }
        ```
   

---

### 2. Autentikasi (Auth)

Endpoint yang berhubungan dengan registrasi, login, dan manajemen sesi pengguna.

-   **`POST /api/auth/register`**
    -   **Deskripsi:** Mendaftarkan pengguna baru dengan email dan password.
    -   **Autentikasi:** Publik.
    -   **Request Body:**
        ```json
        {
          "email": "user@example.com",
          "password": "password123",
          "username": "newuser"
        }
        ```
    -   **Respons Sukses (201 Created):**
        ```json
        {
          "message": "Registration successful. Please check your email for verification.",
          "user": {
            "id": "user-uuid",
            "email": "user@example.com",
            "username": "newuser",
            "name": "newuser"
          }
        }
        ```
   

-   **`POST /api/auth/login`**
    -   **Deskripsi:** Login pengguna dengan email dan password untuk mendapatkan token akses.
    -   **Autentikasi:** Publik.
    -   **Request Body:**
        ```json
        {
          "email": "user@example.com",
          "password": "password123"
        }
        ```
    -   **Respons Sukses (200 OK):**
        ```json
        {
          "user": {
            "id": "user-uuid",
            "email": "user@example.com",
            "username": "testuser",
            "name": "testuser",
            "avatar_url": null
          },
          "access_token": "your_access_token",
          "refresh_token": "your_refresh_token",
          "expires_at": 1678886400,
          "supabase_session": { ... }
        }
        ```
   

-   **`POST /api/auth/save-user`**
    -   **Deskripsi:** Menyimpan atau memperbarui data pengguna setelah login via Google OAuth dari frontend. Backend akan memeriksa apakah pengguna sudah ada; jika tidak, pengguna baru akan dibuat.
    -   **Autentikasi:** Publik.
    -   **Request Body:**
        ```json
        {
          "id": "google-user-id",
          "email": "user.google@example.com",
          "username": "Google User",
          "avatar_url": "[http://link.to/avatar.jpg](http://link.to/avatar.jpg)"
        }
        ```
    -   **Respons Sukses (200 OK):**
        ```json
        {
          "id": "google-user-id",
          "email": "user.google@example.com",
          "username": "Google User",
          "name": null,
          "avatar_url": "[http://link.to/avatar.jpg](http://link.to/avatar.jpg)",
          "login_method": "google",
          ...
        }
        ```
   

-   **`GET /api/auth/me`**
    -   **Deskripsi:** Mendapatkan detail profil pengguna yang sedang login (berdasarkan token).
    -   **Autentikasi:** Terproteksi (membutuhkan Bearer Token).
    -   **Respons Sukses (200 OK):**
        ```json
        {
          "id": "user-uuid",
          "email": "user@example.com",
          "username": "myusername",
          "avatar_url": null,
          "created_at": "2023-01-01T00:00:00Z",
          "score": 150
        }
        ```
   

---

### 3. Konten (Hands & Words)

Endpoint untuk mendapatkan konten pembelajaran seperti isyarat tangan dan kata.

-   **`GET /api/hands`**
    -   **Deskripsi:** Mendapatkan semua data isyarat tangan. Dapat difilter berdasarkan modul atau sub-modul.
    -   **Autentikasi:** Publik.
    -   **Parameter Query (opsional):**
        -   `mod`: ID modul untuk memfilter.
        -   `sub`: ID sub-modul untuk memfilter.
    -   **Respons Sukses (200 OK):**
        ```json
        {
          "data": [
            { "name": "A", "image_url": "[https://example.com/images/bisindo_a.jpg](https://example.com/images/bisindo_a.jpg)" },
            { "name": "B", "image_url": "[https://example.com/images/bisindo_b.jpg](https://example.com/images/bisindo_b.jpg)" }
          ]
        }
        ```
   

-   **`GET /api/hands/:char`**
    -   **Deskripsi:** Mendapatkan data isyarat tangan untuk satu karakter spesifik.
    -   **Autentikasi:** Publik.
    -   **Parameter URL:** `char` (satu karakter, misal: 'A').
    -   **Respons Sukses (200 OK):** Mengembalikan objek sub-modul tunggal.
        ```json
        {
            "id": 1,
            "module_id": 1,
            "name": "A",
            "image_url": "[https://example.com/a.png](https://example.com/a.png)",
            "order_index": 1
        }
        ```
   

-   **`GET /api/words/random`**
    -   **Deskripsi:** Mendapatkan satu kata acak dari database untuk permainan.
    -   **Autentikasi:** Publik.
    -   **Respons Sukses (200 OK):**
        ```json
        {
          "id": 12,
          "word": "IBU",
          "points": 30
        }
        ```
   

-   **`POST /api/words/submit-session`**
    -   **Deskripsi:** Mengirimkan hasil sesi permainan kata untuk menghitung skor dan memperbarui skor tertinggi pengguna.
    -   **Autentikasi:** Terproteksi (membutuhkan Bearer Token).
    -   **Request Body:**
        ```json
        {
          "word_ids": [12, 15, 12]
        }
        ```
    -   **Respons Sukses (200 OK):**
        ```json
        {
          "success": true,
          "message": "New high score!",
          "score": 250,
          "update_at": "2023-10-27T10:00:00Z"
        }
        ```
   

---

### 4. Progres Belajar (Progress)

Semua endpoint di bawah ini terproteksi dan memerlukan Bearer Token.

-   **`POST /api/progress`**
    -   **Deskripsi:** Membuat atau memperbarui progres belajar pengguna untuk sebuah sub-modul.
    -   **Request Body:**
        ```json
        {
          "sub_module_id": 1,
          "is_completed": true
        }
        ```
    -   **Respons Sukses (200 OK):** Mengembalikan objek progres yang baru dibuat/diperbarui.
   

-   **`GET /api/progress/sub`**
    -   **Deskripsi:** Mendapatkan progres belajar untuk semua sub-modul, digabungkan dengan status penyelesaian pengguna. Dapat difilter per modul.
    -   **Parameter Query (opsional):** `mod` (ID modul).
    -   **Respons Sukses (200 OK):**
        ```json
        [
          {
            "id": 1,
            "module_id": 1,
            "name": "A",
            "image_url": "...",
            "order_index": 1,
            "is_completed": true,
            "has_progress": true
          }
        ]
        ```
   

-   **`GET /api/progress/module/:languageId`**
    -   **Deskripsi:** Mendapatkan rekap progres per modul untuk sebuah bahasa.
    -   **Parameter URL:** `languageId` (ID bahasa).
    -   **Respons Sukses (200 OK):**
        ```json
        [
            {
                "module_id": "1",
                "name": "Huruf A-D",
                "description": "A, B, C, D",
                "completed": 4,
                "total": 4
            }
        ]
        ```
   

-   **`GET /api/progress/language/`**
    -   **Deskripsi:** Mendapatkan rekap progres per bahasa untuk pengguna yang sedang login.
    -   **Respons Sukses (200 OK):**
        ```json
        [
          {
            "language_code": "BISINDO",
            "language_name": "Bahasa Isyarat Indonesia",
            "completed": 3,
            "total": 6
          }
        ]
        ```
   

---

### 5. Papan Peringkat (Leaderboard)

Endpoint untuk menampilkan peringkat pengguna berdasarkan skor.

-   **`GET /api/leaderboard`**
    -   **Deskripsi:** Mendapatkan daftar pengguna dengan peringkat teratas.
    -   **Autentikasi:** Publik.
    -   **Parameter Query (opsional):** `limit` (jumlah pengguna yang ingin ditampilkan, default: 10, maks: 100).
    -   **Respons Sukses (200 OK):**
        ```json
        [
          {
            "rank": 1,
            "user_id": "user-uuid-1",
            "username": "signmaster",
            "avatar_url": "...",
            "best_score": 980
          },
          {
            "rank": 2,
            "user_id": "user-uuid-2",
            "username": "deaflegend",
            "avatar_url": "...",
            "best_score": 870
          }
        ]
        ```
