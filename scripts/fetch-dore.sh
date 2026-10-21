#!/usr/bin/env bash
# Haalt de Doré-illustraties (publiek domein) op van Wikimedia Commons en zet ze
# gecomprimeerd in public/dore/. Opnieuw draaien overschrijft de bestaande bestanden.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/dore
mkdir -p "$OUT"
UA="PlusOne/0.1 (https://commons.wikimedia.org/wiki/Commons:User-Agent_policy)"

while IFS='|' read -r slug file; do
  [ -z "$slug" ] && continue
  url="https://commons.wikimedia.org/wiki/Special:FilePath/$(python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$file")?width=1200"
  echo "→ $slug"
  curl -sSfL -A "$UA" "$url" -o "$OUT/$slug.jpg"
  # Langste zijde max 1100px, JPEG-kwaliteit ~65: scherp genoeg voor gravures, klein genoeg voor mobiel.
  sips -Z 1100 -s format jpeg -s formatOptions 65 "$OUT/$slug.jpg" --out "$OUT/$slug.jpg" >/dev/null
  sleep 0.5
done <<'EOF'
pride|Gustove Dore, The Divine Comedy, Purgatory, plate 93, The Burden of Pride.jpg
humility|Par 27, Gustave Doré.jpg
envy|Pur 13 dore.jpg
kindness|Par 18, Gustave Doré.jpg
wrath|Wrathful souls fighting upon the Styx, illustration to Dante’s Inferno by Gustave Doré.jpg
patience|Par 19, Gustave Doré, aquila.jpg
forest|Gustave Doré - Dante Alighieri - Inferno - Plate 1 (I found myself within a forest dark...).jpg
ladder|Par 21 dore.jpg
greed|Gustave Doré - Dante Alighieri - Inferno - Plate 22 (Canto VII - Hoarders and Wasters).jpg
charity|Par 14, Gustave Doré.jpg
gluttony|Gustave Doré - Purgatorio, Canto 23, The souls of the gluttonous.jpg
temperance|Par 03, Gustave Doré.jpg
lust|Gustove Dore, The Divine Comedy, Inferno, plate 14, The Tempest of Hell.jpg
rose|Doré, Gustave - Paradiso Canto 31.jpg
virgil|Gustave Doré - Dante Alighieri - Inferno - Plate 4 (Dante meets Virgil).jpg
boat|Gustove Dore, The Divine Comedy, Purgatory, plate 79, The Boat of Souls.jpg
gate|Pur 09 dore.jpg
shore|Pur 01 dore.jpg
lucifer|Gustave Dore Inferno34.jpg
ninth|Gustove Dore, The Divine Comedy, Paradise, plate 133, The Ninth Heaven.jpg
foulque|Foulque-Nerra Assailed by the Phantoms of His Victims.jpg
taurus|Gustave Doré - The Crusaders Cross Mount Taurus.jpg
george|Gustave Doré - Apparition of Saint George on the Mount of Olives.jpg
satan|GustaveDoreParadiseLostSatanProfile.jpg
oath|Gustave Doré - For the Defense of Christ.jpg
benediction|Gustave Doré - Benediction.jpg
EOF

du -sh "$OUT"

# Daarna de witte randen, kaderlijnen en onderschriften wegsnijden:
#   python3 scripts/trim-dore.py "$OUT" "$OUT"
