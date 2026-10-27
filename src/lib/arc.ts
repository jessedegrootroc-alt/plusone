/**
 * Een boog rond (x, y) die bovenaan begint, voor een deel `f` van de cirkel (0 tot 1).
 * Met de klok mee voor wat je wint (de deugd), tegen de klok in voor wat je verliest (de zonde):
 * zo loopt een min-score letterlijk de andere kant op.
 */
export const arc = (x: number, y: number, r: number, f: number, back = false) => {
  const a = Math.min(Math.max(f, 0), 0.9999) * Math.PI * 2
  const ex = x + (back ? -1 : 1) * Math.sin(a) * r
  const ey = y - Math.cos(a) * r
  return `M ${x} ${y - r} A ${r} ${r} 0 ${a > Math.PI ? 1 : 0} ${back ? 0 : 1} ${ex} ${ey}`
}
