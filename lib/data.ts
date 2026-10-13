// Все тексты, цены, контакты и отзывы — в одном месте.
// Источник фактов: карточка «Чувство формы» на Яндекс Картах (обзор, прайс, отзывы, особенности).
// Ничего сверх этого не добавлять: открытые вопросы к студии — в OPEN_QUESTIONS.md.

/* ---------- типографика ---------- */
const NB = ' ';
const SHORT =
  'в|во|на|с|со|к|ко|о|об|от|до|по|за|из|у|и|а|но|не|ни|для|без|при|над|под|про|что|как|или|да|же|ли|мы|вы|я|её|ее|их|это|все|всё|уже|чем|так|то|ещё|еще';
const reShort = new RegExp(`(^|[\\s(«„"—])(${SHORT})\\s`, 'giu');

/** Неразрывные пробелы после коротких слов, перед тире, внутри чисел и перед ₽ / мин. */
export function t(s: string): string {
  let r = s;
  r = r.replace(reShort, (_m, pre, w) => `${pre}${w}${NB}`);
  r = r.replace(reShort, (_m, pre, w) => `${pre}${w}${NB}`); // второй проход: «и в», «а не»
  r = r.replace(/ —/g, `${NB}—`);
  r = r.replace(/(\d) (?=\d{3}\b)/g, `$1${NB}`);
  r = r.replace(/(\d) (₽|мин|м|кг|%)/g, `$1${NB}$2`);
  return r;
}

/** 1800 → «1 800 ₽» (группировка регуляркой: toLocaleString не группирует четырёхзначные) */
export const rub = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB)}${NB}₽`;

/* ---------- контакты ---------- */
export const CONTACTS = {
  name: 'Чувство формы',
  city: 'Казань',
  address: 'ул. Юлиуса Фучика, 53',
  addressFull: 'г. Казань, ул. Юлиуса Фучика, 53, 420138',
  coords: { lat: 55.743902, lon: 49.204052 },
  hours: 'ежедневно 10:00–18:00',
  open: 10,
  close: 18,
  phone: '+7 (962) 551-19-88',
  phoneHref: 'tel:+79625511988',
  whatsapp: 'https://wa.me/79196452199',
  telegram: 'https://t.me/+qSNdnbHmYJY3NDcy',
  vk: 'https://vk.ru/id691836241',
  yandexMaps: 'https://yandex.ru/maps/org/chuvstvo_formy/6769645873/',
  route: 'https://yandex.ru/maps/?rtext=~55.743902%2C49.204052&rtt=auto',
  stop: { name: 'Улица Фучика, 8', meters: 120 },
  metro: { name: 'Проспект Победы', meters: 800 },
  amenities: ['парковка', 'Wi‑Fi', 'онлайн-запись'],
};

export const wa = (text: string) => `${CONTACTS.whatsapp}?text=${encodeURIComponent(text)}`;
export const WA_CONSULT = wa('Здравствуйте! Хочу записаться на консультацию');

export const NAV = [
  { id: 'method', label: 'Метод' },
  { id: 'tech', label: 'Технологии' },
  { id: 'prices', label: 'Прайс' },
  { id: 'studio', label: 'Студия' },
  { id: 'contacts', label: 'Контакты' },
];

/* ---------- услуги (прайс студии на Яндекс Картах) ---------- */
export type Category = 'figure' | 'face' | 'wraps' | 'passes';
export type Service = {
  id: string;
  cat: Category;
  name: string;
  min?: number;
  price: number;
  desc: string;
  gift?: string;
  img?: string;
};

export const SERVICES: Service[] = [
  { id: 'lpg-body', cat: 'figure', name: 'LPG-массаж тела', min: 25, price: 1800, img: 'lpg-handpiece',
    desc: 'Роликово-вакуумный массаж: работает с объёмами, отёками и целлюлитом, подтягивает кожу. Без боли и синяков' },
  { id: 'sphere-body', cat: 'figure', name: 'Бьютисфера-массаж тела', min: 60, price: 3000,
    desc: 'Моделирование тела аппаратными процедурами' },
  { id: 'emslim', cat: 'figure', name: 'EMSLIM-массаж', min: 30, price: 2500,
    desc: 'Электростимуляция прорабатывает пресс, ягодицы и бёдра, пока вы лежите' },
  { id: 'myostim', cat: 'figure', name: 'Миостимуляция', price: 1500,
    desc: 'Мышцы работают под мягкими электрическими импульсами' },
  { id: 'vacuum', cat: 'figure', name: 'Вакуумный массаж', price: 1000, img: 'gloves-belly',
    desc: 'Аппаратный массаж с мягким разрежением' },
  { id: 'cavitation', cat: 'figure', name: 'Ультразвуковая кавитация', price: 1000, img: 'cavitation-leg',
    desc: 'Ультразвук для зон с локальными отложениями' },
  { id: 'lipolysis', cat: 'figure', name: 'Лазерный липолиз', price: 1500, img: 'pads-belly',
    desc: 'Насадки аппарата лежат на выбранной зоне, без проколов' },
  { id: 'rf', cat: 'figure', name: 'RF-лифтинг', price: 999,
    desc: 'Радиочастотная энергия стимулирует коллаген и эластин, кожа становится упругой' },
  { id: 'presso-wrap', cat: 'figure', name: 'Прессотерапия + обёртывание', price: 2000, img: 'pressotherapy-suit',
    desc: 'Жиросжигающий гель — горячий или холодный, на ваш выбор', gift: 'гель в подарок' },
  { id: 'lpg-presso', cat: 'figure', name: 'LPG + прессотерапия', price: 3500, img: 'pressotherapy-suit',
    desc: 'Два аппарата за один визит', gift: 'гель в подарок' },

  { id: 'lpg-face', cat: 'face', name: 'LPG лица + маска', price: 2000,
    desc: 'Укрепляет кожу, моделирует овал и второй подбородок, выравнивает текстуру' },
  { id: 'sphere-face', cat: 'face', name: 'Массаж лица сферами', min: 20, price: 2000,
    desc: 'Мягкий лимфодренаж: снимает отёки и зажимы, подтягивает овал. Без игл и восстановления' },
  { id: 'morpheus', cat: 'face', name: 'Микроигольчатый RF-лифтинг лица', price: 15000, img: 'morpheus8-face',
    desc: 'Микроиглы и радиочастотная энергия: тонус и текстура кожи, поры, рубцы, мелкие морщины' },

  { id: 'wrap-anticell', cat: 'wraps', name: 'Антицеллюлитное обёртывание', price: 3000, img: 'wrap-belly',
    desc: 'Классическое обёртывание для зон, где хочется гладкости' },
  { id: 'wrap-vitamin', cat: 'wraps', name: '«Витамин молодости» anti-age', price: 4500, img: 'wrap-belly',
    desc: 'Уходовое обёртывание с акцентом на упругость кожи' },
  { id: 'wrap-ocean', cat: 'wraps', name: '«Секрет океана»', price: 3000, img: 'wrap-belly',
    desc: 'Обёртывание с ламинариями' },
  { id: 'wrap-choco', cat: 'wraps', name: '«Шоколадный ангел»', price: 4500, img: 'wrap-belly',
    desc: 'Обёртывание с шоколадом' },
  { id: 'wrap-styx', cat: 'wraps', name: 'STYX Cello Gel', price: 5000, img: 'wrap-belly',
    desc: 'Обёртывание на профессиональном геле STYX' },

  { id: 'pass-5', cat: 'passes', name: '5 сеансов LPG + прессотерапия', price: 13500, img: 'lpg-handpiece',
    desc: 'Абонемент на курс' },
  { id: 'pass-10', cat: 'passes', name: '10 сеансов LPG + прессотерапия', price: 17000, img: 'lpg-handpiece',
    desc: 'Абонемент на курс' },
];

export const svc = (id: string) => SERVICES.find((s) => s.id === id)!;

export const PRICE_TABS: { id: Category; label: string }[] = [
  { id: 'figure', label: 'Фигура' },
  { id: 'face', label: 'Лицо' },
  { id: 'wraps', label: 'Обёртывания' },
  { id: 'passes', label: 'Абонементы' },
];

/* ---------- секции ---------- */
export const HERO = {
  title: ['Форму', 'можно', 'почувствовать'],
  lead: 'Студия аппаратной коррекции фигуры и косметологии лица в Казани. LPG, сферы, EMS и микроигольчатый RF‑лифтинг — в одном курсе, собранном под вас',
  meta: ['Казань', 'ул. Юлиуса Фучика, 53', 'ежедневно 10:00–18:00'],
};

export const MANIFESTO =
  'Мы не обещаем минус размер за один визит. Мы собираем курс: замеряем, подбираем аппараты, ведём от процедуры к процедуре. Остальное — ваше постоянство, а мы рядом на каждом шаге';

export const LAYERS = [
  {
    id: 'skin', n: '01', name: 'Кожа', tone: 'nude',
    about: 'Упругость, тонус, текстура, овал',
    tech: ['Микроигольчатый RF‑лифтинг (Morpheus8)', 'RF‑лифтинг', 'LPG лица', 'Массаж лица сферами'],
  },
  {
    id: 'tissue', n: '02', name: 'Ткани', tone: 'sage',
    about: 'Объёмы, отёки, целлюлит',
    tech: ['LPG тела', 'Сферы', 'Вакуумный массаж', 'Кавитация', 'Лазерный липолиз', 'Прессотерапия', 'Обёртывания'],
  },
  {
    id: 'muscle', n: '03', name: 'Мышцы', tone: 'sage-deep',
    about: 'Тонус пресса, ягодиц, бёдер',
    tech: ['EMSLIM', 'Миостимуляция'],
  },
] as const;

export type Zone = { id: string; label: string; services: string[] };
export const BODY_ZONES: Zone[] = [
  { id: 'face', label: 'Лицо и овал', services: ['lpg-face', 'sphere-face', 'morpheus', 'rf'] },
  { id: 'neck', label: 'Шея и подбородок', services: ['lpg-face', 'morpheus', 'rf'] },
  { id: 'arms', label: 'Руки', services: ['rf', 'vacuum', 'lpg-body'] },
  { id: 'belly', label: 'Живот и талия', services: ['lpg-body', 'cavitation', 'lipolysis', 'emslim', 'wrap-anticell'] },
  { id: 'hips', label: 'Бёдра и ягодицы', services: ['lpg-body', 'emslim', 'sphere-body', 'vacuum', 'cavitation'] },
  { id: 'legs', label: 'Ноги (отёки)', services: ['presso-wrap', 'lpg-presso', 'lpg-body'] },
];
export const FACE_ZONES: Zone[] = [
  { id: 'oval', label: 'Овал', services: ['lpg-face', 'sphere-face', 'morpheus'] },
  { id: 'pores', label: 'Кожа и поры', services: ['morpheus', 'rf', 'lpg-face'] },
  { id: 'puff', label: 'Отёки', services: ['sphere-face', 'lpg-face'] },
];

export const METHOD = {
  who: 'Татьяна Геннадьевна · косметолог',
  quote: 'Не просто делает массаж, а ведёт за руку до результата',
  quoteBy: 'из отзыва Альбины',
  steps: [
    { title: 'Знакомство и замеры', text: 'Цели, параметры, замеры — на старте и дальше в динамике, чтобы видеть путь, а не гадать.' },
    { title: 'Курс под вас', text: 'Подбор и сочетание аппаратов. Иногда это не то, за чем вы пришли, а то, что сработает лучше.' },
    { title: 'Каждый шаг понятен', text: 'Мастер объясняет, что и зачем происходит на процедуре, — без загадок и спешки.' },
    { title: 'Рядом и после', text: 'Рекомендации по уходу и вопрос о самочувствии в дни после процедуры.' },
  ],
};

export const REFORMA = {
  lead: 'Индивидуальный курс, который собирается вокруг ваших целей. Его можно пройти самой — или подарить.',
  points: ['Цели и параметры — на старте', 'Замеры в динамике', 'График процедур под вас'],
};

export type Tech = { id: string; name: string; does: string; meta: string; img?: string; note?: string; pattern?: 'fibers' | 'spheres' | 'waves' };
export const TECH: Tech[] = [
  { id: 'morpheus8', name: 'Morpheus8', does: 'Микроиглы и радиочастотная энергия — тонус и текстура кожи лица', meta: `от ${rub(15000)}`, img: 'morpheus8-face', note: 'гости пишут: безболезненно' },
  { id: 'lpg', name: 'LPG', does: 'Роликово-вакуумный массаж: объёмы, отёки, целлюлит, упругость кожи', meta: `25${NB}мин · от ${rub(1800)}`, img: 'lpg-handpiece', note: 'без боли и синяков' },
  { id: 'spheres', name: 'Сферы', does: 'Моделирование тела и мягкий лимфодренаж лица вращающимися сферами', meta: `20–60${NB}мин · от ${rub(2000)}`, pattern: 'spheres' },
  { id: 'emslim', name: 'EMSLIM', does: 'Электростимуляция мышц пресса, ягодиц и бёдер, пока вы лежите', meta: `30${NB}мин · ${rub(2500)}`, pattern: 'fibers' },
  { id: 'presso', name: 'Прессотерапия', does: 'Костюм мягко сжимает ноги и тело волнами — в паре с обёртыванием', meta: `от ${rub(2000)}`, img: 'pressotherapy-suit' },
  { id: 'cavitation', name: 'Кавитация', does: 'Ультразвук для зон с локальными отложениями', meta: `от ${rub(1000)}`, img: 'cavitation-leg' },
  { id: 'lipolysis', name: 'Лазерный липолиз', does: 'Насадки ложатся на выбранную зону — без проколов', meta: `от ${rub(1500)}`, img: 'pads-belly' },
  { id: 'rf', name: 'RF‑лифтинг', does: 'Радиочастотная энергия стимулирует коллаген и эластин', meta: `от ${rub(999)}`, pattern: 'waves', note: 'гости пишут: безболезненно' },
];

// SHOW_RESULTS = false — секция «до / после» скрывается целиком (реклама медуслуг, ФЗ «О рекламе», ст. 24)
export const SHOW_RESULTS = true;
export const RESULTS = [
  { id: 'body', before: 'ba-body-before', after: 'ba-body-after', caption: 'Миостимуляция, прессотерапия, обёртывание · 3 курса', w: 538, h: 435 },
  { id: 'hands', before: 'ba-hands-before', after: 'ba-hands-after', caption: 'Кисти рук · микроигольчатый RF‑лифтинг', w: 640, h: 398 },
  { id: 'face', before: 'ba-face-before', after: 'ba-face-after', caption: 'Кожа щеки · микроигольчатый RF‑лифтинг', w: 640, h: 218 },
];

// Цитаты — из отзывов на Яндекс Картах, сокращены без искажения смысла. Только имя.
export const VOICES = [
  { name: 'Александра', tag: 'курс процедур', text: 'Пришла, хотела одно, а Татьяна оценила мою ситуацию и желаемый результат и подобрала индивидуальный курс с другими, более эффективными для меня процедурами.' },
  { name: 'Алсу', tag: 'курс «Реформа»', text: 'Сначала изучила мои цели, параметры, которые измеряла в динамике, и выстроила график процедур. Профессиональный и индивидуальный подход.' },
  { name: 'Алсу', tag: 'массаж', text: 'Самое главное — она говорила и объясняла про каждый шаг, когда делала процедуру. Комфортно и красиво в её пространстве.' },
  { name: 'Светлана', tag: 'микроигольчатый RF', text: 'После процедуры не забывала и каждый день интересовалась самочувствием, давала рекомендации по уходу.' },
  { name: 'Альбина', tag: 'коррекция фигуры', text: 'Татьяна не просто делает массаж, а ведёт за руку до результата.' },
  { name: 'Medina', tag: 'LPG', text: 'Быстро, безболезненно. Салон уютный и чистый. Буду возвращаться и не раз.' },
  { name: 'Лиля', tag: 'сферы + EMS', text: 'Есть несколько видов аппаратов: я взяла курс по Эндосфере и EMS. Идёт подтяжка кожи снаружи и прокачка мышц внутри.' },
  { name: 'Анна', tag: 'процедуры для тела', text: 'Процедура прошла безболезненно, наоборот, я получала удовольствие от всего процесса. Хочется возвращаться снова.' },
];

export type GalleryItem = { id: string; img: string; alt: string; caption: string; shape: 'capsule' | 'tall' | 'square' | 'wide'; video?: string };
export const GALLERY: GalleryItem[] = [
  { id: 'hall', img: 'interior-hall', alt: 'Холл студии: розовое кресло, столик и витрина с уходом', caption: 'Холл — кресло для тех, кто пришёл чуть раньше', shape: 'capsule' },
  { id: 'lpg', img: 'lpg-master', alt: 'Мастер ведёт процедуру LPG', caption: 'LPG: костюм, манипула и спокойный темп', shape: 'tall' },
  { id: 'wrap-video', img: 'wrap-candlelight-poster', alt: 'Обёртывание при тёплом свете ламп', caption: 'Обёртывание при тёплом свете — видео', shape: 'tall', video: 'wrap-candlelight' },
  { id: 'morpheus', img: 'morpheus8-device', alt: 'Аппарат Morpheus8 в кабинете с лавандовыми стенами', caption: 'Кабинет Morpheus8', shape: 'square' },
  { id: 'robe', img: 'master-robe', alt: 'Женщина в белом халате рядом с костюмом прессотерапии', caption: 'Белый халат и костюм прессотерапии', shape: 'capsule' },
  { id: 'cavitation', img: 'cavitation-leg', alt: 'Насадка кавитации на бедре', caption: 'Кавитация', shape: 'wide' },
  { id: 'wrap', img: 'wrap-belly', alt: 'Обёртывание талии плёнкой', caption: 'Обёртывание', shape: 'square' },
  { id: 'gloves', img: 'gloves-belly', alt: 'Рука в перчатке и насадка на животе', caption: 'Аппаратная процедура для живота', shape: 'tall' },
  { id: 'street', img: 'facade-street', alt: 'Вход в студию со двора, рядом парковка', caption: 'Вход со двора и парковка', shape: 'wide' },
  { id: 'way-video', img: 'way-to-studio-poster', alt: 'Дорога к студии зимой', caption: 'Как дойти до двери — видео', shape: 'capsule', video: 'way-to-studio' },
  { id: 'facade', img: 'facade-entrance', alt: 'Вход с вывеской «Студия красоты» и цветами в вазонах', caption: 'Цветы у входа — ул. Фучика, 53', shape: 'tall' },
];

export const GIFT = {
  title: 'Подарите не процедуру, а ощущение формы',
  text: 'Сертификат на сумму или на курс. Дарят и курс «Реформа» — об этом пишут в отзывах.',
};

export const FINALE = 'Запишитесь на консультацию — начнём с замеров';

export const DISCLAIMER = 'Имеются противопоказания. Необходима консультация специалиста';
