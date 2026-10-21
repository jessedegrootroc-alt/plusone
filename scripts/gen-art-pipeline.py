# Genereert docs/ART-PIPELINE.md:  python3 scripts/gen-art-pipeline.py > docs/ART-PIPELINE.md
import sys

P = ("Staand", "1024×1536", "1024×1536 portrait")
S = ("Vierkant", "1024×1024", "1024×1024 square")
L = ("Liggend", "1536×1024", "1536×1024 landscape")

T = ("Transparant", "a real transparent background (PNG with alpha channel), not a checkerboard pattern")
B = ("Effen zwart", "a solid pure black background (#000000), no transparency")
W = ("Effen wit", "a solid plain white background, no transparency")
O = ("Geen (het hele beeld is gevuld)", "fully opaque, the whole canvas filled with the scene, no transparency")

MAN = "a man in his early thirties with an oval face, a straight nose, strong dark eyebrows, short dark hair and a short dark beard"
REF = "the same man as in the attached image (same face, hair, beard and proportions)"

steps = []  # (section, group, title, upload, size, bg, file, prompt)
sec = None
grp = None


def add(title, upload, size, bg, file, prompt):
    steps.append((sec, grp, title, upload, size, bg, file, prompt.strip()))


def no_arms(src, dst, name):
    add(f"{name}, zonder armen", f"`{src}`", P, T, dst, f"""
Edit the attached image. Remove BOTH ARMS completely, from the shoulders down, including the hands and anything they hold. Fully draw the parts of the body and clothing that the arms were covering, as if the arms had never been there. Change nothing else: same position, same scale, same lines, same lighting.""")


def blink(src, dst, name):
    add(f"{name}, ogen dicht", f"`{src}`", P, T, dst, f"""
Edit the attached image. Close the eyes only: draw the eyelids fully shut, in the same engraving style. Change nothing else: same position, scale, face, lines and lighting.""")


def remove(src, dst, title, what):
    add(title, f"`{src}`", S, T, dst, f"""
Edit the attached image. Remove only {what}, and fill in whatever was behind it. Change nothing else: same position, scale, lines and lighting.""")


# ───────────────────────── 1. KARAKTERS ─────────────────────────
sec = "1 · Karakters"
grp = None

add("Jij, in balans (het hoofdkarakter)", "niets", P, T, "karakter-balans.png", f"""
Draw one full-body character: {MAN}. He has a healthy, ordinary build and stands upright and calm, weight slightly on one leg, arms relaxed and a little away from the body. He wears a clean linen shirt and dark trousers and is barefoot. Three-quarter view, turned toward the right. He fills about 85% of the image height, with his feet near the bottom.""")
no_arms("karakter-balans.png", "karakter-balans-zonder-armen.png", "Jij, in balans")
blink("karakter-balans.png", "karakter-balans-ogen-dicht.png", "Jij, in balans")

add("De Schim (het slechtste)", "`karakter-balans.png`", P, T, "karakter-schim.png", f"""
Draw {REF}, but completely degraded into a gaunt cave-dweller. He crouches low with his knees bent and splayed and his back deeply hunched. He is extremely thin: every rib visible, a sunken belly, stick-thin arms and legs, long bony fingers and toes. His head looks too big for his starved body. Huge pale bulging eyes with tiny pupils, hollow cheeks, only a few thin wet strands of hair, large ears. He wears only a torn ragged loincloth. With both hands he clutches a small smartphone to his chest like a treasure; its screen lights his face from below. A thin rim of light along his right side. Three-quarter view, turned toward the right. He fills about 85% of the image height.""")
no_arms("karakter-schim.png", "karakter-schim-zonder-armen.png", "De Schim")
blink("karakter-schim.png", "karakter-schim-ogen-dicht.png", "De Schim")

add("De Verdwaalde (half slecht)", "`karakter-balans.png`", P, T, "karakter-verdwaalde.png", f"""
Draw {REF}, but badly worn down. He is very thin and slouched, shoulders caved in, head bowed but eyes looking up. Faint ribs show. Greasy, thinning hair, a patchy beard, dark rings under eyes that are too wide. A torn shirt hanging loose, ragged trousers, barefoot. His left arm hangs limp; his right hand holds a glowing phone at hip height, away from his body. A thin rim of light along his right side. Three-quarter view, turned toward the right. He fills about 85% of the image height.""")
no_arms("karakter-verdwaalde.png", "karakter-verdwaalde-zonder-armen.png", "De Verdwaalde")
blink("karakter-verdwaalde.png", "karakter-verdwaalde-ogen-dicht.png", "De Verdwaalde")

add("De Klimmer: de schildknaap (bijna goed)", "`karakter-balans.png` **en** je eigen foto van de ridder (in deze volgorde)", P, T, "karakter-klimmer.png", f"""
Draw {REF.replace('the attached image', 'the FIRST attached image')}, but visibly fitter and stronger, on his way to becoming the knight in the SECOND attached image: he is the squire, not yet the knight.
He wears a simple linen tunic with a small cross stitched on the chest in black ink (no red, no colour), a plain leather belt, and leather bracers on his forearms. No armour yet. Sleeves rolled up, chest open, shoulders back, chin slightly raised, a determined look. More defined shoulders and forearms, a leaner waist. Feet planted wide and steady, arms a little away from the body. Three-quarter view, turned toward the right. He fills about 85% of the image height.""")
no_arms("karakter-klimmer.png", "karakter-klimmer-zonder-armen.png", "De Klimmer")
blink("karakter-klimmer.png", "karakter-klimmer-ogen-dicht.png", "De Klimmer")

add("Je Ideale Zelf: de tempelier (het beste)", "`karakter-balans.png` **en** je eigen foto van de ridder (in deze volgorde)", P, T, "karakter-ideaal.png", f"""
Draw the same man as in the FIRST attached image (same face, hair, beard and proportions) at his absolute best, as a Templar knight.
Use the SECOND attached image only as the reference for his armour and clothing: copy the armour, surcoat, belt and details as closely as possible, translated into the engraving style. If the reference shows a helmet, leave it off so his face stays fully visible.
The cross on his surcoat is drawn in solid black ink: no red, no colour at all.
He is strong, athletic and upright, with a calm, powerful, wise expression. He stands tall with his feet firmly planted and both arms a little away from his body. A long sword stands point-down beside his right foot, with his right hand resting on the pommel; his left hand hangs relaxed. The lower part of his surcoat hangs free, so it can move in the wind. Three-quarter view, turned toward the right. He fills about 85% of the image height.""")
no_arms("karakter-ideaal.png", "karakter-ideaal-zonder-armen.png", "Je Ideale Zelf")
blink("karakter-ideaal.png", "karakter-ideaal-ogen-dicht.png", "Je Ideale Zelf")

# ───────────────────────── 2. ITEMS ─────────────────────────
sec = "2 · Items"

# Emblemen
grp = ("Emblemen", "De kenmerken van je ideale zelf.")
emblems = [
    ("Embleem: lauwerkrans", "item-lauwerkrans.png", "a classical laurel wreath, as it would sit on a man's head, seen from slightly to the side"),
    ("Embleem: medaille", "item-medaille.png", "a round victory medal with an engraved star, hanging from a ribbon that forms a V shape"),
    ("Embleem: stralenkrans", "item-stralenkrans.png", "a thin halo ring seen at an angle, with fine lines radiating from it"),
    ("Embleem: ijsadem", "item-ijsadem.png", "a cluster of sharp ice crystals with a wisp of frozen breath curling from it"),
    ("Embleem: vuur", "item-vuur.png", "a single slender rising flame wrapped in curling waves of heat"),
    ("Embleem: dageraad", "item-dageraad.png", "a half sun rising on a straight horizon line, with long rays fanning out"),
    ("Embleem: boek", "item-boek.png", "a closed leather-bound book with a metal clasp, tilted slightly"),
    ("Embleem: halter", "item-halter.png", "a classical iron dumbbell, lying horizontally"),
]
for title, f, what in emblems:
    add(title, "niets", S, T, f, f"Draw one single object, centered: {what}. Nothing else in the image, no hand, no ground, no shadow.")

# De uitrusting van de tempelier, los, zodat hij in de scène kan liggen of bewegen
knight = [
    ("Ridder: zwaard", P, "item-zwaard.png", "the long sword from the attached image, standing upright and point-down, the full blade, crossguard and pommel visible"),
    ("Ridder: helm", S, "item-helm.png", "the helmet from the attached image, seen from the front at a slight angle (if the image shows no helmet, a classic Templar great helm)"),
    ("Ridder: schild", P, "item-schild.png", "the shield from the attached image, seen from the front, with the cross drawn in solid black ink (if the image shows no shield, a classic Templar heater shield with a cross)"),
]
for title, size, f, what in knight:
    add(title, "je eigen foto van de ridder", size, T, f, f"Draw one single object, centered: {what}. Translated into the engraving style; any colour becomes black ink or white paper. Nothing else in the image, no hand, no ground, no shadow.")

# Zondetaferelen
grp = ("Taferelen", "Beeldengroepen die laten zien waar een zonde of deugd je brengt. Sommige maak je twee keer: daarna zonder het deel dat in de app beweegt.")
TAB = "a frozen group of figures like a sculpture, as if they are slowly turning to stone. Symbolic and dignified: no blood, no wounds, no nudity beyond classical drapery. It stands on its own small patch of ground, which is part of the image. Nothing else around it."
sins = [
    ("Tafereel zonde: Hoogmoed", "item-tafereel-hoogmoed.png",
     "PRIDE: a man in a fine robe kneels before a tall ornate gilded mirror, holding a flawless smiling mask in front of his face. His real face behind it is cracking like porcelain. An enormous boulder on his back presses him down. A toppled crown lies beside him. A tattered cloth banner hangs from the top of the mirror frame.",
     ("item-tafereel-hoogmoed-zonder-doek.png", "Tafereel Hoogmoed, zonder doek", "the tattered cloth banner hanging from the mirror frame")),
    ("Tafereel zonde: Afgunst", "item-tafereel-afgunst.png",
     "ENVY: three figures sit shoulder to shoulder against a stone wall, their eyes bound shut with heavy cloth blindfolds. Each leans toward the next, straining to see. The middle figure clutches a glowing phone showing tiny silhouettes of other people's perfect lives.", None),
    ("Tafereel zonde: Toorn", "item-tafereel-toorn.png",
     "WRATH: two men locked in an endless struggle, half-sunk in a black swamp, each grabbing the other by the collar with a clenched fist, faces twisted with rage. A shattered glass and a broken phone lie at the edge of the swamp.", None),
    ("Tafereel zonde: Traagheid", "item-tafereel-traagheid.png",
     "SLOTH: a man lies in an old bed that has grown into the ground. Roots and cobwebs creep over his blanket and limbs; thick dust lies on everything. A remote control rests in his limp hand and screen light falls on his half-open eyes. Above the bed hangs a large wall clock with a long pendulum.",
     ("item-tafereel-traagheid-zonder-slinger.png", "Tafereel Traagheid, zonder slinger", "the pendulum of the wall clock")),
    ("Tafereel zonde: Hebzucht", "item-tafereel-hebzucht.png",
     "GREED: a gaunt man kneels, chained by the wrist to the post of an enormous iron merchant's scale. One pan is heaped with coins, dice, playing cards and lottery tickets; on the other lies a carved stone heart, his own. He reaches for more coins while the scale tips against him.",
     ("item-tafereel-hebzucht-zonder-balk.png", "Tafereel Hebzucht, zonder weegbalk", "the horizontal beam of the scale with both hanging pans and everything on them (keep the upright post)")),
    ("Tafereel zonde: Vraatzucht", "item-tafereel-vraatzucht.png",
     "GLUTTONY: a bloated man sits chained to a heavy chair at the end of an endless banquet table, still reaching for more. Empty bottles, overflowing ashtrays, cigarette packs, sweets and greasy wrappers are piled around him. Behind him stand gaunt, starving figures with hollow eyes, watching him in silence.", None),
    ("Tafereel zonde: Lust", "item-tafereel-lust.png",
     "LUST: two lovers in classical drapery, turned to pale stone in a tight embrace, yet both stare not at each other but at a glowing screen held between them. Their drapery is whipped by a storm wind.", None),
]
for title, f, desc, rem in sins:
    add(title, "niets", S, T, f, f"Draw one sin tableau, {TAB}\n{desc}")
    if rem:
        remove(f, rem[0], rem[1], rem[2])

virtues = [
    ("Tafereel deugd: Nederigheid", "item-tafereel-nederigheid.png",
     "HUMILITY: a strong man kneels and washes the feet of a tired old traveller, pouring a stream of water from a jug into a basin. His own crown lies set aside on the ground. Both faces are calm and dignified.",
     ("item-tafereel-nederigheid-zonder-water.png", "Tafereel Nederigheid, zonder waterstraal", "the stream of water between the jug and the basin")),
    ("Tafereel deugd: Welwillendheid", "item-tafereel-welwillendheid.png",
     "KINDNESS: a man pulls a fallen stranger up from the ground by the forearm and drapes his own cloak over the stranger's shoulders; one long end of the cloak hangs free in the wind. Their eyes meet with warmth.",
     ("item-tafereel-welwillendheid-zonder-mantel.png", "Tafereel Welwillendheid, zonder mantelpunt", "the long loose end of the cloak hanging in the wind")),
    ("Tafereel deugd: Geduld", "item-tafereel-geduld.png",
     "PATIENCE: a man sits upright and perfectly calm on a rock while a storm rages around him. His cloak is whipped by the wind, but his face is still and his hands rest open on his knees. A lamb lies peacefully at his feet.", None),
    ("Tafereel deugd: IJver", "item-tafereel-ijver.png",
     "DILIGENCE: a man with rolled-up sleeves carves steps into a steep rock face, a chisel in his left hand and a hammer raised in his right. Beside him stand a beehive and an hourglass. His face shows focus, not strain.",
     ("item-tafereel-ijver-zonder-arm.png", "Tafereel IJver, zonder hamerarm", "his right arm holding the hammer, from the shoulder down, fully drawing the body and rock it was covering")),
    ("Tafereel deugd: Vrijgevigheid", "item-tafereel-vrijgevigheid.png",
     "CHARITY: a man breaks a loaf of bread in two and hands it to two children. An open jar of coins stands beside him, given away rather than kept. Empty space above them.", None),
    ("Tafereel deugd: Matigheid", "item-tafereel-matigheid.png",
     "TEMPERANCE: a calm figure in simple robes pours a thin stream of water from one jug into another with total control, not a drop spilled. At their feet lie a bridle and a simple bowl of fruit.",
     ("item-tafereel-matigheid-zonder-water.png", "Tafereel Matigheid, zonder waterstraal", "the thin stream of water between the two jugs")),
    ("Tafereel deugd: Zuiverheid", "item-tafereel-zuiverheid.png",
     "PURITY: a figure in white classical robes stands in perfectly still, mirror-like water and holds up an oil lamp with a steady upright flame. In the other hand is a lily. The reflection in the water is clear.",
     ("item-tafereel-zuiverheid-zonder-vlam.png", "Tafereel Zuiverheid, zonder vlam", "the flame of the oil lamp")),
]
for title, f, desc, rem in virtues:
    add(title, "niets", S, T, f, f"Draw one virtue tableau, {TAB.replace('as if they are slowly turning to stone', 'bathed in soft light from the upper left')}\n{desc}")
    if rem:
        remove(f, rem[0], rem[1], rem[2])

# Props
grp = ("Voorwerpen", "Je eigen verleidingen en deugden als losse voorwerpen in de scène.")
props = [
    # verleidingen
    ("telefoon", "a smartphone lying face up, its screen glowing"),
    ("laptop", "a half-open laptop, its screen glowing"),
    ("asbak", "a heavy ashtray overflowing with cigarette butts, next to a crushed cigarette pack"),
    ("vape", "a vape pen lying on its side"),
    ("drankfles", "an empty liquor bottle lying tipped over"),
    ("blikje", "a crushed energy-drink can"),
    ("fastfood", "a greasy crumpled fast-food bag with a few fries spilling out"),
    ("snoep", "a torn-open candy wrapper with sweets spilling out"),
    ("dobbelstenen", "a pair of dice"),
    ("speelkaarten", "a fanned-out hand of playing cards"),
    ("munten", "a small scattered pile of coins"),
    ("boodschappentas", "an overflowing shopping bag"),
    ("wekker", "a smashed alarm clock"),
    ("controller", "a game controller with a dangling cable"),
    ("afstandsbediening", "a TV remote control"),
    ("gebroken-glas", "a shattered drinking glass"),
    ("brief", "a torn, crumpled letter"),
    ("tijdschriften", "a stack of glossy magazines"),
    ("handspiegel", "a cracked hand mirror"),
    ("kroon", "a toppled golden crown lying on its side"),
    ("masker", "a smiling porcelain mask"),
    # deugden
    ("kettlebell", "a heavy iron kettlebell"),
    ("hardloopschoenen", "a pair of worn running shoes"),
    ("ijsbad", "a wooden tub of ice water with floating chunks of ice"),
    ("saunaemmer", "a wooden sauna bucket with a ladle"),
    ("saunastenen", "a heap of hot sauna stones"),
    ("boeken", "a stack of old books"),
    ("dagboek", "an open journal with a quill and an inkpot"),
    ("kaars", "a lit candle in a simple holder"),
    ("meditatiekussen", "a round meditation cushion"),
    ("fruitschaal", "a bowl of fruit"),
    ("waterkruik", "a clay water jug with a cup"),
    ("brood", "a loaf of bread broken in two"),
    ("spaarpot", "a glass jar of coins"),
    # pelgrim
    ("lantaarn", "an old iron lantern"),
    ("pelgrimsstaf", "a pilgrim's wooden staff"),
    # pot van Covey
    ("glazen-pot", "an empty clear glass jar without a lid, seen from the front, with engraved reflections"),
    ("grote-steen", "one large rounded rock"),
    ("middelgrote-steen", "one medium-sized rounded rock"),
    ("kiezel", "one small pebble"),
    ("zandhoopje", "a small pile of sand"),
]
for key, what in props:
    add(f"Item: {key.replace('-', ' ')}", "niets", S, T, f"item-{key}.png",
        f"Draw one single object, centered: {what}. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.")

grp = ("Wezens en figuranten", "Wat er door de scène beweegt. De tweede pose maak je steeds door het vorige beeld te bewerken.")
# Wezens: een tweede pose maak je altijd als bewerking van de eerste, zodat ze precies op elkaar passen
def pose(title, src, dst, size, bg, change):
    add(title, f"`{src}`", size, bg, dst, f"Edit the attached image. Change only this: {change}. Keep everything else exactly the same: same creature, same size, same position, same lines.")

creatures = [
    ("Wezen: raaf, zittend", S, "item-raaf-zittend.png", "a raven perched on a short bare branch, in side view, its head turned slightly toward the viewer. The branch is part of the image."),
    ("Wezen: raaf, vliegend", S, "item-raaf-vleugels-omhoog.png", "a raven in flight in side view, flying to the right, with both wings raised high above its body."),
    ("Wezen: vleermuis", S, "item-vleermuis-omhoog.png", "a bat seen from the front, with both wings raised."),
    ("Wezen: duif", S, "item-duif-omhoog.png", "a white dove in flight in side view, flying to the right, with both wings raised high. Black outlines, white inside."),
    ("Wezen: luipaard", S, "item-luipaard.png", "the dark silhouette of a leopard lurking, half-hidden, almost entirely solid black, only its eyes two small white points."),
    ("Wezen: leeuw", S, "item-leeuw.png", "the dark silhouette of a lion lurking, half-hidden, almost entirely solid black, only its eyes two small white points."),
    ("Wezen: wolvin", S, "item-wolvin.png", "the dark silhouette of a gaunt she-wolf lurking, half-hidden, almost entirely solid black, only its eyes two small white points."),
    ("Figurant: pelgrim", P, "item-pelgrim-1.png", "a hooded pilgrim with a staff and a bundle, walking to the right in side view, left leg forward, filling about 85% of the image height."),
    ("Figurant: boot met zielen", L, "item-boot.png", "a slender wooden boat in side view with a winged angel standing at the stern and a group of hooded souls seated inside, on a thin line of calm water directly under the hull."),
    ("Figurant: engel bij de poort", P, "item-engel.png", "a tall serene angel seated on a stone threshold step, holding a drawn sword upright, wings folded behind it, face calm. The step is part of the image."),
    ("Wezen: mot", S, "item-mot.png", "a single moth with open wings, seen from above."),
    ("Wezen: vlieg", S, "item-vlieg.png", "a single fly, seen from above."),
]
second = {
    "item-raaf-vleugels-omhoog.png": ("Wezen: raaf, vleugels omlaag", "item-raaf-vleugels-omlaag.png", "both wings are now pushed down below the body"),
    "item-vleermuis-omhoog.png": ("Wezen: vleermuis, vleugels omlaag", "item-vleermuis-omlaag.png", "both wings are now pushed down"),
    "item-duif-omhoog.png": ("Wezen: duif, vleugels omlaag", "item-duif-omlaag.png", "both wings are now pushed down below the body"),
    "item-pelgrim-1.png": ("Figurant: pelgrim, tweede stap", "item-pelgrim-2.png", "the legs: now the RIGHT leg is forward and the left leg back, as in the next step of walking"),
}
for title, size, f, what in creatures:
    add(title, "niets", size, T, f, f"Draw one single creature, centered: {what} Nothing else in the image, no ground, no shadow.")
    if f in second:
        t2, f2, ch = second[f]
        pose(t2, f, f2, size, T, ch)

# Effecten (wit op zwart)
grp = ("Effecten", "Deze maak je **wit op zwart**. Dat is expres: de app laat het zwart wegvallen, zodat alleen het licht overblijft.")
fx = [
    ("Effect: sintel", S, "effect-sintel.png", "one single glowing ember, small, in the center, drawn as WHITE engraved marks with a few radiating lines."),
    ("Effect: vonk", S, "effect-vonk.png", "one single thin spark, in the center, drawn as WHITE engraved lines."),
    ("Effect: stofje", S, "effect-stofje.png", "one single floating dust mote catching the light, small, in the center, drawn in WHITE."),
    ("Effect: lichtje", S, "effect-lichtje.png", "one single tiny mote of holy light with fine radiating lines, in the center, drawn in WHITE."),
    ("Effect: ijskristal", S, "effect-ijskristal.png", "one single six-pointed ice crystal, in the center, drawn in WHITE engraved lines."),
    ("Effect: veer", S, "effect-veer.png", "one single small white feather, in the center, drawn in WHITE engraved lines."),
    ("Effect: ogen in het donker", S, "effect-ogen.png", "one pair of small glowing animal eyes side by side, in the center, drawn in WHITE."),
    ("Effect: vlam 1", P, "effect-vlam-1.png", "one tall flame tongue leaning slightly left, drawn as WHITE engraved contours and inner lines, filling the middle of the image."),
    ("Effect: mist (naadloos)", L, "effect-mist.png", "a band of low drifting mist made of soft WHITE engraved horizontal hatching, dense at the bottom and fading out toward the top. The left and right edges must match perfectly so it can scroll endlessly."),
    ("Effect: rook (naadloos)", L, "effect-rook.png", "a band of slowly curling smoke and steam plumes rising upward, in WHITE engraved lines. The left and right edges must match perfectly so it can scroll endlessly."),
    ("Effect: water (naadloos)", L, "effect-water.png", "a band of glints of light on calm water: short WHITE horizontal engraved strokes and ripples across the middle third of the image. The left and right edges must match perfectly."),
    ("Effect: lichtstralen", P, "effect-stralen.png", "several broad diagonal rays of light falling from the upper left toward the lower right, drawn as fine parallel WHITE engraved lines that fade out at their edges."),
    ("Effect: gloed", S, "effect-gloed.png", "a glow of concentric WHITE engraved rings with fine radiating lines, centered and fading outward."),
    ("Effect: wervelwind (naadloos)", L, "effect-wervelwind.png", "a band of howling whirlwind: streaks of wind, swirling engraved lines and scraps of cloth, all in WHITE. The left and right edges must match perfectly."),
    ("Effect: regen (naadloos)", S, "effect-regen.png", "slanting rain made of short diagonal WHITE engraved strokes of varying length, tiling perfectly on all four sides."),
]
for title, size, f, what in fx:
    add(title, "niets", size, B, f, f"Draw one light effect: {what} Only white lines on black, nothing else in the image.")
    if f == "effect-vlam-1.png":
        pose("Effect: vlam 2", f, "effect-vlam-2.png", size, B, "the flame now leans slightly to the right and its tip curls the other way, like the next moment of a flickering fire")

# UI
grp = ("Scherm", "Ornamenten voor de interface. Deze maak je **zwart op wit**; de app keert ze om naar wit op zwart.")
ui = [
    ("Scherm: balansmeter", L, "scherm-meter.png", "a long, thin ornamental bar running across the middle of the image from edge to edge, no taller than 15% of the image height. On the far left a small skull wreathed in thorns; on the far right a small radiant sun inside a laurel wreath. Between them an empty channel divided into five equal segments by four small carved dividers. The rest of the image is empty."),
    ("Scherm: icoon schedel", S, "scherm-icoon-1.png", "one small round medallion with a skull inside, bold and simple enough to read at 24 pixels, centered."),
    ("Scherm: icoon donkere boom", S, "scherm-icoon-2.png", "one small round medallion with a dark twisted tree inside, bold and simple enough to read at 24 pixels, centered."),
    ("Scherm: icoon bootje", S, "scherm-icoon-3.png", "one small round medallion with a small boat on water inside, bold and simple enough to read at 24 pixels, centered."),
    ("Scherm: icoon poort", S, "scherm-icoon-4.png", "one small round medallion with a stone gate on a mountain inside, bold and simple enough to read at 24 pixels, centered."),
    ("Scherm: icoon zon", S, "scherm-icoon-5.png", "one small round medallion with a radiant sun inside, bold and simple enough to read at 24 pixels, centered."),
    ("Scherm: lantaarntje", S, "scherm-lantaarn.png", "one small hanging iron lantern seen from the front, with a handle on top and an empty glass where the flame would be, centered, filling about half of the image."),
    ("Scherm: banner omlaag (Affliction)", L, "scherm-banner-omlaag.png", "one dark, torn, tattered banner of heavy cloth with ragged edges and thorny vines, mostly solid black, spanning the width of the image across the middle, with an empty calm area in its center for a title. The rest of the image is empty."),
    ("Scherm: banner omhoog (Virtue)", L, "scherm-banner-omhoog.png", "one luminous unfurled ribbon of cloth drawn in fine lines, with laurel at both ends and rays behind it, spanning the width of the image across the middle, with an empty calm area in its center for a title. The rest of the image is empty."),
    ("Scherm: lijst", P, "scherm-lijst.png", "one ornate picture frame like a 19th-century book plate: a double ruled border along all four edges with small corner ornaments of laurel and thorns, no thicker than 6% of the width. The inside is completely empty."),
    ("Scherm: inktvlek", S, "scherm-inktvlek.png", "one enormous, irregular black ink blot with splattered edges, as if a bottle of ink has spilled across an engraving, filling most of the image."),
]
for title, size, f, what in ui:
    add(title, "niets", size, W, f, f"Draw one interface ornament in black ink: {what}")

# ───────────────────────── 3. ACHTERGRONDEN ─────────────────────────
sec = "3 · Achtergronden"
grp = None
scenes = [
    ("inferno", "Inferno",
     "the pitch-black abyss at the bottom of Hell: a near-black void, and far away, barely visible, a colossal shadowy figure frozen waist-deep in a lake of ice. A faint cold glow rises from below.",
     "jagged black rock pillars and broken stone stairs descending into darkness",
     "a wet, uneven cave floor of black rock with scattered stones, old bones and small puddles reflecting faint light",
     "dripping stalactites from the top corners, rusted chains hanging on the left, sharp rocks in the bottom right"),
    ("woud", "Het donkere woud",
     "a dark forest at night: a night sky barely glimpsed through a dense canopy, and far away, through one small gap between the trees, a distant hill touched by the first pale light.",
     "dense, twisted, gnarled tree trunks receding into darkness, with dark gaps between them; keep the small distant gap of light visible",
     "a forest floor of tangled roots, dead leaves and undergrowth",
     "dark gnarled branches reaching in from the top corners and the sides, thorny brambles in the bottom corners"),
    ("kust", "De kust van de berg",
     "early dawn over a calm grey sea: a pale sky with soft light breaking from the upper left and low clouds on the horizon. No mountain, no figures.",
     "a great mountain rising on the right with carved terraces spiralling upward and mist at its base; the water in the center and on the left stays empty",
     "a pebbled shore with dry reeds and the water's edge",
     "large weathered boulders on the left and right edges, tall dry reeds in the bottom left"),
    ("terrassen", "De terrassen",
     "a clear morning sky high on a mountain: broad rays of sunlight breaking through parting clouds from the upper left, and a sea of clouds far below.",
     "carved stone ledges and stairways climbing up a mountain, and in the center distance a great carved stone gate at the top of three steps; the top step stays empty",
     "a broad carved stone ledge with worn steps and a few clumps of mountain grass and flowers",
     "a rugged rock edge with clinging wild plants along the left and right edges and the bottom corners"),
    ("paradiso", "Paradiso",
     "Doré's heaven: immense concentric rings of white light radiating from a point above the center, built from rays and circles, almost entirely white paper with fine lines.",
     "a distant celestial rose formed by countless tiny luminous figures arranged in rings, with soft parting clouds",
     "a floor of soft, bright, sculpted clouds drawn with sparse lines",
     "delicate wisps of cloud and fine streaks of light along the left and right edges and the bottom corners"),
]
for key, name, far, mid, near, front in scenes:
    farf = f"achtergrond-{key}-1-ver.png"
    add(f"{name}: laag 1, de verte", "niets", P, O, farf, f"""
Draw the farthest background layer of a scene. {far[0].upper() + far[1:]}
The horizon is at 60% of the image height. No characters.""")
    add(f"{name}: laag 2, het midden", f"`{farf}`", P, T, f"achtergrond-{key}-2-midden.png", f"""
Draw only the middle-distance layer that belongs in front of the attached background, with the same perspective and the same horizon: {mid}.
Leave open space on the left and right at about 75% of the image height. Do not redraw the sky or the far distance; that part stays transparent.""")
    add(f"{name}: laag 3, de grond", f"`{farf}`", P, T, f"achtergrond-{key}-3-grond.png", f"""
Draw only the ground layer that belongs in front of the attached background: {near}, from the horizon down to the bottom edge.
The center at about 88% of the image height is flat and calm, because a person stands there. Everything above the ground stays transparent.""")
    add(f"{name}: laag 4, de voorgrond", f"`{farf}`", P, T, f"achtergrond-{key}-4-voorgrond.png", f"""
Draw only the foreground framing layer that belongs in front of the attached background: {front}. These are very dark, almost black silhouettes.
The center 60% of the width stays completely empty and transparent.""")

# ───────────────────────── OUTPUT ─────────────────────────
out = []
out.append("""# PlusOne: beelden maken in ChatGPT

Een rechte lijst van boven naar beneden. **Eén stap is één beeld.**

1. **Karakters**: jijzelf, in 5 toestanden
2. **Items**: alles wat in de scène staat of beweegt
3. **Achtergronden**: de 5 plekken, elk in 4 lagen

## Zo werkt elke stap
1. Open een **nieuw gesprek** in ChatGPT en plak eerst **je stijlprompt**. Doe dat bij elk onderdeel opnieuw: één gesprek voor de karakters, één voor de items, één voor de achtergronden.
2. Staat er bij **Upload** een bestand? Voeg dat beeld toe met het paperclip-icoon.
3. Plak de **prompt** en verstuur.
4. Sla het beeld op onder de naam bij **Opslaan als**, allemaal in één map: `public/art/`.
5. Vink de stap af en ga naar de volgende.

Klopt het beeld niet? Vraag in hetzelfde gesprek: *"Make it again, closer to the prompt."* Krijg je een geblokt schaakbord in plaats van een doorzichtige achtergrond? Stuur dan: *"Real transparent background, not a checkerboard pattern."*

Meer over waarom de scène zo is opgebouwd staat in [SCENE-ONTWERP.md](SCENE-ONTWERP.md).

---
""")
cur = None
n = 0
counts = {}
curg = None
for (s_, g_, title, upload, size, bg, file, prompt) in steps:
    counts[s_] = counts.get(s_, 0) + 1
for (s_, g_, title, upload, size, bg, file, prompt) in steps:
    if s_ != cur:
        cur = s_
        out.append(f"\n## {s_}  ·  {counts[s_]} beelden\n")
    if g_ and g_ != curg:
        curg = g_
        out.append(f"\n#### — {g_[0]} —\n{g_[1]}\n")
    n += 1
    full = f"{prompt}\nStyle: as defined in my style prompt.\nSize: {size[2]}.\nBackground: {bg[1]}."
    out.append(f"""### ☐ Stap {n} · {title}
**Upload:** {upload} · **Formaat:** {size[0]} ({size[1]}) · **Achtergrond:** {bg[0]} · **Opslaan als:** `{file}`
```
{full}
```
""")
    if s_ == "1 · Karakters" and file == "karakter-ideaal-ogen-dicht.png":
        out.append("""> **Na de karakters (handwerk, geen prompt).** De drie beelden per toestand passen precies over elkaar. In Photoshop of Photopea knip je uit `karakter-…png` het hoofd en de armen (bovenarm, onderarm, hand). Uit `…-zonder-armen.png` knip je de romp en de benen, en uit `…-ogen-dicht.png` het hoofd met gesloten ogen. Wil je dit liever niet zelf doen? Lever dan alleen de beelden aan; het knippen kan ook later.
""")

out.append(f"\n---\n\n**Klaar.** {n} beelden in totaal. Zet ze in `public/art/`, dan bouw ik de levende scène erop.\n")
sys.stdout.write("\n".join(out))
print("\n", file=sys.stderr)
print({k: v for k, v in counts.items()}, n, file=sys.stderr)
