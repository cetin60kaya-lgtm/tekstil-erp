# ERP Full + Kalıp Kart (DEV2) — 20260125_172629

Bu paket, temizlenmiş ERP paketinin üzerine **Kalıp Kartı modülünün gerçek backend iskeletini** ekler.

## Backend
- `src/kalip-kart/` modülü eklendi:
  - `GET /kalip-kart`
  - `GET /kalip-kart/:id`
  - `POST /kalip-kart`
  - `POST /kalip-kart/:id/yerlesim`
  - `POST /kalip-kart/yerlesim/:id/desen`
  - `PATCH /kalip-kart/yerlesim-desen/:id/imalat`
- `prisma/schema.prisma` içine Kalıp Kartı tabloları eklendi.

## Frontend
- `src/pages/KalipKartPage.jsx` eklendi/korundu.
- Basit hash route: `/#kalip` => Kalıp Kart sayfası (mevcut App.jsx uygunsa).

## Çalıştırma
### Backend
```powershell
cd C:\ERP\erp-backend
npm i
npx prisma generate
npx prisma db push
npm run start:dev
```

### Frontend
```powershell
cd C:\ERP\erp-frontend
npm i
npm run dev
```
