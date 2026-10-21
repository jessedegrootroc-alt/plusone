// De grens (Goggins): groeien door bewust ongemak op te zoeken, verdeeld over je hele leven.
// Model: comfortzone → groeizone → paniekzone (Senninger). Groei gebeurt in het midden;
// in de paniekzone leer je niets en brand je op. Daarom meet de app ook je energie.

export type AreaId =
  | 'werk' | 'geld' | 'leiden'
  | 'leren' | 'denken' | 'binnen'
  | 'maken' | 'creatief' | 'zichtbaar'
  | 'taal' | 'wereld' | 'natuur'
  | 'mensen' | 'liefde' | 'familie' | 'geven'
  | 'lichaam'

export interface Area {
  id: AreaId
  name: string
  line: string
  group: string
}

// Gegroepeerd zoals je over je leven nadenkt, zodat je de plek snel vindt.
export const AREAS: Area[] = [
  { id: 'werk', group: 'Werk & geld', name: 'Werk & ondernemen', line: 'Iets bouwen dat van jou is.' },
  { id: 'geld', group: 'Werk & geld', name: 'Geld', line: 'Grip op je geld, in plaats van geld dat jou stuurt.' },
  { id: 'leiden', group: 'Werk & geld', name: 'Leiderschap', line: 'Verantwoordelijkheid voor meer dan jezelf.' },
  { id: 'leren', group: 'Hoofd', name: 'Leren & studie', line: 'Een vaardigheid die je nog niet hebt.' },
  { id: 'denken', group: 'Hoofd', name: 'Zelf denken', line: 'Een mening die je zelf hebt gevormd.' },
  { id: 'binnen', group: 'Hoofd', name: 'Binnenwereld', line: 'Kijken naar wat je liever niet voelt.' },
  { id: 'maken', group: 'Maken', name: 'Hobby & ambacht', line: 'Doen in plaats van zeggen dat je het gaat doen.' },
  { id: 'creatief', group: 'Maken', name: 'Creatief maken', line: 'Iets uit jezelf halen: schrijven, tekenen, muziek.' },
  { id: 'zichtbaar', group: 'Maken', name: 'Zichtbaar worden', line: 'Laten zien wat je maakt en denkt.' },
  { id: 'taal', group: 'De wereld', name: 'Taal', line: 'Een nieuwe taal is een nieuwe wereld.' },
  { id: 'wereld', group: 'De wereld', name: 'Reizen & avontuur', line: 'Weg uit je kamer, weg uit je stad.' },
  { id: 'natuur', group: 'De wereld', name: 'Natuur & buiten', line: 'Buiten zijn, ook als het koud en nat is.' },
  { id: 'mensen', group: 'Mensen', name: 'Mensen', line: 'Het gesprek dat je spannend vindt.' },
  { id: 'liefde', group: 'Mensen', name: 'Liefde & relatie', line: 'Iemand echt dichtbij laten komen.' },
  { id: 'familie', group: 'Mensen', name: 'Familie', line: 'De banden die je niet zelf koos.' },
  { id: 'geven', group: 'Mensen', name: 'Geven & gemeenschap', line: 'Iets doen voor anderen, zonder dat het moet.' },
  { id: 'lichaam', group: 'Lichaam', name: 'Fysieke grens', line: 'Je lichaam kan meer dan je hoofd zegt.' },
]
export const AREA_BY_ID = Object.fromEntries(AREAS.map((a) => [a.id, a])) as Record<AreaId, Area>

/** Klein: past in een week, kost een uur of minder. Groot: een mijlpaal die je inplant. */
export type Size = 'klein' | 'groot'

export interface ChallengeTemplate {
  area: AreaId
  title: string
  size: Size
  /** De eerste stap van twee minuten. Wie die zet, heeft het niet alleen gezegd. */
  step: string
}

const c = (area: AreaId, size: Size, title: string, step: string): ChallengeTemplate => ({ area, size, title, step })

export const CHALLENGES: ChallengeTemplate[] = [
  c('werk', 'klein', 'Bedrijfsidee op één A4 uitgeschreven', 'Open een leeg document en zet de titel erboven'),
  c('werk', 'klein', 'Iemand gebeld die verder is dan jij', 'Schrijf drie namen op'),
  c('werk', 'klein', 'Eén potentiële klant benaderd', 'Zoek één naam en één reden waarom zij'),
  c('werk', 'groot', 'Je eerste product of dienst verkocht', 'Zet een prijs op wat je kunt'),
  c('werk', 'groot', 'Bedrijf ingeschreven bij de KvK', 'Plan de afspraak in'),
  c('werk', 'groot', 'Om opslag of promotie gevraagd', 'Schrijf op wat je het afgelopen jaar hebt bereikt'),

  c('denken', 'klein', 'Een boek gelezen van iemand met een andere mening', 'Zoek de titel op en reserveer hem'),
  c('denken', 'klein', 'Een eigen overtuiging onderuit gehaald', 'Schrijf het sterkste argument tegen jezelf op'),
  c('denken', 'klein', 'Een claim gecheckt bij de bron', 'Kies het laatste nieuwsbericht dat je deelde'),
  c('denken', 'klein', 'Een dag zonder nieuws en socials', 'Zet de apps nu in een map op het laatste scherm'),
  c('denken', 'groot', 'Je eigen standpunt opgeschreven en gedeeld', 'Schrijf de eerste zin'),
  c('denken', 'groot', 'Een debat aangegaan met iemand die het oneens is', 'Vraag het iemand die je respecteert'),

  c('maken', 'klein', 'Een uur gemaakt in plaats van geconsumeerd', 'Leg je materiaal klaar voor vanavond'),
  c('maken', 'klein', 'De eerste les van een nieuwe hobby', 'Zoek één beginnersvideo en zet hem klaar'),
  c('maken', 'klein', 'Twintig minuten een instrument geoefend', 'Haal het instrument uit de hoes'),
  c('maken', 'groot', 'Iets afgemaakt en aan iemand laten zien', 'Kies het ene project dat al half klaar is'),
  c('maken', 'groot', 'Ingeschreven voor een cursus of club', 'Zoek er drie in de buurt'),
  c('maken', 'groot', 'Iets verkocht dat je zelf hebt gemaakt', 'Maak een foto van je beste werk'),

  c('taal', 'klein', 'Vijftien minuten een nieuwe taal geoefend', 'Installeer één app of pak één boek'),
  c('taal', 'klein', 'Een aflevering gekeken in die taal, met ondertitels in die taal', 'Zet de taal van je streamingdienst om'),
  c('taal', 'klein', 'Eten of koffie besteld in die taal', 'Leer de drie zinnen die je nodig hebt'),
  c('taal', 'groot', 'Een taalpartner gevonden', 'Maak een profiel aan op een tandem-app'),
  c('taal', 'groot', 'Tien minuten een gesprek gevoerd in die taal', 'Plan het in met je taalpartner'),
  c('taal', 'groot', 'Een examen ingepland', 'Zoek de eerstvolgende datum op'),

  c('wereld', 'klein', 'Ergens geweest in je stad waar je nog nooit was', 'Open de kaart en kies een wijk'),
  c('wereld', 'klein', 'Alleen uit eten of alleen naar de film', 'Kies de plek en de avond'),
  c('wereld', 'klein', 'Een dagtrip zonder plan', 'Zoek de eerste trein van zaterdag op'),
  c('wereld', 'groot', 'Alleen op reis geboekt', 'Kies drie bestemmingen en een maand'),
  c('wereld', 'groot', 'Een land bezocht waar je de taal niet spreekt', 'Zet een prijsalert voor een vlucht'),
  c('wereld', 'groot', 'Een nacht buiten geslapen', 'Leen of zoek een slaapzak'),

  c('mensen', 'klein', 'Een vreemde aangesproken', 'Bedenk één open vraag die je kunt stellen'),
  c('mensen', 'klein', 'Iemand uitgenodigd voor koffie', 'Stuur nu het bericht'),
  c('mensen', 'klein', 'Nee gezegd zonder excuus', 'Bedenk waar je deze week nee tegen wilt zeggen'),
  c('mensen', 'klein', 'Alleen naar een meetup of evenement', 'Zoek er één deze week'),
  c('mensen', 'groot', 'Een moeilijk gesprek gevoerd dat je uitstelde', 'Schrijf op wat je wilt zeggen in één zin'),
  c('mensen', 'groot', 'Een praatje of presentatie gegeven', 'Vraag waar je mag spreken'),

  c('lichaam', 'klein', 'Een training gedaan die je haat', 'Zet hem in je agenda voor morgen'),
  c('lichaam', 'klein', 'Drie minuten in het ijsbad', 'Vul vanavond het bad of zoek een plek'),
  c('lichaam', 'klein', '5 km gelopen voor 7:00', 'Leg je kleren vanavond klaar'),
  c('lichaam', 'groot', 'Ingeschreven voor een wedstrijd', 'Zoek een 10 km, Hyrox of marathon'),
  c('lichaam', 'groot', 'Een tocht van 30 km gelopen', 'Kies de route'),
  c('lichaam', 'groot', 'Eén dag per jaar die je grens verlegt (misogi)', 'Schrijf op wat je nu niet zou durven'),

  c('geld', 'klein', 'Je uitgaven van de afgelopen maand op een rij gezet', 'Download het afschrift van vorige maand'),
  c('geld', 'klein', 'Eén abonnement opgezegd dat je niet gebruikt', 'Zoek in je bankapp de terugkerende betalingen'),
  c('geld', 'klein', 'Een boek over geld gelezen', 'Kies er één en reserveer hem'),
  c('geld', 'groot', 'Een buffer van drie maanden opgebouwd', 'Open een aparte spaarrekening'),
  c('geld', 'groot', 'Een schuld helemaal afgelost', 'Zet al je schulden op één lijst'),
  c('geld', 'groot', 'Een gesprek gehad met een onafhankelijk financieel adviseur', 'Schrijf je drie vragen op'),

  c('leiden', 'klein', 'Een overleg zelf geleid', 'Schrijf de agenda in drie punten'),
  c('leiden', 'klein', 'Iemand eerlijke feedback gegeven', 'Schrijf op wat je zag en wat het deed'),
  c('leiden', 'klein', 'Als eerste een fout van het team op je genomen', 'Bedenk wat je gaat zeggen'),
  c('leiden', 'groot', 'Een groep geleid bij een project', 'Bied je aan'),
  c('leiden', 'groot', 'Een evenement georganiseerd', 'Kies een datum en een plek'),
  c('leiden', 'groot', 'Iemand ingewerkt of begeleid', 'Schrijf op wat jij toen had willen horen'),

  c('leren', 'klein', 'Een uur geleerd van iets wat je nog niet kunt', 'Kies het onderwerp en zet een timer'),
  c('leren', 'klein', 'Een gratis online cursus begonnen', 'Zoek er één en maak een account'),
  c('leren', 'klein', 'Iemand gevraagd om je iets te leren', 'Bedenk wie kan wat jij wilt kunnen'),
  c('leren', 'groot', 'Een cursus afgemaakt, met certificaat', 'Zet de eerste les in je agenda'),
  c('leren', 'groot', 'Iets gebouwd met wat je leerde', 'Schrijf op wat het moet kunnen'),
  c('leren', 'groot', 'Je aangemeld voor een opleiding', 'Zoek de inschrijfdatum op'),

  c('binnen', 'klein', 'Een uur alleen gezeten, zonder telefoon of muziek', 'Zet een timer en ga zitten'),
  c('binnen', 'klein', 'Opgeschreven waar je echt bang voor bent', 'Begin met: ik ben bang dat'),
  c('binnen', 'klein', 'Iemand verteld hoe het écht met je gaat', 'Kies iemand die je vertrouwt'),
  c('binnen', 'groot', 'Een afspraak gemaakt met een psycholoog of coach', 'Zoek er drie op'),
  c('binnen', 'groot', 'Een stilte-retraite gedaan', 'Zoek er één van een weekend'),
  c('binnen', 'groot', 'Een oude wond eindelijk aangekeken', 'Schrijf een brief die je niet verstuurt'),

  c('creatief', 'klein', 'Een pagina geschreven zonder iets te verbeteren', 'Pak pen en papier'),
  c('creatief', 'klein', 'Twintig minuten getekend', 'Leg potlood en papier klaar'),
  c('creatief', 'klein', 'Een eigen liedje of beat begonnen', 'Neem tien seconden op met je telefoon'),
  c('creatief', 'groot', 'Een kort verhaal of essay afgemaakt', 'Schrijf de laatste zin eerst'),
  c('creatief', 'groot', 'Werk ingestuurd voor een wedstrijd of expositie', 'Zoek er één met een deadline'),
  c('creatief', 'groot', 'Dertig dagen elke dag iets gemaakt', 'Kies wat en hoe laat'),

  c('zichtbaar', 'klein', 'Iets gedeeld wat je zelf hebt gemaakt', 'Kies het en schrijf er één zin bij'),
  c('zichtbaar', 'klein', 'Je mening gegeven in een groep waar je meestal zwijgt', 'Bedenk vooraf je eerste zin'),
  c('zichtbaar', 'klein', 'Een video van jezelf opgenomen', 'Zet je telefoon neer en druk op opnemen'),
  c('zichtbaar', 'groot', 'Een maand lang elke week iets gepubliceerd', 'Kies het kanaal en de dag'),
  c('zichtbaar', 'groot', 'Je eigen website of portfolio online gezet', 'Schrijf in drie zinnen wie je bent'),
  c('zichtbaar', 'groot', 'Te gast geweest in een podcast of interview', 'Vraag het iemand met een podcast'),

  c('natuur', 'klein', 'Een uur buiten zonder telefoon', 'Laat hem thuis liggen'),
  c('natuur', 'klein', 'De zon zien opkomen', 'Zet je wekker twintig minuten ervoor'),
  c('natuur', 'klein', 'Gezwommen in open water, met iemand erbij', 'Zoek een veilige plek'),
  c('natuur', 'groot', 'Een nacht gekampeerd', 'Leen een tent'),
  c('natuur', 'groot', 'Een meerdaagse wandeltocht gelopen', 'Kies de route'),
  c('natuur', 'groot', 'Een week in de natuur zonder scherm', 'Plan de week en vertel het iemand'),

  c('liefde', 'klein', 'Gezegd wat je voelt, zonder grap erachter', 'Schrijf het eerst voor jezelf op'),
  c('liefde', 'klein', 'Iemand mee uit gevraagd', 'Kies wie en waar'),
  c('liefde', 'klein', 'Een avond samen zonder telefoons', 'Leg ze in een andere kamer'),
  c('liefde', 'groot', 'Het moeilijke gesprek over jullie relatie gevoerd', 'Schrijf op wat jij nodig hebt'),
  c('liefde', 'groot', 'Samen een relatiecursus of therapie gedaan', 'Zoek er één en stel het voor'),
  c('liefde', 'groot', 'Je kwetsbaarste kant laten zien', 'Bedenk wat bijna niemand van je weet'),

  c('familie', 'klein', 'Je ouders of grootouders zomaar gebeld', 'Zoek het nummer op'),
  c('familie', 'klein', 'Een familieverhaal opgeschreven', 'Vraag één herinnering'),
  c('familie', 'klein', 'Een broer, zus of neef opgezocht', 'Stuur nu een bericht'),
  c('familie', 'groot', 'Een familieruzie uitgepraat', 'Schrijf in één zin wat je wilt zeggen'),
  c('familie', 'groot', 'Een hele dag met een ouder doorgebracht', 'Stel een datum voor'),
  c('familie', 'groot', 'Het levensverhaal van een ouder opgenomen', 'Bedenk tien vragen'),

  c('geven', 'klein', 'Iets gedaan voor een vreemde, zonder dat iemand het zag', 'Kijk vandaag om je heen'),
  c('geven', 'klein', 'Een buur geholpen', 'Bel aan of schrijf een briefje'),
  c('geven', 'klein', 'Bloed of plasma gedoneerd', 'Kijk of je mag doneren'),
  c('geven', 'groot', 'Begonnen met vrijwilligerswerk', 'Zoek drie plekken in de buurt'),
  c('geven', 'groot', 'Mentor geworden van iemand die jonger is', 'Bedenk wie je kunt helpen'),
  c('geven', 'groot', 'Een inzameling of actie georganiseerd', 'Kies het goede doel'),
]

/** Hoe spannend het voelt, vooraf. Groei zit in het midden. */
export const FEAR = [
  { v: 1, label: 'Lekker', zone: 'comfort' },
  { v: 2, label: 'Spannend', zone: 'groei' },
  { v: 3, label: 'Doodeng', zone: 'paniek' },
] as const

/** Hoe het was, achteraf. 'Te veel' is een signaal, geen falen. */
export const FELT = [
  { v: 1, label: 'Viel mee' },
  { v: 2, label: 'Zwaar, maar goed' },
  { v: 3, label: 'Te veel' },
] as const

export const ENERGY = [
  { v: 1, label: 'Leeg' },
  { v: 2, label: 'Oké' },
  { v: 3, label: 'Vol' },
] as const
