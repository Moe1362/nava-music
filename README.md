# نوا · Nava

اپ موزیک ترندهای ایران و جهان. نسخهٔ اول (وب، قابل نصب روی گوشی به‌صورت PWA).

An original music app for trending Iranian and global songs. First version: a web app you can also "install" on a phone.

> **مهم:** همهٔ آهنگ‌ها، خواننده‌ها، آمارها و متن‌ها ساختگی‌اند. صدای پخش یک ملودی ساده است که خود مرورگر می‌سازد، نه آهنگ واقعی. برای پخش آهنگ واقعی اول باید مجوز (لایسنس) گرفت.
>
> All songs, artists, numbers and lyrics are made up. The sound is a simple tune generated in the browser, not a real recording. Real songs need licences first.

## What's inside

- **خانه (Home):** genre chips, today's #1 in Iran, world hits, Iran top 5, diaspora, mood mixes
- **ترند (Trending):** Iran / World / Diaspora charts with up, down and "new" markers
- **جستجو (Search):** search by song, artist or lyrics, browse by genre
- **کتابخانه (Library):** playlists, liked songs (saved in your browser), artists
- **Player:** mini player, full-screen player with synced lyrics, seek, next/previous, shuffle, repeat, like
- Right-to-left Persian layout, Vazirmatn font, phone and desktop layouts

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
| `lib/synth.ts` | Makes the demo sound |
| `components/views/` | The four screens |
| `components/NowPlaying.tsx` | Full-screen player and lyrics |
| `app/globals.css` | All colours and styles |
