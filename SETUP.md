# Stock Count — Setup & Deploy Guide

A mobile-friendly stock counter your family can use **at the same time**, with barcode
scanning, photos, live multi-user sync, and one-tap export to CSV / PDF.

Built with **Vite + React + TypeScript**, data + photos + realtime on **Supabase**.

> Works *without* Supabase out of the box — it runs in **offline demo mode** (data saved
> only on that one device). To get **live multi-user counting**, do Steps 2–3 below.

---

## Step 1 — Run it locally (dev)

```bash
npm install
npm run dev
```

Open the URL it prints (e.g. http://localhost:5173). You'll see the offline-demo banner
until you connect Supabase.

## Step 2 — Create the free Supabase project (~4 min)

1. Go to **https://supabase.com** → sign up (free) → **New project**.
2. Name it (e.g. `stock-count`), set a DB password, pick a nearby region → **Create**.
3. Wait ~1 minute for provisioning.
4. Open **SQL Editor** → **New query**, paste ALL of **`supabase_setup.sql`**, click **Run**.
   This creates the products table, live sync, and the photo storage bucket.

## Step 3 — Add your keys

1. In Supabase go to **Project Settings → API** and copy:
   - **Project URL**  (e.g. `https://abcdwxyz.supabase.co`)
   - **anon public** key (a long string)
2. In the project root, copy `.env.example` to **`.env`** and fill in:
   ```
   VITE_SUPABASE_URL=https://abcdwxyz.supabase.co
   VITE_SUPABASE_ANON_KEY=your-long-anon-key
   ```
3. Restart `npm run dev`. The offline banner disappears — it's now live and shared.

---

## Step 4 — Deploy a free web link

Camera scanning needs **https**, so host it (don't just email the file).

> ⚠️ **Important:** the env vars below are read **at build time** (Vite inlines them).
> Add them to the host **before** the first build, or redeploy after adding them —
> otherwise the deployed site ships in offline-demo mode.

### Option A — Vercel (connect the GitHub repo, auto-build) — recommended

1. The repo is already on GitHub (`kuangeric1234-droid/Stock-Count`) with a `vercel.json`.
2. On **https://vercel.com** → **Add New → Project** → **Import** the repo.
   Vercel auto-detects Vite (build `npm run build`, output `dist`) — no changes needed.
3. **Before** clicking Deploy, expand **Environment Variables** and add the two
   (these live in *Vercel*, not Supabase — they point *at* your Supabase project):
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon public key
4. **Deploy** → you get `https://your-project.vercel.app`. Share that link.
   - If you ever add the env vars *after* deploying, trigger **Redeploy** so they take effect.
   - Every `git push` to `main` auto-redeploys.

### Option B — Netlify (connect the GitHub repo, auto-build)

1. On **https://app.netlify.com** → **Add new site → Import from GitHub** → pick the repo.
2. Build settings (auto-detected): **Build command** `npm run build`, **Publish directory** `dist`.
3. Under **Site settings → Environment variables**, add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`, then trigger a deploy.
4. Deploy → you get `https://your-name.netlify.app`.

On each phone: open the link → browser menu → **Add to Home Screen** → opens like an app.

---

## How the family uses it

- **First open:** type your name (“Who's counting?”). It's stamped on everything you count.
- **Live presence:** the green line up top shows who else is counting right now — so two
  people don't double-count the same shelf. Tip: split by aisle/section.
- **Fastest counting:** tap **Scan**, point at a barcode.
  - Known item → quantity auto **+1**, just save.
  - New item → fill the details once; next scan it's recognised.
- **On the list:** quick **−/+** buttons bump the count without opening the item.
- **Photos:** tap the photo box → take a picture. Stored in the cloud, visible to everyone.
- **Finish:** **Analytics & Export** → **Export CSV** (for the books) or **Print / PDF**
  (clean printable list with totals — hand it to the buyer).

---

## Project structure

```
src/
  App.tsx            # orchestrates state, modals, persistence
  supabase.ts        # client + CLOUD flag (offline-demo fallback)
  types.ts           # Product type + category/unit constants
  index.css          # the dark mobile theme
  lib/
    data.ts          # load / CRUD / photo upload / offline queue / realtime
    export.ts        # CSV + printable-PDF generation
    usePresence.ts   # live "who's counting" hook
  components/        # Header, ProductList, Analytics, ProductModal,
                     # ScannerModal, NameModal, ConfirmDialog, Toast
supabase_setup.sql   # one-shot DB + storage setup
legacy/              # the original single-file prototype (kept for reference)
```

## Notes / FAQ

- **Security:** `supabase_setup.sql` uses an *open* policy — anyone with the link + anon key
  can read/write. Fine for a private family tool shared by link. Swap for auth-based
  policies later if you want real logins.
- **Offline:** if WiFi drops in the stockroom, counts save on the phone and auto-sync when
  the connection returns (“All changes synced ✓”).
- **Cost:** $0 — Supabase free tier (500 MB DB + 1 GB storage) + Netlify free hosting.
