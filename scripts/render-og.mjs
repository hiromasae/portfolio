// Renders scripts/og-card.html to public/og.png — the site's Open Graph card.
//
// RUN IT BY HAND, and re-run it whenever the home page's <h1> or any of the
// dark-theme tokens below change:
//
//     node scripts/render-og.mjs
//
// NOT a build step, and deliberately not one. public/og.png is committed, so
// `astro build` needs neither a browser nor this script — which is what keeps
// the deploy from depending on a 200MB Chromium download. The cost is that the
// card can go stale, and the whole design of this script is aimed at that: it
// reads the site's real tokens out of global.css rather than carrying a copy,
// and it throws rather than guessing when one goes missing. The predecessor it
// exists to prevent is legacy/og-image.png — a hand-exported screenshot of a
// site that no longer existed, which is why this card had to be built from
// scratch rather than recovered.
//
// Playwright is a peer of this script, not a dependency of the site: it is not
// in package.json, because nothing else here needs a browser. A global install
// (`npm i -g playwright`) is the expected setup and is what resolveChromium
// looks for after trying a local one.

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const CARD = join(here, 'og-card.html');
const CSS = join(root, 'src', 'styles', 'global.css');
const OUT = join(root, 'public', 'og.png');

// The card's dimensions, and the numbers og:image:width/height in
// src/layouts/Layout.astro name. If these change, that markup changes with
// them — a scraper that is told the wrong size lays out a placeholder at the
// wrong aspect and pops when the real file lands.
const WIDTH = 1200;
const HEIGHT = 630;

// Every token og-card.html paints with. The card defines NO colours of its
// own, so this list is the contract between the two files: add a var() there,
// add its name here.
const TOKENS = [
	'paper',
	'surface',
	'ink',
	'ink-soft',
	'ink-hero',
	'dye-name',
];

/** Pull the dark theme's custom properties out of global.css.
 *
 *  Reads the :root[data-theme="dark"] block specifically — NOT bare :root,
 *  which is the light theme. Comments come out first (global.css is mostly
 *  comments, several of which contain braces and hex values in prose), then
 *  the block is taken by brace-matching rather than by a regex, so a nested
 *  rule inside it can't truncate the match. */
function readDarkTokens() {
	const css = readFileSync(CSS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

	const at = css.indexOf(':root[data-theme="dark"]');
	if (at === -1) throw new Error(`no :root[data-theme="dark"] block in ${CSS}`);

	const open = css.indexOf('{', at);
	let depth = 0;
	let close = -1;
	for (let i = open; i < css.length; i++) {
		if (css[i] === '{') depth++;
		else if (css[i] === '}' && --depth === 0) { close = i; break; }
	}
	if (close === -1) throw new Error('unterminated :root[data-theme="dark"] block');

	const block = css.slice(open + 1, close);
	const found = new Map();
	for (const m of block.matchAll(/--([a-z-]+)\s*:\s*([^;]+);/g)) {
		found.set(m[1], m[2].trim());
	}

	// Loudly, and naming the token. A card that silently renders a missing
	// colour as transparent is exactly the failure this script exists to stop.
	const missing = TOKENS.filter((t) => !found.has(t));
	if (missing.length) {
		throw new Error(
			`global.css's dark block no longer defines: ${missing.map((t) => '--' + t).join(', ')}\n` +
			`Either the token was renamed (update TOKENS and og-card.html) or it moved out of that block.`
		);
	}

	return TOKENS.map((t) => `--${t}: ${found.get(t)};`).join('\n');
}

/** Import Playwright from wherever it actually is: a local install first, then
 *  the global root. Resolved rather than hard-coded because the global path
 *  carries the Node version in it under nvm, so a version bump would break a
 *  literal path. */
async function resolveChromium() {
	try {
		return (await import('playwright')).chromium;
	} catch {}

	let globalRoot;
	try {
		globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
	} catch {
		throw new Error('Playwright not found and `npm root -g` failed. Try: npm i -g playwright');
	}

	const entry = join(globalRoot, 'playwright', 'index.mjs');
	if (!existsSync(entry)) {
		throw new Error(`Playwright not found at ${entry}. Try: npm i -g playwright`);
	}
	return (await import(pathToFileURL(entry).href)).chromium;
}

// Read the tokens BEFORE launching anything. This is the step that throws, and
// there is no reason to have spent a browser start-up on the way to finding out
// a token was renamed.
const tokens = readDarkTokens();

const chromium = await resolveChromium();
const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width: WIDTH, height: HEIGHT },
	deviceScaleFactor: 1,
});

await page.goto(pathToFileURL(CARD).href);
// The tokens land AFTER the document so they win on order against anything
// the card might ever declare for itself, and before the fonts settle.
await page.addStyleTag({ content: `:root {\n${tokens}\n}` });
// font-display: block means an unsettled face renders as nothing rather than
// as a fallback — so this is what stands between us and a card of blank space.
await page.evaluate(() => document.fonts.ready);

await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
await browser.close();

console.log(`og.png  ${WIDTH}×${HEIGHT}  →  ${OUT}`);
