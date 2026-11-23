"use client";

import type { Track } from "@/lib/data";
import { cover, fa } from "@/lib/format";
import { usePlayer } from "@/lib/player";
import { HeartIcon } from "./Icons";

export function MoveBadge({ move }: { move: Track["move"] }) {
  if (move === "new") return <span className="mv nw">تازه</span>;
  if (move > 0) return <span className="mv up" aria-label={`${move} پله بالا`}>▲{fa(move)}</span>;
  if (move < 0) return <span className="mv dn" aria-label={`${-move} پله پایین`}>▼{fa(-move)}</span>;
  return <span className="mv same" aria-label="بدون تغییر">–</span>;
}

export function Equalizer() {
  return (
    <span className="eq" aria-label="در حال پخش">
      <i /><i /><i />
    </span>
  );
}

type Props = {
  track: Track;
  rank?: number;
  queue: Track[];
  index: number;
  source: string;
  showLike?: boolean;
};

export function TrackRow({ track, rank, queue, index, source, showLike }: Props) {
  const p = usePlayer();
  const current = p.track.id === track.id;
  const liked = p.liked.has(track.id);
  return (
    <div className={`trk${current ? " cur" : ""}`}>
      <button className="trk-main" onClick={() => p.playFrom(queue, index, source)}>
        {rank !== undefined && <span className="n">{current && p.playing ? <Equalizer /> : fa(rank)}</span>}
        <span className="cv" style={cover(track.colors)} />
        <span className="t">
          <b>{track.title}</b>
          <span>
            {track.artist} · {fa(track.plays)}
          </span>
        </span>
        {rank !== undefined && <MoveBadge move={track.move} />}
      </button>
      {showLike && (
        <button
          className={`ib like${liked ? " on" : ""}`}
          aria-label={liked ? "حذف از پسندیده‌ها" : "پسندیدن"}
          aria-pressed={liked}
          onClick={() => p.toggleLike(track.id)}
        >
          <HeartIcon size={20} filled={liked} />
        </button>
      )}
    </div>
  );
}
