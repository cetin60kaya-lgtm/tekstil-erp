# ERP CONTEXT PACK (BAĞLAYICI HAFIZA)

## 0) Proje özeti
- Proje: Tekstil baskı ERP sistemi.
- Hedef: Basit ve net; “ön muhasebe” seviyesinde (resmi/genel muhasebe değil).
- Kritik: KDV (devreden dahil), cari hareketler, fatura/tahsilat/ödeme akışı.
- Veriler silinmez; pasiflenir. Audit log yaklaşımı.

## 1) Teknoloji ve mimari (kilitli)
- Backend: Node.js + NestJS
- DB: PostgreSQL
- ORM: Prisma (client output: ./generated/prisma)
- Frontend: React + Vite (tek gerçek frontend: erp-frontend)
- Web: PWA hedefi; Android APK (Kotlin) ayrıca.
- PDF raporlar modül olarak var.
- Backend port: 3101 (checkpoint).
- Frontend dev: 5173/5174 (duruma göre).

## 2) Repo ve çalışma prensipleri (kilitli)
- erp-web devre dışı: _DISABLED_erp-web (silinmez, aktif geliştirme yok).
- erp-frontend ana frontend.
- Frontend routing: react-router-dom zorunlu.
  - Route’lar: /, /muhasebe, /boyahane, /desen, /numune, /imalat
  - BoyahaneRenkBazli ayrı route: /boyahane/renk
- Asistan kod çıktısı kuralı: Kullanıcı kod verdiğinde, düzeltilmiş çıktı tek parça dosya içeriği olarak verilir (patch parçaları değil).

## 3) Modüller (yüksek seviye)
- Muhasebe çekirdek:
  - Cari (müşteri/tedarikçi)
  - Alış faturaları
  - Satış faturaları
  - Tahsilatlar / ödemeler
  - Cari hareket (cariIslem) mantığı
  - Cari bakiye raporu
- KDV:
  - Çıkan / indirilecek / devreden / ödenecek
  - Aylık kapanış yaklaşımı
  - PDF KDV raporları
- Sevkiyat:
  - IN/OUT endpointleri (IN’de floorColor zorunlu, OUT opsiyonel)
  - Takip/latest endpoint
- Desen & Boyahane:
  - Desen hazır olmadan boyahane üretime geçmez (iş emri akışı).
- Turlama & Fiyatlandırma (kilit kurallar):
  - Muhasebe içinde ayrı bölüm
  - Mail entegrasyonu yok; metin/ekran görüntüsü yapıştırma
  - Model bazlı tur takibi (1-2-3-final)
  - “m.k = yapılamaz” statüsü + zorunlu sebep
  - From/To/Cc kişileri kalıcı kaydedilir
  - Veri silinmez, pasiflenir; audit log zorunlu
  - Turlamadan model bazlı iş emrine dönüş
- İK/Yövmiye notu:
  - Maaşlı personel + yıllık izin (5 gün), resmi tatiller izinden düşmez
  - Yövmiyeci ayrı şifreli sayfa, vardiya gündüz/gece, haftalık özet fişi

## 4) UI/Şablon kararları (kilitli)
- Tüm modüller admin panelinden yönetilebilir:
  - Firma bilgisi, PDF font/punto, sözlükler, workflow, alan/form düzeni
  - Arşiv kaynakları: Local/OneDrive/GDrive
- İş Emri PDF şablonları:
  - Üst-Ön, Üst-Arka ayrı; Alt/Paça; Etek; Kol; Küçük baskı
  - Üstte firma adı + tipografi ayarı
- PSD kanal mantığı:
  - Kanal sayısı = renk/iş adımı
  - Sim/Kabaran ayrı tip; otomatik getirilebilir ama elle güncellenebilir

## 5) Boyahane paneli (kilitli detaylar)
- Renk kartı standardı:
  - Kare renk dolgusu + siyah çerçeve + Pantone kod altta
- Pantone havuzu:
  - Import + localStorage temelli havuz yaklaşımı denendi
- Rol kısıtı:
  - Desenci ve boyacı renk ayarı yapabilir; strict rol kısıtı yok
- Boyahane işleyiş:
  - Zorunlu seçimler: İş tipi (Numune/İmalat), Model, Renk kod+ad
  - Deneme yönetimi: son aktif, yeni, kopyala, pasif; kaydetmeden çıkış uyarısı
  - Boya türü değişince reçete sıfırlanır + varsayılan ürün satırları gelir
  - Reçete satırları: ürün autocomplete; G1–G4 sabit; toplam/kg/oran kilitli
  - Alt özet: salt okunur; Clear/White/Renk
  - LOT yönetimi: kg’sız; ürün satırında popup ile seçim; varsayılan lot
  - Model bağlama: snapshot mantığı (numune/imalat)
  - Gösterim standardı: “18-1663 – Kırmızı”
  - Model bazlı takip ekranı:
    - her renk satırına tıklanınca aynı ekranda detay (accordion)
    - her renk kendi gramaj tablosuna sahip
    - tabloda GR kolonları (en az 5); +GR ile yana, +Satır ile alta eklenir
    - Kaydet -> model belgesi snapshot
    - Değişiklik olursa renk durumu: DÜZENLENMİŞ
- Çalışılacak dosya sabit:
  - C:\ERP\erp-frontend\src\pages\BoyahaneRenkBazli.jsx

## 6) Güncel checkpoint notları
- Backend build + start:prod başarılı (checkpoint).
- Swagger’da aktif rotalar: cari/musteri, cari/tedarikci, alis-faturalar, satis-fatura, tahsilatlar, kdv/ozet, rapor/cari-bakiye.
- Prisma şema: datasource url env("DATABASE_URL") ile düzgün.
- QR sistemi soft askıda (QrController app.module.ts’ten çıkarıldı).
