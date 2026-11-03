export const BLOG_CATEGORIES = [
  { id: 'tech', label: '技术', english: 'Technology' },
  { id: 'science', label: '科普', english: 'Explainers' },
  { id: 'notes', label: '随想', english: 'Notes' },
] as const;
export type BlogCategory = typeof BLOG_CATEGORIES[number]['id'];

export interface ArticleData {
  title: string;
  description: string;
  date: string;
  category: BlogCategory;
  draft: boolean;
  tags: string[];
  cover?: string;
  coverAlt?: string;
}

export function selectArticles<T extends { id: string; data: { date: string; draft?: boolean; category?: string } }>(entries: T[], includeDrafts = false, category?: BlogCategory): T[] {
  return entries.filter(entry => (includeDrafts || entry.data.draft === false) && (!category || entry.data.category === category))
    .sort((a, b) => b.data.date.localeCompare(a.data.date) || a.id.localeCompare(b.id));
}

export function formatArticleDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return `${year}年${month}月${day}日`;
}

export function articleHref(id: string, category: BlogCategory): string {
  return `/${category}/${id.split('/').map(encodeURIComponent).join('/')}/`;
}
