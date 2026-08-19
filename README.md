# portfolio

The personal site of Hiro Eernisse, a design engineer in the San Francisco Bay
Area. It is a small static site: a home page with a grid of work, an about page,
and one case-study page per project, generated at build time from
`src/data/projects.ts`.

## Running it

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output to dist/
npm run preview  # serve the build locally
```

Node 22.12 or newer is required.

## Layout

```text
src/
├── data/projects.ts   # the projects, and the source of the /projects/* routes
├── pages/             # index, about, and the [slug] case-study template
├── components/        # nav, project grid, and the pieces the pages compose
├── layouts/           # the shared document shell
├── assets/            # case-study images and the self-hosted variable font
└── styles/            # global CSS and the type/colour scale
```

## Why Astro

The site is a document, not an application, and Astro is the framework that
takes that literally. Pages are authored as HTML and rendered to static files at
build time, so no UI framework runtime is shipped to the browser — the only
JavaScript on a page is the handful of inline scripts the site actually asks
for, mostly theme handling in the nav. Routing a project detail page per entry
in a data file is a dozen lines of `getStaticPaths`, and the font pipeline and
Tailwind both plug into the same config. The result is a site that loads as fast
as flat HTML, because that is what it is.
