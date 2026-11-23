"use client";

import { useState } from "react";
import { ALL_TRACKS, PLAYLISTS, findTrack, type Track } from "@/lib/data";
import { cover, fa } from "@/lib/format";
import { usePlayer } from "@/lib/player";
import { DownloadIcon } from "../Icons";
import { TrackRow } from "../TrackRow";

const TABS = ["پلی‌لیست", "پسندیده‌ها", "هنرمندان"] as const;

export function LibraryView() {
  const p = usePlayer();
  const [tab, setTab] = useState<(typeof TABS)[number]>("پلی‌لیست");
  const [open, setOpen] = useState<string | null>(null);
  const liked = ALL_TRACKS.filter((t) => p.liked.has(t.id));
  const artists = [...new Map(ALL_TRACKS.map((t) => [t.artist, t])).values()];

  const openPl = PLAYLISTS.find((x) => x.id === open);
  if (openPl) {
    const list = openPl.trackIds.map(findTrack).filter(Boolean) as Track[];
    return (
      <>
        <div className="sec">
          <button className="link" onClick={() => setOpen(null)}>→ کتابخانه</button>
        </div>
        <div className="plhead">
          <span className="cv" style={cover(openPl.colors)} />
          <div>
            <h1>{openPl.name}</h1>
            <span className="meta">{fa(list.length)} آهنگ{openPl.offline ? " · آفلاین" : ""}</span>
            <button className="btn" onClick={() => p.playFrom(list, 0, openPl.name)}>پخش همه</button>
          </div>
        </div>
        {list.map((t, i) => (
          <TrackRow key={t.id} track={t} queue={list} index={i} source={openPl.name} showLike />
        ))}
      </>
    );
  }

  return (
    <>
      <div className="hello">
        <h1>کتابخانهٔ من</h1>
        <span className="av" aria-hidden />
      </div>
      <div className="chips" role="group" aria-label="بخش">
        {TABS.map((t) => (
          <button key={t} className={`chip${t === tab ? " on" : ""}`} aria-pressed={t === tab} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === "پلی‌لیست" && (
        <>
          <button className="lib" onClick={() => setTab("پسندیده‌ها")}>
            <span className="cv" style={cover(["#e6324b", "#7a5cff"])} />
            <span>
              <b>آهنگ‌های پسندیده</b>
              <span className="meta">{fa(liked.length)} آهنگ</span>
            </span>
          </button>
          {PLAYLISTS.map((pl) => (
            <button key={pl.id} className="lib" onClick={() => setOpen(pl.id)}>
              <span className="cv" style={cover(pl.colors)} />
              <span>
                <b>{pl.name}</b>
                <span className="meta">
                  {fa(pl.trackIds.length)} آهنگ
                  {pl.offline && (
                    <>
                      {" · "}
                      <DownloadIcon size={12} /> آفلاین
                    </>
                  )}
                </span>
              </span>
            </button>
          ))}
        </>
      )}

      {tab === "پسندیده‌ها" &&
        (liked.length ? (
          liked.map((t, i) => <TrackRow key={t.id} track={t} queue={liked} index={i} source="آهنگ‌های پسندیده" showLike />)
        ) : (
          <p className="empty">هنوز آهنگی نپسندیده‌اید. روی ♥ کنار هر آهنگ بزنید.</p>
        ))}

      {tab === "هنرمندان" && (
        <div className="artists">
          {artists.map((t) => {
            const theirs = ALL_TRACKS.filter((x) => x.artist === t.artist);
            return (
              <button key={t.artist} className="artist" onClick={() => p.playFrom(theirs, 0, t.artist)}>
                <span className="cv" style={cover(t.colors)} />
                <b>{t.artist}</b>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
