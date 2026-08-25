import type { Channel, OrderItem } from './model'

export interface CategoryRule {
  id: string
  name: string
  color: string
  /** Lower-cased substrings matched against the product name. */
  keywords: string[]
  /** Restrict the rule to a channel (used by the digital-media default rule). */
  channel?: Channel
  enabled: boolean
  /** Marks the rules that ship with the app, so the UI can offer a reset. */
  builtin?: boolean
}

export const UNCATEGORISED = 'Uncategorised'

/**
 * Amazon exports carry no category for retail items, so categories are derived
 * from product names. Rules are evaluated top to bottom, first match wins —
 * which is why the narrow ones (photo, automotive) sit above the broad ones.
 * Keywords are deliberately bilingual: an amazon.de account mixes DE and EN.
 *
 * Keywords match as plain substrings, which is what makes German compounds work
 * ("topf" also catches "Kochtopf"). Short words that hide inside unrelated ones
 * therefore carry a LEADING SPACE: " roller" matches "Roller" but not
 * "Controller", " lack" not "Black", " deo" not "Video", " reis" not "Preis".
 */
export const defaultRules = (): CategoryRule[] => [
  {
    id: 'giftcards',
    name: 'Gift Cards & Top-ups',
    color: '#f59e0b',
    keywords: ['gutschein', 'geschenkkarte', 'geschenkgutschein', 'aufladen', 'amazon-konto', 'guthaben', 'gift card'],
    enabled: true,
    builtin: true,
  },
  {
    id: 'digital',
    name: 'Digital & Media',
    color: '#8b5cf6',
    channel: 'digital',
    keywords: [],
    enabled: true,
    builtin: true,
  },
  {
    id: 'photo',
    name: 'Photo & Video',
    color: '#06b6d4',
    keywords: ['kamera', 'camera', 'objektiv', 'stativ', 'tripod', 'gimbal', 'gopro', 'blitzgerät', 'systemblitz',
      'mikrofon', 'microphone', 'ringlicht', 'softbox', 'sofortbild', 'dslr', 'spiegelreflex', 'fotopapier',
      'speicherkarte', 'kamerarucksack', 'polfilter', 'graufilter', 'beamer', 'projektor', 'leinwand'],
    enabled: true,
    builtin: true,
  },
  {
    id: 'automotive',
    name: 'Automotive & Motorcycle',
    color: '#78716c',
    keywords: ['motorrad', 'motorcycle', 'motoröl', 'getriebeöl', 'kfz', 'pkw', 'reifen', 'felge', 'scheibenwischer',
      'bremsbelag', 'bremsscheibe', 'zündkerze', 'auspuff', 'anhängerkupplung', 'kennzeichen', 'nummernschild',
      'motorradhelm', 'visier', 'lichtmaschine', 'anlasser', 'obd', 'wagenheber', 'sitzbezug', 'dachträger',
      'ducati', 'motorroller', ' roller', 'lenkrad', 'kettenspray', 'bremsflüssigkeit', 'starthilfe', 'autobatterie',
      'fußmatten', 'warnweste', 'abschleppseil', 'luftfilter', 'ölfilter', 'zündspule'],
    enabled: true,
    builtin: true,
  },
  {
    id: 'tools',
    name: 'Tools & DIY',
    color: '#f97316',
    keywords: ['bohrer', 'akkuschrauber', 'schraube', 'dübel', 'hammer', 'zange', 'sägeblatt', 'stichsäge',
      'werkzeug', 'schleifpapier', 'schleifer', 'silikon', 'bauschaum', 'epoxid', 'sekundenkleber',
      'klebeband', 'gewebeband', 'alleskleber', 'holzleim', 'klarlack', 'sprühlack', ' lack', 'pinsel', 'zollstock', 'wasserwaage', 'multimeter',
      'lötkolben', 'lötstation', 'kabelbinder', 'schraubendreher', 'inbus', 'drehmoment', 'trittleiter',
      'winkelschleifer', 'gewindeschneider', 'spachtel', 'fugen', 'nietzange', 'schleifscheibe', 'bit-satz',
      'ersatzklingen', 'cuttermesser', 'maurer', 'dichtungsband', 'montagekleber', 'holzschrauben'],
    enabled: true,
    builtin: true,
  },
  {
    id: 'garden',
    name: 'Garden & Plants',
    color: '#65a30d',
    keywords: ['garten', 'pflanze', 'blumen', 'blumensamen', ' samen', 'saatgut', 'blumenerde', 'dünger', 'rasen',
      'gießkanne', 'hochbeet', 'terrasse', 'grill', 'grillkohle', 'briketts', 'heckenschere', 'laubbläser',
      'sonnenschirm', 'blumentopf', 'pflanzkübel', 'gartenschlauch', 'kettensäge', 'vogelhaus', 'insektenhotel',
      'pizzaofen', 'feuerschale', 'schneeschieber', 'streugut'],
    enabled: true,
    builtin: true,
  },
  {
    id: 'pets',
    name: 'Pets',
    color: '#d946ef',
    keywords: ['hundefutter', 'katzenfutter', 'katzenstreu', 'kratzbaum', 'hundeleine', 'napf',
      'aquarium', 'terrarium', 'vogelfutter', 'tierbedarf', 'kauknochen', 'hundebett', 'katzenklo',
      'hundegeschirr', 'katzenspielzeug', 'zeckenzange'],
    enabled: true,
    builtin: true,
  },
  {
    id: 'baby-toys',
    name: 'Baby, Kids & Toys',
    color: '#f472b6',
    keywords: ['baby', 'windel', 'kinderwagen', 'schnuller', 'spielzeug', 'lego', 'playmobil', 'puzzle',
      'brettspiel', 'gesellschaftsspiel', 'plüsch', 'kuscheltier', 'malbuch', 'kinderbuch', 'bausteine',
      'laufrad', 'kindersitz', 'modellbau', 'rc-auto', 'ferngesteuert', 'quadrocopter', 'drohne',
      'experimentierkasten', 'knete', 'bobby car'],
    enabled: true,
    builtin: true,
  },
  {
    id: 'music',
    name: 'Music & Instruments',
    color: '#a855f7',
    keywords: ['gitarre', 'gitarren', 'saiten', 'plektrum', 'klavier', 'piano', 'schlagzeug', 'drumsticks',
      'verstärker', 'notenständer', 'notenblätter', ' noten', 'ukulele', 'synthesizer', 'midi', 'mischpult', 'stimmgerät', 'kapodaster',
      'gitarrengurt', 'audio-interface', 'monitorboxen'],
    enabled: true,
    builtin: true,
  },
  {
    id: 'electronics',
    name: 'Electronics & Computing',
    color: '#3b82f6',
    keywords: ['usb', 'hdmi', 'kabel', 'cable', 'adapter', 'ladegerät', 'ladekabel', 'ladestation', 'charger',
      'netzteil', 'powerbank', 'akku', 'batterie', 'batterien', 'kopfhörer', 'headset', 'earbuds', 'ohrhörer',
      'airpods', 'lautsprecher', 'speaker', 'soundbar', 'subwoofer', 'soundtouch', 'sonos', 'soundkarte',
      'monitor', 'display', 'tastatur', 'keyboard', 'mouse', 'trackpad', 'festplatte', 'ssd', 'nvme',
      'sd-karte', 'sd karte', 'microsd', 'usb-stick', 'kartenleser', 'router', 'wlan', 'wifi', 'bluetooth',
      'smartphone', 'handy', 'tablet', 'ipad', 'iphone', 'laptop', 'notebook', 'macbook', 'imac', 'apple watch',
      'apple pencil', 'drucker', 'toner', 'druckerpatrone', 'tinte', 'webcam', 'fernseher', 'smart tv',
      'receiver', 'dockingstation', 'raspberry', 'arduino', 'esp32', 'sensor', 'ethernet', 'netzwerk',
      'patchkabel', 'repeater', 'powerline', 'nas-system', 'netzwerkspeicher', 'synology', 'diskstation', 'schutzfolie',
      'displayschutz', 'smartwatch', 'fitness tracker', 'echo dot', 'fire tv', 'alexa', 'amazon echo',
      'steckdose', 'smart home', 'zigbee', 'thermostat', 'geforce', 'grafikkarte', 'mainboard', 'prozessor',
      'ryzen', 'arbeitsspeicher', 'gehäuselüfter', 'pc-gehäuse', 'netzwerkkabel', 'fernbedienung', 'harmony',
      'mp3-player', 'kindle', 'e-reader', 'usb-hub', 'hub ', 'wireless charger', 'lüfter', 'kühler',
      'messgerät', 'keypad', 'ups ', 'steckdosenleiste', 'verlängerungskabel', 'funksteckdose', 'schutzhülle',
      'hülle für', 'tastaturhülle', 'klapphülle', 'ladepad', 'kfz-halterung'],
    enabled: true,
    builtin: true,
  },
  {
    id: 'gaming',
    name: 'Gaming',
    color: '#22c55e',
    keywords: ['playstation', 'ps4', 'ps5', 'xbox', 'nintendo', 'gamepad', 'controller', 'konsole', 'steam deck',
      'joy-con', 'oculus', 'meta quest', 'quest 2', 'quest 3', 'vr-brille', 'gaming-stuhl', 'gaming stuhl', 'gaming-maus', 'arcade', 'joystick',
      'guitar hero', 'wii', 'gamecube', 'retro-konsole', 'emulator'],
    enabled: true,
    builtin: true,
  },
  {
    id: 'home',
    name: 'Home & Kitchen',
    color: '#0ea5e9',
    keywords: ['küche', 'pfanne', 'topf', 'kochtopf', 'messer', 'schneidebrett', 'geschirr', 'teller', 'tasse',
      'becher', 'besteck', 'mixer', 'kaffeemaschine', 'kaffeevollautomat', 'vollautomat', 'kaffeepadmaschine',
      'milchaufschäumer', 'entkalker', 'wasserfilter', 'filterkartusche', 'wasserkocher', 'toaster',
      'dampfgarer', 'sous-vide', 'vakuumierer', 'vakuumiergerät', 'multikocher', 'heißluftfritteuse',
      'fritteuse', 'küchenmaschine', 'standmixer', 'entsafter', 'eismaschine', 'waffeleisen', 'kontaktgrill',
      'reiskocher', 'schnellkochtopf', 'sodastream', 'wassersprudler', 'staubsauger', 'saugroboter',
      'wischroboter', 'staubsaugerbeutel', 'bügeleisen', 'bügelbrett', 'wäschekorb', 'wäschespinne',
      'waschmittel', 'waschpulver', 'weichspüler', 'spülmittel', 'allzweckreiniger', 'putzmittel', 'schwamm',
      'müllbeutel', 'mülleimer', 'aufbewahrungsbox', 'vorratsdose', 'vorratsglas', 'einmachglas', 'gläser',
      'frischhalte', 'gefrierbeutel', 'backpapier', 'alufolie', 'küchenrolle', 'toilettenpapier',
      'papiertücher', 'taschentücher', 'handtuch', 'geschirrtuch', 'bettwäsche', 'spannbettlaken', 'bettlaken',
      'kopfkissen', 'bettdecke', 'gewichtsdecke', 'matratze', 'kissenbezug', 'lampe', 'leuchte', 'glühbirne',
      'led-lampe', 'philips hue', 'vorhang', 'duschvorhang', 'teppich', 'mikrowelle', 'backofen', 'backblech',
      'auflaufform', 'thermoskanne', 'regal', 'kleiderbügel', 'spülmaschine', 'luftreiniger', 'luftbefeuchter',
      'luftentfeuchter', 'ventilator', 'heizlüfter', 'wandhalterung', 'schreibtisch', 'stuhl', 'sofa',
      'seifenspender', 'waage', 'badspiegel', 'handtuchhalter', 'duschkopf', 'porzellan', 'küchensieb', 'reibe',
      'emsa', 'thermometer', 'kerzen', 'bilderrahmen', 'garderobe', 'schuhregal', 'wäschenetz'],
    enabled: true,
    builtin: true,
  },
  {
    id: 'health',
    name: 'Health & Personal Care',
    color: '#14b8a6',
    keywords: ['shampoo', 'duschgel', 'duschbad', 'creme', 'zahnbürste', 'zahnpasta', 'zahnseide', 'sonicare',
      'oral-b', 'rasierer', 'rasierklingen', 'oneblade', 'haarschneider', 'haartrimmer', 'bartpflege',
      'deodorant', 'deospray', ' deo', 'seife', 'vitamin', 'magnesium', 'zink', 'omega', 'kapseln', 'tabletten', 'nahrungsergänzung',
      'kollagen', 'probiotika', 'melatonin', 'ashwagandha', 'spirulina', 'chlorella', 'msm',
      'pflaster', 'verband', 'desinfektion', 'sonnencreme', 'hautpflege', 'handcreme', 'lippenpflege',
      'parfum', 'massage', 'blutdruckmessgerät', 'fieberthermometer', 'ffp2', 'einweghandschuhe',
      'ohrstöpsel', 'brille', 'kontaktlinsen', 'wattestäbchen', 'nasenspray', 'hustensaft', 'ibuprofen',
      'paracetamol', 'rotlicht', 'lichttherapie', 'waschlotion', 'bodylotion', 'haarpflege'],
    enabled: true,
    builtin: true,
  },
  {
    id: 'grocery',
    name: 'Grocery & Drinks',
    color: '#84cc16',
    keywords: ['kaffee', 'kaffeebohnen', 'kaffeepads', 'kaffeekapseln', 'tassimo', 'nespresso', 'jacobs',
      'espresso', 'crema', 'teebeutel', 'schokolade', 'nudeln', 'pasta', 'olivenöl', 'kokosöl', 'rapsöl',
      'leinöl', 'honig', 'mandeln', 'cashew', 'walnüsse', 'nüsse', 'protein', 'riegel', 'gewürz', 'curry',
      'chili', 'habanero', 'jalapeno', 'chipotle', 'paprika', 'meersalz', 'pfeffer', 'mehl', 'zucker',
      'getrocknet', 'trockenfrüchte', 'datteln', 'feigen', 'rosinen', 'snack', 'müsli', 'haferflocken',
      'sirup', 'kakao', 'chips', 'gummibärchen', 'süßigkeiten', 'bio-', 'kräuter', 'kurkuma', 'ingwer',
      'zimt', 'vanille', 'backpulver', 'hefe', 'basmati', 'milchreis', ' reis', 'linsen', 'kichererbsen', 'quinoa', 'wurst',
      'schinken', 'käse', 'hühnereier', 'freilandhaltung', ' eier', 'milch', 'haferdrink', 'oatly', 'joghurt', 'butter', 'essig', 'senf',
      'ketchup', 'sauce', 'tomaten', 'marmelade', 'aufstrich', 'brot', 'mineralwasser', 'limonade',
      'bier', 'wein', 'whisky', 'likör', 'pulver', 'vegan', 'gemahlen', 'lebensmittel'],
    enabled: true,
    builtin: true,
  },
  {
    id: 'books',
    name: 'Books & Print',
    color: '#eab308',
    keywords: ['buch', 'bücher', 'roman', 'taschenbuch', 'gebundene ausgabe', 'dvd', 'blu-ray', 'zeitschrift',
      'magazin', 'comic', 'manga', 'kalender', 'reiseführer', 'kochbuch', 'lexikon', 'wörterbuch', 'atlas',
      'landkarte', 'hörbuch'],
    enabled: true,
    builtin: true,
  },
  {
    id: 'clothing',
    name: 'Clothing & Shoes',
    color: '#ec4899',
    keywords: ['t-shirt', 'shirt', 'hose', 'jacke', 'pullover', 'hoodie', 'socken', 'schuhe', 'sneaker', 'stiefel',
      'mütze', 'handschuhe', 'gürtel', 'jeans', 'kleid', 'unterwäsche', 'boxershorts', 'badehose', 'hemd',
      'sweatshirt', 'halstuch', 'regenjacke', 'weste', 'krawatte', 'einlegesohlen', 'hausschuhe', 'sandalen'],
    enabled: true,
    builtin: true,
  },
  {
    id: 'sports',
    name: 'Sports & Outdoor',
    color: '#ef4444',
    keywords: ['fahrrad', 'e-bike', 'hantel', 'kettlebell', 'yogamatte', 'fitness', 'laufschuh',
      'camping', 'zelt', 'schlafsack', 'isomatte', 'rucksack', 'wander', 'trekking', 'schwimmbrille',
      'tauchen', 'klettern', 'stirnlampe', 'taschenlampe', 'multitool', 'thermoflasche', 'trinkflasche',
      'faszienrolle', 'springseil', 'boxsack', 'skate', 'snowboard', 'angeln', 'fernglas'],
    enabled: true,
    builtin: true,
  },
  {
    id: 'office',
    name: 'Office & Stationery',
    color: '#64748b',
    keywords: ['druckerpapier', 'kopierpapier', 'kugelschreiber', 'bleistift', 'filzstift', 'marker', 'ordner',
      'notizbuch', 'notizblock', 'etiketten', 'locher', 'tacker', 'briefumschlag', 'versandtaschen', 'schere',
      'lineal', 'radiergummi', 'whiteboard', 'laminier', 'aktenvernichter', 'klarsichthüllen', 'haftnotizen'],
    enabled: true,
    builtin: true,
  },
]

export interface CategoryConfig {
  rules: CategoryRule[]
  /** ASIN to category name. Wins over every rule. */
  overrides: Record<string, string>
}

export const defaultCategoryConfig = (): CategoryConfig => ({ rules: defaultRules(), overrides: {} })

export type CategorySource = 'override' | 'rule' | 'export' | 'fallback'

export type Categoriser = (item: OrderItem) => { category: string; source: CategorySource }

/** Builds a memoised classifier for the given configuration. */
export function makeCategoriser(config: CategoryConfig): Categoriser {
  const active = config.rules.filter((r) => r.enabled)
  const cache = new Map<string, { category: string; source: CategorySource }>()

  return (item) => {
    const override = item.asin && config.overrides[item.asin]
    if (override) return { category: override, source: 'override' as const }

    const key = `${item.channel} ${item.sourceCategory ?? ''} ${item.name}`
    const hit = cache.get(key)
    if (hit) return hit

    const haystack = item.name.toLowerCase()
    let result: { category: string; source: CategorySource } = {
      category: UNCATEGORISED,
      source: 'fallback',
    }

    for (const rule of active) {
      // A channel-scoped rule claims its whole channel unless it narrows further.
      if (rule.channel) {
        if (rule.channel !== item.channel) continue
        if (rule.keywords.length === 0 || rule.keywords.some((k) => k && haystack.includes(k))) {
          result = { category: rule.name, source: 'rule' }
          break
        }
        continue
      }
      if (rule.keywords.some((k) => k && haystack.includes(k))) {
        result = { category: rule.name, source: 'rule' }
        break
      }
    }

    if (result.source === 'fallback' && item.sourceCategory) {
      result = { category: item.sourceCategory, source: 'export' }
    }

    cache.set(key, result)
    return result
  }
}

export const categoryColors = (rules: CategoryRule[]): Record<string, string> => {
  const map: Record<string, string> = { [UNCATEGORISED]: '#94a3b8' }
  for (const r of rules) map[r.name] = r.color
  return map
}

export const PALETTE = [
  '#3b82f6', '#f97316', '#22c55e', '#a855f7', '#ef4444', '#14b8a6', '#eab308', '#ec4899',
  '#0ea5e9', '#84cc16', '#8b5cf6', '#f472b6', '#06b6d4', '#65a30d', '#d946ef', '#64748b',
]
