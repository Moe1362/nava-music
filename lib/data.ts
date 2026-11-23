// The charts below use made-up placeholder songs (they play a demo tune).
// ORIGINALS are real instrumental tracks made for Nava by scripts/compose.py:
// they are original, so they need no licence.
import music from "./music.json";

export type ChartKey = "ir" | "wd" | "ds";
export type Move = number | "new";

export type Track = {
  id: string;
  title: string;
  artist: string;
  colors: [string, string];
  move: Move;
  plays: string;
  genre: string;
  chart: ChartKey;
  duration: number; // seconds
  bpm: number;
  lyrics: string[];
  audio?: string; // a real audio file to play
  about?: string; // short description, e.g. the mode and instruments
};

export const GENRES = ["همه", "پاپ", "رپ فارسی", "سنتی", "شاد", "عاشقانه", "بی‌کلام"] as const;

export const CHARTS: Record<ChartKey, { label: string; source: string }> = {
  ir: { label: "ایران", source: "ترند ایران" },
  wd: { label: "جهان", source: "ترند جهانی" },
  ds: { label: "دیاسپورا", source: "ترند دیاسپورا" },
};

const LY_FA: string[][] = [
  [
    "از پنجره ماه رو نگاه کردم",
    "خیابونا پر از صدای تو بود",
    "شب‌های تهران بی تو سرده",
    "هر چراغی یه خاطره‌ست",
    "بارون که می‌زنه یاد تو می‌افتم",
    "تا صبح بیدارم، تا صبح با تو",
    "یه آهنگ قدیمی تو ماشینه",
    "شب‌های تهران مال ماست",
  ],
  [
    "دلم تنگه برای اون روزا",
    "برای خنده‌هات زیر نور ماه",
    "هنوز اسمت رو دیوار دلمه",
    "یه نامه نوشتم که نرسید",
    "دلم تنگه، دلم تنگه",
    "کاش برگردی همین امشب",
    "هر جا میرم بوی تو میاد",
    "دلم تنگه برای اون روزا",
  ],
  [
    "بزن دست، امشب شب ماست",
    "همه بیان وسط، دنیا مال ماست",
    "صدای ساز بلنده تا آسمون",
    "یه شب شاد، یه دنیا مهربون",
    "بخند که غم بره از این خونه",
    "این آهنگ تا صبح می‌مونه",
    "بزن دست، بزن دست",
    "امشب شب ماست",
  ],
  [
    "آروم آروم مثل نسیم",
    "اومدی تو قلب من نشستی",
    "یه دنیا حرف تو چشماته",
    "با یه نگاه همه رو گفتی",
    "تو آینه منی، تو نفس منی",
    "هر جای این قصه تویی",
    "آروم آروم مثل نسیم",
    "بمون پیشم، بمون",
  ],
];

const LY_EN: string[][] = [
  [
    "City lights are calling out my name",
    "Running through the rain again",
    "Every street remembers you",
    "Neon skies in shades of blue",
    "Hold on, hold on to the night",
    "We were burning way too bright",
    "Say it once and say it loud",
    "Dancing lost inside the crowd",
  ],
  [
    "Golden hour, you and me",
    "Waves are rolling to the sea",
    "Turn it up and let it play",
    "We could stay here every day",
    "Oh oh, don't let go",
    "Feel it in the radio",
    "Golden hour, here again",
    "Never want this song to end",
  ],
];

type Row = [string, string, string, string, Move, string, string, number, number];

const build = (chart: ChartKey, rows: Row[], lyricSets: string[][]): Track[] =>
  rows.map(([title, artist, c1, c2, move, plays, genre, duration, bpm], i) => ({
    id: `${chart}-${i + 1}`,
    title,
    artist,
    colors: [c1, c2],
    move,
    plays,
    genre,
    chart,
    duration,
    bpm,
    lyrics: lyricSets[i % lyricSets.length],
  }));

export const IRAN: Track[] = build(
  "ir",
  [
    ["شب‌های تهران", "آرین ماهور", "#e6324b", "#4a1170", 1, "2.4M", "پاپ", 204, 96],
    ["دلم تنگه", "سارا نیک‌پی", "#17b3a3", "#0b3b5c", 3, "1.9M", "عاشقانه", 192, 84],
    ["بارون", "تیام", "#f2a93b", "#b3263f", "new", "1.7M", "پاپ", 218, 100],
    ["ماه من", "بند شبگرد", "#7a5cff", "#1b1240", 0, "1.5M", "عاشقانه", 236, 78],
    ["خیابون ولیعصر", "رها کیان", "#ff7a59", "#5c1630", 5, "1.2M", "رپ فارسی", 187, 92],
    ["نفس", "پویا دریا", "#2fd08f", "#123d33", -2, "1.1M", "پاپ", 201, 104],
    ["آینه", "مهسا رود", "#e04fa8", "#2a0e3d", 2, "980K", "عاشقانه", 224, 88],
    ["فردا", "کاوه", "#3aa0ff", "#0e2252", 0, "910K", "رپ فارسی", 176, 90],
    ["سه‌تار و باران", "گروه نی‌لبک", "#b8860b", "#4a2a06", 1, "760K", "سنتی", 262, 70],
    ["جشن کوچه", "نیما شادمان", "#f2a93b", "#c2372c", -1, "700K", "شاد", 190, 120],
  ],
  LY_FA
);

export const WORLD: Track[] = build(
  "wd",
  [
    ["Neon Rain", "Lua Vance", "#ff4d8d", "#2b0b4a", 2, "48M", "پاپ", 198, 112],
    ["Golden Hour Again", "The Paper Kites Club", "#f2a93b", "#6a2c0e", -1, "41M", "عاشقانه", 211, 90],
    ["Midnight Tokyo", "KAIRO", "#19c2ff", "#0a1a3c", 0, "39M", "بی‌کلام", 184, 118],
    ["Corazón Azul", "Mar Delgado", "#2fd08f", "#0e3b3b", 4, "33M", "شاد", 195, 108],
    ["Satellite", "Jun & Ivy", "#9b7bff", "#1d1240", -2, "30M", "پاپ", 203, 100],
    ["Run It Back", "DXNNY", "#ff6b3d", "#3d0f12", "new", "27M", "رپ فارسی", 172, 94],
    ["Paper Moons", "Elle Norway", "#7fd1ff", "#1a2b52", 1, "24M", "عاشقانه", 229, 76],
    ["Lo-Fi Sunday", "beatsbyorchid", "#17b3a3", "#0b3b3a", 0, "19M", "بی‌کلام", 160, 80],
  ],
  LY_EN
);

export const DIASPORA: Track[] = build(
  "ds",
  [
    ["لس‌آنجلس ۹۰", "بند ستاره‌های غرب", "#e6324b", "#3a1630", 1, "640K", "شاد", 214, 116],
    ["عروسی", "نازی شاد", "#f2a93b", "#7a1f3a", 0, "590K", "شاد", 206, 124],
    ["ساحل", "آرمین ویو", "#17b3a3", "#14324a", -1, "420K", "پاپ", 197, 98],
    ["تورنتو برفی", "شیدا", "#9fd3ff", "#1b2a4a", "new", "380K", "عاشقانه", 221, 82],
    ["برلین ساعت ۳", "سام ایکس", "#9b7bff", "#140c1c", 2, "310K", "رپ فارسی", 183, 92],
  ],
  LY_FA
);

export const ORIGINALS: Track[] = music.map((m, i) => ({
  id: `nv-${i + 1}`,
  title: m.title,
  artist: "ارکستر نوا",
  colors: m.colors as [string, string],
  move: 0,
  plays: "",
  genre: m.genre,
  chart: "ir" as ChartKey,
  duration: m.duration,
  bpm: 0,
  lyrics: [],
  audio: `/music/${m.slug}.mp3`,
  about: m.about,
}));

export const CHART_TRACKS: Record<ChartKey, Track[]> = { ir: IRAN, wd: WORLD, ds: DIASPORA };

export const ALL_TRACKS: Track[] = [...ORIGINALS, ...IRAN, ...WORLD, ...DIASPORA];

export const findTrack = (id: string) => ALL_TRACKS.find((t) => t.id === id);

export const BROWSE_TILES: { name: string; genre: string; colors: [string, string] }[] = [
  { name: "پاپ فارسی", genre: "پاپ", colors: ["#e6324b", "#5a1028"] },
  { name: "رپ فارسی", genre: "رپ فارسی", colors: ["#2b2b36", "#0d0d12"] },
  { name: "سنتی", genre: "سنتی", colors: ["#b8860b", "#4a2a06"] },
  { name: "شاد و عروسی", genre: "شاد", colors: ["#f2a93b", "#c2372c"] },
  { name: "عاشقانه", genre: "عاشقانه", colors: ["#e04fa8", "#2a0e3d"] },
  { name: "لوفای و بی‌کلام", genre: "بی‌کلام", colors: ["#17b3a3", "#0b3b3a"] },
];

export type Playlist = { id: string; name: string; colors: [string, string]; trackIds: string[]; offline?: boolean };

export const PLAYLISTS: Playlist[] = [
  { id: "nava", name: "بی‌کلام ایرانی نوا", colors: ["#e6324b", "#17b3a3"], trackIds: ORIGINALS.map((t) => t.id), offline: true },
  { id: "drive", name: "رانندگی شبانه", colors: ["#17b3a3", "#0b2b4a"], trackIds: ["ir-1", "wd-3", "ir-5", "ds-5", "wd-1"], offline: true },
  { id: "mix", name: "میکس روزانهٔ تو", colors: ["#f2a93b", "#7a1f3a"], trackIds: ["ir-3", "ir-6", "wd-5", "ds-3", "ir-8"] },
  { id: "miss", name: "دلتنگی", colors: ["#3aa0ff", "#1b1240"], trackIds: ["ir-2", "ir-4", "ds-4", "wd-7", "ir-7"] },
  { id: "party", name: "مهمانی", colors: ["#ff7a59", "#5c1630"], trackIds: ["ir-10", "ds-1", "ds-2", "wd-4", "wd-6"] },
];
