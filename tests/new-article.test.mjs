import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createArticle } from '../scripts/new-article.mjs';

test('new article starts as a draft and never overwrites existing writing', async () => {
  const root = await mkdtemp(join(tmpdir(), 'stochidem-writing-'));
  try {
    const path = await createArticle('first-post', root, '2026-11-03');
    const text = await readFile(path, 'utf8');
    assert.match(text, /draft: true/);
    assert.match(text, /date: "2026-11-03"/);
    await assert.rejects(createArticle('first-post', root), { code: 'EEXIST' });
    assert.equal(await readFile(path, 'utf8'), text);
    for (const slug of ['../escape', '/absolute', 'with space', 'a/b', '', '中文']) {
      await assert.rejects(createArticle(slug, root), /英文小写/);
    }
  } finally { await rm(root, { recursive: true, force: true }); }
});
