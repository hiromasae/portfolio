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

## Deploying

Static output to `dist/`, served from S3 behind CloudFront. Two pieces of that
setup are load-bearing, live outside this repo, and are therefore verified by
nothing in a build — if the site is broken right after a deploy, they are the
first place to look.

Before the first deploy, check that `site` in `astro.config.mjs` matches the
real domain. Canonical URLs and the Open Graph tags are built from it, and a
mismatch ships silently.

```sh
npm run build
aws s3 sync dist/ s3://<bucket> --delete
aws cloudfront create-invalidation --distribution-id <id> --paths '/*'
```

### 1. Directory indexes — required

Astro emits `about/index.html`, `projects/migaki/index.html`, and so on.
CloudFront over an S3 REST origin does **not** resolve directory indexes; only
the distribution root does. Without this, every route except `/` returns
NoSuchKey. Attach a CloudFront Function on **viewer request**:

```js
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri += 'index.html';
  } else if (!uri.includes('.')) {
    request.uri += '/index.html';
  }
  return request;
}
```

That covers both `/about` and `/about/`. The alternative is pointing CloudFront
at the S3 *website* endpoint as a custom origin, which resolves indexes on its
own but is HTTP-only and cannot use Origin Access Control.

### 2. The 404 page — required

`src/pages/404.astro` builds to `dist/404.html`, but CloudFront never reaches
for it unless told to. Add two Custom Error Responses:

| HTTP error code | Response page path | HTTP response code |
| --- | --- | --- |
| 403 | `/404.html` | 404 |
| 404 | `/404.html` | 404 |

Both are needed: a missing key behind Origin Access Control returns 403 rather
than 404 unless the bucket policy grants `s3:ListBucket`. The response code has
to stay **404** — returning 200 makes it a soft 404 and gets the page indexed,
which is the one thing the status code exists to prevent.

### Cache headers — optional

Everything under `_astro/` is content-hashed and safe to cache indefinitely; the
HTML is not. Files excluded from a sync are excluded from its `--delete` too, so
the HTML survives the first command:

```sh
aws s3 sync dist/ s3://<bucket> --delete --exclude '*.html' \
  --cache-control 'public,max-age=31536000,immutable'
aws s3 sync dist/ s3://<bucket> --exclude '*' --include '*.html' \
  --cache-control 'public,max-age=0,must-revalidate'
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
