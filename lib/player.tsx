"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { IRAN, type Track } from "./data";
import { DemoSynth } from "./synth";

type PlayerState = {
  queue: Track[];
  index: number;
  track: Track;
  source: string;
  playing: boolean;
  position: number;
  soundOn: boolean;
  shuffle: boolean;
  repeat: boolean;
  liked: Set<string>;
  playFrom: (queue: Track[], index: number, source: string) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (sec: number) => void;
  toggleLike: (id: string) => void;
  setSoundOn: (on: boolean) => void;
  setShuffle: (on: boolean) => void;
  setRepeat: (on: boolean) => void;
};

const Ctx = createContext<PlayerState | null>(null);
const LIKED_KEY = "nava:liked";

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Track[]>(IRAN);
  const [index, setIndex] = useState(0);
  const [source, setSource] = useState("ترند ایران");
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const synth = useRef<DemoSynth | null>(null);
  const posRef = useRef(0);
  posRef.current = position;

  const track = queue[index];

  // remember liked songs in this browser
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LIKED_KEY);
      if (raw) setLiked(new Set(JSON.parse(raw)));
    } catch {}
  }, []);
  const toggleLike = useCallback((id: string) => {
    setLiked((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      try {
        localStorage.setItem(LIKED_KEY, JSON.stringify([...n]));
      } catch {}
      return n;
    });
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => {
        if (shuffle && queue.length > 1) {
          let j = i;
          while (j === i) j = Math.floor(Math.random() * queue.length);
          return j;
        }
        return (i + dir + queue.length) % queue.length;
      });
      setPosition(0);
    },
    [queue.length, shuffle]
  );

  // clock: move the play head while playing
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      setPosition((p) => p + dt);
    }, 200);
    return () => window.clearInterval(id);
  }, [playing]);

  // sound: restart the generator when the song, play state or seek changes
  const seekNonce = useRef(0);
  const [seekTick, setSeekTick] = useState(0);
  useEffect(() => {
    if (!synth.current) synth.current = new DemoSynth();
    if (playing && soundOn) synth.current.start(track, posRef.current);
    else synth.current.stop();
    return () => synth.current?.stop();
  }, [track, playing, soundOn, seekTick]);

  const seek = useCallback(
    (sec: number) => {
      setPosition(Math.max(0, Math.min(track.duration - 0.5, sec)));
      seekNonce.current++;
      setSeekTick(seekNonce.current);
    },
    [track.duration]
  );

  // end of song
  useEffect(() => {
    if (position < track.duration) return;
    if (repeat) seek(0);
    else step(1);
  }, [position, track.duration, repeat, step, seek]);

  const playFrom = useCallback((q: Track[], i: number, src: string) => {
    setQueue(q);
    setIndex(i);
    setSource(src);
    setPosition(0);
    setPlaying(true);
  }, []);

  const prev = useCallback(() => {
    if (posRef.current > 4) seek(0);
    else step(-1);
  }, [seek, step]);

  // media keys / lock screen controls where the browser supports it
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.artist, album: "نوا" });
    navigator.mediaSession.setActionHandler("play", () => setPlaying(true));
    navigator.mediaSession.setActionHandler("pause", () => setPlaying(false));
    navigator.mediaSession.setActionHandler("nexttrack", () => step(1));
    navigator.mediaSession.setActionHandler("previoustrack", () => prev());
  }, [track, step, prev]);

  const value = useMemo<PlayerState>(
    () => ({
      queue,
      index,
      track,
      source,
      playing,
      position,
      soundOn,
      shuffle,
      repeat,
      liked,
      playFrom,
      toggle: () => setPlaying((p) => !p),
      next: () => step(1),
      prev,
      seek,
      toggleLike,
      setSoundOn,
      setShuffle,
      setRepeat,
    }),
    [queue, index, track, source, playing, position, soundOn, shuffle, repeat, liked, playFrom, step, prev, seek, toggleLike]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlayer() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePlayer must be used inside PlayerProvider");
  return v;
}
