# 📺 NDN Video Streaming with Next.js + Shaka + Docker

Platform video streaming modern berbasis [Named Data Networking (NDN)](https://named-data.net/) dan [Shaka Player](https://github.com/shaka-project/shaka-player), dibungkus dalam Next.js + Docker.

## 🚀 Fitur Utama

- ✅ **Next.js 14** 
- 📦 Streaming konten via protokol NDN
- 🎥 Integrasi **Shaka Player** dengan plugin `NdnPlugin`
- 🧠 Algoritma ABR:
  - Rate Based
  - Buffer Based
  - Hybrid
  - Neural Network (Brain.js)
- 📊 Statistik streaming real-time + kalkulasi QoE (masih develoment)
- 🐳 **Dockerized** dengan image <300MB 

---

## 📁 Struktur Project

```
src/
├── app/stream/video-player     # Logika utama player
├── components/component        # Komponen UI seperti Streaming, SelectAbr
├── ndn/                        # Koneksi & plugin NDN
├── abr/                        # Algoritma ABR
├── app/stream/StreamPage.jsx        # Halaman utama streaming
```

---

## 🔗 Cara Menjalankan Project

### ⚡ Opsi 1: Jalankan dengan Docker

#### 🔨 Build Image
```bash
docker build -t nextjs-app .
```

#### 🚀 Jalankan Container
```bash
docker run -p 3000:3000 nextjs-app
```

> Akses di: [http://localhost:3000](http://localhost:3000)

---

### ⚡ Opsi 2: Clone Manual dan Jalankan Lokal

#### 📦 Clone Repo
```bash
git clone https://github.com/Bilsyp/next-ndn-v1.git
cd next-ndn-v1
```

#### 📝 Install Dependencies
```bash
npm install
```

#### ⚙️ Jalankan Development Mode
```bash
npm run dev
```

> Akses di: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Demo Publik

Project ini juga tersedia secara live di:
🔗 [https://next-ndn-v1.vercel.app/](https://next-ndn-v1.vercel.app/)

---

## ⚙️ Config Opsional

- Tambahkan `.env` kalau perlu konfigurasi, contoh:
  ```env
  NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
  ```
- Gambar bisa ditaruh di `public/`
- Konfigurasi ABR ada di folder `abr/`
- Model Neural bisa di-load dari JSON via `brain.js`

---


## 🧑‍💻 Author

Made with ❤️ by [Bilsyp](https://github.com/Bilsyp) – Powered by cosmos
"Turning bandwidth into experience ☕️📡"

---


## 📃 Lisensi

MIT License

