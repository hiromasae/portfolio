export interface Project {
	slug: string;
	title: string;
	company: string;
	year: string;
	tags: string[];
	/** One-line "what I did". No longer rendered — it came off the cards
	    2026-08-02, leaving the year alone above the title. Kept for the same
	    reason as the fields below. */
	role: string;
	blurb: string;
	problem: string;
	/** The "Work" paragraph — what I did and what it changed. Prose, not a
	    bullet list: the detail page renders it as one block. */
	work: string;
	cover: string;
	images: string[];
	/** Number of empty frames to stand in for screenshots that don't exist yet.
	    Only read when `images` is empty, and only by the detail page; an empty
	    `cover` leaves the card's own frame blank the same way. Delete the field
	    from a project the moment it has real images — a placeholder that
	    outlives its shoot is worse than no frame at all. */
	placeholders?: number;
	/** `tags`, `company`, `link` and now `role` are no longer rendered anywhere
	    (tags/company/link dropped from the detail page 2026-07-29, role from the
	    cards 2026-08-02; the cards now use only year, title and cover). Kept
	    because they're real facts that are a nuisance to re-gather — delete them
	    if they're still unused later. */
	link?: string;
}

export const projects: Project[] = [
	{
		slug: 'migaki',
		title: 'migaki: Design Sense for Coding Agents',
		company: 'Open source',
		year: '2026',
		tags: ['Open Source', 'AI', 'Design Systems'],
		role: 'Wrote the skill, its three-file structure, and the weekly refresh loop.',
		blurb: 'An open source design skill that gives any AI coding agent a working visual sense.',
		problem:
			'A coding agent will build almost anything you describe, but left to its own defaults it keeps landing on the same look. Write the fix down once and the document starts aging the day you save it. migaki (磨き, "to polish") is a design skill that tries to solve both halves of that at once: a visual sense an agent can actually apply, that does not decay into a period piece.',
		work:
			"The skill is three markdown files. The first holds the timeless perceptual principles, the part of visual judgement that doesn't move. The second catalogues the patterns that read as AI-generated or dated, and the third what reads as excellent right now. Those last two rewrite themselves weekly, so the sense it works from tracks the present instead of settling into a style guide from last year. Anything that can read a skill file gets the whole thing.",
		cover: '',
		images: [],
		placeholders: 3,
	},
	{
		slug: 'stacksmith',
		title: 'Stacksmith: AI Tool Stack Discovery',
		company: 'Stacksmith',
		year: '2026',
		tags: ['Product Design', 'UI/UX'],
		role: 'Designed and built the browsing flows, comparison views, and overall visual system.',
		blurb: 'A concept for browsing and comparing AI tools in a way that feels more useful than a giant list.',
		problem:
			'There are a lot of AI tools now, but most directories still feel like long lists with no real context. Stacksmith was my attempt to make that easier to sort through by showing what tools fit different roles, where they overlap, and how they might work together in an actual stack.',
		work:
			"I built the browsing around roles and use cases instead of categories, so you start from the job you're trying to do rather than a list you have to read end to end. Comparison views let you put stacks side by side, and mapping how the tools connect puts the overlaps and gaps on the page instead of leaving them for you to work out. The visual system came last, mostly to keep that density readable.",
		cover: '/images/stacksmith1.png',
		images: [
			'/images/stacksmith1.png',
			'/images/stacksmith2.png',
			'/images/stacksmith3.png',
			'/images/stacksmith4.png',
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
		blurb: 'Diagrams for a healthcare compliance product made to be clear enough for non-technical reviewers.',
		problem:
			'Suma needed a clearer way to explain how its platform worked during a commercialization review. The audience was not deeply technical, so the challenge was turning a pretty complex healthcare product into diagrams that were easy to follow and still accurate.',
		work:
			'I drew the user flows for the SumaAdmin platform, the architecture visuals that went into the review materials, and the supporting graphics around risk and process. Most of the work was deciding what to leave out: each diagram carries one idea, so a reviewer can follow the platform end to end without needing the engineering context underneath it. The set gave the team one consistent way to explain the product to people outside it.',
		cover: '/images/suma1.webp',
		images: ['/images/suma1.webp', '/images/suma2.webp', '/images/suma3.webp', '/images/suma4.webp'],
		link: 'https://www.yoursuma.com/',
	},
	{
		slug: 'shipyard',
		title: 'Shipyard',
		company: 'Shipyard',
		year: '2025',
		tags: ['Product Design', 'UI/UX'],
		role: 'Shipped product UI with the dev team, from the main showcase to the discovery flows.',
		blurb: 'A lighter project showcase platform shaped in close collaboration with the dev team.',
		problem:
			'A lot of project platforms feel more focused on submission rules than the work itself. Shipyard was meant to feel lighter and more current, with a cleaner way for teams to show what they built and for other people to browse through projects.',
		work:
			'I led the product UI decisions with the dev team, working inside their loop instead of handing off finished screens. The main showcase and the discovery flows were the two pieces I owned end to end, and both went through several rounds as the scope of the product moved. Keeping the layouts loose enough to absorb that meant the later changes landed as adjustments rather than redesigns.',
		cover: '/images/shipyard1.webp',
		images: [
			'/images/shipyard1.webp',
			'/images/shipyard2.webp',
			'/images/shipyard3.webp',
			'/images/shipyard4.webp',
			'/images/shipyard5.webp',
		],
		link: 'https://shipyardhq.tech/',
	},
];

export const contacts = [
	{ label: 'Email', href: 'mailto:hiroeern@gmail.com', icon: 'email' },
	{ label: 'GitHub', href: 'https://github.com/hiromasae', icon: 'github' },
	{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/hiro-design', icon: 'linkedin' },
	{ label: 'Twitter', href: 'https://x.com/hiroeernisse', icon: 'twitter' },
] as const;
