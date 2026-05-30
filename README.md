# Stock Count 📦

A mobile-friendly stock counter for a small shop — **multiple people can count at the same
time**, with barcode/QR scanning, product photos, live sync, and one-tap **CSV / PDF** export.

Built with **Vite + React + TypeScript**; data, photos and realtime sync on **Supabase**.
Runs in an **offline-demo mode** with no setup, or as a live shared app once Supabase is connected.

## Quick start

```bash
npm install
npm run dev
```

Then see **[SETUP.md](SETUP.md)** for connecting Supabase (live multi-user) and deploying a
free shareable web link.

## Features

- 📷 Barcode / QR scanning (auto +1 on a known product, prompts to add a new one)
- 👥 Live multi-user counting with "who's also counting now" presence
- 🖼️ Product photos stored in the cloud
- ➕➖ One-tap quantity stepping on the list for fast counting
- 📊 Analytics (totals, value, by-category, top stock)
- 📤 Export the full stock list as CSV or a printable PDF report
- 📴 Offline-tolerant: changes queue on the device and sync when back online
- 📱 Installable to the home screen, mobile-first design

## Scripts

| Command         | What it does                          |
| --------------- | ------------------------------------- |
| `npm run dev`   | Local dev server                      |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview the production build        |
