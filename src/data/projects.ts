/** One detail-page image: its src, its intrinsic size, and optionally a
    caption. The bare-string form `images` used to allow is gone (2026-08-17) —
    see `w` for what killed it. */
export interface ProjectImage {
	src: string;
	/** ⚠ THE FILE'S OWN PIXEL DIMENSIONS, not the size it renders at. These are
	    REQUIRED, and the requirement is the point: they exist so the browser can
	    reserve the right box before a single byte of the image arrives.

	    Without them the detail page shifted about 2,300px (2026-08-17). The
	    template hands each shot `w-full` and nothing else, and Tailwind's
	    preflight ships `img,video{max-width:100%;height:auto}` — with no
	    intrinsic ratio to work from, `height:auto` resolves to ZERO, so every
	    shot laid out as a 0px sliver and the whole stack snapped to full height
	    as the files landed. On migaki that walked the link-out, the More
	    projects strip and the footer down the page in four jumps.

	    The second-order half is worse and less obvious: while all four boxes
	    sat at 0px they were all stacked at the top of the document, so all four
	    were "in the viewport" when the lazy heuristic ran and `loading="lazy"`
	    on shots 2..n bought exactly nothing — the browser fetched every one
	    immediately. Sizing the boxes is what makes that attribute start working,
	    which is why the two fixes are one fix.

	    Width and height ATTRIBUTES do not fix the rendered size. Preflight's
	    `height:auto` still governs, and `w-full` still sets the width; the
	    numbers only supply the aspect ratio the reservation needs. So these can
	    be the raw 2x source dimensions — nothing here needs to know about the
	    920px the page actually renders at.

	    ⚠ RE-SHOOT A SHOT AND YOU MUST UPDATE THESE. A stale pair is worse than
	    no pair: the browser reserves a confidently wrong box and the page still
	    jumps, only now it also lied. `sips -g pixelWidth -g pixelHeight <file>`
	    prints both. The same discipline the card frame and the about photo
	    already keep by other means — see ProjectCard's aspect-[16/9] frame and
	    about.astro's width/height on me.webp; this was the one place on the site
	    that kept neither. */
	w: number;
	/** @see w — always set as a pair. */
	h: number;
	/** Rendered ABOVE the image — see the template for why. Set it where the
	    shot's ROLE isn't self-evident, which is not the same question as
	    whether the shot is readable. All four of migaki's are perfectly
	    legible and not one of them says what it is doing in the sequence: two
	    are the same prompt built without and with the skill, and nothing in the
	    pixels says which is which; the other two are terminals whose job in the
	    argument is invisible until named. EJS carries TWO for the same reason
	    — its first two shots are one page before and after a redesign, and the
	    green is the same green in both. The remaining projects carry none
	    because theirs are plain product shots in a set — each is another view
	    of one thing, so there is no role to disambiguate.

	    ⚠ EJS's last two shots are BARE ON PURPOSE (2026-08-15, Hiro), and this
	    reverses what was written here a few hours earlier. The claim then was
	    that a comparison contaminates everything after it — that an uncaptioned
	    third shot would read as a third alternative rather than as another view
	    — so all four were labelled. Two of those labels were "Support" and
	    "Documentation", which is the tell: a caption that only names the page it
	    is a picture of has nothing to disambiguate, and the sequence had run out
	    of comparison long before it ran out of images. So the rule stays exactly
	    as stated above — captions where the ROLE is unclear — and EJS is now an
	    example of it rather than an exception to it. Don't restore them for
	    symmetry with the pair; the pair is not a set the rest has to match.

	    An uncaptioned image also falls back to `— image N` for its alt text,
	    which is worth nothing to a screen reader. That alone is reason enough
	    not to leave a shot unlabelled when it has anything to say. */
	caption?: string;
}

/** One section of a long-form case study (2026-10-07, off the feedback that
    two studies should go to full depth: context and constraints, what was
    tried and rejected, the decision and why, what happened after, what I'd do
    differently — six to ten short sections, an image each).

    A section is a heading, one paragraph, and its images. `images` is a LIST
    rather than a single shot for exactly one reason: the before/after pairs.
    migaki's "without/with" and EJS's "old/rebuilt" are the strongest evidence
    on their pages, and a comparison only works with both halves in view (see
    the long notes on the `images` field of each project below). A pair has to
    live inside one section or it stops being a pair. Most sections carry one;
    an empty list is legal for a closing section that has nothing to show.

    `body` is one paragraph. The feedback said SHORT sections, and the heading
    is doing the work a topic sentence would otherwise do — if a section
    wants two paragraphs it probably wants to be two sections. */
export interface ProjectSection {
	/** Omit on the OPENING section only (2026-10-07, Hiro): an h2 directly
	    under the title reads as a subtitle, so the study opens on its
	    paragraph. Every later section keeps one. */
	heading?: string;
	body: string;
	images: ProjectImage[];
}

/** Where the work stands. Rendered on the detail page's dateline after the
    company (2026-09-30, off the feedback that every page should say this
    outright), so it is a fact about the OUTCOME, not the work's genre: "Open source" is
    a status here because for that kind of project publishing the repo IS
    shipping it. Keep the set closed — a fifth value wants a reason, and the
    page has no styling per value to update, so the cost is only vocabulary. */
export type ProjectStatus = 'Shipped' | 'Concept' | 'Proposed' | 'Open source';

export interface Project {
	slug: string;
	title: string;
	/** Rendered on the detail page's dateline between the year and the status
	    (2026-09-30). For self-initiated work write who it was for or under,
	    not what kind of work it was — "Open source" used to sit here for
	    migaki and ejs and is now the STATUS of both, so the dateline would
	    have said it twice.

	    OPTIONAL since 2026-10-03 (Hiro: "Independent · Open source is
	    redundant"). "Independent" was the filler that took Open source's old
	    seat on migaki, and it says nothing the status doesn't. Leave it OUT
	    for self-initiated work rather than inventing an owner; the dateline
	    drops the slot and its middot. */
	company?: string;
	year: string;
	/** NOT RENDERED. Off the detail page since 07-29, and back for a few
	    hours on 09-30 before coming off again with `role` — the header note
	    in [slug].astro has the reason. Don't repeat the status as a tag:
	    migaki and ejs each carried 'Open Source' here and it went when the
	    status arrived. Kept because they're real facts that are a nuisance to
	    re-gather; delete if still unused later. */
	tags: string[];
	/** One-line "what I did". NOT RENDERED — off the cards 2026-08-02, and on
	    the detail page under the title for a few hours on 09-30 before coming
	    off again (see the header note there): on every project it is the work
	    paragraph's first sentence in shorter form, so it cost a line to say
	    what the prose says a screen later. Kept for the same reason as tags. */
	role: string;
	status: ProjectStatus;
	/** A card on the home grid (true) or a row in its Earlier work list
	    (false). 2026-10-07, Hiro, off the feedback that "three strong beat
	    five thin": migaki and EJS became full studies, Stacksmith stays a
	    card, Suma and Shipyard dropped to the list. Their detail pages are
	    unchanged and still in every project page's More projects strip, so
	    nothing is unpublished; this decides prominence on the home page
	    only. The grid runs three across, so three featured fills one row;
	    a fourth would start a short row, which is the thing to re-decide.
	    Required rather than optional so every entry states its answer. */
	featured: boolean;
	blurb: string;
	problem: string;
	/** The "Work" paragraph — what I did and what it changed. Prose, not a
	    bullet list: the detail page renders it as one block. */
	work: string;
	cover: string;
	/** Detail page images, in order. Everything rides on its own src — the
	    caption and now the intrinsic size both. Keep them welded rather than
	    parallel-arraying either one: migaki's shots were renumbered once
	    already (see its note), and a captions[] or a sizes[] indexed alongside
	    would have silently shifted onto the wrong pictures.

	    ⚠ ONE FORM ONLY, as of 2026-08-17. A bare string used to be legal here
	    for a shot that needed no caption, and that was fine while src was the
	    only thing a shot had to carry. It isn't: `w`/`h` are required now (see
	    ProjectImage), a bare string cannot carry them, and every string form
	    left legal is a hole this exact bug climbs back through the next time
	    someone adds a picture. An uncaptioned shot is `{ src, w, h }` with no
	    caption key — barely longer, and it can't be under-specified. */
	images: ProjectImage[];
	/** The long-form study. When set, the detail page renders THESE in place
	    of `problem`, `work` and `images` — those three keep feeding the card,
	    the meta description and any page that isn't sectioned, so a project
	    carries both and they must agree. Two projects have one (migaki, ejs);
	    the other three stay on the short form on purpose — "three strong beat
	    five thin" was the whole of the feedback. */
	sections?: ProjectSection[];
	/** Number of empty frames to stand in for screenshots that don't exist yet.
	    Only read when `images` is empty, and only by the detail page; an empty
	    `cover` leaves the card's own frame blank the same way. Delete the field
	    from a project the moment it has real images — a placeholder that
	    outlives its shoot is worse than no frame at all. */
	placeholders?: number;
	/** The link out. Rendered on every detail page that has one (2026-09-30);
	    from 08-16 until then it rendered only where `linkLabel` was also set,
	    which left three of five URLs unpublished — that gate is gone, see
	    `linkLabel`. Omit the field to publish no link. */
	link?: string;
	/** The link's VISIBLE TEXT, optional. Without it the page shows the URL's
	    host with any leading "www." dropped — "yoursuma.com",
	    "shipyardhq.tech" — so a bare `link` still renders (2026-09-30, off the
	    feedback that it didn't). Set this only where the host is the wrong
	    thing to say: migaki's names the repo, because the host alone would be
	    "github.com" and the page has already said it is open source, so the
	    useful thing left to say is WHICH repo.

	    ⚠ FROM 2026-08-16 TO 09-30 THIS WAS ALSO THE SWITCH that decided whether
	    a link rendered at all — the ask then was migaki and ejs specifically,
	    and deriving a label would have published all five at once. That is
	    exactly what the 09-30 feedback asked for, so the gate came off; don't
	    put it back by reading an absent label as "unpublished".

	    Write the DESTINATION, not an instruction — "ejs.co", not "Visit the
	    site". The ↗ already says a link leaves the site, so the words are free
	    to say where it goes, and a reader deciding whether to click wants the
	    host more than the verb.

	    ⚠ IT CANNOT WRAP, so length has a ceiling. .btn-quiet is an inline-flex
	    row, which means a long label runs past the page's right edge instead of
	    breaking — there is no second line for it to take. MEASURED at the
	    narrowest width worth supporting: "github.com/hiromasae/migaki", the
	    longest one here, renders 271px, and a 320px viewport leaves 272.5px
	    inside main's px-5. That is ~1.5px of headroom, so this label is
	    effectively AT the limit and a longer one would overflow. Anything past
	    ~27 characters wants a shorter form (drop the owner, or name the host)
	    rather than a fix in the CSS. The derived host is subject to the same
	    ceiling — "app.subframe.com" is the longest one today at 16. */
	linkLabel?: string;
}

export const projects: Project[] = [
	{
		slug: 'migaki',
		title: 'migaki: Design Sense for Coding Agents',
		year: '2026',
		tags: ['AI', 'Design Systems'],
		role: 'Wrote the skill, its three-file structure, and the weekly refresh loop.',
		status: 'Open source',
		featured: true,
		blurb: 'An open source design skill that gives any AI coding agent a working visual sense.',
		problem:
			'A coding agent will build almost anything you describe, but left to its own defaults it keeps landing on the same look. Write the fix down once and the document starts aging the day you save it. migaki (磨き, "to polish") is a design skill that tries to solve both halves of that at once: a visual sense an agent can actually apply, that does not decay into a period piece.',
		work:
			"The skill is three markdown files. The first holds the timeless perceptual principles, the part of visual judgement that doesn't move. The second catalogues the patterns that read as AI-generated or dated, and the third what reads as excellent right now. Those last two rewrite themselves weekly, so the sense it works from tracks the present instead of settling into a style guide from last year. Anything that can read a skill file gets the whole thing.",
		/* migaki is numbered 0-4 rather than 1-n like the others (2026-08-14,
		   Hiro): migaki0 was shot as the card cover, migaki1-4 as the detail
		   shots. The cover has since moved to migaki2 (see below), and migaki0
		   now lives only in the sections' files section. Keep the numbering
		   anyway; migaki5 is the next detail shot.

		   The four run in file order, and the shape is comparison first then
		   mechanism: migaki1 and migaki2 are the same prompt built without and
		   with the skill, migaki3 is that skill running, migaki4 is the
		   taste-decisions list it hands back.

		   ⚠ THE PAIR MUST STAY ADJACENT. This briefly ran 1,3,2,4 to follow the
		   chronology — migaki3 is the run that produced migaki2, so it wanted to
		   sit in front of it — and that was reverted (2026-08-14, Hiro) because
		   it cost more than it bought. Comparing two images means holding both
		   at once, and migaki3 is ~475px of dense terminal wedged between them.
		   The chronology is the weaker claim: put anything between 1 and 2 and
		   the page's strongest evidence stops working. If migaki3's link to
		   migaki2 needs restating, its caption is the place, not the order.

		   ⚠ migaki4 IS A DIFFERENT RUN, and its output is not on the page. It
		   rewrites the WITHOUT page (`without/index.html`) rather than
		   continuing from migaki2 — its decisions name Ferrite and quote the
		   invented 96.6%/8.14s figures visible in migaki1. So it points
		   BACKWARDS at the first image, which is what its caption has to carry
		   now that three images separate them. The honest fix is a fifth shot
		   of the rewritten page, closing the loop migaki4 opens; until then the
		   caption is doing that work alone.

		   ⚠ THE COVER IS migaki2, the "With migaki" page (2026-10-08, Hiro).
		   It was migaki0, the three markdown files in an editor, on the theory
		   that migaki has no product to shoot. At the card's ~304px that read
		   as a grey block of type, and it showed the skill's source rather
		   than what the skill does. migaki2 is the output: one big headline,
		   one accent, legible at card size. Not the without/with pair side by
		   side — each half would be ~150px wide. migaki2 is ~1.37, so the
		   card's top-anchored 16/9 crop keeps the headline and the head of
		   the terminal and drops the footer row.

		   Everything here lands in the site's palette by construction rather
		   than by grading: the editor theme in every shot is Tokyo Night, and
		   so is this site — see --surface-sunken and --ink-title in global.css,
		   both taken verbatim from it. A screenshot from any other theme would
		   need colour work to sit next to the others. Keep that in mind before
		   re-shooting.

		   Ratios differ by job. The card frame crops the cover to 16/9
		   regardless of what it's handed. The four below render uncropped at 920px, so their
		   ratio only sets their height — the two landing pages are the squarer
		   pair at ~1.37 and stand about 670px tall, the two terminals are wider
		   and sit shorter. In file order that reads tall, tall, short, short.
		   The 1,3,2,4 order alternated them instead, which was the one thing
		   that arrangement had going for it; it was spent deliberately, because
		   an even rhythm is a smaller prize than a comparison that works. All
		   five are shot at ~2530 wide, which is the 2x the 920px render needs
		   to stay crisp; don't drop below that. */
		cover: '/images/migaki2.webp',
		images: [
			{ src: '/images/migaki1.webp', w: 2530, h: 1854, caption: 'Without migaki' },
			{ src: '/images/migaki2.webp', w: 2530, h: 1844, caption: 'With migaki' },
			{ src: '/images/migaki3.webp', w: 2528, h: 1312, caption: 'The skill running' },
			{
				src: '/images/migaki4.webp',
				w: 2528,
				h: 1376,
				caption: 'What it proposed for the first page',
			},
		],
		/* ── The long-form study (2026-10-07, cut to five the same day) ──
		   Was eight sections in the feedback's order, with GitHub screenshots
		   for the restarts, the bounding commit, the sources file and the
		   research PR. Hiro: too detailed — no one needs to see what the PRs
		   were. Now five: the problem, the files, the failure that set the
		   rule, the decision about authority, and what I'd do differently.
		   The restarts survive as one clause in the last section; the
		   monthly refresh as one in the files section. migaki5-8 are no
		   longer referenced (still in public/images; delete if they stay
		   unused).

		   Cutting the research-PR section also retired the two claims the
		   repo couldn't back ("All sixteen went in" on an open PR, and the
		   inferred reason for the restarts). Don't reintroduce either
		   without checking it.

		   The without/with pair stays in ONE section (the first) for the
		   reason the images note above gives at length. migaki0 illustrates
		   the files section, which has no better picture than the files.
		   migaki2, the cover, also appears in the body, the same exception
		   EJS makes with its hero. The
		   beige section has no image: the only picture of it was the commit
		   diff. It sits between two image sections so the page never runs
		   two bare sections back to back mid-page.

		   Written for a reader who has never used a coding agent: the first
		   section says what a skill is, and "slop entry", "routing test",
		   "tiers" and "RGB spread" are gone from the prose.

		   ⚠ Still open: any external users. The repo shows none and the
		   text claims none. */
		sections: [
			{
				body: 'A coding agent will build almost anything you describe, but left to its defaults it keeps arriving at the same page, with the same gradient and the same card grid. A written correction starts aging the day you save it, because whatever reads as fresh now ends up in the next model’s training data. I started migaki (磨き, to polish) to deal with both problems. It is a skill, a set of instructions an agent like Claude Code loads when a task calls for it, and it gives the agent visual judgement that doesn’t go stale.',
				images: [
					{ src: '/images/migaki1.webp', w: 2530, h: 1854, caption: 'Without migaki' },
					{ src: '/images/migaki2.webp', w: 2530, h: 1844, caption: 'With migaki' },
				],
			},
			{
				heading: 'How it’s structured',
				body: 'SKILL.md tells the agent which file to open. core.md holds sixteen principles of visual judgement that don’t change with fashion. slop.md lists what reads as AI-generated or dated, and edge.md what reads as excellent right now. Those two are refreshed monthly from shipped products, so the advice keeps up with the present. The whole thing is about five hundred lines, and I keep it that size on purpose.',
				images: [{ src: '/images/migaki0.webp', w: 2462, h: 1438, caption: 'core.md, slop.md and edge.md' }],
			},
			{
				heading: 'Making the rules measurable',
				body: 'In an early test, an instruction asking for a slightly warm neutral produced a heavy beige, and one asking for a Tiempos-style serif produced Palatino. Both described the right thing but set no limits. I fixed them with numbers: a warm neutral stays within about four RGB points of gray, and a display serif needs a licensed webfont or the pattern is skipped. Since then, every new rule has to name a value someone could check.',
				images: [],
			},
			{
				heading: 'Letting the user decide',
				body: 'The biggest design question was how much authority the skill’s opinions should have. It builds what was asked, then lists the taste decisions it made so the user can accept or reject each one in a word. Every pattern it warns against also says when that pattern is still the right choice, and the user’s own instructions override all of it.',
				images: [
					{ src: '/images/migaki3.webp', w: 2528, h: 1312, caption: 'The skill running' },
					{ src: '/images/migaki4.webp', w: 2528, h: 1376, caption: 'The decisions it handed back' },
				],
			},
			{
				heading: 'What I’d do differently',
				body: 'I would start with the text. My first two versions were an MCP server and a JavaScript rewrite, and I scrapped both before settling on three markdown files. I would also limit length from the start: one round of edits grew the files by fourteen percent before I capped each entry at eight lines.',
				images: [],
			},
		],
		/* The repo, which for this project is the product: migaki ships as three
		   markdown files and a plugin manifest, so there is no site to send
		   anyone to and the source is the whole of it. Labelled with the full
		   owner/name path rather than "GitHub" — the page has already said it is
		   open source, so the useful thing left to say is WHICH repo. */
		link: 'https://github.com/hiromasae/migaki',
		linkLabel: 'github.com/hiromasae/migaki',
	},
	{
		slug: 'ejs',
		title: 'EJS: Landing Page Facelift',
		company: 'EJS',
		year: '2026',
		tags: ['Landing Page', 'UI/UX'],
		role: 'Redesigned the marketing site: hero, support page, and docs.',
		/* Proposed, not Open source: the redesign is not deployed — see the
		   link's note below, which is the same fact seen from the other side. */
		status: 'Proposed',
		featured: true,
		blurb: 'A redesign of the EJS landing page, so the library says what it does up front.',
		problem:
			"ejs.co has looked more or less the same for years. There's a wordmark, a four-word tagline, and a lot of olive green. What it never gets around to is what EJS actually does, or why you would pick it over the alternatives. The only thing promoted above the fold is a different project. The Jake banner sits above EJS's own logo. Twenty million people install this library every week and the page tells them almost nothing about it.",
		work:
			"I led with a plain statement of what the library does, generate HTML with plain JS, and put the install command right under it in a chip you can copy. The numbers that make the case on their own are on the page for the first time: 20M+ weekly downloads, 7.7k stars, zero dependencies. I also built the two pages a one-screen site had nowhere to put. Support sends a question to Stack Overflow or GitHub Issues, and the docs have an on-this-page rail so the reference is something you can move around in. The olive green stays, since it is what people recognise, but it runs as a band and an accent instead of the whole canvas.",
		/* ── Image order is 1, 0, 2, 3, and that is deliberate (Hiro's ask) ──
		   NOT a numbering mistake to be tidied up. ejs1 is the EXISTING site and
		   ejs0 is its replacement, so the sequence opens on a before/after pair
		   and the file numbers simply don't run in the order the argument does.
		   Renumbering the files would fix the cosmetics and cost the reason —
		   ejs0 is the COVER (see below), and cover-plus-details is the same split
		   migaki draws with its own 0/1-4 gap.

		   ⚠ THE PAIR MUST STAY ADJACENT, for the reason migaki's note gives at
		   length: comparing two images means holding both at once, and anything
		   wedged between them breaks the only comparison this page makes. The two
		   after that are single views of the new site and can be reordered freely.

		   ejs0 does double duty as cover AND as the second figure, which is the
		   one place this project departs from migaki's convention (there the
		   cover owns no slot in the sequence). It earns the exception: the after
		   half of a before/after cannot be a shot the page doesn't show, and the
		   hero is also the only frame that reads at card size. The card crops it
		   to 16/9 from 1.90, which trims ~3% off each side — the headline starts
		   far enough in to survive that, so check the left edge if this is ever
		   re-shot narrower.

		   All four are ~2530 wide, the 2x the 920px render wants; the same figure
		   migaki records. One file per shot is committed, in the format the entry
		   below names — these four are .webp; stacksmith and shipyard are .png.
		   The .png twin that used to sit beside every .webp is gone: nothing
		   referenced them and they were 14 MB of an 18 MB build. Re-shoot and
		   you commit the one file, not the pair. */
		cover: '/images/ejs0.webp',
		images: [
			{ src: '/images/ejs1.webp', w: 2532, h: 1322, caption: 'The site as it is today' },
			{ src: '/images/ejs0.webp', w: 2530, h: 1332, caption: 'The same page, rebuilt' },
			{ src: '/images/ejs2.webp', w: 2528, h: 1386 },
			{ src: '/images/ejs3.webp', w: 2532, h: 1386 },
		],
		/* ── The long-form study (2026-10-07, cut to seven the same day) ──
		   Was eight. Cut on the same note as migaki (Hiro: too detailed, no
		   one needs the PRs): "Open, mergeable, unreviewed" / "Still waiting
		   on review" and its PR #22 screenshot (ejs8, now unreferenced) are
		   gone, and the build details (Astro output committed as static
		   files, the lockfile lesson, the copy-pass line) came out of the
		   docs, what-came-out and closing sections. The one fact the PR
		   section carried that a reader needs, that the link below goes to
		   the OLD site, now closes the last section.

		   Facts are the redesign branch's history in
		   ~/ejs-site (73 commits ahead of upstream) and PR #22 on mde/ejs-site.
		   The before/after pair is split across sections 1 and 3 here, which
		   the images note above forbids for the short form — it holds because
		   the section between them is the old site too (the features band),
		   so the reader is still on the "before" when the hero arrives.

		   ejs4-8 are new (2026-10-07): 4 = the old features band, from the
		   gitignored screenshots in ~/ejs-site; 5 = four compare-history frames
		   (e9e9693, 31d321f, 87e7fe4, 674f45d) in a 2x2 with transparent gaps,
		   shorter frames padded rather than cropped so each shape is whole;
		   6 = the security notice cropped from the old about section and the
		   redesign's, side by side; 7 = /docs/ served locally from the
		   committed build, light theme to match ejs0; 8 = PR #22 on GitHub,
		   dark, logged out. The old-site notice in 6 is NOT the crimson-ring
		   version the paragraph describes — that one was never shot — so the
		   caption says what the picture is, not what the text is about.

		   ⚠ ASK HIRO before this ships:
		   - §2: the brief. The repo has no written one; the constraints are
		     read off CLAUDE.md and the PR body. The relationship to mde (the
		     maintainer, same surname) is not on the page and maybe should be.
		   - §5: who said the notice "looked like a system error", and why the
		     accordion came out after a day (the commit only says "lighter").
		   - §7: whether mde has seen PR #22, and whether "unreviewed" belongs
		     on a portfolio page at all. "As of this writing" dates fast.
		   - §3: where 20M+ / 7.7k come from, and as of when. */
		sections: [
			{
				body: 'ejs.co has looked the same for years: a wordmark, a four-word tagline, a lot of olive green. The only thing promoted above the fold is a different project, a Jake banner above EJS’s own logo, and the page never gets around to what the library does or why you would pick it over the alternatives. Twenty million people install it every week, and the first screen tells them almost nothing.',
				images: [{ src: '/images/ejs1.webp', w: 2532, h: 1322, caption: 'The site as it is today' }],
			},
			{
				heading: 'Constraints',
				body: 'The site is a 2015 Bootstrap template served as static files, and I kept it that way: no framework, no build step and very little JavaScript. The olive green and the crimson were inherited too. People recognise them, so I kept both and changed only how much of the page they cover.',
				images: [
					{ src: '/images/ejs4.webp', w: 2530, h: 757, caption: 'The old features band: the green as the whole canvas' },
				],
			},
			{
				heading: 'Rewriting the first screen',
				body: 'The new first screen is a plain statement, generate HTML with plain JS, with the install command under it in a chip you can copy, and the three numbers that make the case on their own: 20M+ weekly downloads, 7.7k stars, zero dependencies. I tried a side-by-side code card there first and cut it, and the stats replaced an install pill and a row of buttons. The green runs as a band behind this one screen instead of behind everything.',
				images: [{ src: '/images/ejs0.webp', w: 2530, h: 1332, caption: 'The same page, rebuilt' }],
			},
			{
				heading: 'Comparing EJS to other libraries',
				body: 'The one section that argues for EJS over the alternatives went through four shapes. Tabs that switched between Handlebars, Pug and Mustache hid the comparison behind a click. A side-by-side grid with a glowing EJS card put it on the table but gave it no weight. Peers in a row above a full-width answer card read as a hierarchy. The version that stayed stacks the three peers on the left and sets EJS on the right, with the checklist under the code.',
				images: [
					{ src: '/images/ejs5.webp', w: 2530, h: 1890, caption: 'Tabs, grid, row over answer, two columns' },
				],
			},
			{
				heading: 'What I cut',
				body: 'A scroll-reveal animation went in and came out two weeks later: fade-up-on-scroll reads as template filler, and it was the only animation on the page. A mobile accordion for the About cards lasted a day before simpler, tighter cards replaced it. The security notice had a crimson ring and an exclamation mark, and the feedback was that it looked like a system error, so it is a plain note now.',
				images: [
					{ src: '/images/ejs6.webp', w: 2530, h: 1023, caption: 'The security notice, old site and redesign' },
				],
			},
			{
				heading: 'Documentation',
				body: 'I folded nine separate docs pages into one, with redirects so old links still work. A single page doesn’t need search or a left sidebar, so both came out. The on-this-page rail stayed, with its scrollbar visible, so readers can jump between sections of the reference.',
				images: [{ src: '/images/ejs7.webp', w: 2530, h: 1757, caption: 'The documentation page' }],
			},
			{
				heading: 'What I’d do differently',
				body: 'I would show the maintainer the work much earlier, not as one seventy-three-commit pull request at the end. I would also keep the decision log going: mine stops in late May, and the reasons for the later cuts survive only in commit messages. The redesign is still a proposal, so the link below goes to ejs.co as it is today.',
				images: [],
			},
		],
		/* ⚠ THIS GOES TO THE SITE AS IT IS TODAY — the OLD page, the one the
		   first screenshot is of, not the redesign. The redesign is not deployed
		   anywhere, so ejs.co is the before half of this page's before/after and
		   the link lands a visitor on it. That is honest and worth keeping (the
		   prose is an argument about a real page, and the reader can check it),
		   but it does mean the label must stay the bare host: anything warmer —
		   "See it live" — would promise the work above and deliver its opposite.
		   If the redesign ever ships, this URL is the first thing to revisit. */
		link: 'https://ejs.co/',
		linkLabel: 'ejs.co',
	},
	{
		slug: 'stacksmith',
		title: 'Stacksmith: AI Tool Stack Discovery',
		company: 'Stacksmith',
		year: '2026',
		tags: ['Product Design', 'UI/UX'],
		role: 'Designed and built the browsing flows, comparison views, and overall visual system.',
		status: 'Concept',
		featured: true,
		blurb: 'A concept for browsing and comparing AI tools by the job you need done.',
		problem:
			'There are a lot of AI tools now, and most directories list them with little context. Stacksmith shows which tools fit which roles, where they overlap, and how they could work together in a stack.',
		work:
			"I organized browsing around roles and use cases instead of categories, so you start from the job you're trying to do. Comparison views put stacks side by side, and a map of how the tools connect shows where they overlap and what's missing. I designed the visual system last, mostly to keep that much information readable.",
		/* A CROP, not a full screen (2026-10-08, Hiro). stacksmith1 was the
		   cover: mostly white space around a blue gradient banner, the stock
		   SaaS hero, sitting one card over from migaki's argument against it.
		   This is stacksmith2 cut at (484,146) 670x377, exactly 16/9: the
		   "Growth Engine Content Stack" title card whole, corner and all, with
		   the Workflow Pipeline heading under it. A HEADLINE SHOT, on purpose
		   (2026-10-08, Hiro): migaki's and EJS's covers both lead with big
		   type, and the row reads as a set because of that, not their colours.
		   An earlier cut of the pipeline itself had no headline and small
		   text, and it made the last card the weakest. Keep it narrow — the
		   title has to span about two-thirds of the card to read at 283px.
		   Re-shoot stacksmith2 and this needs redoing (sharp is in
		   node_modules).

		   An inset frame (cover on a shared bed, bleeding off the bottom-
		   right) was tried the same day to even out the row's mismatched
		   lightness, and reverted: the edges matched but the black/green/
		   white blocks still read first, and the shots shrank past legible.
		   If the row's mismatch is fixed, it's inside the images. */
		cover: '/images/stacksmith-cover.webp',
		images: [
			{ src: '/images/stacksmith1.png', w: 1920, h: 981 },
			{ src: '/images/stacksmith2.png', w: 1920, h: 981 },
			{ src: '/images/stacksmith4.png', w: 1920, h: 981 },
		],
		link: 'https://app.subframe.com/a4820e3a0486/design/e6b3b72d-a1bb-41d8-95b6-dfe778ef8e78/share',
	},
	{
		slug: 'suma',
		title: 'Commercialization Plan Diagrams',
		company: 'Suma Solutions Inc.',
		year: '2025',
		tags: ['Diagrams', 'Healthcare', 'UX'],
		role: 'Drew the user flows and architecture visuals for a non-technical review audience.',
		status: 'Shipped',
		featured: false,
		blurb: 'Diagrams for a healthcare compliance product made to be clear enough for non-technical reviewers.',
		problem:
			'Suma needed a clearer way to explain how its platform worked during a commercialization review. The reviewers were not deeply technical, so the diagrams had to make a complex healthcare product easy to follow without losing accuracy.',
		work:
			'I drew the user flows for the SumaAdmin platform, the architecture visuals that went into the review materials, and the supporting graphics around risk and process. Most of the work was deciding what to leave out. Each diagram covers one idea, so a reviewer can follow the whole platform without the engineering details. The set gave the team a consistent way to explain the product to outsiders.',
		cover: '/images/suma1.webp',
		images: [
			{ src: '/images/suma1.webp', w: 1100, h: 790 },
			{ src: '/images/suma2.webp', w: 1069, h: 780 },
			{ src: '/images/suma3.webp', w: 1068, h: 758 },
			{ src: '/images/suma4.webp', w: 1068, h: 758 },
		],
		link: 'https://www.yoursuma.com/',
	},
	{
		slug: 'shipyard',
		title: 'Shipyard',
		company: 'Shipyard',
		year: '2025',
		tags: ['Product Design', 'UI/UX'],
		role: 'Shipped product UI with the dev team, from the main showcase to the discovery flows.',
		status: 'Shipped',
		featured: false,
		blurb: 'A hackathon project showcase, designed alongside the dev team.',
		problem:
			'Many project platforms put submission rules ahead of the projects. Shipyard was meant to put the projects first, with a simpler way for teams to show what they built and for other people to browse it.',
		work:
			'I led the product UI decisions and worked inside the dev team’s loop instead of handing off finished screens. I owned the main showcase and the discovery flows, and both went through several rounds as the product’s scope changed. I kept the layouts flexible, so later scope changes only needed small adjustments.',
		cover: '/images/shipyard.png',
		images: [{ src: '/images/shipyard.png', w: 2530, h: 1390 }],
		link: 'https://shipyardhq.tech/',
	},
];

export const contacts = [
	{ label: 'Email', href: 'mailto:hiroeern@gmail.com', icon: 'email' },
	{ label: 'GitHub', href: 'https://github.com/hiromasae', icon: 'github' },
	{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/hiro-design', icon: 'linkedin' },
	{ label: 'Twitter', href: 'https://x.com/hiroeernisse', icon: 'twitter' },
] as const;
