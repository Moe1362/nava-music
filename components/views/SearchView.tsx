"use client";

import { useMemo, useState } from "react";
import { ALL_TRACKS, BROWSE_TILES } from "@/lib/data";
import { cover } from "@/lib/format";
import { SearchIcon } from "../Icons";
import { TrackRow } from "../TrackRow";

// Normalise Arabic/Persian letter variants so "ي" finds "ی" and so on.
const norm = (s: string) =>
  s.toLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[‌\s]+/g, " ").trim();

export function SearchView() {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string | null>(null);

  const results = useMemo(() => {
    const s = norm(q);
    if (genre) return ALL_TRACKS.filter((t) => t.genre === genre);
    if (!s) return [];
    return ALL_TRACKS.filter((t) => norm(`${t.title} ${t.artist} ${t.lyrics.join(" ")}`).includes(s));
  }, [q, genre]);

  const label = genre ? BROWSE_TILES.find((b) => b.genre === genre)?.name : null;

  return (
    <>
      <div className="hello">
        <h1>جستجو</h1>
      </div>
      <label className="srch">
        <SearchIcon />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setGenre(null);
          }}
          placeholder="آهنگ، خواننده یا متن شعر"
          aria-label="جستجو"
          type="search"
        />
      </label>

      {(q || genre) && (
        <div className="results">
          {label && (
            <div className="sec">
              <h2>{label}</h2>
              <button className="link" onClick={() => setGenre(null)}>بازگشت</button>
            </div>
          )}
          {results.length ? (
            results.map((t, i) => <TrackRow key={t.id} track={t} queue={results} index={i} source={label ?? "نتایج جستجو"} showLike />)
          ) : (
            <p className="empty">نتیجه‌ای پیدا نشد</p>
          )}
        </div>
      )}

      {!q && !genre && (
        <>
          <div className="sec">
            <h2>مرور همه</h2>
          </div>
          <div className="tiles">
            {BROWSE_TILES.map((b) => (
              <button key={b.name} className="tile cv" style={cover(b.colors)} onClick={() => setGenre(b.genre)}>
                {b.name}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
