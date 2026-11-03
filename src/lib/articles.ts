export interface ArticleData {
  title: string;
  description: string;
  date: string;
  draft: boolean;
  tags: string[];
  cover?: string;
  coverAlt?: string;
}

export function selectArticles<T extends { id: string; data: { date: string; draft?: boolean } }>(entries: T[], includeDrafts = false): T[] {
  return entries.filter(entry => includeDrafts || entry.data.draft === false)
    .sort((a, b) => b.data.date.localeCompare(a.data.date) || a.id.localeCompare(b.id));
}

export function formatArticleDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return `${year}年${month}月${day}日`;
}

export function articleHref(id: string): string {
  return `/articles/${id.split('/').map(encodeURIComponent).join('/')}/`;
}
