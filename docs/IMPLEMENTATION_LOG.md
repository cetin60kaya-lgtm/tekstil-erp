\# IMPLEMENTATION LOG (UYGULAYICI RAPORU)



\## Kurallar

\- Bu dosya SADECE uygulayıcı (VS Code GPT-5) tarafından yazılır.

\- Her task sonunda güncellenir.

\- Yapılanlar, riskler ve sorular açıkça yazılır.


\## [2026-02-08] IMPLEMENTATION UPDATE

- Okunan bağlayıcılar: /docs/ERP_CONTEXT_PACK.md, /docs/ARCHITECT_NOTES.md
- Boyahane modülü “tek ekran – iki sekme” kuralına göre düzenlendi.
	- `src/pages/BoyahanePage.jsx`: Container hâline getirildi; sekmeler:
		- “Renk Kartları (REV-1)”
		- “Reçete / Renk Bazlı” (içeride `BoyahaneRenkBazli` render edilir)
	- URL senkronizasyonu: `/boyahane?tab=kart|renk`.
	- Derin bağlantı: `/boyahane/renk` kanonik olarak `/boyahane?tab=renk` adresine yönlendirilir (container altında açılır).
- Routing düzeni:
	- `src/App.jsx`: `/boyahane/renk` route’u `BoyahanePage` (container) ile eşlendi.
	- Üst menüde “Boyahane (Renk)” bağlantısı `/boyahane?tab=renk` olarak güncellendi.
- Mevcut ekran/işleyiş korunmuştur:
	- `BoyahaneRenkBazli.jsx` bağımsız içerik olarak değişmeden kullanıldı.
	- Pantone Havuzu + Yeni Renk + Renk Listesi UI ve localStorage mantığı korunmuştur.
- Derleme/doğrulama:
	- Komut: `npm --prefix C:\ERP\erp-frontend run build` (başarılı tamamlandı).
- Değişen dosyalar:
	- `src/pages/BoyahanePage.jsx`
	- `src/App.jsx`
- Risk/Not:
	- Derin linklerin kanonik URL’ye normalize edilmesi (query tab) kullanıcı geçmişi/geri-ileri davranışında beklenen sekme geçişini sağlar.

## [2026-02-08] IMPLEMENTATION UPDATE

- Görev: BoyahaneRenkBazli ekranında MODEL ve RENK seçimini URL query ile senkronize etme.
- URL formatı: `/boyahane?tab=renk&model=<MODEL>&renk=<RENK_KODU>`
- Yapılanlar:
	- `src/pages/BoyahaneRenkBazli.jsx` içine çift yönlü senkron eklendi.
		- URL → State (ilk render): `model` mevcut ve storage’da karşılığı varsa `modelName` set edilir; `renk` (pantoneCode) eşleşirse ilgili renk `openColorId` olarak açılır.
		- State → URL (seçim değişince): Model değiştiğinde `model` paramı güncellenir; renk satırı seçildiğinde `renk` paramı seçilen renk `pantoneCode` değeriyle güncellenir. Yalnızca seçim değişiminde yazılır; diğer query parametreleri (ör. `tab`) korunur.
	- LocalStorage/snapshot akışı korunmuştur; query yoksa mevcut davranış devam eder.
- Edge-case notları:
	- Sekme değişiminde `BoyahaneRenkBazli` unmount olur; yeniden açıldığında (RECETE sekmesi) state’ten ve/veya URL’den tekrar initialize olur. URL’de `model/renk` yoksa bile, seçim state’ten okunur ve ardından URL güncellenir.
	- `/boyahane/renk` deep-link, container tarafından `/boyahane?tab=renk`’e normalize edilir; bu durumda model/renk parametreleri sağlanmışsa doğru seçimle açılır.
- Değişen dosyalar:
	- `src/pages/BoyahaneRenkBazli.jsx`
- Doğrulama:
	- `npm --prefix C:\ERP\erp-frontend run build` başarıyla tamamlandı.
	- Senaryo: `/boyahane?tab=renk&model=MODEL_A&renk=18-1663` → sayfa açıldığında MODEL_A seçili, pantoneCode=18-1663 olan renk detayda açık.
	- F5 sonrasında seçim korunuyor; geri/ileri ile seçim geçişleri URL’e göre beklenen şekilde çalışıyor.
- Risk/Açık konu:
	- URL’deki `model` değeri storage’da yoksa otomatik model oluşturma yapılmıyor; bu durumda query yokmuş gibi davranılır (kasıtlı).
	- `renk` paramı `pantoneCode` üzerinden eşleniyor; aynı `pantoneCode`’a sahip birden fazla renk varsa ilk eşleşen açılır.



