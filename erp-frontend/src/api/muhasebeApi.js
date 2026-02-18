// src/api/muhasebeApi.js
import { apiGet, apiPost } from "./api";

// REV-1 kilit: burada sadece PATH kullanıyoruz.
export const MuhasebeAPI = {
  health: () => apiGet("/health"),

  // Cari
  musteriListe: () => apiGet("/cari/musteri"),
  tedarikciListe: () => apiGet("/cari/tedarikci"),

  // Faturalar
  alisFaturaListe: () => apiGet("/alis-faturalar"),
  satisFaturaListe: () => apiGet("/satis-fatura"),

  // Tahsilat / Ödeme
  tahsilatListe: () => apiGet("/tahsilatlar"),
  odemeListe: () => apiGet("/odemeler"), // backend'de yoksa 404 olabilir; sayfada try/catch var

  // KDV
  kdvOzet: (yil, ay) => apiGet(`/kdv/ozet?yil=${encodeURIComponent(yil)}&ay=${encodeURIComponent(ay)}`),
};
