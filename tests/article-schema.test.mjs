import { test } from 'node:test';
import assert from 'node:assert/strict';
import { articleSchema } from '../src/lib/article-schema.ts';
const fields = { title: '标题', description: '摘要', date: '2026-11-03' };

test('article defaults to draft and accepts quoted or YAML calendar dates', () => {
  assert.equal(articleSchema.parse(fields).draft, true);
  assert.deepEqual(articleSchema.parse(fields).tags, []);
  assert.equal(articleSchema.parse({ ...fields, date: new Date('2026-11-03T00:00:00Z') }).date, '2026-11-03');
});
test('invalid dates and incomplete metadata fail before publishing', () => {
  for (const date of ['2026-02-30', '2026-13-01', '2026-2-1', 'tomorrow']) {
    assert.equal(articleSchema.safeParse({ ...fields, date }).success, false);
  }
  assert.equal(articleSchema.safeParse({ ...fields, date: '2024-02-29' }).success, true);
  assert.equal(articleSchema.safeParse({ ...fields, title: ' ' }).success, false);
  assert.equal(articleSchema.safeParse({ ...fields, description: '' }).success, false);
  assert.equal(articleSchema.safeParse({ ...fields, draft: 'false' }).success, false);
});
test('cover requires a public images path and meaningful alternate text', () => {
  assert.equal(articleSchema.safeParse({ ...fields, cover: '/images/cover.png' }).success, false);
  assert.equal(articleSchema.safeParse({ ...fields, cover: '/images/cover.png', coverAlt: '示意图' }).success, true);
});
