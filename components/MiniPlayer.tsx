"use client";

import { cover } from "@/lib/format";
import { usePlayer } from "@/lib/player";
import { HeartIcon, NextIcon, PauseIcon, PlayIcon } from "./Icons";
import { Controls, Scrubber } from "./NowPlaying";

export function MiniPlayer({ onOpen }: { onOpen: () => void }) {
  const p = usePlayer();
  const t = p.track;
  const pct = Math.min(100, (p.position / t.duration) * 100);
  const liked = p.liked.has(t.id);
  return (
    <div className="mini" style={{ ["--c1" as string]: t.colors[0] }}>
      <button className="mini-open" onClick={onOpen} aria-label={`باز کردن پخش‌کننده: ${t.title}`}>
        <span className="cv" style={cover(t.colors)} />
        <span className="t">
          <b>{t.title}</b>
          <span>{t.artist}</span>
        </span>
      </button>
      {/* phones: simple buttons. desktop: full controls + scrubber */}
      <div className="mini-phone">
        <button className="ib" aria-label={p.playing ? "توقف" : "پخش"} onClick={p.toggle}>
          {p.playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button className="ib" aria-label="بعدی" onClick={p.next}>
          <NextIcon size={20} />
        </button>
      </div>
      <div className="mini-desk">
        <Controls size="small" />
        <Scrubber compact />
      </div>
      <div className="mini-side">
        <button className={`ib like${liked ? " on" : ""}`} aria-label="پسندیدن" aria-pressed={liked} onClick={() => p.toggleLike(t.id)}>
          <HeartIcon size={20} filled={liked} />
        </button>
      </div>
      <i className="mini-bar"><em style={{ width: `${pct}%` }} /></i>
    </div>
  );
}
