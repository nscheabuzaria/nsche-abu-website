# NSChE ABU Student Chapter Website (`nscheabu.org`)

Official digital platform for the Nigerian Society of Chemical Engineers (NSChE), Ahmadu Bello University, Zaria Student Chapter (2025/2026 Session · 4th Senate Council).

## Pages & Architecture (Clean URLs via `vercel.json`)

- **`/` (`index.html`)** — Public **Coming Soon** page with a live countdown to **1 December 2026 · 12:00 Noon WAT**, SEO metadata for `nscheabu.org`, calendar reminder (`.ics`), and a **Live Countdown Share Flyer PNG Generator** (1080×1350 portrait flyer). Contains no public link to the portal while in pre-launch.
- **`/portal` (`portal.html`)** — Behind-the-scenes **Digital Hub Overview** highlighting each project and routing to dedicated subpages.
- **`/reactor` (`reactor.html`)** — **The Reactor 2026 Magazine** (*NSChE 2025/26 Executive Council Project*).
- **`/aspen` (`aspen.html`)** — **Process Simulation Training: Mastering Aspen Plus for Beginners** (*2025/26 Constituency Project · Sen. Amos Oheobe Michael & Sen. Abdulshafiu Adeiza Abubakar*, Tutors: *Anu Aderemi Afolabi & Muktar Jimoh*).
- **`/library` (`library.html`)** — **Past Questions & Study Materials** (*Usman Shehu Ahmad 2025/26 Constituency Project & Muhammad Mukhtar Bello (The Networker) Legacy Project*). Searchable catalogue of **13 courses / 574 curated files** from The Networker Drive archive (`assets/networker-catalogue.json`).
- **`/submit` (`submit.html`)** — **Student Material Submission Portal** with automatic browser-side image compression (~200 KB without visible quality loss), PDF stream optimization (`pdf-lib`), and Cloudflare R2 upload integration.
- **`/feedback` (`feedback.html`)** — **Student Feedback & Complaints Portal** (*Sen. Mamudu Majeedah Yahya Constituency Project*) submitting via Formspree (`moedblkj`) to `nscheabuzaria1@gmail.com` with Cloudflare R2 backup.

## Deploying Cloudflare R2 Upload Worker (`nscheabuzaria1@gmail.com`)

```bash
cd cloudflare-worker
npx wrangler login        # Sign in with nscheabuzaria1@gmail.com
npx wrangler r2 bucket create nsche-abu-materials
npx wrangler deploy
```
Then update `R2_UPLOAD_ENDPOINT` in `submit.html` if your `workers.dev` subdomain differs from `nsche-abu-uploads.nscheabuzaria1.workers.dev`.

## Deploying to Vercel (`nscheabuzaria1@gmail.com` → `nsche.vercel.app` & `nscheabu.org`)

```bash
npx vercel login          # Sign in with nscheabuzaria1@gmail.com
npx vercel --prod --name nsche
```
Or import the GitHub repo `ushcodex/nsche-abu-website` in Vercel under `nscheabuzaria1@gmail.com`, set Project Name to `nsche` (`nsche.vercel.app`), and attach custom domain `nscheabu.org`.
