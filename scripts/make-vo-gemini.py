"""Vertelstem voor de animatic met Gemini TTS (gratis sleutel van Google AI Studio): een diepe, zware
Nederlandse mannenstem, per regel naar m4a, met tijdcodes per woord voor het meelezen (zelfde formaat als
make-vo.py, dus de site merkt niets).

De sleutel komt uit GOOGLE_API_KEY / GEMINI_API_KEY of uit ~/.config/skills/.env (daar zet je hem zelf neer,
één regel: GOOGLE_API_KEY=...). Het script laat de sleutel nooit zien.

Gebruik:
    python3 scripts/make-vo-gemini.py --proef Charon Algenib Gacrux   # dezelfde drie regels per stem, in art/stem-test/, met controle
    python3 scripts/make-vo-gemini.py --stem Algenib                   # alle regels uit vo.json, naar public/animatic/vo/
    python3 scripts/make-vo-gemini.py --schoon                         # ruisstoot aan het eind weghalen, zonder opnieuw op te nemen
    python3 scripts/make-vo-gemini.py --taal en --stem Algenib         # de Engelse versie (vo.en.json, naar public/animatic/vo/en/)
    python3 scripts/make-vo-gemini.py --taal en --pauzes 0.8           # te lange stiltes midden in een zin inkorten
    python3 scripts/make-vo-gemini.py --taal en --sneller 13 14        # deze regels iets sneller (standaard 1,15×)

Het gratis gebruik heeft een kleine daglimiet (10 verzoeken per dag voor dit model). Elke regel is één verzoek; na elke
regel wordt opgeslagen, dus stopt het bij de limiet, dan gaat het de volgende dag verder. Wat niet veranderd is, wordt
niet opnieuw gemaakt.
Gemini geeft geen tijd per woord terug: die wordt per regel geschat (naar woordlengte en leestekens).
"""
import argparse
import base64
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import wave
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src/animatic/vo.json"
OUT = ROOT / "public/animatic/vo"
TEST = ROOT / "art/stem-test"
# Opnames komen eerst hier; pas als álle regels klaar zijn, gaan ze samen naar de animatic (geen mix van twee stemmen)
STAGE = TEST / "gemini-vo"
MODEL = "gemini-3.8-flash-tts"
# Andere spraakmodellen met dezelfde stemmen, elk met een eigen gratis daglimiet (--model): om niet op morgen te wachten
MODELS = ["gemini-3.8-flash-tts", "gemini-3.1-flash-tts-preview", "gemini-3.8-flash-lite-tts", "gemini-2.5-flash-preview-tts", "gemini-2.5-pro-preview-tts"]
CHECK = "gemini-3.8-flash"  # luistert mee: schrijft uit wat er echt gezegd is
api = lambda: f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

# De regie voor de stem, in de opbouw die Google voor TTS aanraadt: alleen het TRANSCRIPT wordt uitgesproken.
# (Losse instructies in de tekst leest het model hardop voor; een systeeminstructie kent het TTS-model niet.)
DIRECTION = """# AUDIO PROFILE: Daan
A Dutch man of 34, a former boxer. A deep, heavy, slightly gravelly voice, low in the chest, close to the microphone.

## THE SCENE
A dark, intimate film in black and white. We hear his inner voice, his own thoughts, never a performance.

### DIRECTOR'S NOTES
Style: restrained and honest, never theatrical, never announcing.
Pace: slow. A short natural pause after every sentence. A silence of about two seconds between paragraphs.
Accent: native Netherlands Dutch.

#### TRANSCRIPT
"""
# De tweede stem: de drang. Dezelfde man, maar fluisterend, te dichtbij (regels met een sleutel die begint met "drang-")
DRANG = """# AUDIO PROFILE: De drang
The same man, Daan, but this is the voice of his craving inside his head: a whisper, very close to the ear, intimate and persuasive, almost tender, with a cold edge.

## THE SCENE
A dark film in black and white. The craving talks to him; it is his own voice turned against him.

### DIRECTOR'S NOTES
Style: whispered and breathy, never loud, never cartoonish.
Pace: unhurried, a breath before each line. A silence of about two seconds between paragraphs.
Accent: native Netherlands Dutch.

#### TRANSCRIPT
"""
# De derde stem: Noor, zijn dochter van zeven, als ze de deur opendoet (regels met een sleutel die begint met "noor-")
NOOR = """# AUDIO PROFILE: Noor
A little Dutch girl of about seven, Daan's daughter. A small, sweet, light child's voice, soft and a little breathy.

## THE SCENE
Early morning. She opens the front door and her father is standing there, after two years. She can hardly believe it.

### DIRECTOR'S NOTES
Style: tender and unsure, a quiet question full of hope, as if she is afraid it is not real. Never cute on purpose, never loud.
Pace: slow, a tiny breath before the word; the word rises at the end, like a question.
Accent: native Netherlands Dutch.

#### TRANSCRIPT
"""
# Per stem: de regie en het tempo (Daan iets trager dan het model hem uit zichzelf zegt; de toonhoogte blijft gelijk)
ROLES = {"daan": (DIRECTION, 0.93), "drang": (DRANG, 1.0), "noor": (NOOR, 1.0)}
LANG_CODE, LANG_NAME = "nl-NL", "Dutch"


def english():
    """De Engelse versie: dezelfde stemmen en regie, maar in natuurlijk Engels, met eigen bestanden en mappen (de
    Nederlandse opnames blijven staan)."""
    global SRC, OUT, STAGE, ROLES, LANG_CODE, LANG_NAME
    SRC, OUT, STAGE = ROOT / "src/animatic/vo.en.json", ROOT / "public/animatic/vo/en", TEST / "gemini-vo-en"
    accent = lambda d: d.replace("Accent: native Netherlands Dutch.", "Accent: natural, neutral English, no regional accent.")
    ROLES = {k: (accent(d), tempo) for k, (d, tempo) in ROLES.items()}
    LANG_CODE, LANG_NAME = "en-US", "English"
# Een eigen stem en toonhoogte per rol (de rest gebruikt de stem van --stem): Noor is een jonge stem, iets hoger gezet
# (+2,4 halve tonen, ook de klankkleur), zodat er een kind praat in plaats van een jonge vrouw
VOICE = {"noor": "Leda"}
PITCH = {"noor": 1.15}


def role(key: str) -> str:
    return "drang" if key.startswith("drang-") else "noor" if key.startswith("noor-") else "daan"


BATCH = 1  # regels per verzoek: één regel per opname (knippen op stiltes bleek onbetrouwbaar; de pauzes van het model wisselen te veel)
WAIT = 22  # seconden tussen verzoeken (gratis: een paar per minuut)
LEAD = 0.12
# Het einde: stilte eraf en de laatste 40 ms zacht laten uitlopen (geen tik als de stem stopt)
TAIL = "areverse,silenceremove=start_periods=1:start_threshold=-45dB,afade=t=in:d=0.04,areverse"
FILM ="lowshelf=g=2.5:f=120,acompressor=threshold=-18dB:ratio=2.5:attack=10:release=200:makeup=2,alimiter=limit=0.95"
PROEF = ["1", "13", "17"]
PAUSE = {".": 22, "!": 22, "?": 22, ",": 9, ";": 9, ":": 9}


def key() -> str:
    k = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    env = Path.home() / ".config/skills/.env"
    if not k and env.exists():
        for line in env.read_text().splitlines():
            name, _, value = line.strip().partition("=")
            if name.strip() in ("GOOGLE_API_KEY", "GEMINI_API_KEY"):
                k = value.strip().strip('"').strip("'")
    if not k:
        sys.exit("Geen GOOGLE_API_KEY gevonden (omgeving of ~/.config/skills/.env).")
    return k


last_call = 0.0


def tts(voice: str, lines: list[str], wav: Path, direction: str = DIRECTION):
    """Eén verzoek: de regels als alinea's achter elkaar, als 24 kHz mono wav."""
    global last_call
    wait = WAIT - (time.time() - last_call)
    if last_call and wait > 0:
        time.sleep(wait)
    body = {
        "contents": [{"parts": [{"text": direction + "\n\n".join(lines)}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            # Altijd de taal van deze versie: bij korte regels ("Noor. Mijn dochter.") raadt het model anders soms Duits
            "speechConfig": {"languageCode": LANG_CODE, "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}},
        },
    }
    for attempt in range(3):
        req = Request(api(), data=json.dumps(body).encode(), headers={"x-goog-api-key": key(), "Content-Type": "application/json"})
        try:
            with urlopen(req, timeout=300) as r:
                data = json.loads(r.read())
            break
        except HTTPError as e:
            msg = e.read().decode(errors="replace")[:400]
            if e.code == 400 and "language" in msg.lower() and "languageCode" in body["generationConfig"]["speechConfig"]:
                # Kent dit model de taalcode niet, dan zonder (de regie vraagt al om de taal)
                del body["generationConfig"]["speechConfig"]["languageCode"]
                continue
            if e.code == 429 and attempt < 2 and "free_tier_requests, limit" not in msg:
                print("  limiet bereikt, even wachten…")
                time.sleep(65)
                continue
            sys.exit(f"Gemini gaf {e.code}: {msg}")
    last_call = time.time()
    part = data["candidates"][0]["content"]["parts"][0]
    pcm = base64.b64decode(part["inlineData"]["data"])
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(24000)
        w.writeframes(pcm)


def ff(*args, capture=False):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-y", *map(str, args)], capture_output=True, text=True)
    if r.returncode:
        sys.exit(r.stderr[-400:])
    return r.stderr


def seconds(path: Path) -> float:
    info = subprocess.run(["afinfo", str(path)], capture_output=True, text=True).stdout
    return float(re.search(r"estimated duration: ([\d.]+)", info).group(1))


def split(wav: Path, texts: list[str]):
    """De regels in één opname losknippen. Niet simpelweg op de langste stiltes (een pauze binnen een regel kan
    langer zijn dan die tussen twee regels), maar op de stiltes die het best passen bij hoe lang elke regel zou moeten
    duren (naar het aantal letters), met een voorkeur voor lange stiltes. (begin, eind) per regel, in seconden."""
    n = len(texts)
    total = seconds(wav)
    if n == 1:
        return [(0.0, total)]
    log = ff("-i", wav, "-af", "silencedetect=noise=-40dB:d=0.25", "-f", "null", "-")
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    gaps = [g for g in zip(starts, ends) if g[0] > 0.3 and g[1] < total - 0.3]
    if len(gaps) < n - 1:
        return None
    w = [len(t) for t in texts]
    targets = [total * sum(w[:k + 1]) / sum(w) for k in range(n - 1)]
    cost = lambda k, g: abs((g[0] + g[1]) / 2 - targets[k]) - 0.6 * min(g[1] - g[0], 2.5)
    # Kortste pad: voor elke knip k een stilte, in volgorde
    best = [[cost(0, g) for g in gaps]]
    back = [[-1] * len(gaps)]
    for k in range(1, n - 1):
        row, brow = [], []
        for j, g in enumerate(gaps):
            prev = [(best[k - 1][i], i) for i in range(j)]
            if not prev:
                row.append(float("inf"))
                brow.append(-1)
                continue
            c, i = min(prev)
            row.append(c + cost(k, g))
            brow.append(i)
        best.append(row)
        back.append(brow)
    j = min(range(len(gaps)), key=lambda x: best[-1][x])
    if best[-1][j] == float("inf"):
        return None
    chosen = []
    for k in range(n - 2, -1, -1):
        chosen.append(gaps[j])
        j = back[k][j]
    chosen.reverse()
    cuts = [0.0] + [x for g in chosen for x in g] + [total]
    return [(cuts[2 * i], cuts[2 * i + 1]) for i in range(n)]


def plausible(parts, texts):
    """Klopt elke stuk ongeveer met zijn regel? (spreektempo uit de opname zelf). Geeft de regels die niet kloppen."""
    lengths = [b - a for a, b in parts]
    rate = sum(lengths) / sum(len(t) for t in texts)
    return [i for i, (d, t) in enumerate(zip(lengths, texts)) if abs(d - rate * len(t)) > max(0.6, 0.3 * rate * len(t))]


def words_with_times(text: str, total: float):
    """Verdeel de duur over de woorden naar lengte, met pauzes na leestekens."""
    words = text.split()
    weights = [len(re.sub(r"\W", "", w)) + 2 for w in words]
    pauses = [PAUSE.get(w[-1], 0) for w in words]
    unit = total / (sum(weights) + sum(pauses[:-1]))
    t, out = LEAD, []
    for w, k, p in zip(words, weights, pauses):
        out.append({"text": w, "start": round(t, 3), "end": round(t + k * unit, 3)})
        t += (k + p) * unit
    return out


def tail_noise(path: Path):
    """Gemini zet soms een ruisstoot achter de laatste zin: na een korte stilte ~0,13 s gesis, even hard als de stem.
    Geeft het moment (in seconden) net na de laatste zin, of None als het einde schoon is. Niet vlak vóór de stoot:
    die begint soms al met een tik in de stilte."""
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", str(path), "-f", "s16le", "-ac", "1", "-ar", "44100", "-"],
                         capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
    w = 441  # vensters van 10 ms
    frames = x[: len(x) // w * w].reshape(-1, w)
    rms = np.sqrt((frames ** 2).mean(axis=1))
    loud = rms > 0.01  # boven -40 dB
    end = len(loud)
    while end and not loud[end - 1]:
        end -= 1
    start = end
    while start and loud[start - 1]:
        start -= 1
    gap = start
    while gap and not loud[gap - 1]:
        gap -= 1
    # 0,1–0,18 s, los van de zin, en geen stem: even hard als de stem maar met veel nuldoorgangen (stem ~0,02,
    # gesis ~0,16). Een losse k of t aan het eind ("Dat kan ik.") lijkt erop, maar duurt hooguit 50 ms.
    if not gap or not 10 <= end - start <= 18 or start - gap < 6:
        return None
    burst = frames[start:end].ravel()
    hiss = np.mean(np.abs(np.diff(np.sign(burst)))) / 2 > 0.12
    as_loud = np.sqrt((burst ** 2).mean()) > 0.3 * rms[:gap][loud[:gap]].mean()
    return (gap + 3) * w / 44100 if hiss and as_loud else None


def finish(src: Path, a: float, b: float, out: Path, text: str, tempo: float = 1.0, pitch: float = 1.0):
    """Knip één regel uit, haal stilte (en een ruisstoot) aan de randen weg, mix hem als filmstem en schat de woorden."""
    with tempfile.TemporaryDirectory() as tmp:
        cut = Path(tmp) / "cut.wav"
        trim = "silenceremove=start_periods=1:start_threshold=-45dB"
        ff("-i", src, "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-af", f"{trim},{TAIL},aresample=44100", "-ac", "1", cut)
        noise = tail_noise(cut)
        if noise is not None:
            clean = Path(tmp) / "clean.wav"
            ff("-i", cut, "-af", f"atrim=end={noise:.3f},{TAIL}", clean)
            cut = clean
        spoken = seconds(cut) / tempo
        shift = f"asetrate={44100 * pitch:.0f},aresample=44100,atempo={1 / pitch:.4f}," if pitch != 1 else ""
        ff("-i", cut, "-af", f"{shift}atempo={tempo},adelay={int(LEAD * 1000)},{FILM}", "-c:a", "aac", "-b:a", "96k", out)
    return {"duration": round(seconds(out), 3), "words": words_with_times(text, spoken)}


def record(voice: str, items: list[tuple[str, str]], outs: dict[str, Path], who: str = "daan"):
    """Regels in groepjes opnemen en losknippen. Lukt het knippen niet, dan die regels één voor één."""
    direction, tempo = ROLES[who]
    pitch = PITCH.get(who, 1.0)
    timings = {}
    with tempfile.TemporaryDirectory() as tmp:
        for i in range(0, len(items), BATCH):
            group = items[i:i + BATCH]
            wav = Path(tmp) / f"opname-{i}.wav"
            tts(voice, [t for _, t in group], wav, direction)
            parts = split(wav, [t for _, t in group])
            wrong = plausible(parts, [t for _, t in group]) if parts else []
            if parts and wrong:
                # De rest klopt; alleen de regels die niet passen apart opnieuw
                for x in wrong:
                    k, t = group[x]
                    print(f"  {k}: past niet bij zijn stuk, apart opnieuw…")
                    one = Path(tmp) / f"{k}.wav"
                    tts(voice, [t], one, direction)
                    timings[k] = finish(one, 0.0, seconds(one), outs[k], t, tempo, pitch)
                    print(f"{k:>16}  {timings[k]['duration']:5.1f}s  {t[:60]}")
                group = [g for x, g in enumerate(group) if x not in wrong]
                parts = [pt for x, pt in enumerate(parts) if x not in wrong]
            if parts is None:
                print("  stiltes niet gevonden, regels één voor één…")
                for k, t in group:
                    one = Path(tmp) / f"{k}.wav"
                    tts(voice, [t], one, direction)
                    timings[k] = finish(one, 0.0, seconds(one), outs[k], t, tempo, pitch)
                    print(f"{k:>16}  {timings[k]['duration']:5.1f}s  {t[:60]}")
                continue
            for (k, t), (a, b) in zip(group, parts):
                timings[k] = finish(wav, a, b, outs[k], t, tempo, pitch)
                print(f"{k:>16}  {timings[k]['duration']:5.1f}s  {t[:60]}")
    return timings


def transcribe(path: Path) -> str:
    """Laat Gemini uitschrijven wat er in een opname gezegd wordt (om te controleren zonder te luisteren)."""
    with tempfile.TemporaryDirectory() as tmp:
        mp3 = Path(tmp) / "a.mp3"
        ff("-i", path, "-ac", "1", "-b:a", "48k", mp3)
        body = {"contents": [{"parts": [
            {"inlineData": {"mimeType": "audio/mp3", "data": base64.b64encode(mp3.read_bytes()).decode()}},
            {"text": "Transcribe exactly what is spoken. Put each sentence on its own line with its start time [m:ss]. "
                     "Mark every silence longer than one second as (stilte N s). " + f"Say if the speech is not {LANG_NAME} or has an accent, "
                     "and describe the voice in one line (pitch, texture, pace)."},
        ]}]}
        # Druk bij Google (503): even wachten, of een ander model
        for model in (CHECK, "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.5-flash"):
            req = Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                          data=json.dumps(body).encode(), headers={"x-goog-api-key": key(), "Content-Type": "application/json"})
            try:
                with urlopen(req, timeout=180) as r:
                    return json.loads(r.read())["candidates"][0]["content"]["parts"][0]["text"]
            except HTTPError as e:
                if e.code not in (404, 429, 500, 503):
                    raise
                time.sleep(5 if e.code == 404 else 15)
            except OSError:  # time-out
                time.sleep(15)
        return "(controle lukte niet: Google is even overbelast)"


def proef(voices):
    """Per stem de drie proefregels in één verzoek (als alinea's, zoals straks echt), plus een controle."""
    lines = json.loads(SRC.read_text())
    TEST.mkdir(parents=True, exist_ok=True)
    for v in voices:
        out = TEST / f"gemini-{v}.m4a"
        with tempfile.TemporaryDirectory() as tmp:
            wav = Path(tmp) / "p.wav"
            tts(v, [lines[k] for k in PROEF], wav)
            parts = split(wav, [lines[k] for k in PROEF])
            ff("-i", wav, "-af", f"aresample=44100,{FILM}", "-ac", "1", "-c:a", "aac", "-b:a", "96k", out)
        print(f"→ {out.relative_to(ROOT)}  {seconds(out):.1f}s  los te knippen: {'ja' if parts else 'nee'}")
        print(transcribe(out))


def stem(voice, only=None):
    lines = json.loads(SRC.read_text())
    STAGE.mkdir(parents=True, exist_ok=True)
    cache_file = STAGE / ".cache.json"  # buiten public/, zodat het niet mee online gaat
    cache = json.loads(cache_file.read_text()) if cache_file.exists() else {}
    timings_file = STAGE / "timings.json"
    timings = json.loads(timings_file.read_text()) if timings_file.exists() else {}
    sig = lambda k, t, m=MODEL: hashlib.sha1(f"{VOICE.get(role(k), voice)}|{m}|{ROLES[role(k)]}|{FILM}|{t}".encode()).hexdigest()
    # Een regel is klaar als hij met deze stem en tekst is opgenomen, met welk van de spraakmodellen ook
    done = lambda k, t: cache.get(k) in {sig(k, t, m) for m in MODELS} and (STAGE / f"{k}.m4a").exists() and k in timings
    todo = [(k, t) for k, t in lines.items() if not done(k, t) and (only is None or role(k) == only)]
    print(f"{len(lines) - len(todo)} ongewijzigd, {len(todo)} te maken")
    def save():
        timings_file.write_text(json.dumps({k: timings[k] for k in lines if k in timings}, ensure_ascii=False, indent=1))
        cache_file.write_text(json.dumps({k: cache[k] for k in lines if k in cache}, indent=1))

    # Regel voor regel, en na elke regel opslaan: de gratis daglimiet is klein, morgen gaat het verder waar het stopte
    for k, t in todo:
        try:
            timings.update(record(VOICE.get(role(k), voice), [(k, t)], {k: STAGE / f"{k}.m4a"}, role(k)))
        except SystemExit as e:
            save()
            sys.exit(f"Gestopt bij {k}: {e}. Wat klaar is, is bewaard; draai het script later opnieuw.")
        cache[k] = sig(k, t)
        save()
    missing = [k for k in lines if k not in timings]
    if missing:
        print(f"nog {len(missing)} te gaan: {', '.join(missing)}")
        return
    total = sum(timings[k]["duration"] for k in lines if not k.startswith(("15-porno", "15-buurt")))
    print(f"totaal (één route): {total:.1f}s")
    publish(lines, timings)


def publish(lines, timings):
    """Alles klaar: in één keer naar de animatic."""
    OUT.mkdir(parents=True, exist_ok=True)
    for k in lines:
        shutil.copy(STAGE / f"{k}.m4a", OUT / f"{k}.m4a")
    (OUT / "timings.json").write_text(json.dumps({k: timings[k] for k in lines}, ensure_ascii=False, indent=1))
    print(f"alle {len(lines)} regels staan nu in {OUT.relative_to(ROOT)}")


def schoon():
    """De ruisstoot uit regels halen die al zijn opgenomen, zonder ze opnieuw op te nemen."""
    lines = json.loads(SRC.read_text())
    timings_file = STAGE / "timings.json"
    timings = json.loads(timings_file.read_text())
    for k in lines:
        m4a = STAGE / f"{k}.m4a"
        at = tail_noise(m4a)
        if at is None:
            continue
        with tempfile.TemporaryDirectory() as tmp:
            clean = Path(tmp) / m4a.name
            ff("-i", m4a, "-af", f"atrim=end={at:.3f},{TAIL}", "-c:a", "aac", "-b:a", "96k", clean)
            shutil.move(clean, m4a)
        was = timings[k]["duration"]
        # De woorden waren over de stilte vóór de stoot uitgesmeerd: opnieuw verdelen over wat er nu klinkt
        now = seconds(m4a)
        timings[k] = {"duration": round(now, 3), "words": words_with_times(lines[k], now - LEAD)}
        print(f"{k:10} ruis eraf: {was:.2f}s → {now:.2f}s")
    timings_file.write_text(json.dumps({k: timings[k] for k in lines if k in timings}, ensure_ascii=False, indent=1))
    publish(lines, timings)


def pauzes(maximum: float):
    """Lange stiltes midden in een regel inkorten tot `maximum` seconden, zonder opnieuw op te nemen (het tweede
    spraakmodel liet tussen twee zinnen soms 3 tot 6 s stilte vallen), en de woorden opnieuw over de regel verdelen."""
    lines = json.loads(SRC.read_text())
    timings_file = STAGE / "timings.json"
    timings = json.loads(timings_file.read_text())
    for k in lines:
        m4a = STAGE / f"{k}.m4a"
        was = seconds(m4a)
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / m4a.name
            ff("-i", m4a, "-af", f"silenceremove=stop_periods=-1:stop_duration={maximum}:stop_threshold=-40dB:stop_silence={maximum}",
               "-c:a", "aac", "-b:a", "96k", out)
            now = seconds(out)
            if was - now < 0.25:
                continue
            shutil.move(out, m4a)
        timings[k] = {"duration": round(now, 3), "words": words_with_times(lines[k], now - LEAD)}
        print(f"{k:10} pauzes ingekort: {was:.1f}s → {now:.1f}s")
    timings_file.write_text(json.dumps({k: timings[k] for k in lines if k in timings}, ensure_ascii=False, indent=1))
    publish(lines, timings)


def sneller(keys, factor: float):
    """Regels iets sneller laten spreken, zonder opnieuw op te nemen (atempo: zelfde toonhoogte), en de woorden
    opnieuw over de regel verdelen."""
    lines = json.loads(SRC.read_text())
    timings_file = STAGE / "timings.json"
    timings = json.loads(timings_file.read_text())
    for k in keys:
        m4a = STAGE / f"{k}.m4a"
        was = seconds(m4a)
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / m4a.name
            ff("-i", m4a, "-af", f"atempo={factor}", "-c:a", "aac", "-b:a", "96k", out)
            now = seconds(out)
            shutil.move(out, m4a)
        timings[k] = {"duration": round(now, 3), "words": words_with_times(lines[k], now - LEAD)}
        print(f"{k:10} sneller: {was:.1f}s → {now:.1f}s")
    timings_file.write_text(json.dumps({k: timings[k] for k in lines if k in timings}, ensure_ascii=False, indent=1))
    publish(lines, timings)


def main():
    global MODEL
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--proef", nargs="+", metavar="STEM", help="proefje per stem (regels 1, 13 en 17)")
    ap.add_argument("--stem", metavar="STEM", help="alle regels met deze stem")
    ap.add_argument("--alleen", choices=list(ROLES), help="alleen de regels van Daan of van de drang (elk op één model)")
    ap.add_argument("--model", choices=MODELS, help="ander spraakmodel (eigen daglimiet); standaard " + MODEL)
    ap.add_argument("--schoon", action="store_true", help="ruisstoot achter de laatste zin weghalen uit wat al is opgenomen")
    ap.add_argument("--taal", choices=["nl", "en"], default="nl", help="nl (standaard) of en: de Engelse versie")
    ap.add_argument("--pauzes", type=float, metavar="S", help="stiltes midden in een regel inkorten tot S seconden (zonder opnieuw op te nemen)")
    ap.add_argument("--sneller", nargs="+", metavar="REGEL", help="deze regels iets sneller laten spreken (zonder opnieuw op te nemen)")
    ap.add_argument("--factor", type=float, default=1.15, help="hoeveel sneller bij --sneller (standaard 1.15)")
    a = ap.parse_args()
    if a.taal == "en":
        english()
    if a.model:
        MODEL = a.model
    if a.schoon:
        schoon()
    elif a.pauzes:
        pauzes(a.pauzes)
    elif a.sneller:
        sneller(a.sneller, a.factor)
    elif a.proef:
        proef(a.proef)
    elif a.stem:
        stem(a.stem, a.alleen)
    else:
        ap.print_help()


if __name__ == "__main__":
    main()
