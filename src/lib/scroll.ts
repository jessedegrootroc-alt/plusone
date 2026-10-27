// Vloeiend scrollen. Met een muiswiel of trackpad glijdt de pagina na in plaats van te verspringen (Lenis);
// met een vinger blijft het scrollen van de telefoon zelf, dat is al vloeiend en voelt vertrouwd.
// Dezelfde uitloop als de rest van het design system (--ease), en uit bij "minder beweging".
import Lenis from 'lenis'

let lenis: Lenis | null = null

/** Uitlopen zoals cubic-bezier(0.22, 1, 0.36, 1): snel weg, zacht tot stilstand. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 5)

export const startSmoothScroll = () => {
  if (lenis || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  lenis = new Lenis({
    duration: 1.1,
    easing: easeOut,
    smoothWheel: true,
    syncTouch: false,
    // Sheets en horizontale rijen scrollen zelf; daar mag het niet aan trekken
    prevent: (node) => !!node.closest?.('.sheet, .chips.scroll'),
  })
  const raf = (t: number) => { lenis!.raf(t); requestAnimationFrame(raf) }
  requestAnimationFrame(raf)
}

/** Naar boven: meteen bij een paginawissel, vloeiend als je het zelf vraagt. */
export const scrollToTop = (smooth = false) => {
  if (lenis) lenis.scrollTo(0, { immediate: !smooth, force: true })
  else window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'instant' })
}
