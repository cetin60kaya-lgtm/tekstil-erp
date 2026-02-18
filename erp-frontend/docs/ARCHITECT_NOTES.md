# ARCHITECT NOTES (BAĞLAYICI)

## [INIT]
- Bu dosya mimari kararların kaynağıdır ve bağlayıcıdır.
- Her görevden ÖNCE okunur; yeni karar varsa UYGULANIR.
- Silme yok; değişiklikler günlükle beraber ilerler.

## [2026-02-08]
- Boyahane tek modül, iki sekme (Kartlar | Renk Bazlı).
- Route, modül değildir; `/boyahane/renk` container içinde açılır.
- Kanonik URL (renk sekmesi): `/boyahane?tab=renk`.
- Renk Bazlı ekranda seçimlerin URL ile senkronu zorunlu:
  - Format: `/boyahane?tab=renk&model=<MODEL_ID>&renk=<RENK_KODU>`
  - `model`: Uygulamada MODEL anahtarının aynısı (şimdilik model adı).
  - `renk`: Rengin kodu (şimdilik `pantoneCode`).
- Refresh (F5) sonrası seçimler URL’den yeniden kurulmalı.
- Geri/ileri (history) ile seçim doğru değişmeli.
- URL yalnızca seçim değiştiğinde güncellenmeli; diğer query’ler korunmalı.
