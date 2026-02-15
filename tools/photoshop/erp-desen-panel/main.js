import photoshop from "photoshop";

const { app, core, action } = photoshop;

const $ = (id) => document.getElementById(id);

function log(msg) {
  const el = $("log");
  if (!el) return;
  el.textContent = `${new Date().toLocaleTimeString()}  ${msg}\n` + el.textContent;
}

async function ensureDoc() {
  if (!app.documents || app.documents.length === 0) {
    throw new Error("Açık bir PSD/doküman yok. Önce Photoshop’ta bir dosya aç.");
  }
}

async function addTextLayer(text) {
  await ensureDoc();
  await core.executeAsModal(async () => {
    const doc = app.activeDocument;
    const layer = await doc.artLayers.add();
    layer.kind = "textLayer";
    layer.name = "ERP_TEXT";
    layer.textItem.contents = text || "Merhaba ERP";
    layer.textItem.size = 36;
  }, { commandName: "ERP Desen Panel: Add Text Layer" });
}

async function renameActiveLayer(newName) {
  await ensureDoc();
  await core.executeAsModal(async () => {
    const doc = app.activeDocument;
    const layer = doc.activeLayers?.[0];
    if (!layer) throw new Error("Aktif layer yok.");
    layer.name = newName || ("ERP_LAYER_" + Date.now());
  }, { commandName: "ERP Desen Panel: Rename Active Layer" });
}

/**
 * Kanal oluşturma TEST'i:
 * - En stabil başlangıç: yeni bir "alpha channel" oluşturur (Channels panelinde görünür).
 * - Sonraki adımda bunu gerçek Spot Channel'a yükselteceğiz (renk/solid/spotColor).
 */
async function createChannelTest(channelName) {
  await ensureDoc();
  await core.executeAsModal(async () => {
    const name = (channelName || "").trim() || ("ERP_SPOT_TEST_" + Date.now());

    await action.batchPlay(
      [
        {
          _obj: "make",
          _target: [{ _ref: "channel" }],
          using: { _obj: "channel", name }
        }
      ],
      { synchronousExecution: false, modalBehavior: "execute" }
    );
  }, { commandName: "ERP Desen Panel: Create Channel Test" });
}

function wireUI() {
  $("btnAddText").addEventListener("click", async () => {
    try {
      await addTextLayer($("txt").value);
      log("OK: Text layer eklendi (ERP_TEXT).");
    } catch (e) {
      log("HATA: " + (e?.message || e));
    }
  });

  $("btnRename").addEventListener("click", async () => {
    try {
      await renameActiveLayer("ERP_RENAMED_" + Date.now());
      log("OK: Aktif layer adı değişti.");
    } catch (e) {
      log("HATA: " + (e?.message || e));
    }
  });

  $("btnSpot").addEventListener("click", async () => {
    try {
      await createChannelTest($("chName").value);
      log("OK: Kanal oluşturuldu (Channels panelini kontrol et).");
    } catch (e) {
      log("HATA: " + (e?.message || e));
    }
  });

  log("Panel hazır. 1) PSD aç 2) Test butonlarına bas.");
}

document.addEventListener("DOMContentLoaded", wireUI);
