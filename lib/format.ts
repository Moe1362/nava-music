const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** Convert Latin digits to Persian digits. */
export const fa = (v: string | number) => String(v).replace(/\d/g, (d) => FA_DIGITS[+d]);

/** 125 -> "2:05" (kept LTR in the UI). */
export const time = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export const cover = (colors: [string, string]) => ({
  background: `linear-gradient(145deg, ${colors[0]}, ${colors[1]})`,
});

/** Index of the lyric line that should be highlighted at a given time. */
export const lyricIndex = (pos: number, duration: number, lines: number) => {
  const intro = 6;
  if (pos < intro) return -1;
  const step = (duration - intro) / (lines * 2); // the song sings the lines twice
  return Math.floor((pos - intro) / step) % lines;
};
