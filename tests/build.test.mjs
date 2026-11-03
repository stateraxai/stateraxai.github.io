import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, unlink, access, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkLinks } from '../scripts/check-links.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const build = () => execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], { cwd: root, encoding: 'utf8', stdio: 'pipe', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
const frontmatter = (title, draft) => `---\ntitle: "${title}"\ndescription: "中文摘要与标点。"\ndate: "2026-11-03"\ndraft: ${draft}\ntags: ["Kubernetes"]\n---\n\n## 中文正文\n\n测试段落与 **强调**。\n\n\`\`\`bash\nkubectl get pods\n\`\`\`\n\n![测试图片](/logo.svg)\n\n[返回首页](/)\n`;

test('real production build renders published Markdown and excludes draft routes and text', { timeout: 120000 }, async () => {
  const fixtures = [new URL('../src/content/articles/fixture-published.md', import.meta.url), new URL('../src/content/articles/fixture-secret-draft.md', import.meta.url)];
  const existing = await readdir(new URL('../src/content/articles/', import.meta.url), { recursive: true });
  assert.ok(!existing.some(name => ['fixture-published.md', 'fixture-secret-draft.md'].includes(name)), 'fixture names must not collide with user content');
  try {
    await writeFile(fixtures[0], frontmatter('公开构建测试文章', false), { flag: 'wx' });
    await writeFile(fixtures[1], frontmatter('DRAFT-MUST-NOT-LEAK', true), { flag: 'wx' });
    build();
    const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
    const list = await readFile(new URL('../dist/articles/index.html', import.meta.url), 'utf8');
    const article = await readFile(new URL('../dist/articles/fixture-published/index.html', import.meta.url), 'utf8');
    assert.match(list, /公开构建测试文章/);
    const listedArticles = [...list.matchAll(/href="(\/articles\/[^"#?]+\/)"/g)].map(match => match[1]);
    const fixtureIsRecent = listedArticles.indexOf('/articles/fixture-published/') < 3;
    assert.equal(home.includes('公开构建测试文章'), fixtureIsRecent, 'homepage must match the newest three listed articles');
    assert.match(article, /中文正文/);
    assert.match(article, /<pre /);
    assert.match(article, /测试图片/);
    assert.match(article, /datetime="2026-11-03"/);
    for (const page of [home, list, article]) assert.doesNotMatch(page, /DRAFT-MUST-NOT-LEAK|fixture-secret-draft/);
    await assert.rejects(access(new URL('../dist/articles/fixture-secret-draft/index.html', import.meta.url)));
    assert.ok((await checkLinks(fileURLToPath(new URL('../dist/', import.meta.url)))).links > 20);
  } finally {
    for (const path of fixtures) await unlink(path).catch(error => { if (error.code !== 'ENOENT') throw error; });
    build();
  }
  const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const list = await readFile(new URL('../dist/articles/index.html', import.meta.url), 'utf8');
  if (!existing.some(name => name.endsWith('.md'))) {
    assert.match(home, /尚未发布文章/);
    assert.match(list, /尚未发布文章/);
    assert.equal((await checkLinks(fileURLToPath(new URL('../dist/', import.meta.url)))).pages, 3);
  }
  assert.doesNotMatch(home, /fixture-published|公开构建测试文章/);
  await checkLinks(fileURLToPath(new URL('../dist/', import.meta.url)));
});
