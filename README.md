# 随机幂等 · STATERAX

Harrison 的个人网站。DevOps、云原生、云计算运维工程师，SRE、FDE、AIOps 进阶中。

- 首页：https://stateraxai.github.io/
- 关于：https://stateraxai.github.io/about/

使用 GitHub Pages 免费方案和默认 github.io 地址。仓库为 Public，源文件和提交历史公开。

## 文件与更新

- `index.html`：首页简介、文章/项目/随想目录及导航。
- `about/index.html`：起源、关注方向、公众号二维码入口。
- `styles.css`：排版、明暗主题、手机布局和像素动画样式。
- `app.js`：访问者当地日期和星期、主题记忆、像素字形逐字显现、二维码弹窗。
- `logo.svg`：网站 Logo 与标签页图标。
- `assets/wechat-qr.svg`：公众号二维码原图。
- `.nojekyll`：直接发布静态文件。

在 GitHub 打开对应文件，点击铅笔按钮编辑；文字与链接均确认可公开后，点击 **Commit changes**，提交到 `main`。GitHub Pages 会自动重新部署，在仓库 **Actions** 查看结果。更新后检查正式网址的手机与桌面显示。

修改首页标题时，同时更新 `aria-label` 与备用文字，保持可访问性和无脚本显示一致。添加内容时保留 `articles`、`projects`、`notes` 等导航目标的 `id`。关于页位于子目录，公共资源采用 `../styles.css`、`../app.js` 等相对路径。

## 本地预览

在仓库根目录运行：

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

打开 http://127.0.0.1:4173/ 和 http://127.0.0.1:4173/about/。

## 发布配置与回退

仓库 **Settings → Pages**：Source 为 **Deploy from a branch**，Branch 为 **main**，目录为 **/(root)**。默认域名使用 HTTPS，无需购买域名或开通付费方案。

需要回退时，对目标发布提交执行 `git revert <提交编号>` 并推送到 `main`；这会保留提交历史并自动重新部署。避免强制推送覆盖历史。
