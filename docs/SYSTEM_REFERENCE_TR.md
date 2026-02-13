# ERP Sistemi – Referans Dokümanı (REV-1)

Bu dosya, C:\ERP çalışma alanındaki sistemin genel mimarisini, çalışma biçimini ve önemli kararlarını hızlıca hatırlatmak için hazırlandı. Amaç: geliştirici için tek bakışta yol haritası ve çalıştırma rehberi sağlamak.

## Genel Bakış
- Monorepo yapı:
  - [erp-backend](../erp-backend) — NestJS + Prisma + PostgreSQL
  - [erp-frontend](../erp-frontend) — React (Vite)
  - [agent](../agent) — Yardımcı PowerShell betikleri (start/health/backup)
  - [prisma](../erp-backend/prisma) — Şema ve tohumlama (backend içinde)
- Hedef modüller: Muhasebe, Boyahane, Desen/Kalıp, Üretim, Lojistik, Raporlama.

## Çalıştırma (Lokal)
### 1) Ortam Değişkenleri
- Backend `.env` (klasör: erp-backend):
  - `DATABASE_URL=postgresql://user:pass@host:5432/db` (zorunlu)
  - `PORT` belirtilmezse backend 3101 portundan başlar.
- Frontend `.env` (klasör: erp-frontend):
  - `VITE_API_BASE_URL` veya `VITE_API_URL` (varsayılan: `http://localhost:3101`).

### 2) Komutlar
```powershell
# Backend
cd C:\ERP\erp-backend
npm i
npx prisma generate
npx prisma db push
npm run start:dev

# Frontend
cd C:\ERP\erp-frontend
npm i
npm run dev -- --host
```

### 3) Agent (opsiyonel kolaylık)
- [agent/agent.ps1](../agent/agent.ps1): `status | up | down | restart | health | swagger | tail | backup | prisma push|gen`
- Notlar:
  - Agent, varsayılan olarak backend=3100 ve frontend=5173 portlarını kontrol ediyor; backend gerçekte 3101 kullanıyor. Düzeltme gerektirir (bkz. “Gözlenen Tutarsızlıklar”).
  - `swagger` komutu `http://localhost:3100/docs` yazdırıyor; backend gerçek Swagger yolu `/swagger` (aşağıya bakınız).

## Backend
- Çatı: NestJS 11, TypeScript, Swagger, Class-Validator, Prisma (PostgreSQL, `@prisma/adapter-pg`).
- Giriş noktası: [src/main.ts](../erp-backend/src/main.ts)
  - CORS açık, global `ValidationPipe` aktif.
  - Swagger yolu: `/swagger`.
  - Port: `process.env.PORT || 3101`.
- Modüller: [src/app.module.ts](../erp-backend/src/app.module.ts)
  - Core: Health, AI (pasif), PrismaModule (global)
  - Muhasebe: Cari, Alış/Satış Fatura, Tahsilatlar, KDV, Ay Kapanış
  - Desen/Boya/Üretim: Kalıp Kart, Boyahane, İş Emri
  - Lojistik: Sevkiyat, Takip
  - Raporlama: PDF, Rapor
- Prisma:
  - Şema: [prisma/schema.prisma](../erp-backend/prisma/schema.prisma)
  - Client çıktısı: `generated/prisma` (backend kökü altında). PrismaService bu klasörden yüklüyor.
  - Konfig: [prisma.config.ts](../erp-backend/prisma.config.ts)
  - Komutlar: `npx prisma generate`, `npx prisma db push`.
- Önemli Servis – Boyahane
  - Controller: [boyahane.controller.ts](../erp-backend/src/modules/boya/boyahane/boyahane.controller.ts)
  - Service: [boyahane.service.ts](../erp-backend/src/modules/boya/boyahane/boyahane.service.ts)
  - Uçlar (özet):
    - `GET /boyahane/renk` — listeleme (filtreler: `aktif`, `boyaTuru`, `tip`, `q`, `limit`)
    - `POST /boyahane/renk` — yeni renk
    - `PATCH /boyahane/renk/:id` — güncelleme (tip/kod birleştirilerek `pantone` alanı oluşturulur)
    - `POST /boyahane/renk/:id/clone` — versiyon çoğaltma
  - Dönüşlerde, eksik `hex` için `fallbackHexFromKey()` ile deterministik bir renk üretiliyor.

### Veri Modeli (seçilmiş başlıklar)
- Boyahane: `BoyahaneRenk`, `BoyahaneModelRenk`
- Desen/Kalıp/Üretim: `model_karti`, `desen_karti + dosya/ölçü`, `kalip`, `is_emri`
- Muhasebe: `fatura + fatura_satir`, `musteri`, `tahsilat`, `kdv_ay_kapanis`
- Personel: `personel`, `puantaj_kaydi`
- Ortak: `dosya_asset`, `takip_kaydi`

## Frontend
- Çatı: React 19 + Vite 7.
- Giriş: [src/main.jsx](../erp-frontend/src/main.jsx), [src/App.jsx](../erp-frontend/src/App.jsx)
- Sayfalar: [src/pages](../erp-frontend/src/pages)
  - Boyahane: [BoyahanePage.jsx](../erp-frontend/src/pages/BoyahanePage.jsx)
  - Desen: [DesenPage.jsx](../erp-frontend/src/pages/DesenPage.jsx)
  - Muhasebe: [MuhasebePage.jsx](../erp-frontend/src/pages/MuhasebePage.jsx) (+ basit İK/Yevmiye mini)
  - Numune, İmalat, Kalıp Kart — iskelet ve örnekler
- API katmanı:
  - Genel: [src/api/api.js](../erp-frontend/src/api/api.js) — `API_BASE` (`VITE_API_BASE_URL`/`VITE_API_URL`), `apiGet/POST/PATCH`
  - Ek: [src/lib/api.js](../erp-frontend/src/lib/api.js) — Boyahane ve Model-Renk işlemleri
- Desen ↔ Boyahane köprüsü (REV-1):
  - [src/lib/modelStore.js](../erp-frontend/src/lib/modelStore.js) — `localStorage` tabanlı model ve renk kimliği havuzu. Desen sayfasındaki “Kaydet (Yayın)” Boyahane tarafınca görülebilecek veri formatını hazırlar. Backend bağlamaya uygun tasarlandı.

## Gözlenen Tutarsızlıklar / Notlar
- Port/Swagger uyumsuzluğu:
  - Backend gerçek Swagger yolu `/swagger`, port 3101. Agent `http://localhost:3100/docs` yazdırıyor. Düzeltilmeli.
- Başlatma .bat dosyaları karışık görünüyor:
  - [start-frontend.bat](../start-frontend.bat) backend’i; [start-backend.bat](../start-backend.bat) ise `erp-web`’i başlatıyor. İsimler veya içerik düzeltilmeli.
- Frontend API tabanı için iki değişken var (`VITE_API_BASE_URL` ve `VITE_API_URL`). Biri yeterli; ikincisi geriye dönük uyumluluk için tutuluyorsa dokümante edildi.

## Hızlı Test Akışı
1) PostgreSQL erişimini sağlayın ve `DATABASE_URL` tanımlayın.
2) Backend: `npm i && npx prisma generate && npx prisma db push && npm run start:dev`
3) Frontend: `npm i && npm run dev -- --host`
4) Tarayıcılar:
   - Frontend: `http://localhost:5173/`
   - Swagger: `http://localhost:3101/swagger`

## Kod Tarzı ve Konvansiyonlar
- Backend: NestJS modül/servis/controller standardı, DTO’larda class-validator, Swagger dekoratörleri.
- Prisma: Client çıktısı `generated/prisma`; servis bu yolu dinamik yükler.
- Frontend: Inline stil + küçük Card/Chip bileşenleri; global state yerine sayfa içi `useState`. REV-1’de kalıcı veri için `localStorage` tercih edilmiş.

## Yol Haritası (Öneri)
- Agent port ve Swagger yolu düzeltmeleri.
- `.bat` dosyalarının yeniden adlandırılması/düzenlenmesi.
- Desen `modelStore` verisinin backend’e taşınması (eşitleme uçları).
- Boyahane sayfasında `hex` için color-picker + giriş formatı doğrulaması (normalizeHex var, picker eklenebilir).
- Testler: En azından backend için temel e2e (Nest Test + Supertest).

---
Son güncelleme: 2026-02-08
