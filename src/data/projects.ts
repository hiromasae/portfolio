export interface Project {
	slug: string;
	title: string;
	company: string;
	year: string;
	tags: string[];
	blurb: string;
	problem: string;
	contributions: string[];
	cover: string;
	images: string[];
	link?: string;
}

export const projects: Project[] = [
	{
		slug: 'stacksmith',
		title: 'Stacksmith: AI Tool Stack Discovery',
		company: 'Stacksmith',
		year: '2026',
		tags: ['Product Design', 'UI/UX'],
		blurb: 'A concept for browsing and comparing AI tools in a way that feels more useful than a giant list.',
		problem:
			'There are a lot of AI tools now, but most directories still feel like long lists with no real context. Stacksmith was my attempt to make that easier to sort through by showing what tools fit different roles, where they overlap, and how they might work together in an actual stack.',
		contributions: [
			'Designed flows for browsing tools by role and use case',
			'Built comparison views for looking at different stacks side by side',
			'Mapped tool relationships to show integrations and overlap',
			'Created the overall visual system for the product',
		],
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
		blurb: 'Diagrams for a healthcare compliance product made to be clear enough for non-technical reviewers.',
		problem:
			'Suma needed a clearer way to explain how its platform worked during a commercialization review. The audience was not deeply technical, so the challenge was turning a pretty complex healthcare product into diagrams that were easy to follow and still accurate.',
		contributions: [
			'Designed user flow diagrams for the SumaAdmin platform',
			'Made architecture visuals for review materials',
			'Created supporting graphics around risk and process flow',
			'Added search and filter to the enrollment table interface',
			'Implemented real-time database sync for student enrollment data',
		],
		cover: '/images/suma1.webp',
		images: ['/images/suma1.webp', '/images/suma2.webp', '/images/suma3.webp', '/images/suma4.webp'],
		link: 'https://www.yoursuma.com/',
	},
	{
		slug: 'shipyard',
		title: 'Shipyard',
		company: 'Shipyard',
		year: '2025–2026',
		tags: ['Product Design', 'UI/UX'],
		blurb: 'A lighter project showcase platform shaped in close collaboration with the dev team.',
		problem:
			'A lot of project platforms feel more focused on submission rules than the work itself. Shipyard was meant to feel lighter and more current, with a cleaner way for teams to show what they built and for other people to browse through projects.',
		contributions: [
			'Led product UI decisions alongside the dev team',
			'Refined layouts and interactions as the product changed',
			'Designed the main showcase and discovery flows',
		],
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
	{
		slug: 'indio',
		title: 'Agent Dashboard & Broker Profile',
		company: 'Indio Technologies',
		year: '2019',
		tags: ['UI Redesign', 'Dashboard', 'InsurTech'],
		blurb: 'A redesign of dense internal insurance tools, focused on clarity, structure, and easier day-to-day use.',
		problem:
			'These internal insurance tools had gotten pretty cluttered over time. The screens were dense, hard to scan, and not very intuitive, so the redesign focused on making everyday tasks feel less confusing and easier to get through.',
		contributions: [
			'Audited the existing components before starting the redesign',
			'Reworked the Agent Dashboard with a simpler layout',
			'Redesigned the Broker Profile to reduce visual clutter',
			'Helped make patterns more consistent across the product',
		],
		cover: '/images/indio1.webp',
		images: ['/images/indio1.webp', '/images/indio2.webp', '/images/indio3.webp', '/images/indio4.webp'],
	},
];

export const contacts = [
	{ label: 'Email', href: 'mailto:hiroeern@gmail.com', icon: 'email' },
	{ label: 'Calendly', href: 'https://calendly.com/hiroeern/30-min-chat', icon: 'calendly' },
	{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/hiro-design', icon: 'linkedin' },
	{ label: 'GitHub', href: 'https://github.com/hiromasae', icon: 'github' },
] as const;
