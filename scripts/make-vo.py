"""Tijdelijke vertelstem voor de animatic: macOS `say` (Xander, nl_NL) per zin naar m4a,
plus geschatte tijdcodes per woord voor de karaoke. Wordt later vervangen door de echte opname
(dan komen de tijdcodes uit ElevenLabs of forced alignment, in hetzelfde formaat).

Gebruik: python3 scripts/make-vo.py
"""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src/animatic/vo.json"
OUT = ROOT / "public/animatic/vo"
VOICE = "Xander"
RATE = "128"  # woorden per minuut: plechtig, niet gehaast

# Hoe lang een pauze na een leesteken duurt, in "lettergewicht" (geschat, past bij de stiltes hieronder)
PAUSE = {".": 22, "!": 22, "?": 22, ",": 9, ";": 9, ":": 9}


def duration(path: Path) -> float:
    info = subprocess.run(["afinfo", str(path)], capture_output=True, text=True).stdout
    return float(re.search(r"estimated duration: ([\d.]+)", info).group(1))


def words_with_times(text: str, total: float):
    """Verdeel de duur over de woorden naar lengte, met pauzes na leestekens."""
    words = text.split()
    weights = [len(re.sub(r"\W", "", w)) + 2 for w in words]
    pauses = [PAUSE.get(w[-1], 0) for w in words]
    unit = total / (sum(weights) + sum(pauses[:-1]) + 3)
    t = unit * 1.5  # korte aanloop
    out = []
    for w, k, p in zip(words, weights, pauses):
        out.append({"text": w, "start": round(t, 3), "end": round(t + k * unit, 3)})
        t += (k + p) * unit
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    lines = json.loads(SRC.read_text())
    timings = {}
    for key, text in lines.items():
        aiff = OUT / f"{key}.aiff"
        m4a = OUT / f"{key}.m4a"
        # Een verteller laat de zinnen landen: stilte na elke punt en komma (de echte opname doet dit vanzelf)
        spoken = re.sub(r"([.!?])\s", r"\1 [[slnc 900]] ", text)
        spoken = re.sub(r",\s", ", [[slnc 350]] ", spoken)
        # De drang (tweede stem): sneller, alsof hij aandringt
        subprocess.run(["say", "-v", VOICE, "-r", "150" if key.startswith("drang-") else RATE, "-o", str(aiff), spoken], check=True)
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "64000", str(aiff), str(m4a)], check=True)
        aiff.unlink()
        d = duration(m4a)
        timings[key] = {"duration": round(d, 3), "words": words_with_times(text, d)}
        print(f"{key:>16}  {d:5.1f}s  {text[:60]}")
    (OUT / "timings.json").write_text(json.dumps(timings, ensure_ascii=False, indent=1))
    total = sum(v["duration"] for k, v in timings.items() if not k.startswith(("15-porno", "15-buurt")))
    print(f"totaal (één route): {total:.1f}s")


if __name__ == "__main__":
    main()
