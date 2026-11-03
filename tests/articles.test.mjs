import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectArticles, formatArticleDate, articleHref } from '../src/lib/articles.ts';

const entry = (id, date, draft) => ({ id, data: { title: id, description: id, date, draft, tags: [] } });
test('production excludes drafts and sorts published entries newest first without mutation', () => {
  const entries = [entry('old', '2026-01-01', false), entry('draft', '2026-11-03', true), entry('new', '2026-10-31', false), entry('unset', '2026-10-01', undefined)];
  assert.deepEqual(selectArticles(entries).map(x => x.id), ['new', 'old']);
  assert.equal(entries[0].id, 'old');
});
test('local development can preview drafts', () => {
  assert.deepEqual(selectArticles([entry('draft', '2026-11-03', true)], true).map(x => x.id), ['draft']);
});
test('article calendar date stays on its original day', () => {
  assert.equal(formatArticleDate('2026-01-01'), '2026年1月1日');
});
test('article paths encode each segment and retain trailing slash', () => {
  assert.equal(articleHref('cloud/hello world'), '/articles/cloud/hello%20world/');
});
