import os
import time
import numpy as np
import sounddevice as sd
import pyautogui
import pyperclip

import openwakeword
from openwakeword.model import Model
from faster_whisper import WhisperModel

# === AYAR ===
WAKE_MODEL_NAME = "hey_mycroft_v0.1"   # şimdilik test wakeword
WAKE_THRESHOLD = 0.45

SAMPLE_RATE = 16000
CHUNK_MS = 80
CHUNK = int(SAMPLE_RATE * CHUNK_MS / 1000)

SILENCE_RMS = 0.010
SILENCE_SECONDS_TO_STOP = 1.0
MAX_COMMAND_SECONDS = 10

WHISPER_SIZE = "small"
WHISPER_DEVICE = "cpu"

def ensure_wake_model(model_name: str) -> str:
    pkg_dir = os.path.dirname(openwakeword.__file__)
    model_path = os.path.join(pkg_dir, "resources", "models", f"{model_name}.onnx")

    if not os.path.exists(model_path):
        print(f"[MODEL] Yok -> indiriyorum: {model_name}")
        openwakeword.utils.download_models(model_names=[model_name])
    else:
        print(f"[MODEL] Var: {model_path}")

    if not os.path.exists(model_path):
        raise RuntimeError(f"Model indirilemedi: {model_path}")

    return model_path

def rms(x: np.ndarray) -> float:
    x = x.astype(np.float32)
    return float(np.sqrt(np.mean(x * x) + 1e-12))

def record_command() -> np.ndarray:
    audio = []
    silence = 0.0
    start = time.time()

    with sd.InputStream(samplerate=SAMPLE_RATE, channels=1, dtype="float32", blocksize=CHUNK) as s:
        while True:
            b, _ = s.read(CHUNK)
            b = b.reshape(-1)
            audio.append(b.copy())

            if rms(b) < SILENCE_RMS:
                silence += CHUNK / SAMPLE_RATE
            else:
                silence = 0.0

            if silence >= SILENCE_SECONDS_TO_STOP:
                break
            if time.time() - start >= MAX_COMMAND_SECONDS:
                break

    return np.concatenate(audio, axis=0)

def send_to_chatgpt(text: str):
    text = (text or "").strip()
    if not text:
        return
    pyperclip.copy(text)
    time.sleep(0.05)
    pyautogui.hotkey("ctrl", "v")
    time.sleep(0.05)
    pyautogui.press("enter")

def main():
    print("=== HEY PAŞA SERVİSİ (TEST WAKEWORD) ===")
    print("ChatGPT penceresi aktif kalsın.")
    print("Wakeword: 'hey mycroft' (şimdilik)")

    wake_path = ensure_wake_model(WAKE_MODEL_NAME)

    ww = Model(wakeword_models=[wake_path])
    whisper = WhisperModel(WHISPER_SIZE, device=WHISPER_DEVICE)

    with sd.InputStream(samplerate=SAMPLE_RATE, channels=1, dtype="float32", blocksize=CHUNK) as stream:
        while True:
            block, _ = stream.read(CHUNK)
            block16 = (block.reshape(-1) * 32767).astype(np.int16)

            preds = ww.predict(block16)
            key = max(preds, key=lambda k: preds[k])
            score = float(preds[key])

            if score >= WAKE_THRESHOLD:
                print(f"[UYANDI] score={score:.2f}")
                time.sleep(0.15)

                audio = record_command()
                segs, _ = whisper.transcribe(audio, language="tr")
                text = "".join(s.text for s in segs).strip()

                print("[KOMUT]", text if text else "(boş)")
                if text:
                    send_to_chatgpt(text)

                time.sleep(1.0)

if __name__ == "__main__":
    main()
