import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function checkLinks(directory = 'dist') {
  const root = resolve(directory);
  async function walk(path) {
    const entries = await readdir(path, { withFileTypes: true });
    return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(join(path, entry.name)) : [join(path, entry.name)]))).flat();
  }
  const pages = (await walk(root)).filter(path => path.endsWith('.html'));
  const failures = [];
  let links = 0;
  for (const page of pages) {
    const source = await readFile(page, 'utf8');
    const relative = page.slice(root.length).replace(/index\.html$/, '');
    const base = new URL(relative, 'https://stateraxai.github.io');
    for (const match of source.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
      const raw = match[1].replaceAll('&amp;', '&');
      if (/^(?:data:|mailto:|tel:|javascript:)/.test(raw)) continue;
      const url = new URL(raw, base);
      if (url.origin !== base.origin) continue;
      links++;
      let target = join(root, decodeURIComponent(url.pathname));
      if (url.pathname.endsWith('/') || !extname(target)) target = join(target, 'index.html');
      try {
        await access(target);
        if (url.hash && target.endsWith('.html')) {
          const html = await readFile(target, 'utf8');
          const id = decodeURIComponent(url.hash.slice(1));
          const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
          if (!ids.includes(id)) throw new Error(`缺少锚点 ${id}`);
        }
      } catch (error) { failures.push(`${relative} → ${raw}: ${error.message}`); }
    }
  }
  if (failures.length) throw new Error(failures.join('\n'));
  return { pages: pages.length, links };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log('内部链接与资源检查通过：', await checkLinks()); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
