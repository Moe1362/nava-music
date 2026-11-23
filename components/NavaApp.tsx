"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PLAYLISTS, findTrack, type ChartKey, type Track } from "@/lib/data";
import { cover } from "@/lib/format";
import { PlayerProvider, usePlayer } from "@/lib/player";
import { HomeIcon, LibIcon, Logo, SearchIcon, TrendIcon } from "./Icons";
import { MiniPlayer } from "./MiniPlayer";
import { NowPlaying } from "./NowPlaying";
import { HomeView } from "./views/HomeView";
import { LibraryView } from "./views/LibraryView";
import { SearchView } from "./views/SearchView";
import { TrendView } from "./views/TrendView";

type View = "home" | "trend" | "search" | "lib";

const NAV: { id: View; label: string; Icon: typeof HomeIcon }[] = [
  { id: "home", label: "خانه", Icon: HomeIcon },
  { id: "trend", label: "ترند", Icon: TrendIcon },
  { id: "search", label: "جستجو", Icon: SearchIcon },
  { id: "lib", label: "کتابخانه", Icon: LibIcon },
];

function Shell() {
  const p = usePlayer();
  const [view, setView] = useState<View>("home");
  const [chart, setChart] = useState<ChartKey>("ir");
  const [npOpen, setNpOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    if (p.playing) setStarted(true);
  }, [p.playing]);

  const go = (v: View) => {
    setView(v);
    main.current?.scrollTo({ top: 0 });
  };
  const openChart = (c: ChartKey) => {
    setChart(c);
    go("trend");
  };
  const close = useCallback(() => setNpOpen(false), []);

  return (
    <div className={`app${started ? " has-player" : ""}`}>
      <aside className="side">
        <div className="brand">
          <span className="mark"><Logo /></span>
          <b>نوا</b>
        </div>
        <nav className="side-nav" aria-label="منوی اصلی">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} className={view === id ? "on" : ""} aria-current={view === id ? "page" : undefined} onClick={() => go(id)}>
              <Icon /> {label}
            </button>
          ))}
        </nav>
        <div className="side-h">پلی‌لیست‌ها</div>
        {PLAYLISTS.map((pl) => {
          const list = pl.trackIds.map(findTrack).filter(Boolean) as Track[];
          return (
            <button key={pl.id} className="side-pl" onClick={() => p.playFrom(list, 0, pl.name)}>
              <span className="cv" style={cover(pl.colors)} /> {pl.name}
            </button>
          );
        })}
        <p className="side-note">همهٔ آهنگ‌ها، خواننده‌ها و آمارها نمونه و ساختگی‌اند.</p>
      </aside>

      <main className="view" ref={main}>
        <div className="view-in">
          {view === "home" && <HomeView openChart={openChart} />}
          {view === "trend" && <TrendView chart={chart} setChart={setChart} />}
          {view === "search" && <SearchView />}
          {view === "lib" && <LibraryView />}
        </div>
      </main>

      {started && <MiniPlayer onOpen={() => setNpOpen(true)} />}

      <nav className="tabs" aria-label="منوی اصلی">
        {NAV.map(({ id, label, Icon }) => (
          <button key={id} className={view === id ? "on" : ""} aria-current={view === id ? "page" : undefined} onClick={() => go(id)}>
            <Icon />
            {label}
          </button>
        ))}
      </nav>

      {npOpen && <NowPlaying onClose={close} />}
    </div>
  );
}

export default function NavaApp() {
  return (
    <PlayerProvider>
      <Shell />
    </PlayerProvider>
  );
}
