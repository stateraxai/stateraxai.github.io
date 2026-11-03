import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function createArticle(slug, root = process.cwd(), date, category = 'tech') {
  if (!['tech', 'science', 'notes'].includes(category)) throw new Error('分类请选择 tech（技术）、science（科普）或 notes（随想）。');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? '')) {
    throw new Error('文件名请使用英文小写字母、数字和连接号，例如 my-first-post。');
  }
  const now = new Date();
  const today = date ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const directory = join(root, 'src/content/articles');
  await mkdir(directory, { recursive: true });
  const destination = join(directory, `${slug}.md`);
  await writeFile(destination, `---\ntitle: "请填写文章标题"\ndescription: "请填写一两句话的摘要。"\ndate: "${today}"\ncategory: ${category}\ndraft: true\ntags: []\n---\n\n## 从这里开始\n\n请在这里写正文。\n`, { flag: 'wx' });
  return destination;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log(`已创建草稿：${await createArticle(process.argv[2], process.cwd(), undefined, process.argv[3])}`); }
  catch (error) { console.error(error.code === 'EEXIST' ? '同名文章已存在，没有覆盖原文件。' : error.message); process.exitCode = 1; }
}
