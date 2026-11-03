import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, unlink, access, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkLinks } from '../scripts/check-links.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const build = () => execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], { cwd: root, encoding: 'utf8', stdio: 'pipe', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
const categories = ['tech', 'science', 'notes'];
const frontmatter = (title, category, draft) => `---\ntitle: "${title}"\ndescription: "中文摘要与标点。"\ndate: "2026-11-03"\ncategory: ${category}\ndraft: ${draft}\ntags: ["测试"]\n---\n\n## 中文正文\n\n测试段落与 **强调**。\n\n\`\`\`bash\nkubectl get pods\n\`\`\`\n\n![测试图片](/logo.svg)\n\n[返回首页](/)\n`;

test('all three blogs generate isolated lists and details while production excludes every draft', { timeout: 120000 }, async () => {
  const existing = await readdir(new URL('../src/content/articles/', import.meta.url), { recursive: true });
  const created = [];
  try {
    for (const category of categories) {
      for (const draft of [false, true]) {
        const slug = `fixture-${draft ? 'draft' : 'public'}-${category}`;
        const path = new URL(`../src/content/articles/${slug}.md`, import.meta.url);
        await writeFile(path, frontmatter(draft ? `DRAFT-MUST-NOT-LEAK-${category}` : `公开构建测试-${category}`, category, draft), { flag: 'wx' });
        created.push(path);
      }
    }
    build();
    const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
    for (const category of categories) {
      const slug = `fixture-public-${category}`;
      const title = `公开构建测试-${category}`;
      const href = `/${category}/${slug}/`;
      const list = await readFile(new URL(`../dist/${category}/index.html`, import.meta.url), 'utf8');
      const article = await readFile(new URL(`../dist${href}index.html`, import.meta.url), 'utf8');
      assert.match(list, new RegExp(title));
      assert.ok(list.includes(href));
      const listed = [...list.matchAll(/href="(\/(?:tech|science|notes)\/[^"#?]+\/)"/g)].map(match => match[1]);
      assert.ok(listed.indexOf(href) >= 0);
      assert.equal(home.includes(title), listed.indexOf(href) < 3, 'home must reflect latest posts per category');
      for (const other of categories.filter(item => item !== category)) {
        assert.ok(!list.includes(`公开构建测试-${other}`), 'category lists must not mix articles');
        await assert.rejects(access(new URL(`../dist/${other}/${slug}/index.html`, import.meta.url)));
      }
      assert.match(article, /中文正文/);
      assert.match(article, /<pre /);
      assert.match(article, /测试图片/);
      assert.match(article, /datetime="2026-11-03"/);
      assert.ok(article.includes(`href="/${category}/"`), 'details return to their own category');
      await assert.rejects(access(new URL(`../dist/${category}/fixture-draft-${category}/index.html`, import.meta.url)));
    }
    for (const filename of await readdir(new URL('../dist/', import.meta.url), { recursive: true })) {
      if (filename.endsWith('.html')) {
        const html = await readFile(new URL(`../dist/${filename}`, import.meta.url), 'utf8');
        assert.doesNotMatch(html, /DRAFT-MUST-NOT-LEAK|fixture-draft-/);
      }
    }
    await checkLinks(fileURLToPath(new URL('../dist/', import.meta.url)));
  } finally {
    for (const path of created) await unlink(path);
    build();
  }
  const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(home, /fixture-public-|公开构建测试-/);
  const links = await checkLinks(fileURLToPath(new URL('../dist/', import.meta.url)));
  if (!existing.some(name => name.endsWith('.md'))) {
    assert.equal(links.pages, 5);
    for (const category of categories) {
      const list = await readFile(new URL(`../dist/${category}/index.html`, import.meta.url), 'utf8');
      assert.match(list, /尚未发布/);
    }
  }
});
