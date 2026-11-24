/**
 * The generated docs site (`.output/public`, after `pnpm generate`) served on
 * a local port, and the wait every browser-driven script needs after a
 * navigation. Shared by viewport-smoke.mjs and component-previews.mjs.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PUBLIC = resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '../.output/public',
);

const MIME = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.mjs': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/** Exit with a hint when the site has not been generated. */
export const requireGenerated = (script) => {
  if (!existsSync(PUBLIC)) {
    console.error(
      `${script}: ${relative(process.cwd(), PUBLIC)} is missing — run \`pnpm generate\` first`,
    );
    process.exit(2);
  }
};

/** Serve the generated site; resolves to its origin and a `close()`. */
export const servePublic = async () => {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');

    let file = join(PUBLIC, decodeURIComponent(url.pathname));

    if (existsSync(file) && statSync(file).isDirectory())
      file = join(file, 'index.html');

    if (!existsSync(file)) {
      res.writeHead(404);
      res.end();

      return;
    }

    res.writeHead(200, {
      'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
    });
    createReadStream(file).pipe(res);
  });

  await new Promise((done) => server.listen(0, '127.0.0.1', done));

  return {
    close: () => server.close(),
    origin: `http://127.0.0.1:${server.address().port}`,
  };
};

/**
 * Hydration + custom-element upgrade: every c-* tag on the page defined, the
 * fonts loaded, then two frames for the upgraded elements to lay out.
 */
export const settlePage = (page) =>
  page.evaluate(async () => {
    const tags = new Set(
      Array.from(document.querySelectorAll('*'))
        .map((el) => el.localName)
        .filter((name) => name.startsWith('c-')),
    );

    await Promise.all(
      Array.from(tags).map((tag) => customElements.whenDefined(tag)),
    );
    await document.fonts.ready;
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
  });
