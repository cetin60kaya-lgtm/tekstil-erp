export function seed(){
  const key = "erp.proto.seed.v1";
  if (localStorage.getItem(key)) return;

  const now = new Date().toISOString();
  const data = {
    users: [
      { id:"u1", name:"Admin", role:"admin" },
      { id:"u2", name:"Muhasebe 1", role:"muhasebe" },
      { id:"u3", name:"İK 1", role:"ik" },
    ],
    timeline: [
      { id:"t1", at: now, type:"MODEL_CREATED", ref:"M-0001", by:"u2", note:"Model açıldı" },
      { id:"t2", at: now, type:"TUR_STARTED", ref:"M-0001", by:"u2", note:"Turlama 1 başlatıldı" },
    ],
    models: [
      { id:"m1", code:"M-0001", name:"18-1663 – Kırmızı", status:"AKTIF", createdAt: now }
    ],
    cariler: [
      { id:"c1", type:"MUSTERI", name:"ABC Tekstil", bakiye: 125000 },
      { id:"c2", type:"TEDARIKCI", name:"Boya A.Ş.", bakiye: -42000 }
    ],
    faturalar: [
      { id:"f1", type:"SATIS", cariId:"c1", no:"SF-0001", tutar: 150000, kdv: 30000, at: now },
      { id:"f2", type:"ALIS",  cariId:"c2", no:"AF-0007", tutar: 80000,  kdv: 16000, at: now }
    ],
    tahsilatlar: [
      { id:"th1", cariId:"c1", tutar: 50000, at: now, note:"Havale" }
    ],
    ik: {
      personel: [
        { id:"p1", ad:"Ahmet Yılmaz", tip:"MAASLI", gorev:"Operatör", maas: 35000, izinKalan: 5 },
        { id:"p2", ad:"Mehmet Kaya", tip:"YOVMIYE", vasif:"Usta", vardiya:"GUNDUZ", ucret: 1200 }
      ],
      yevmiye: [
        { id:"y1", personelId:"p2", hafta:"2026-W07", gun:"Pazartesi", vardiya:"GUNDUZ", tutar: 1200 }
      ]
    },
    turlama: [
      { id:"tr1", modelCode:"M-0001", turNo:1, status:"DEVAM", mkYapilamaz:false,
        participants:{ from:["a@x.com"], to:["b@x.com"], cc:["c@x.com"] },
        audit:[ { at: now, by:"u2", action:"CREATE", note:"Tur oluşturuldu" } ]
      }
    ],
    kaliplar: [
      { id:"k1", kalipNo:"60x70-001", modelCodes:["M-0001"],
        history:[ { at: now, by:"u1", action:"CREATE", note:"Kalıp açıldı" } ]
      }
    ]
  };

  localStorage.setItem("erp.proto.data.v1", JSON.stringify(data));
  localStorage.setItem(key, "1");
}

export function readData(){
  try { return JSON.parse(localStorage.getItem("erp.proto.data.v1") || "{}"); }
  catch { return {}; }
}
