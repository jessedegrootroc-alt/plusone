// De taal van de animatic: Nederlands of Engels. Hij ligt vast zodra de pagina laadt (?lang=en, en daarna onthouden op
// dit toestel); wisselen op het startscherm laadt de pagina opnieuw in de andere taal. Elke tekst staat met t() naast
// zijn vertaling, zodat de twee versies altijd samen veranderen.
export type Lang = 'nl' | 'en'

const KEY = 'animatic-taal'

export const lang: Lang = (() => {
  const asked = new URLSearchParams(location.search).get('lang')
  if (asked === 'nl' || asked === 'en') {
    try { localStorage.setItem(KEY, asked) } catch { /* privémodus: dan alleen deze keer */ }
    return asked
  }
  try { return localStorage.getItem(KEY) === 'en' ? 'en' : 'nl' } catch { return 'nl' }
})()

/** De Nederlandse tekst, of de Engelse als de animatic in het Engels staat. */
export const t = (nl: string, en: string) => (lang === 'en' ? en : nl)

/** Dezelfde pagina in de andere taal (een scène in de link blijft staan). */
export const switchLang = (to: Lang) => {
  const url = new URL(location.href)
  url.searchParams.set('lang', to)
  location.replace(url.toString())
}
