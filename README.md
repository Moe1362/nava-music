# نوا · Nava

اپ موزیک ترندهای ایران و جهان. نسخهٔ اول (وب، قابل نصب روی گوشی به‌صورت PWA).

An original music app for trending Iranian and global songs. First version: a web app you can also "install" on a phone.

> **مهم:** آهنگ‌های چارت‌ها (ایران، جهان، دیاسپورا) ساختگی‌اند و فقط یک ملودی ساده پخش می‌کنند. ۸ قطعهٔ «بی‌کلام ایرانی نوا» واقعی‌اند: با کد و بر پایهٔ دستگاه‌های موسیقی ایرانی ساخته شده‌اند، پس مال خود پروژه‌اند و مجوز لازم ندارند. برای پخش آهنگ خواننده‌های واقعی اول باید مجوز (لایسنس) گرفت.
>
> The chart songs are made up and play a simple demo tune. The 8 "Nava Persian instrumentals" are real audio files composed by code (`scripts/compose.py`) from Persian modes, so the project owns them and needs no licence. Songs by real singers need licences first.

## What's inside

- **خانه (Home):** genre chips, today's #1 in Iran, world hits, Iran top 5, diaspora, mood mixes
- **ترند (Trending):** Iran / World / Diaspora charts with up, down and "new" markers
- **جستجو (Search):** search by song, artist or lyrics, browse by genre
- **کتابخانه (Library):** playlists, liked songs (saved in your browser), artists
- **Player:** mini player, full-screen player with synced lyrics, seek, next/previous, shuffle, repeat, like
- Right-to-left Persian layout, Vazirmatn font, phone and desktop layouts

## The Nava instrumentals

| Track | Mode (dastgah) | Instruments |
| --- | --- | --- |
| سپیده در شیراز | Shur | santur, tombak |
| نسیم همایون | Homayoun | ney, santur |
| آتش چهارگاه | Chahargah | tar, daf |
| باغ ارم | Mahur | santur, pop beat |
| عروسی کوچه | Mahur (6/8) | santur, tar, daf, tombak |
| دلتنگی اصفهان | Bayat-e Esfahan | ney, santur, pad |
| رقص سه‌گاه | Segah | tar, tombak |
| لوفای تهران | Shur | electric piano, lo-fi beat |

They live in `public/music/`. To make new ones, change `TRACKS` in `scripts/compose.py` and run `python3 scripts/compose.py` (needs Python with numpy, and ffmpeg).

## Run it on your computer

You need [Node.js](https://nodejs.org) (version 20 or newer).

```bash
git clone https://github.com/Moe1362/nava-music.git
cd nava-music
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Put it online (free)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New → Project** and pick `nava-music`.
3. Click **Deploy**. You get a link like `nava-music.vercel.app` that works on any phone.

## Where things are

| Folder | What it is |
| --- | --- |
| `lib/data.ts` | The songs, charts and playlists (edit this to change the music list) |
| `lib/player.tsx` | Player logic: play, pause, next, likes |
| `lib/synth.ts` | Makes the demo sound for the made-up chart songs |
| `public/music/` | The real Nava instrumental tracks (mp3) |
| `scripts/compose.py` | The program that composed them |
| `components/views/` | The four screens |
| `components/NowPlaying.tsx` | Full-screen player and lyrics |
| `app/globals.css` | All colours and styles |
