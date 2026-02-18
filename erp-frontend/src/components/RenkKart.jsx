export default function RenkKart({
  item,
  onEdit,
  onClone,
  onToggle,
  onQuickHexOpen,
  isInModel,
  onToggleModel,
}) {
  const hex = item.hexRenk || item.viewHex || "#888888";
  const isAktif = !!item.aktif;

  const badge = item.isImalat
    ? { text: "İmalat", cls: "bg-blue-100 text-blue-800 border-blue-300" }
    : item.isNumune
    ? { text: "Numune", cls: "bg-yellow-100 text-yellow-800 border-yellow-300" }
    : null;

  const tipLabel = item.tip === "MUSTERI" ? "Müşteri" : "Pantone";

  return (
    <div
      className={[
        "border rounded-2xl p-3 bg-white shadow-sm transition relative",
        "hover:shadow-md hover:-translate-y-0.5",
        isAktif ? "opacity-100" : "opacity-60 bg-gray-50",
      ].join(" ")}
    >
      {badge ? (
        <span
          className={[
            "absolute top-2 right-2 text-[11px] px-2 py-0.5 rounded-full border",
            badge.cls,
          ].join(" ")}
        >
          {badge.text}
        </span>
      ) : null}

      <button className="w-full text-left" onClick={() => onEdit(item)} title="Düzenle">
        <div
          className={[
            "w-full aspect-square rounded-xl border-2 border-black",
            "transition-transform hover:scale-[1.02]",
            !isAktif ? "grayscale" : "",
          ].join(" ")}
          style={{ background: hex }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickHexOpen?.(item);
          }}
          role="button"
          aria-label="Renk hex hızlı düzenle"
        />

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="text-sm font-bold truncate">{item.kod}</div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded-full border bg-gray-50">{tipLabel}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full border">{isAktif ? "Aktif" : "Pasif"}</span>
          </div>
        </div>

        <div className="text-xs opacity-80 mt-0.5">{item.boyaTuru} • {item.versiyon}</div>
        {item.not ? <div className="text-xs mt-1 opacity-70 line-clamp-2">{item.not}</div> : null}
      </button>

      <div className="flex gap-2 mt-3">
        <button className="flex-1 px-2 py-2 text-xs border rounded-xl hover:bg-gray-50" onClick={() => onClone(item)}>
          Versiyonla
        </button>
        <button className="flex-1 px-2 py-2 text-xs border rounded-xl hover:bg-gray-50" onClick={() => onToggle(item)}>
          {isAktif ? "Pasif Yap" : "Aktif Yap"}
        </button>
      </div>

      <div className="mt-2">
        <button
          className={[
            "w-full px-2 py-2 text-xs border rounded-xl transition",
            isInModel ? "bg-gray-50" : "hover:bg-gray-50"
          ].join(" ")}
          onClick={() => onToggleModel?.(item)}
          title={isInModel ? "Modelden çıkar" : "Modele ekle"}
        >
          {isInModel ? "Modelden Çıkar" : "Modele Ekle"}
        </button>
      </div>
    </div>
  );
}
