# 随机幂等

无限的个人网站。行走中的 SRE，爬行中的 FDE。

原生 HTML 和 CSS 静态页面，无需安装依赖。项目、作品、文章、兴趣四个分类暂显示“内容整理中”。

## 免费发布到 GitHub Pages

1. 登录 GitHub，确认当前账号是 `missingwolf`。
2. 新建仓库 `missingwolf.github.io`，可见性选择 **Public**。GitHub Free 的 Pages 要求公开仓库，上传的源文件和提交历史也会公开。
3. 若同名仓库已经存在，先检查其中内容，不要覆盖现有网站。
4. 选择 **Add file → Upload files**，将本目录中的 `index.html`、`styles.css`、`favicon.svg`、`.nojekyll` 和 `README.md` 上传至仓库根目录。不要上传外层 `personal-site` 文件夹或 ZIP 文件。`.nojekyll` 是隐藏文件，可通过 **Add file → Create new file** 单独创建。
5. 提交到 `main`，进入 **Settings → Pages**。
6. 在 **Build and deployment → Source** 选择 **Deploy from a branch**；分支选择 **main**，目录选择 **/(root)**，点击 **Save**。
7. 等待 Pages 部署成功，在此页面点击 **Visit site**。预计地址为 `https://missingwolf.github.io/`，部署前不能视为已经上线。发布可能需要约 10 分钟。
8. 使用手机和电脑打开网址，检查页面、四个分类导航和 GitHub 链接。

只使用 GitHub 免费方案和默认 `github.io` 地址，不需要购买域名。

## 后续更新

- 修改名字、简介和内容：在仓库中打开 `index.html`，点击铅笔按钮编辑，提交到 `main` 后会自动重新部署。
- 添加项目或文章：找到对应分类的 `<p class="empty-state">…</p>`，替换为实际内容，例如 `<p><a href="https://example.com/">文章标题</a></p>`（示例地址需替换，不要直接发布）。保留分类的 `id`，导航才会继续有效。
- 调整颜色、间距、手机布局：编辑 `styles.css`。
- 添加图片：先上传到仓库的 `assets/` 目录，再用 `./assets/文件名` 引用；确认图片和文字均可公开。
- 查看发布进度：仓库的 **Actions** 页面；查看正式地址：**Settings → Pages → Visit site**。

## 本地预览

在本目录运行 `python3 -m http.server 4173 --bind 127.0.0.1`，浏览器打开 `http://127.0.0.1:4173/`。

官方文档：https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
