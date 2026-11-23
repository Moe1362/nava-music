#!/usr/bin/env python3
"""
Compose Nava's original Persian-style instrumental tracks.

Everything here is made from scratch by code: the melodies are generated
from Persian modes (dastgah) and the instruments (santur, tar, ney, tombak,
daf, ...) are synthesised. No samples or recordings are used, so the music
belongs to the project and needs no licence.

Run:  python3 scripts/compose.py      (needs numpy and ffmpeg)
Out:  public/music/*.mp3 and lib/music.json
"""

import json
import os
import subprocess
import tempfile
import wave

import numpy as np

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "music")

# ---------------------------------------------------------------- modes
# cents of the 7 degrees. 150 / 350 / 650 / 850 are the Persian "koron"
# (roughly a quarter tone flat) intervals.
MODES = {
    "shur": [0, 150, 300, 500, 700, 800, 1000],
    "homayoun": [0, 150, 400, 500, 700, 800, 1000],
    "chahargah": [0, 150, 400, 500, 700, 850, 1100],
    "mahur": [0, 200, 400, 500, 700, 900, 1100],
    "esfahan": [0, 200, 300, 500, 700, 800, 1100],
    "segah": [0, 150, 350, 500, 650, 850, 1050],
}


def freq(tonic, mode, deg):
    o, s = divmod(deg, 7)
    return tonic * 2 ** ((MODES[mode][s] + 1200 * o) / 1200)


def midi_hz(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------------------------------------------------------------- helpers
def t_axis(n):
    return np.arange(n) / SR


def smooth(x, k):
    """cheap low-pass: moving average of k samples"""
    if k <= 1:
        return x
    return np.convolve(x, np.ones(k) / k, mode="same")


def adsr(n, a, r, sustain_n=None):
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na)
    nr = max(1, int(r * SR))
    if sustain_n is not None and sustain_n + nr < n:
        e[sustain_n : sustain_n + nr] *= np.linspace(1, 0, nr)
        e[sustain_n + nr :] = 0
    else:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


# ---------------------------------------------------------------- instruments
def santur(f, vel=1.0, rng=None):
    """hammered strings: inharmonic partials, two detuned strings, hammer click"""
    T = 2.6
    n = int(T * SR)
    t = t_axis(n)
    out = np.zeros(n)
    B = 0.0003
    for det in (-2.5, 2.5):
        fd = f * 2 ** (det / 1200)
        for k in range(1, 12):
            fk = fd * k * np.sqrt(1 + B * k * k)
            if fk > 14000:
                break
            amp = (1 / k**0.85) * (1.0 if k < 6 else 0.6)
            dec = 0.9 / (k**0.6)
            out += amp * np.exp(-t / dec) * np.sin(2 * np.pi * fk * t + k)
    click = (rng.standard_normal(int(0.006 * SR)) if rng is not None else 0) * 0.12
    out[: len(click)] += smooth(click, 8) * np.linspace(1, 0, len(click))
    out *= np.minimum(1, t / 0.002)
    return 0.16 * vel * out


def tar(f, vel=1.0, rng=None, dur=1.2):
    """plucked long-neck lute: bright attack, pitch settles, nasal partials"""
    T = min(1.6, dur + 0.6)
    n = int(T * SR)
    t = t_axis(n)
    bend = 1 + 0.006 * np.exp(-t / 0.03)
    phase = 2 * np.pi * np.cumsum(f * bend) / SR
    amps = [1, 0.8, 0.65, 0.35, 0.4, 0.2, 0.18, 0.1, 0.08]
    out = np.zeros(n)
    for k, a in enumerate(amps, 1):
        if f * k > 12000:
            break
        out += a * np.exp(-t / (0.55 / k**0.5)) * np.sin(k * phase)
    if rng is not None:
        nz = rng.standard_normal(int(0.01 * SR)) * 0.35
        out[: len(nz)] += nz * np.linspace(1, 0, len(nz))
    out *= np.minimum(1, t / 0.003)
    return 0.14 * vel * out


def ney(f, dur, vel=1.0, rng=None):
    """end-blown reed flute: breathy, vibrato that grows over long notes"""
    n = int((dur + 0.25) * SR)
    t = t_axis(n)
    vib_depth = 0.006 * np.clip((t - 0.25) / 0.5, 0, 1)
    fm = f * (1 + vib_depth * np.sin(2 * np.pi * 5.2 * t)) * (1 - 0.01 * np.exp(-t / 0.05))
    phase = 2 * np.pi * np.cumsum(fm) / SR
    out = np.sin(phase) + 0.28 * np.sin(2 * phase) + 0.12 * np.sin(3 * phase) + 0.05 * np.sin(4 * phase)
    env = adsr(n, 0.09, 0.18, int(dur * SR))
    # swell slightly on long notes
    env *= 0.85 + 0.15 * np.sin(np.clip(t / max(dur, 0.1), 0, 1) * np.pi)
    if rng is not None:
        breath = smooth(rng.standard_normal(n), 24) * 0.14
        breath *= env * (0.6 + 0.4 * np.exp(-t / 0.08))
        out = out * env + breath
    else:
        out *= env
    return 0.13 * vel * out


def epiano(f, dur, vel=1.0):
    n = int((dur + 1.4) * SR)
    t = t_axis(n)
    mod = 1.2 * np.exp(-t * 4) * np.sin(2 * np.pi * f * 2 * t)
    out = np.sin(2 * np.pi * f * t + mod) + 0.2 * np.sin(2 * np.pi * f * 3 * t) * np.exp(-t * 3)
    env = np.exp(-t / 1.2) * adsr(n, 0.004, 0.3, int((dur + 0.2) * SR))
    return 0.13 * vel * out * env


def pad(freqs, dur, vel=1.0):
    n = int((dur + 1.0) * SR)
    t = t_axis(n)
    out = np.zeros(n)
    for f in freqs:
        for det in (-6, 0, 6):
            fd = f * 2 ** (det / 1200)
            out += np.sin(2 * np.pi * fd * t) + 0.25 * np.sin(4 * np.pi * fd * t)
    env = adsr(n, 0.5, 0.9, int(dur * SR))
    return 0.025 * vel * out * env


def bass(f, dur, vel=1.0):
    n = int((dur + 0.2) * SR)
    t = t_axis(n)
    out = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) * np.exp(-t * 6)
    return 0.22 * vel * out * adsr(n, 0.005, 0.12, int(dur * SR))


def tom(vel=1.0, rng=None):  # tombak / dum
    n = int(0.45 * SR)
    t = t_axis(n)
    f = 62 + 70 * np.exp(-t / 0.03)
    out = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18)
    if rng is not None:
        out += smooth(rng.standard_normal(n), 20) * np.exp(-t / 0.02) * 0.6
    return 0.5 * vel * out


def bak(vel=1.0, rng=None):  # tombak rim / tak
    n = int(0.12 * SR)
    t = t_axis(n)
    nz = rng.standard_normal(n)
    nz = smooth(nz - smooth(nz, 12), 3)
    out = nz * np.exp(-t / 0.018) * 0.6 + np.sin(2 * np.pi * 880 * t) * np.exp(-t / 0.03) * 0.5
    return 0.3 * vel * out


def daf_dum(vel=1.0, rng=None):
    n = int(0.6 * SR)
    t = t_axis(n)
    f = 55 + 40 * np.exp(-t / 0.04)
    out = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.28)
    out += jingle(0.5, rng, n)
    return 0.5 * vel * out


def jingle(vel=1.0, rng=None, n=None):
    n = n or int(0.35 * SR)
    t = t_axis(n)
    nz = rng.standard_normal(n)
    nz = nz - smooth(nz, 4)
    shimmer = 0.6 + 0.4 * np.sin(2 * np.pi * 38 * t)
    return 0.22 * vel * nz * np.exp(-t / 0.09) * shimmer


def kick(vel=1.0):
    n = int(0.4 * SR)
    t = t_axis(n)
    f = 48 + 90 * np.exp(-t / 0.035)
    return 0.6 * vel * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)


def snare(vel=1.0, rng=None):
    n = int(0.25 * SR)
    t = t_axis(n)
    nz = rng.standard_normal(n)
    nz = nz - smooth(nz, 6)
    out = nz * np.exp(-t / 0.06) * 0.5 + np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05) * 0.4
    return 0.35 * vel * out


def hat(vel=1.0, rng=None):
    n = int(0.06 * SR)
    t = t_axis(n)
    nz = rng.standard_normal(n)
    nz = nz - smooth(nz, 3)
    return 0.1 * vel * nz * np.exp(-t / 0.012)


# ---------------------------------------------------------------- mixing
class Mix:
    def __init__(self, seconds):
        self.n = int((seconds + 4) * SR)
        self.dry = np.zeros((2, self.n))
        self.wet = np.zeros((2, self.n))

    def add(self, sig, at, pan=0.0, gain=1.0, rev=0.25):
        i = max(0, int(at * SR))
        if i >= self.n:
            return
        sig = sig[: self.n - i] * gain
        nf = min(int(0.3 * SR), len(sig) // 3)
        if nf > 1:  # fade every sound's tail so nothing ends with a click
            sig = sig.copy()
            sig[-nf:] *= np.linspace(1, 0, nf)
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        for ch, g in ((0, l), (1, r)):
            self.dry[ch, i : i + len(sig)] += sig * g * (1 - rev * 0.5)
            self.wet[ch, i : i + len(sig)] += sig * g * rev

    def render(self, rng, room=2.2):
        n_ir = int(room * SR)
        t = t_axis(n_ir)
        out = self.dry.copy()
        size = 1 << int(np.ceil(np.log2(self.n + n_ir)))
        for ch in range(2):
            ir = rng.standard_normal(n_ir) * np.exp(-t / (room / 6.9))
            ir = smooth(ir, 3)
            ir[: int(0.012 * SR)] = 0  # pre-delay
            ir /= np.sqrt(np.sum(ir**2))
            wet = np.fft.irfft(np.fft.rfft(self.wet[ch], size) * np.fft.rfft(ir, size), size)[: self.n]
            out[ch] += wet * 0.9
        # trim trailing silence, gentle master
        peak = np.max(np.abs(out)) or 1
        out = np.tanh(out / peak * 1.25) / np.tanh(1.25) * 0.89
        return out


# ---------------------------------------------------------------- composition
R6 = [[3, 1, 2], [2, 2, 2], [1, 1, 1, 3], [2, 1, 3], [1, 1, 2, 2], [3, 3], [1, 2, 1, 2], [2, 1, 1, 2]]
R8 = [[2, 2, 2, 2], [3, 3, 2], [2, 1, 1, 4], [1, 1, 2, 4], [4, 2, 2], [3, 1, 2, 2], [2, 2, 4], [1, 1, 1, 1, 4]]


def phrase(rng, meter, bars, start, target, lo, hi):
    """one melodic phrase: list of (start_eighth, len_eighths, degree)"""
    pats = R6 if meter == 6 else R8
    notes = []
    pos = 0
    deg = start
    total = bars * meter
    for b in range(bars):
        pat = pats[rng.integers(len(pats))] if b < bars - 1 else ([2, 4] if meter == 6 else [2, 2, 4])
        for k, ln in enumerate(pat):
            remaining = total - pos
            last = b == bars - 1 and k == len(pat) - 1
            if last:
                deg = target
            else:
                pull = np.sign(target - deg) if remaining < meter * 1.5 else 0
                step = rng.choice([-2, -1, -1, 0, 1, 1, 2]) + pull
                if rng.random() < 0.15:
                    step = rng.choice([-3, 3])
                deg = int(np.clip(deg + step, lo, hi))
            notes.append((pos, ln, deg))
            pos += ln
    return notes


def vary(rng, notes, lo, hi, amount=0.3):
    out = []
    for i, (p, ln, d) in enumerate(notes):
        if 0 < i < len(notes) - 1 and rng.random() < amount:
            d = int(np.clip(d + rng.choice([-1, 1]), lo, hi))
        out.append((p, ln, d))
    return out


def shift(notes, by):
    return [(p + by, ln, d) for p, ln, d in notes]


def build_melody(rng, meter, shahed, lo, hi, cycles=2):
    """A A' B B' A'' forud, repeated: the classic arc that rises to the
    high register (owj) and comes back down to the tonic (forud).
    Every other cycle brings new material, and the middle cycles sit
    higher, so the piece builds and then settles."""
    out, pos = [], 0
    for c in range(cycles):
        if c % 2 == 0:
            lift = 2 if 0 < c < cycles - 1 else 0
            A = phrase(rng, meter, 4, shahed + lift, shahed + lift, lo, hi + lift)
            B = phrase(rng, meter, 4, shahed + 3 + lift, shahed + 2, lo, hi + 2 + lift)
            F = phrase(rng, meter, 4, shahed + 1, 0, lo, hi)
        for sec in (A, vary(rng, A, lo, hi), B, vary(rng, B, lo, hi + 2), vary(rng, A, lo, hi, 0.5), F):
            out += shift(sec, pos)
            pos += 4 * meter
    return out, pos


def play_lead(mix, rng, inst, notes, e, t0, tonic, mode, octave=0, pan=0.0, gain=1.0, tremolo=True):
    for p, ln, d in notes:
        at = t0 + p * e + rng.normal(0, 0.006)
        f = freq(tonic, mode, d + 7 * octave)
        dur = ln * e
        vel = 0.8 + 0.25 * rng.random()
        if inst == "santur":
            mix.add(santur(f, vel, rng), at, pan, gain)
            if tremolo and ln >= 3:  # santur tremolo on long notes
                k = int(dur / (e / 3))
                for j in range(1, k):
                    mix.add(santur(f, vel * (0.55 - 0.2 * j / k), rng), at + j * e / 3, pan, gain)
            elif rng.random() < 0.18 and ln >= 2:  # grace note from above
                g = freq(tonic, mode, d + 1 + 7 * octave)
                mix.add(santur(g, 0.5, rng), at - 0.05, pan, gain)
        elif inst == "tar":
            mix.add(tar(f, vel, rng, dur), at, pan, gain)
            if ln >= 3:  # tar "riz" (fast repeated strokes)
                k = int(dur / (e / 2))
                for j in range(1, k):
                    mix.add(tar(f, vel * 0.5, rng, e / 2), at + j * e / 2, pan, gain)
        elif inst == "ney":
            mix.add(ney(f, dur * 0.97, vel, rng), at, pan, gain)
        elif inst == "epiano":
            mix.add(epiano(f, dur, vel), at, pan, gain)


def drone(mix, rng, inst, total, meter, e, t0, tonic, mode, pan=-0.3, gain=0.6):
    """low tonic/fifth strokes that anchor the mode"""
    for b in range(int(total // meter)):
        at = t0 + b * meter * e
        mix.add(santur(freq(tonic, mode, -7), 0.7, rng) if inst == "santur" else tar(freq(tonic, mode, -7), 0.7, rng), at, pan, gain)
        if meter == 6:
            mix.add(santur(freq(tonic, mode, -3), 0.45, rng), at + 3 * e, pan, gain)
        else:
            mix.add(santur(freq(tonic, mode, -3), 0.45, rng), at + 4 * e, pan, gain)


def perc(mix, rng, kind, bars, meter, e, t0, gain=1.0, fill_every=4):
    for b in range(bars):
        at = t0 + b * meter * e
        fill = (b + 1) % fill_every == 0
        if kind == "tombak":
            seq = [("T", 0), ("b", 2), ("T", 3), ("b", 4), ("b", 5)]
            if fill:
                seq = [("T", 0), ("b", 2), ("b", 3), ("b", 3.5), ("b", 4), ("b", 4.5), ("b", 5), ("b", 5.5)]
            for s, p in seq:
                v = 0.85 + 0.2 * rng.random()
                mix.add(tom(v, rng) if s == "T" else bak(v, rng), at + p * e + rng.normal(0, 0.004), 0.1, gain, 0.15)
        elif kind == "daf":
            seq = [("D", 0), ("j", 2), ("D", 3), ("j", 4), ("j", 5)]
            if fill:
                seq += [("j", 4.5), ("j", 5.5)]
            for s, p in seq:
                v = 0.85 + 0.2 * rng.random()
                mix.add(daf_dum(v, rng) if s == "D" else jingle(v, rng), at + p * e, -0.1, gain, 0.2)
        elif kind in ("pop", "lofi"):
            swing = 0.18 * e if kind == "lofi" else 0
            for i in range(meter):
                tt = at + i * e + (swing if i % 2 else 0)
                if i in (0, 5 if kind == "pop" else 3):
                    mix.add(kick(), tt, 0, gain, 0.05)
                if i in (2, 6):
                    mix.add(snare(0.9, rng), tt, 0.05, gain * (0.8 if kind == "lofi" else 1), 0.2)
                mix.add(hat(0.6 + 0.4 * (i % 2 == 0), rng), tt, 0.3, gain * 0.9, 0.05)


def vinyl(mix, rng, seconds):
    n = int(seconds * SR)
    crackle = np.zeros(n)
    idx = rng.integers(0, n, int(seconds * 9))
    crackle[idx] = rng.standard_normal(len(idx)) * 0.5
    hiss = smooth(rng.standard_normal(n), 10) * 0.012
    mix.add(crackle + hiss, 0, 0, 0.5, 0)


def chords(mix, prog, bars_each, meter, e, t0, gain=1.0, with_bass=True):
    t = t0
    for root_midi, kind in prog:
        third = 3 if kind == "m" else 4
        dur = bars_each * meter * e
        mix.add(pad([midi_hz(root_midi), midi_hz(root_midi + third), midi_hz(root_midi + 7), midi_hz(root_midi + 12)], dur), t, 0, gain, 0.4)
        if with_bass:
            for k in range(bars_each * 2):
                mix.add(bass(midi_hz(root_midi - 24), meter * e / 2 * 0.9), t + k * meter * e / 2, 0, gain, 0.05)
        t += dur
    return t


# ---------------------------------------------------------------- the tracks
def song(spec):
    rng = np.random.default_rng(spec["seed"])
    meter, e, mode, tonic = spec["meter"], spec["e"], spec["mode"], spec["tonic"]
    lo, hi = -2, 9
    cycles = max(2, round(spec.get("seconds", 150) / (24 * meter * e)))
    melody, length = build_melody(rng, meter, spec.get("shahed", 2), lo, hi, cycles)
    intro_bars = spec.get("intro_bars", 4)
    t0 = intro_bars * meter * e
    seconds = t0 + length * e + 3
    mix = Mix(seconds)

    # intro: free, slow statement of the mode
    intro = phrase(rng, meter, intro_bars, 0, spec.get("shahed", 2), lo, hi)
    play_lead(mix, rng, spec.get("intro", spec["lead"]), intro, e * 1.0, 0, tonic, mode, spec.get("oct", 0), 0.1, 0.9)

    play_lead(mix, rng, spec["lead"], melody, e, t0, tonic, mode, spec.get("oct", 0), 0.15, 1.0)
    if spec.get("double"):
        play_lead(mix, rng, spec["double"], melody, e, t0 + 0.012, tonic, mode, spec.get("double_oct", 0), -0.35, 0.55, tremolo=False)
    if spec.get("answer"):  # second instrument answers in the second half
        half = [(p, ln, d) for p, ln, d in melody if p >= length // 2]
        play_lead(mix, rng, spec["answer"], half, e, t0, tonic, mode, spec.get("answer_oct", -1), -0.3, 0.55, tremolo=False)

    bars = int(length // meter)
    if spec.get("drone"):
        drone(mix, rng, spec["drone"], length, meter, e, t0, tonic, mode)
    for k in spec.get("perc", []):
        start_bar = spec.get("perc_from", 0)
        perc(mix, rng, k, bars - start_bar, meter, e, t0 + start_bar * meter * e, spec.get("perc_gain", 0.9))
    if spec.get("chords"):
        t = t0
        while t < t0 + length * e - 0.1:
            t = chords(mix, spec["chords"], spec.get("chord_bars", 2), meter, e, t, spec.get("chord_gain", 1.0), spec.get("bass", True))
    if spec.get("vinyl"):
        vinyl(mix, rng, seconds)
    # final tonic
    end = t0 + length * e
    fin = freq(tonic, mode, 7 * spec.get("oct", 0))
    if spec["lead"] == "ney":
        mix.add(ney(fin, 2.4, 0.9, rng), end, 0.1)
    else:
        mix.add(santur(fin, 1.0, rng), end, 0.1)
        mix.add(santur(freq(tonic, mode, -7), 0.8, rng), end, -0.3)
    audio = mix.render(rng, spec.get("room", 2.2))
    return audio[:, : int((end + 2.8) * SR)]


TRACKS = [
    dict(slug="sepideh-shiraz", title="سپیده در شیراز", genre="سنتی", about="دستگاه شور · سنتور و تمبک",
         colors=["#f2a93b", "#b3263f"], seed=11, mode="shur", tonic=293.66, meter=6, e=0.2,
         lead="santur", intro="santur", drone="santur", perc=["tombak"], perc_from=4),
    dict(slug="nasim-homayoun", title="نسیم همایون", genre="سنتی", about="دستگاه همایون · نی و سنتور",
         colors=["#17b3a3", "#0b2b4a"], seed=23, mode="homayoun", tonic=392.0, meter=6, e=0.34,
         lead="ney", intro="ney", answer="santur", answer_oct=-1, drone="santur", perc=["tombak"], perc_from=12,
         perc_gain=0.55, room=3.0),
    dict(slug="atash-chahargah", title="آتش چهارگاه", genre="سنتی", about="دستگاه چهارگاه · تار و دف",
         colors=["#e6324b", "#3a1630"], seed=37, mode="chahargah", tonic=261.63, meter=6, e=0.16,
         lead="tar", intro="tar", drone="tar", perc=["daf"], perc_from=2),
    dict(slug="bagh-eram", title="باغ ارم", genre="پاپ", about="ماهور · سنتور با بیت پاپ",
         colors=["#2fd08f", "#123d33"], seed=41, mode="mahur", tonic=349.23, meter=8, e=0.25,
         lead="santur", intro="santur", perc=["pop"], perc_from=0, perc_gain=0.75,
         chords=[(65, "M"), (60, "M"), (62, "m"), (58, "M")], chord_bars=2),
    dict(slug="arusi-kucheh", title="عروسی کوچه", genre="شاد", about="ماهور شش‌وهشتم · سنتور، تار و دف",
         colors=["#ff7a59", "#5c1630"], seed=53, mode="mahur", tonic=392.0, meter=6, e=0.15,
         lead="santur", intro="santur", double="tar", double_oct=-1, perc=["daf", "tombak"], perc_gain=0.7,
         chords=[(67, "M"), (62, "M"), (60, "M"), (62, "M")], chord_bars=2, chord_gain=0.6),
    dict(slug="deltangi-esfahan", title="دلتنگی اصفهان", genre="عاشقانه", about="بیات اصفهان · نی و پد",
         colors=["#3aa0ff", "#1b1240"], seed=67, mode="esfahan", tonic=440.0, meter=8, e=0.34,
         lead="ney", intro="ney", answer="santur", answer_oct=-1,
         chords=[(57, "m"), (53, "M"), (50, "m"), (52, "M")], chord_bars=1, chord_gain=0.8, bass=False,
         room=3.0),
    dict(slug="raghs-segah", title="رقص سه‌گاه", genre="شاد", about="دستگاه سه‌گاه · تار و تمبک",
         colors=["#b8860b", "#4a2a06"], seed=79, mode="segah", tonic=320.0, meter=6, e=0.17,
         lead="tar", intro="tar", drone="tar", perc=["tombak"], perc_from=2),
    dict(slug="lofi-tehran", title="لوفای تهران", genre="بی‌کلام", about="شور · پیانو الکتریک، بیت لوفای",
         colors=["#9b7bff", "#140c1c"], seed=97, mode="shur", tonic=293.66, meter=8, e=0.36,
         lead="epiano", intro="epiano", perc=["lofi"], perc_from=2, perc_gain=0.6, vinyl=True,
         chords=[(50, "m"), (46, "M"), (48, "M"), (45, "m")], chord_bars=1, chord_gain=0.9),
]


def write_mp3(path, audio):
    pcm = (np.clip(audio.T, -1, 1) * 32767).astype("<i2")
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wav_path = tmp.name
    with wave.open(wav_path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", wav_path, "-codec:a", "libmp3lame", "-b:a", "128k",
         "-metadata", "artist=ارکستر نوا", "-metadata", "comment=Original music made with code for Nava", path],
        check=True,
    )
    os.unlink(wav_path)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    meta = []
    for spec in TRACKS:
        audio = song(spec)
        path = os.path.join(OUT_DIR, spec["slug"] + ".mp3")
        write_mp3(path, audio)
        dur = round(audio.shape[1] / SR, 1)
        print(f"{spec['slug']:18s} {dur:6.1f}s  {os.path.getsize(path) / 1e6:.1f} MB")
        meta.append({k: spec[k] for k in ("slug", "title", "genre", "about", "colors")} | {"duration": dur})
    with open(os.path.join(ROOT, "lib", "music.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
