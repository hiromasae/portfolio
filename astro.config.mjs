// @ts-check
import { readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

/* ── Keep .DS_Store out of the build (2026-08-22) ──
   Astro copies public/ into dist/ verbatim, and macOS writes a .DS_Store into
   any folder Finder so much as looks at — so public/.DS_Store and
   public/images/.DS_Store were being built into dist/ and, from there, synced
   to the bucket by `aws s3 sync`, which uploads dotfiles like anything else.
   They were publicly readable on the origin; a .DS_Store is a directory
   listing, so it names files whether or not anything links to them.

   Deleting the two that existed is not the fix. .gitignore already covered
   them, which is exactly why they went unnoticed for so long — they never
   appeared in a diff, and they come BACK the next time anyone opens public/ in
   Finder. An --exclude on the sync command is not the fix either: it only
   holds for as long as everyone deploying types the documented command (the
   README's now does, as a second line of defence).

   So the build strips them. It is the one step every deploy goes through no
   matter how the files get uploaded afterwards, which makes it the only place
   the guarantee actually sticks. Cheap, too — one recursive readdir of a
   directory that was just written. */
const stripDsStore = {
  name: 'strip-ds-store',
  hooks: {
    /** @type {(opts: { dir: URL, logger: { info: (msg: string) => void } }) => Promise<void>} */
    'astro:build:done': async ({ dir, logger }) => {
      const root = fileURLToPath(dir);
      const entries = await readdir(root, { recursive: true });
      const junk = entries.filter((entry) => path.basename(entry) === '.DS_Store');
      await Promise.all(junk.map((entry) => rm(path.join(root, entry), { force: true })));
      // Silent on the happy path — a clean build shouldn't have to say so.
      if (junk.length > 0) {
        logger.info(`stripped ${junk.length} .DS_Store file(s) from the build output`);
      }
    },
  },
};

// https://astro.build/config
export default defineConfig({
  // The production origin, and the ONLY place it is written down. Everything
  // absolute in the <head> — canonical, og:url, and og:image if one is ever
  // added — is derived from this through Astro.site in Layout.astro, so moving
  // the site to another domain is this one line and nothing else. Added
  // 2026-08-18 with the social card: og:url and canonical are meaningless
  // relative, and `new URL(path, Astro.site)` throws at build time without it,
  // so the config and those tags land together or not at all.
  //
  // https, and no trailing path. The canonical a crawler is handed has to be
  // the URL a visitor actually ends up on — naming the http:// form on a site
  // that redirects to https just books a redirect on every crawl.
  site: 'https://hiroeern.com',
  // ── Type ── Recursive, SELF-HOSTED (2026-08-16). It used to come off the
  // Google Fonts CDN as a plain <link rel=stylesheet>, which put a two-hop
  // chain in front of the site's only face on EVERY page load: connect to
  // fonts.googleapis.com, fetch the CSS, discover the @font-face, connect to
  // fonts.gstatic.com, fetch the woff2 — two DNS+TLS handshakes and a
  // request that can't even START until the first one comes back. This site
  // navigates with hard loads (see Nav.astro), so every click paid it, and
  // with DevTools open — where "Disable cache" is the default posture —
  // nothing was reused between pages and the fallback face was visible for
  // most of a second each time (Hiro, 2026-08-16: "the fonts take a second
  // to load when clicking between pages"). Served from our own origin and
  // preloaded from the <head> (the <Font> tag in Layout.astro), it is one
  // request on a connection the HTML already opened, started at parse time
  // instead of after the CSS round-trip.
  //
  // THE FILE IS THE PINNING. src/assets/fonts/Recursive-latin.woff2 is the
  // exact instance Google was serving for the old URL's axis pins,
  // downloaded once and committed. Recursive is a superfamily; four of its
  // five axes are pinned, and that is what makes this "Recursive Sans" and
  // not the rest of it:
  //   MONO 0  proportional sans, not the monospace end (this is the axis
  //           that makes it "Sans"; MONO 1 is Recursive Mono)
  //   CASL 0  Linear, the neutral drawing, not the Casual/handwritten one
  //   slnt 0  upright; nothing on the site sets italic
  //   CRSV 0  roman letterforms. The face's own default is 0.5 ("auto",
  //           cursive only when slanted) — harmless here since slnt is
  //           pinned upright, but 0 states it rather than relying on how
  //           auto resolves.
  // Those used to be pinned in a Google css2 URL, in an order that API
  // dictated (registered lowercase axes alphabetically, then custom
  // uppercase ones) and would reject if you got wrong. Now they are baked
  // into the bytes: the file is static on all four and variable on wght
  // alone, so the pinning costs nothing and can no longer drift out from
  // under the site on a CDN's schedule.
  //
  // wght stays a RANGE, not four quantised stops — 300..700 out of the
  // face's continuous 300–1000. The floor is 300, Recursive's lightest,
  // because the site's weight scale moved DOWN a step on 2026-08-04 (Hiro:
  // "much lighter") and body text now sits there; see the scale on body's
  // font-weight rule in global.css. The ceiling stays 700 though nothing
  // currently asks above 500: on a variable face the extra range costs
  // essentially nothing, and it means every weight the CSS can name is one
  // the file really has. That is the lesson the .btn comment in global.css
  // records — a declared weight the font lacks gets synthesised or snapped,
  // and under a webfont swap the two sides disagree visibly.
  //
  // LATIN ONLY. Google split its Recursive into four unicode-range subsets;
  // this is the `latin` one (U+0000–00FF plus the general punctuation and
  // currency ranges below). The site renders nothing outside it — the
  // Japanese runs, the arrows and ⌘ already fall through to the system face,
  // as they did on the CDN — and it is the only file preloaded, so it must
  // not carry bytes nothing sets. If copy ever gains a U+0100+ glyph (a
  // macron, an ō), the fix is a second variant here pointing at Google's
  // `latin-ext` woff2 with its own unicodeRange — NOT a wider single file.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Recursive',
      cssVariable: '--font-recursive',
      // Kept in step with --font-sans's tail in global.css: Astro builds the
      // variable's value as [the face, the generated metric-matched
      // fallbacks, then these], so this list is where the stack after
      // Recursive is actually declared now.
      fallbacks: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      // Metric-matched fallbacks (size-adjust/ascent-override, derived from
      // the real file's metrics) are ON — the default, stated here because
      // it is the half of this change that the eye actually reads. The old
      // setup's visible fault wasn't only the wait: when the webfont finally
      // landed it RESET every text box, because the fallback was drawn at
      // its own metrics. Recursive's numbers now shape the fallback, so the
      // swap moves almost nothing. Nav.astro's whenTypeSettled ceremony
      // stays as the belt to this suspenders — it is what guarantees the
      // load intro never plays across a swap — but it is no longer the only
      // thing standing between a cold cache and a page that jumps.
      optimizedFallbacks: true,
      options: {
        variants: [
        {
          weight: '300 700',
          style: 'normal',
          src: ['./src/assets/fonts/Recursive-latin.woff2'],
          // Google's own `latin` range, verbatim. Declaring it states what
          // is in the file rather than letting the browser find out per
          // glyph, and it keeps this variant honest if a latin-ext one is
          // ever added beside it.
          unicodeRange: [
            'U+0000-00FF',
            'U+0131',
            'U+0152-0153',
            'U+02BB-02BC',
            'U+02C6',
            'U+02DA',
            'U+02DC',
            'U+0304',
            'U+0308',
            'U+0329',
            'U+2000-206F',
            'U+20AC',
            'U+2122',
            'U+2191',
            'U+2193',
            'U+2212',
            'U+2215',
            'U+FEFF',
            'U+FFFD',
          ],
        },
        ],
      },
    },
  ],
  integrations: [stripDsStore],
  // ── Dev host ── The IP form, NOT `localhost`, and only so the URL this
  // prints is safe to click. Cmd+clicking a `localhost` URL inside the Claude
  // Code TUI opens the page TWICE (2026-08-23): Claude Code carries its own
  // dev-server-aware browser opener, and for that host form it fires alongside
  // the terminal's OSC 8 open, so one click becomes two tabs — two real loads
  // ~470ms apart, confirmed in this dev server's own request log. The same URL
  // written 127.0.0.1 opens once, and so does `localhost` clicked in a plain
  // iTerm2 tab or handed to `open`, which is what rules out the terminal, macOS
  // and Astro and leaves the host string as the whole trigger.
  //
  // It costs nothing to state. Astro's default here is `false`, which already
  // means loopback-only — this pins the same reachability to one address rather
  // than opening anything up, and the binding was IPv4/IPv6-split under the
  // default anyway (`localhost` resolved to ::1, where 127.0.0.1 wasn't
  // listening at all). Anyone needing the server on the network still passes
  // `--host` on the command line, which overrides this.
  //
  // A Claude Code fix upstream makes this line pointless, not wrong; drop it
  // once a `localhost` link opens a single tab again.
  server: { host: '127.0.0.1' },
  vite: {
    plugins: [tailwindcss()]
  }
});
