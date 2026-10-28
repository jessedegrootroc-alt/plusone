"""Vertelstem voor de animatic met ElevenLabs: een diepe Nederlandse mannenstem, per zin naar m4a,
met echte tijdcodes per woord voor het meelezen (zelfde formaat als make-vo.py, dus de site merkt niets).

De sleutel komt uit ELEVENLABS_API_KEY of uit ~/.config/skills/.env (daar zet je hem zelf neer, één regel:
ELEVENLABS_API_KEY=...). Het script laat de sleutel nooit zien.

Gebruik:
    python3 scripts/make-vo-eleven.py --zoek                     # diepe Nederlandse mannenstemmen in de bibliotheek
    python3 scripts/make-vo-eleven.py --proef ID [ID ...]        # dezelfde drie zinnen per stem, in art/stem-test/
    python3 scripts/make-vo-eleven.py --stem ID                  # alle zinnen uit vo.json, naar public/animatic/vo/

Elke zin wordt apart opgenomen (met de zin ervoor en erna als context, zodat de toon doorloopt) en daarna
met een stilte ertussen aan elkaar gezet. Wat niet veranderd is, wordt niet opnieuw opgenomen.
"""
import argparse
import base64
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src/animatic/vo.json"
OUT = ROOT / "public/animatic/vo"
TEST = ROOT / "art/stem-test"
API = "https://api.elevenlabs.io"
MODEL = "eleven_multilingual_v2"

# Zwaar en traag, als een filmtrailer, maar nog menselijk: niet te stabiel (dan wordt het vlak)
SETTINGS = {"stability": 0.5, "similarity_boost": 0.85, "style": 0.25, "use_speaker_boost": True, "speed": 0.9}
GAP = 0.75  # stilte tussen twee zinnen (s)
LEAD = 0.12  # korte aanloop voor de eerste zin (s)
# Een beetje warmte en gelijkmatigheid, zoals een stem in een film gemixt wordt
FILM = "lowshelf=g=2.5:f=120,acompressor=threshold=-18dB:ratio=2.5:attack=10:release=200:makeup=2,alimiter=limit=0.95"
PROEF = ["1", "13", "17"]


def key() -> str:
    k = os.environ.get("ELEVENLABS_API_KEY")
    env = Path.home() / ".config/skills/.env"
    if not k and env.exists():
        for line in env.read_text().splitlines():
            name, _, value = line.strip().partition("=")
            if name.strip() == "ELEVENLABS_API_KEY":
                k = value.strip().strip('"').strip("'")
    if not k:
        sys.exit("Geen ELEVENLABS_API_KEY gevonden (omgeving of ~/.config/skills/.env).")
    return k


def call(path: str, body=None, query=None):
    url = f"{API}{path}" + (f"?{urlencode(query)}" if query else "")
    data = json.dumps(body).encode() if body is not None else None
    req = Request(url, data=data, headers={"xi-api-key": key(), "Content-Type": "application/json", "Accept": "application/json"})
    try:
        with urlopen(req, timeout=120) as r:
            return json.loads(r.read())
    except HTTPError as e:
        sys.exit(f"ElevenLabs gaf {e.code} op {path}: {e.read().decode(errors='replace')[:400]}")


def sentences(text: str):
    parts = [s.strip() for s in re.findall(r"[^.!?]+[.!?]+", text)]
    return parts or [text.strip()]


def speak(voice: str, text: str, prev: str, nxt: str):
    """Eén zin met tijdcodes per letter: (mp3-bytes, [(woord, begin, eind)])."""
    body = {"text": text, "model_id": MODEL, "voice_settings": SETTINGS}
    if prev:
        body["previous_text"] = prev
    if nxt:
        body["next_text"] = nxt
    r = call(f"/v1/text-to-speech/{voice}/with-timestamps", body, {"output_format": "mp3_44100_128"})
    a = r.get("alignment") or r.get("normalized_alignment")
    chars, starts, ends = a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]
    said = "".join(chars)
    words, pos = [], 0
    for w in text.split():
        i = said.find(w, pos)
        if i < 0:  # de uitlijning wijkt af (bv. een spatie meer): val terug op de volgorde
            i = min(pos, len(chars) - 1)
        j = min(i + len(w) - 1, len(ends) - 1)
        words.append((w, starts[i], ends[j]))
        pos = i + len(w)
    return base64.b64decode(r["audio_base64"]), words


def seconds(path: Path) -> float:
    info = subprocess.run(["afinfo", str(path)], capture_output=True, text=True).stdout
    return float(re.search(r"estimated duration: ([\d.]+)", info).group(1))


def ff(*args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def record(voice: str, text: str, out: Path):
    """Een hele regel: zinnen apart opnemen, met stiltes aan elkaar, en de woorden op hun echte tijd."""
    parts = sentences(text)
    words, t = [], LEAD
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        ff("-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", str(GAP), tmp / "gap.wav")
        ff("-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", str(LEAD), tmp / "lead.wav")
        listing = [tmp / "lead.wav"]
        for i, s in enumerate(parts):
            mp3, ws = speak(voice, s, " ".join(parts[:i]), " ".join(parts[i + 1:]))
            (tmp / f"{i}.mp3").write_bytes(mp3)
            ff("-i", tmp / f"{i}.mp3", "-ac", "1", "-ar", "44100", tmp / f"{i}.wav")
            words += [{"text": w, "start": round(t + a, 3), "end": round(t + b, 3)} for w, a, b in ws]
            listing.append(tmp / f"{i}.wav")
            t += seconds(tmp / f"{i}.wav")
            if i < len(parts) - 1:
                listing.append(tmp / "gap.wav")
                t += GAP
        (tmp / "list.txt").write_text("".join(f"file '{p}'\n" for p in listing))
        ff("-f", "concat", "-safe", "0", "-i", tmp / "list.txt", "-af", FILM, "-c:a", "aac", "-b:a", "96k", out)
    return {"duration": round(seconds(out), 3), "words": words}


def zoek():
    r = call("/v1/shared-voices", query={"language": "nl", "gender": "male", "page_size": 40, "sort": "trending"})
    for v in r.get("voices", []):
        desc = " · ".join(x for x in [v.get("age"), v.get("accent"), v.get("descriptive"), v.get("use_case")] if x)
        print(f"{v['voice_id']}  {v.get('name', '')[:34]:34}  {desc}")
    mine = call("/v1/voices").get("voices", [])
    if mine:
        print("\nAl in je account:")
        for v in mine:
            labels = " · ".join(str(x) for x in (v.get("labels") or {}).values())
            print(f"{v['voice_id']}  {v.get('name', '')[:34]:34}  {labels}")


def proef(ids):
    lines = json.loads(SRC.read_text())
    TEST.mkdir(parents=True, exist_ok=True)
    text = " ".join(lines[k] for k in PROEF)
    for vid in ids:
        out = TEST / f"eleven-{vid}.m4a"
        r = record(vid, text, out)
        print(f"{out.relative_to(ROOT)}  {r['duration']:.1f}s")


def stem(vid):
    lines = json.loads(SRC.read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    TEST.mkdir(parents=True, exist_ok=True)
    cache_file = TEST / ".eleven-cache.json"  # buiten public/, zodat het niet mee online gaat
    cache = json.loads(cache_file.read_text()) if cache_file.exists() else {}
    timings_file = OUT / "timings.json"
    timings = json.loads(timings_file.read_text()) if timings_file.exists() else {}
    for k, text in lines.items():
        h = hashlib.sha1(f"{vid}|{MODEL}|{json.dumps(SETTINGS, sort_keys=True)}|{FILM}|{text}".encode()).hexdigest()
        m4a = OUT / f"{k}.m4a"
        if cache.get(k) == h and m4a.exists() and k in timings:
            print(f"{k:>16}  ongewijzigd")
            continue
        timings[k] = record(vid, text, m4a)
        cache[k] = h
        print(f"{k:>16}  {timings[k]['duration']:5.1f}s  {text[:60]}")
    # Alleen de zinnen die nog in vo.json staan
    timings = {k: timings[k] for k in lines}
    timings_file.write_text(json.dumps(timings, ensure_ascii=False, indent=1))
    cache_file.write_text(json.dumps({k: cache[k] for k in lines if k in cache}, indent=1))
    total = sum(v["duration"] for k, v in timings.items() if not k.startswith(("15-porno", "15-buurt")))
    print(f"totaal (één route): {total:.1f}s")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--zoek", action="store_true", help="diepe Nederlandse mannenstemmen uit de bibliotheek")
    ap.add_argument("--proef", nargs="+", metavar="ID", help="proefje per stem (zinnen 1, 13 en 17)")
    ap.add_argument("--stem", metavar="ID", help="alle zinnen met deze stem")
    a = ap.parse_args()
    if a.zoek:
        zoek()
    elif a.proef:
        proef(a.proef)
    elif a.stem:
        stem(a.stem)
    else:
        ap.print_help()


if __name__ == "__main__":
    main()
