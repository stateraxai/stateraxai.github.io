# 随机幂等 · STATERAX

Harrison 的个人网站。Astro 静态构建，Markdown 文章，GitHub Pages 免费托管。

- 正式首页：https://stateraxai.github.io/
- 关于：https://stateraxai.github.io/about/
- 技术（迁移发布后）：https://stateraxai.github.io/tech/
- 科普（迁移发布后）：https://stateraxai.github.io/science/
- 随想（迁移发布后）：https://stateraxai.github.io/notes/

## 本地开始

推荐 Node 24 LTS（见 `.nvmrc`），最低版本以 package.json 和 Astro 的 Node 要求为准。首次安装：

```sh
npm ci
npm run dev
```

打开终端提示的本地地址，默认 http://127.0.0.1:4321/。开发服务器会自动刷新。若已有正式构建预览占用这个端口，先运行 `npm run preview:stop`，再运行 `npm run dev`。当前项目完整路径：`/Users/sonder/Documents/ChatGPT/Hacker news/stochidem-astro`。

如果终端提示服务器已在后台运行，关闭终端后它仍可能继续运行；用 `npm run dev:stop` 停止开发服务，用 `npm run preview:stop` 停止正式构建预览。前台运行时也可用 Ctrl+C 停止。

## 发布一篇文章

1. 在本地创建草稿：

   ```sh
   npm run new:article -- my-first-post tech
   ```

   最后一个参数决定分类：`tech` 为技术、`science` 为科普、`notes` 为随想；省略时创建技术草稿。例如：

   ```sh
   npm run new:article -- why-cloud science
   npm run new:article -- a-small-thought notes
   ```

2. 编辑 `src/content/articles/my-first-post.md`。文件头包含标题、摘要、日期、分类、草稿状态和标签：

   ```yaml
   ---
   title: "我的第一篇文章"
   description: "一两句话说明文章内容。"
   date: "2026-11-03"
   category: tech
   draft: true
   tags: ["DevOps", "云原生"]
   ---
   ```

   在第二个 `---` 下面写 Markdown 正文。分类与文件名决定地址，例如 `/tech/my-first-post/`。`category` 必填，只能是 `tech`、`science`、`notes`；发布后尽量不要修改分类和文件名，以免网址变化。

3. 配图放入 `public/images/`，正文用 `![图片说明](/images/example.png)` 引用。可选封面字段 `cover: "/images/cover.png"` 和 `coverAlt: "封面说明"` 必须一起填写。
4. 打开本地首页和对应分类列表（`/tech/`、`/science/`、`/notes/`） 预览，草稿显示“草稿，仅本地预览”。
5. 确认内容可公开且准备发布后，改成 `draft: false`。日期只用于展示和排序，不是定时发布开关。
6. 运行下面的发布前检查，检查手机和桌面显示，再把改动提交到独立分支。确认后合并 `main` 才会发布。

```sh
npm run check
npm test
npm run check:links
npm run preview
```

`npm test` 会用临时测试文章验证实际构建，结束后自动移除测试文章并重新构建当前真实内容；请不要与开发服务器同时运行。`npm run preview` 查看正式构建效果，草稿不会生成。只想构建时运行 `npm run build`。

首页对应分类与各分类文章列表会自动更新，不需要手动新增 HTML 链接。没有已发布文章时显示空状态。模板在 `docs/article-template.md`，不会作为文章发布。

**公开资料边界：** draft 只控制网站显示。公开仓库里的 Markdown 源文件及历史仍公开；未确认公开的稿件只保存在本地，不推送。不要在正文、配图或配置中放密码、令牌或其他非公开信息。

## 网站文件

- `src/pages/index.astro`：首页。
- `src/pages/about.astro`：关于内容与二维码弹窗。
- `src/pages/[category]/`：技术、科普、随想的文章列表与自动生成的详情页。
- `src/content/articles/`：Markdown 文章。
- `src/content.config.ts`、`src/lib/article-schema.ts`：内容加载与字段校验。
- `src/layouts/`、`src/components/`：共享页面结构、页头、导航与页脚。
- `src/styles/global.css`：现有设计与文章排版。
- `src/scripts/site.js`：主题、当地日期、像素逐字效果与二维码弹窗。
- `public/logo.svg`、`public/assets/wechat-qr.svg`：已确认公开的原有图片。
- `dist/`：生成的网站，不手动编辑、不提交 Git。

## 首次迁移发布

先确认本地预览，再操作：

1. 提交迁移分支，检查 Pull Request，合并到 `main`。
2. 仓库 **Settings → Pages → Build and deployment → Source** 改为 **GitHub Actions**。
3. 如果首次工作流因为 Pages 来源未切换而失败，在 Actions 重跑对应工作流。也可以在 `main` 上手动运行 **Check and deploy Astro**。
4. 等待部署成功，再检查正式首页、`/about/`、`/tech/`、`/science/`、`/notes/` 和资源链接。

之后每次合并 `main` 自动部署；Pull Request 只做检查，不更新生产。Astro 免费开源；当前仍用公开仓库、免费 GitHub Pages 与原来的 github.io 地址。Pages CMS 本阶段没有接入。

## 回退

迁移前生产提交为 `a48a884f5a5f50a3a8385fb8d6f1d798dcd1a052`。上线后若需回退到原始静态网站，创建回退提交恢复该版本，并将 Pages 来源恢复为 **Deploy from a branch → main → /(root)**。保留提交历史，避免强制推送。日常文章更新可用 `git revert <提交编号>` 回退后重新部署 Astro。
