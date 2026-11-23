"use client";

import { useEffect, useState } from "react";
import { DIASPORA, GENRES, IRAN, ORIGINALS, PLAYLISTS, WORLD, findTrack, type ChartKey, type Track } from "@/lib/data";
import { cover, fa } from "@/lib/format";
import { usePlayer } from "@/lib/player";
import { PlayIcon } from "../Icons";
import { TrackRow } from "../TrackRow";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "شب بخیر";
  if (h < 12) return "صبح بخیر";
  if (h < 17) return "ظهر بخیر";
  if (h < 20) return "عصر بخیر";
  return "شب بخیر";
}

function CardRow({ list, source }: { list: Track[]; source: string }) {
  const p = usePlayer();
  return (
    <div className="row">
      {list.map((t, i) => (
        <button key={t.id} className="card" onClick={() => p.playFrom(list, i, source)}>
          <span className="cv" style={cover(t.colors)} />
          <b>{t.title}</b>
          <span>{t.artist}</span>
        </button>
      ))}
    </div>
  );
}

export function HomeView({ openChart }: { openChart: (c: ChartKey) => void }) {
  const p = usePlayer();
  const [genre, setGenre] = useState<string>("همه");
  const [hello, setHello] = useState("سلام");
  useEffect(() => setHello(greeting()), []);

  const match = (t: Track) => genre === "همه" || t.genre === genre;
  const ir = IRAN.filter(match);
  const wd = WORLD.filter(match);
  const top = ORIGINALS[0];
  const originals = ORIGINALS.filter(match);

  return (
    <>
      <div className="hello">
        <h1>{hello}</h1>
        <span className="av" aria-hidden />
      </div>
      <div className="chips" role="group" aria-label="ژانر">
        {GENRES.map((g) => (
          <button key={g} className={`chip${g === genre ? " on" : ""}`} aria-pressed={g === genre} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
      </div>

      <button className="hero cv" style={cover(top.colors)} onClick={() => p.playFrom(ORIGINALS, 0, "بی‌کلام ایرانی نوا")}>
        <small>تازه · موسیقی اورجینال نوا</small>
        <strong>{top.title}</strong>
        <small>{top.artist} · {top.about}</small>
        <span className="play" aria-hidden><PlayIcon /></span>
      </button>

      <div className="sec">
        <h2>بی‌کلام ایرانی نوا</h2>
        <span className="meta">سنتور، نی، تار، تمبک و دف</span>
      </div>
      {originals.length ? <CardRow list={originals} source="بی‌کلام ایرانی نوا" /> : <p className="empty">در این ژانر آهنگی نیست</p>}

      <div className="sec">
        <h2>داغ‌ترین‌های جهان</h2>
        <button className="link" onClick={() => openChart("wd")}>همه</button>
      </div>
      {wd.length ? <CardRow list={wd} source="ترند جهانی" /> : <p className="empty">در این ژانر آهنگی نیست</p>}

      <div className="sec">
        <h2>۱۰ آهنگ برتر ایران</h2>
        <button className="link" onClick={() => openChart("ir")}>چارت کامل</button>
      </div>
      {ir.length ? (
        ir.slice(0, 5).map((t) => {
          const i = IRAN.indexOf(t);
          return <TrackRow key={t.id} track={t} rank={i + 1} queue={IRAN} index={i} source="ترند ایران" />;
        })
      ) : (
        <p className="empty">در این ژانر آهنگی نیست</p>
      )}

      <div className="sec">
        <h2>صدای ایرانیان دنیا</h2>
        <button className="link" onClick={() => openChart("ds")}>همه</button>
      </div>
      <CardRow list={DIASPORA} source="ترند دیاسپورا" />

      <div className="sec">
        <h2>میکس حال‌وهوا</h2>
      </div>
      <div className="row">
        {PLAYLISTS.map((pl) => {
          const list = pl.trackIds.map(findTrack).filter(Boolean) as Track[];
          return (
            <button key={pl.id} className="card" onClick={() => p.playFrom(list, 0, pl.name)}>
              <span className="cv mixcv" style={cover(pl.colors)}><em>{pl.name}</em></span>
              <b>{pl.name}</b>
              <span>{fa(list.length)} آهنگ</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
