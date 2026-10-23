# Azam — Portfolio

A one-page portfolio site for Azam, an illusionist and live experience creator. Built as a single-page React app with scroll-driven sections, cinematic animations, an interactive card magic trick, auto-playing Instagram reels, and a horizontal "Industries → Partners" explorer.

**Live:** [azams-portfolio.netlify.app](https://azams-portfolio.netlify.app)

---

## Tech stack

| Area | Tool |
|---|---|
| Framework | **React 19** |
| Language | **TypeScript ~6.0** |
| Build / dev server | **Vite 8** |
| Styling | **Tailwind CSS v4** (via `@tailwindcss/vite`) |
| Linter | **oxlint** |
| Deploy target | **Netlify** (SPA + `_headers` for caching) |

No runtime JS dependencies beyond React — animations and 3D card flips are pure CSS keyframes + Tailwind utility classes.

---

## Prerequisites

- **Node.js ≥ 20.19** or **≥ 22.12** (required by Vite 8)
- **npm 10+** (or any package manager that reads `package-lock.json`)
- **cwebp** *(optional)* — only needed if you add new raster assets and want to re-generate the shipped `.webp` versions

Check your versions:
```bash
node -v
npm -v
```

---

## Quick start (local)

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (HMR enabled)
npm run dev
```

The dev server runs at **http://localhost:5173** by default. Any file change triggers a hot reload.

---

## Available scripts

```bash
npm run dev        # start Vite dev server (HMR)
npm run build      # type-check with tsc, then build production bundle to ./dist
npm run preview    # serve ./dist locally (useful for sanity-checking the build)
npm run lint       # run oxlint across the codebase
```

The `build` script runs **`tsc -b && vite build`** — TypeScript must compile cleanly before Vite produces output.

---

## Project structure

```
src/
├── App.tsx                 # Section composition (Hero → About → … → Contact)
├── main.tsx                # React bootstrap + scroll-restoration override
├── index.css               # Tailwind v4 setup, theme tokens, all animations
├── components/
│   ├── Hero.tsx            # Opening banner with mobile + desktop images
│   ├── About.tsx           # Who-is-Azam section (above-the-fold)
│   ├── Proof.tsx           # Stat band with count-up animation
│   ├── Social.tsx          # Social media follower cards + bars
│   ├── Reels.tsx           # Instagram reels marquee (auto-play, tap-to-unmute)
│   ├── Industries.tsx      # 5-industry horizontal picker + logo grid
│   ├── WhyBrands.tsx       # 6 reasons cards
│   ├── Creates.tsx         # Big typographic reveal
│   ├── Formats.tsx         # Experience formats list
│   ├── Process.tsx         # 4-step timeline
│   ├── MagicTrick.tsx      # Interactive card prediction trick
│   ├── Contact.tsx         # Portrait banner + contact info + social icons
│   ├── ScrollToTop.tsx     # Floating back-to-top button
│   └── shared/             # Reusable primitives (StatBlock, LogoTile, etc.)
├── data/
│   ├── brands.ts           # 68 brand logos split across 5 industries
│   ├── content.ts          # Section copy, stats, social links
│   ├── logos.ts            # Vite glob resolver → logo asset URLs
│   └── reels.ts            # Reel metadata (video + poster paths)
├── hooks/
│   └── useInView.ts        # IntersectionObserver hook used by all reveals
└── assets/                 # Images (webp preferred; png kept as source)
    ├── global-brands/      # 14 brand logos
    ├── hospitality-lifestyle/
    ├── real-estate/
    ├── govt-events/
    └── media/

public/
├── _headers                # Netlify cache directives (hashed assets → 1y)
├── favicon.svg
├── icons.svg
└── reels/                  # Instagram reel .mp4 files (served as-is)
```

---

## Making common changes

### Add / remove a brand logo

1. Drop the logo file as **`.webp`** (preferred, keeps bundle small) into the correct category folder under `src/assets/`:
   - `global-brands/` · `hospitality-lifestyle/` · `real-estate/` · `govt-events/` · `media/`
2. Open `src/data/brands.ts` and add an entry to the relevant category's `items` array:
   ```ts
   { name: "Brand Display Name", slug: "filename-without-extension" }
   ```
3. The slug must match the file name exactly (sans extension).

### Add / remove an Instagram reel

1. Drop the `.mp4` and poster image into `public/reels/`.
2. Register it in `src/data/reels.ts` under `reelsRowOne` or `reelsRowTwo`.

### Change contact info / social links

Edit `src/data/content.ts` (the `socials` + `socialLinks` objects) and / or the strings in `src/components/Contact.tsx`.

### Convert PNGs to WebP

The source `.png` files live in `src/assets/` as masters but are not shipped — the imports resolve to `.webp`. To regenerate webps after adding/replacing a PNG:

```bash
# Requires: brew install webp
cwebp -q 85 src/assets/global-brands/new-brand.png -o src/assets/global-brands/new-brand.webp
```

Quality 82-85 is a good balance for logos; use 70-78 for photographs.

---

## Deploying

### Scalixity server (Docker + Cloudflare tunnel)

Live at **https://azam-portfolio.scalixity.com**. The `Dockerfile` builds the site and serves `dist/` with nginx (`docker/nginx.conf.template` mirrors the `public/_headers` caching rules). `deploy/production/` holds the compose file and a zero-downtime deploy script: it builds, health-checks the new image on a throwaway port, swaps the container, and rolls back automatically if the swap fails.

- **Deploy:** click **Deploy Azam portfolio** on https://ci.scalixity.com, or over SSH run `~/scripts/azam-portfolio-deploy.sh [branch]` (default `main`).
- **On the server:** checkout at `~/scalixity/azams_portfolio`, container `azam-portfolio`, host network on `127.0.0.1` / `172.17.0.1` port **3200** (the tunnel points at `http://172.17.0.1:3200`).

### Netlify

The repo is deploy-ready for Netlify as-is:

1. **Build command:** `npm run build`
2. **Publish directory:** `dist`
3. **Node version:** 20.19+ (set via Netlify's Node version UI or a `.nvmrc` file)

The `public/_headers` file is copied to `dist/` on build and tells Netlify to serve all hashed `/assets/*` files with `Cache-Control: public, max-age=31536000, immutable` — gives repeat visitors near-instant loads.

### Vercel / Cloudflare Pages / any static host

1. `npm run build`
2. Upload `dist/` to your host.
3. For caching, replicate the rules in `public/_headers` in your host's equivalent config:
   - `/assets/*` → cache 1 year (immutable)
   - `/reels/*` → cache 1 day
   - `*.svg` → cache 1 day

### Self-hosting (nginx / Apache / Caddy)

Build with `npm run build`, serve `dist/` as a static site. SPA fallback isn't needed — this is a single-page app with no client-side routing.

Minimum nginx snippet:
```nginx
location /assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Performance notes

- **Code-splitting:** Only `Hero` + `About` ship in the main bundle (~231 kB JS, ~72 kB gzip). All other sections lazy-load via `React.lazy()` as the user scrolls down.
- **Images:** All hero/background assets are WebP (97% smaller than their PNG sources).
- **Fonts:** Google Fonts (Bodoni Moda, Fraunces, Playfair Display, Inter) are loaded **non-render-blocking** via `preload` + `onload="this.media='all'"` in `index.html`.
- **Caching:** Hashed asset filenames + `_headers` give repeat visits ~0 ms load for unchanged resources.

Current Lighthouse scores (mobile, 4G throttle): **Performance ~90, Accessibility 100, SEO 100, Best Practices 100**.

---

## Troubleshooting

**Dev server shows a blank page**
Make sure your Node version is ≥20.19. Vite 8 drops support for older Node LTS.

**`cwebp: command not found`**
Install via Homebrew (`brew install webp`) or your OS's package manager. Only needed if you're adding new images.

**Fonts flash unstyled briefly on first load**
Expected — Fonts load async to avoid render-blocking. The flash is < 200ms on a cold cache and 0ms on repeat visits.

**Page scroll jumps to a mid-page section on reload**
Should not happen — `main.tsx` sets `history.scrollRestoration = "manual"`. If you add anchor-link navigation, remember that modifies this behaviour.

---

## License

Private — all rights reserved. Content and imagery © Azam.
