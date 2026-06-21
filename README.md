# 🪑 Belenay Furniture Ecommerce & Accounting System
## Belenay Mobilya E-Ticaret ve Muhasebe Yönetim Sistemi

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0.0-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeORM](https://img.shields.io/badge/TypeORM-MySQL-orange?style=for-the-badge&logo=typeorm)](https://typeorm.io/)
[![Redis](https://img.shields.io/badge/Redis-6.x-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)

A modern, high-performance, and fully localized monorepo e-commerce application tailored for premium furniture shopping combined with a comprehensive administrative accounting, inventory, and salary management ledger.

Belenay Mobilya için geliştirilmiş; kapsamlı idari muhasebe, envanter, maaş bakiye takibi ve kampanya yönetimi paneline sahip, yüksek performanslı ve çok dilli modern monorepo e-ticaret uygulaması.

---

## 🌐 Language Support / Dil Desteği
The application is fully internationalized (`next-intl`) and optimized for cross-border operations, defaulting to Russian:
Uygulama tam uluslararasılaşma (`next-intl`) altyapısına sahiptir ve varsayılan olarak Rusça açılır:
* 🇷🇺 **Russian (Русский)** - Default / Varsayılan
* 🇹🇷 **Turkish (Türkçe)**
* 🇰🇬 **Kyrgyz (Кыргызча)**

---

## 🚀 Key Features / Öne Çıkan Özellikler

### 🛒 Client & E-Commerce / Müşteri & E-Ticaret Arayüzü
- **DB-Backed Cart & Favorites**: Synchronizes user carts and favorites automatically with the database across sessions and devices.
- **Dynamic Discounts**: Automatically inherits active category or store-wide campaign discounts on newly created products.
- **WhatsApp Order Integration**: Redirects users to WhatsApp with dynamic localized templates and stock codes for out-of-stock items.
- **Receipt Uploads**: Order checkout receipts are securely uploaded under dedicated subfolders (`./uploads/receipts/`).
- **Free Shipping Limit**: Dynamic checkout calculations based on backend-configured `min_free_shipping_limit` settings.

### 💼 Admin & Accounting / Yönetici & Muhasebe Arayüzü
- **Cumulative Salary Ledger**: Chronological running balance calculation (deserving vs paid) carrying forward debits and credits month-over-month.
- **Automated Sales Logs**: Instantly posts income transactions to the accounting ledger upon successful order processing and deletes them on order cancel/delete.
- **Radix UI Dialogs**: Fully animated custom confirm dialogs replacing default native browser prompts.
- **Random Stock Code Generator**: Unique stock code generator (`BLN-[6_ALPHANUMERIC]`) integrated into the product form.
- **Image Previews**: Verified path resolution mapping local and remote media sources smoothly using unified backend URLs.

---

## 🛠️ Architecture & Tech Stack / Mimari & Teknoloji Yığını

The project is structured as an npm workspaces monorepo:
Proje, npm workspaces monorepo yapısında tasarlanmıştır:

```
├── client/     # Next.js 15 SPA Frontend Application
├── server/     # NestJS Backend API Service
├── shared/     # Shared TypeScript typings and interfaces
```

### Frontend (Client)
- **Next.js 15** (App Router, Server Actions, React 19)
- **Tailwind CSS v4** (Modern utility-first styling)
- **Zustand** (Global state management with API synchronization)
- **TanStack Query (React Query)** (Server state management and caching)
- **Radix UI** (Accessible primitives for modals and dialogs)
- **Framer Motion** (Smooth transitions and micro-animations)

### Backend (Server)
- **NestJS** (Modular progressive Node.js framework)
- **TypeORM & MySQL** (Entity relation mapping & robust database layout)
- **Redis** (Blacklists, caching, and rate-limiting storage)
- **Passport.js & Better Auth** (JWT token refresh cycles, Google/Apple OAuth strategy)

---

## ⚙️ Installation & Setup / Kurulum ve Yapılandırma

### Prerequisites / Gereksinimler
- Node.js (v18 or higher)
- MySQL Database
- Redis Server

### 1. Clone the repository / Projeyi Klonlayın
```bash
git clone https://github.com/emircannn/fullstack-furnitureecommerce.git
cd fullstack-furnitureecommerce
```

### 2. Configure Environment Variables / Ortam Değişkenleri
Create a `.env` file in the root directory:
Kök dizinde bir `.env` dosyası oluşturun:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=belenaymebel
DB_USER=root
DB_PASSWORD=your_password
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_ACCESS_SECRET=your_unique_access_key
JWT_REFRESH_SECRET=your_unique_refresh_key
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Install Dependencies / Bağımlılıkları Yükleyin
```bash
npm install
```

### 4. Run Locally / Yerel Sunucuyu Başlatın
```bash
# Run both Frontend & Backend concurrently
# Hem Frontend hem de Backend uygulamasını aynı anda çalıştırın
npm run dev:server
npm run dev:client
```

---

## 📦 Production Build / Canlı Sürüm Derleme
Ensure there are no compilation or type-checking issues:
Uygulamayı hatasız bir şekilde derlemek için:
```bash
# Build NestJS Server
npm run build:server

# Build Next.js Client
npm run build:client
```

---

## 📄 License / Lisans
This project is licensed under the MIT License.
Bu proje MIT lisansı altında korunmaktadır.
