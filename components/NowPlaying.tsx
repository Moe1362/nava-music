"use client";

import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { cover, fa, lyricIndex, time } from "@/lib/format";
import { usePlayer } from "@/lib/player";
import {
  ChevronDown,
  HeartIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  RepeatIcon,
  ShuffleIcon,
  SoundIcon,
} from "./Icons";

export function Scrubber({ compact }: { compact?: boolean }) {
  const p = usePlayer();
  const ref = useRef<HTMLDivElement>(null);
  const pct = Math.min(100, (p.position / p.track.duration) * 100);

  // the bar fills from the right, like Persian text
  const seekTo = (e: PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (r.right - e.clientX) / r.width));
    p.seek(f * p.track.duration);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") p.seek(p.position + 5);
    else if (e.key === "ArrowRight") p.seek(p.position - 5);
    else return;
    e.preventDefault();
  };

  return (
    <div className={compact ? "scrub compact" : "scrub"}>
      <div
        ref={ref}
        className="bar"
        role="slider"
        tabIndex={0}
        aria-label="زمان آهنگ"
        aria-valuemin={0}
        aria-valuemax={Math.round(p.track.duration)}
        aria-valuenow={Math.round(p.position)}
        aria-valuetext={`${time(p.position)} از ${time(p.track.duration)}`}
        onPointerDown={(e) => {
          ref.current!.setPointerCapture(e.pointerId);
          seekTo(e);
        }}
        onPointerMove={(e) => e.buttons && seekTo(e)}
        onKeyDown={onKey}
      >
        <em style={{ width: `${pct}%` }} />
        <i style={{ right: `${pct}%` }} />
      </div>
      <div className="tm">
        <span>{fa(time(p.position))}</span>
        <span>{fa(time(p.track.duration))}</span>
      </div>
    </div>
  );
}

export function Controls({ size = "big" }: { size?: "big" | "small" }) {
  const p = usePlayer();
  return (
    <div className={`ctl ${size}`}>
      <button className={`ib${p.shuffle ? " act" : ""}`} aria-label="پخش تصادفی" aria-pressed={p.shuffle} onClick={() => p.setShuffle(!p.shuffle)}>
        <ShuffleIcon size={20} />
      </button>
      <button className="ib" aria-label="قبلی" onClick={p.prev}>
        <PrevIcon />
      </button>
      <button className="pp" aria-label={p.playing ? "توقف" : "پخش"} onClick={p.toggle}>
        {p.playing ? <PauseIcon size={size === "big" ? 28 : 20} /> : <PlayIcon size={size === "big" ? 28 : 20} />}
      </button>
      <button className="ib" aria-label="بعدی" onClick={p.next}>
        <NextIcon />
      </button>
      <button className={`ib${p.repeat ? " act" : ""}`} aria-label="تکرار" aria-pressed={p.repeat} onClick={() => p.setRepeat(!p.repeat)}>
        <RepeatIcon size={20} />
      </button>
    </div>
  );
}

function Lyrics() {
  const p = usePlayer();
  const lines = p.track.lyrics;
  const cur = lyricIndex(p.position, p.track.duration, lines.length);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current?.querySelector<HTMLElement>(".on");
    if (el && box.current) {
      box.current.scrollTo({ top: el.offsetTop - box.current.clientHeight / 2 + el.clientHeight / 2, behavior: "smooth" });
    }
  }, [cur]);

  if (!lines.length) {
    return (
      <div className="lyr lyr-none">
        <div className="lyr-h">بی‌کلام</div>
        <p className="on">{p.track.about}</p>
        <p>این قطعه را ارکستر نوا ساخته است: ملودی بر پایهٔ دستگاه‌های موسیقی ایرانی، و صدای سازها با کامپیوتر ساخته شده. آزاد و بدون مشکل کپی‌رایت.</p>
      </div>
    );
  }
  const step = (p.track.duration - 6) / (lines.length * 2);
  return (
    <div className="lyr" ref={box} lang={p.track.chart === "wd" ? "en" : "fa"} dir={p.track.chart === "wd" ? "ltr" : "rtl"}>
      <div className="lyr-h" dir="rtl">متن آهنگ</div>
      {lines.map((l, i) => (
        <p key={i} className={i === cur ? "on" : ""} onClick={() => p.seek(6 + i * step + 0.1)}>
          {l}
        </p>
      ))}
    </div>
  );
}

export function NowPlaying({ onClose }: { onClose: () => void }) {
  const p = usePlayer();
  const t = p.track;
  const liked = p.liked.has(t.id);

  useEffect(() => {
    const k = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  return (
    <div className="np" role="dialog" aria-modal="true" aria-label="در حال پخش" style={{ ["--c1" as string]: t.colors[0] }}>
      <div className="np-in">
        <div className="nph">
          <button className="ib" aria-label="بستن" onClick={onClose}>
            <ChevronDown />
          </button>
          <span>
            در حال پخش از <b>{p.source}</b>
          </span>
          {t.audio ? <span className="ib" aria-hidden /> : <button
            className={`ib${p.soundOn ? "" : " act"}`}
            aria-label={p.soundOn ? "قطع صدای نمونه" : "وصل صدای نمونه"}
            aria-pressed={!p.soundOn}
            onClick={() => p.setSoundOn(!p.soundOn)}
          >
            <SoundIcon off={!p.soundOn} />
          </button>}
        </div>
        <div className="np-grid">
          <div className="np-main">
            <div className={`cv bigcv${p.playing ? " spin" : ""}`} style={cover(t.colors)} />
            <div className="npt">
              <div>
                <h2>{t.title}</h2>
                <span>{t.artist}</span>
              </div>
              <button
                className={`ib like${liked ? " on" : ""}`}
                aria-label={liked ? "حذف از پسندیده‌ها" : "پسندیدن"}
                aria-pressed={liked}
                onClick={() => p.toggleLike(t.id)}
              >
                <HeartIcon filled={liked} />
              </button>
            </div>
            <Scrubber />
            <Controls />
          </div>
          <Lyrics />
        </div>
        <p className="np-note">
          {t.audio
            ? "موسیقی اورجینال نوا · ساخته‌شده با کد، آزاد برای استفاده"
            : "این آهنگ نمونه است: صدای پخش یک ملودی ساده است که مرورگر می‌سازد."}
        </p>
      </div>
    </div>
  );
}
