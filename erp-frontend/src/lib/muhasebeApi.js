const BASE = "http://localhost:3100";

async function jget(url) {
  const r = await fetch(BASE + url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function jpost(url, body) {
  const r = await fetch(BASE + url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export const MuhasebeAPI = {
  // cariler
  cariler: () => jget("/cariler"),
  cariCreate: (dto) => jpost("/cariler", dto),

  // alis faturalar
  alisFaturalar: () => jget("/alis-faturalar"),
  alisFaturaCreate: (dto) => jpost("/alis-faturalar", dto),

  // tahsilatlar
  tahsilatlar: () => jget("/tahsilatlar"),
  tahsilatCreate: (dto) => jpost("/tahsilatlar", dto),

  // kdv rapor (mevcut)
  kdvRapor: (baslangic, bitis) => jget(`/kdv-rapor?baslangic=${encodeURIComponent(baslangic)}&bitis=${encodeURIComponent(bitis)}`),
};
