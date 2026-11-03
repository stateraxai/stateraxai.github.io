import { z } from 'astro/zod';

const calendarDate = z.preprocess(
  value => value instanceof Date ? value.toISOString().slice(0, 10) : value,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期必须为 YYYY-MM-DD').refine(value => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
  }, '日期不是有效的日历日期'),
);

export const articleSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  date: calendarDate,
  category: z.enum(['tech', 'science', 'notes']),
  draft: z.boolean().default(true),
  tags: z.array(z.string().trim().min(1)).default([]),
  cover: z.string().startsWith('/images/').optional(),
  coverAlt: z.string().trim().min(1).optional(),
}).refine(data => !data.cover || Boolean(data.coverAlt), {
  message: '使用封面时需要填写 coverAlt', path: ['coverAlt'],
});

