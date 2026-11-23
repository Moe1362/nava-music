"use client";

import { CHARTS, CHART_TRACKS, type ChartKey } from "@/lib/data";
import { TrackRow } from "../TrackRow";

export function TrendView({ chart, setChart }: { chart: ChartKey; setChart: (c: ChartKey) => void }) {
  const list = CHART_TRACKS[chart];
  const source = CHARTS[chart].source;
  return (
    <>
      <div className="hello">
        <h1>چارت‌ها</h1>
        <span className="meta">به‌روز: امروز ۹ صبح</span>
      </div>
      <div className="seg" role="tablist" aria-label="چارت">
        {(Object.keys(CHARTS) as ChartKey[]).map((k) => (
          <button key={k} role="tab" aria-selected={k === chart} className={k === chart ? "on" : ""} onClick={() => setChart(k)}>
            {CHARTS[k].label}
          </button>
        ))}
      </div>
      <p className="note">رتبه‌ها بر اساس تعداد پخش‌های بالای ۳۰ ثانیه در ۲۴ ساعت گذشته (داده‌ها نمونه‌اند).</p>
      {list.map((t, i) => (
        <TrackRow key={t.id} track={t} rank={i + 1} queue={list} index={i} source={source} showLike />
      ))}
    </>
  );
}
