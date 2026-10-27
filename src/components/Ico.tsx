import type { CSSProperties } from 'react'
import back from '../icons/back.svg?raw'
import check from '../icons/check.svg?raw'
import close from '../icons/close.svg?raw'
import compass from '../icons/compass.svg?raw'
import minus from '../icons/minus.svg?raw'
import mirror from '../icons/mirror.svg?raw'
import next from '../icons/next.svg?raw'
import path from '../icons/path.svg?raw'
import plus from '../icons/plus.svg?raw'
import urge from '../icons/urge.svg?raw'
import user from '../icons/user.svg?raw'

// Eén consistente iconenset (24×24, lijn 2). Nieuwe iconen: kopieer de SVG naar src/icons/,
// vervang #212121 door currentColor en voeg hem hier toe.
export const ICONS = { back, check, close, compass, minus, mirror, next, path, plus, urge, user }
export type IconName = keyof typeof ICONS

export function Ico({ name, size = 22, color, style }: { name: IconName; size?: number; color?: string; style?: CSSProperties }) {
  return <span className="ico" style={{ width: size, height: size, color, ...style }} dangerouslySetInnerHTML={{ __html: ICONS[name] }} />
}
