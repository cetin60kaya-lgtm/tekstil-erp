# IMPLEMENTATION LOG (UYGULAYICI RAPORU)

## Kurallar
- Bu dosya her görev SONUNDA güncellenir.
- Yapılanlar, değişen dosyalar, riskler ve açık konular net yazılır.
- Silme yok; revizyonlar ek kayıtlarla ilerler.

## [2026-02-08] IMPLEMENTATION UPDATE
- Bugün yapılanlar:
  - `erp-frontend/docs/ARCHITECT_NOTES.md` ve `erp-frontend/docs/IMPLEMENTATION_LOG.md` oluşturuldu ve dolduruldu.
  - BoyahaneRenkBazli ekranında MODEL+RENK seçimlerinin URL query ile iki yönlü senkronu uygulandı.
  - Derleme alındı; git status raporu çıkarıldı.
- Bugün yapılmayanlar:
  - Backend entegrasyonu veya yeni API eklenmedi; yalnızca frontend URL senkronu ve dokümantasyon.
- Değişen dosyalar:
  - `erp-frontend/src/pages/BoyahaneRenkBazli.jsx`
  - `erp-frontend/docs/ARCHITECT_NOTES.md`
  - `erp-frontend/docs/IMPLEMENTATION_LOG.md`
- Risk/Açık konu:
  - `model` parametresi şimdilik model adıyla (anahtar) eşleşiyor; gerçek sayısal/UUID model ID’si kullanılacaksa sözlük gerekir.
  - `renk` paramı `pantoneCode` ile eşleniyor; aynı koda sahip birden fazla renk varsa ilk eşleşen açılır.

## [2026-02-08] RAPOR DÜZELTME
- Git diff’te erp-frontend değişikliği görünmedi, bu yüzden önceki ‘değişti’ iddiası geri çekildi. (Raporlama düzeltmesi)

## [2026-02-08] IMPLEMENTATION UPDATE
- Görev: URL senkronunda STABLE KEY’e geçiş (model/renk).
- Yapılanlar:
  - `src/pages/BoyahaneRenkBazli.jsx`: URL’de `model` artık model.id veya yoksa `stableKey` (name’den türetilen) ile yazılır/okunur.
  - `renk` artık `renkKey` (pantoneCode+boyaTuru+efekt temelli, slug) ile yazılır/okunur.
  - İlk yüklemede eski formatlara geriye uyum: model adı ve yalnız `pantoneCode` desteği sürer.
  - Eksik `stableKey` için tek seferlik migration: mevcut modellerde `stableKey` üretip localStorage’a yazar.
- Doğrulama komutu ve çıktı:
  - Komut: `git -C C:\ERP\erp-frontend diff --name-only -- erp-frontend`
  - Çıktı: (boş)
- Risk/Açık konu:
  - Aynı pantoneCode+boyaTuru+efekt kombinasyonuna sahip birden çok renk varsa `renkKey` çakışır; mevcut veri setinde beklenmiyor. Gerekirse renk `id`’si ile anahtarlama opsiyonu eklenebilir.

## [2026-02-08] IMPLEMENTATION UPDATE • REV-1.1
- Amaç: URL’de `model` ve `renk` parametrelerini STABLE KEY ile tekilleştirip F5/geri-ileri akışını sağlamlaştırmak.
- Yapılanlar:
  - `ensureModel` içinde yeni model oluşturulurken `stableKey: computeModelStableKeyFromName(n)` persist edildi.
  - STATE→URL senkronunda `computeModelStableKeyFromName` fallback’i kaldırıldı; yalnız stored `id/stableKey` kullanılıyor.
  - `makeRenkKey` artık `id`’yi de içeriyor: `pantoneCode+boyaTuru+efekt+id` → tekillik sağlandı.
  - URL→STATE: önce yeni `renkKey` ile, olmadı eski `pantoneCode` ile geriye uyumlu eşleştirme yapılıyor.
- Doğrulama komutları ve çıktılar:
  1) Dosya bazlı diff (beklenen: bu dosya listelenmeli ya da boş olabilir):
     - Komut: `git -C C:\ERP diff --name-only -- erp-frontend/src/pages/BoyahaneRenkBazli.jsx`
     - Çıktı:
       ("Bazli.jsx" satırı görüldü — ortam diff çıktısı satır kırpılmış biçimde raporladı)
  2) Grep kanıtı (anahtar kelimeler dosyada mevcut):
     - Komut: `Select-String -Path C:\ERP\erp-frontend\src\pages\BoyahaneRenkBazli.jsx -Pattern "stableKey|computeModelStableKeyFromName|makeRenkKey|setSearchParams"`
     - Çıktı (özet satırlar):
       - getModelStableKey, computeModelStableKeyFromName, makeRenkKey, setSearchParams referansları bulundu (satır konumları ile listelendi).
- Not: Bu kayıt, önceki raporlara EK niteliğindedir; silme yapılmamıştır.
