# 千禧年个人名片网页

一个使用原生 HTML、CSS 和 JavaScript 制作的单页个人主页，用于展示个人信息、技能方向、项目经历、获奖经历和联系方式。页面默认深色科技风，支持浅色模式、响应式布局、移动端菜单、导航高亮、进入视口动画和复制邮箱功能。

## 文件结构

```text
.
├── index.html   # 页面结构与内容
├── en.html      # 英文版页面
├── style.css    # 视觉样式、响应式布局、主题变量
├── script.js    # 主题切换、菜单、滚动高亮、复制邮箱等交互
└── README.md    # 项目说明
```

## 本地运行方式

方式一：直接双击 `index.html`，用浏览器打开。

方式二：在项目目录启动本地静态服务器：

```powershell
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

## 修改内容

### 修改头像

在 `index.html` 中找到 `.avatar` 图片：

```html
<img class="avatar" src="..." alt="千禧年的圆形头像占位图">
```

把 `src` 改成你的头像文件路径，例如：

```html
<img class="avatar" src="assets/avatar.jpg" alt="千禧年的头像">
```

### 修改姓名和身份

在 `index.html` 首屏区域修改：

```html
<h1 id="hero-title">千禧年</h1>
<p class="identity">华东师范大学空间人工智能学院学生</p>
```

### 修改项目

在 `index.html` 中搜索 `project-card`，按项目卡片结构替换项目名称、简介、技术栈和链接。

### 修改联系方式

在 `index.html` 联系方式区域修改邮箱、GitHub 和个人主页链接：

```html
<a id="email-link" href="mailto:10251510463@stu.ecnu.edu.cn">10251510463@stu.ecnu.edu.cn</a>
<button class="btn btn-primary copy-email" type="button" data-email="10251510463@stu.ecnu.edu.cn">复制邮箱</button>
```

注意：邮箱文本和 `data-email` 都要一起改，复制功能才会使用新邮箱。

## 部署到 GitHub Pages

1. 新建 GitHub 仓库 `HUASHANGLIUSU.github.io`，并把本项目文件提交到仓库根目录。
2. 进入仓库的 `Settings`。
3. 打开 `Pages`。
4. 在 `Build and deployment` 中选择 `Deploy from a branch`。
5. 分支选择 `main`，目录选择 `/root`。
6. 保存后等待部署完成，个人主页地址为 `https://HUASHANGLIUSU.github.io/`。

## 质量说明

- 不依赖 React、Vue 或第三方 JavaScript 库。
- 支持直接打开 `index.html`，也支持本地静态服务器运行。
- 使用语义化 HTML，图片包含 `alt`，按钮和链接包含键盘焦点样式。
- 支持 `prefers-reduced-motion`，用户关闭动画时会减少动画效果。
