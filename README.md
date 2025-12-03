# 简介

`Dowel`（道沃），在我们的愿景中是希望它能成为一款好用的 AI 智能体软件，用户（包括我们自己）能使用它解决很多具体的应用问题，而不像其他 AI 软件一样仅关注于提示词和对话。

我们的愿景：Dowel，一款简洁高效的 AI 智能体平台。

## 安装下载

- [预发布版本 1.0.0](https://github.com/mortise-and-tenon/Dowel/releases/download/1.0.0/Dowel_1.0.0_x64-setup.exe)

## 帮助文档

- [帮助文档](http://localhost:3001/docs/intro)

## 技术栈

### 前端框架

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [daisyUI](https://daisyui.com/)
- [react-icons](https://react-icons.github.io/react-icons/)
- [next-intl](https://github.com/amannn/next-intl)
- [js-cookie](https://github.com/js-cookie/js-cookie)
- [theme-change](https://github.com/saadeghi/theme-change)
- [crypto-js](https://github.com/brix/crypto-js)
- [validator](https://github.com/validatorjs/validator.js)
- [react-markdown](https://github.com/remarkjs/react-markdown)
- [rehype-highlight](https://github.com/rehypejs/rehype-highlight)
- [highlight.js](https://github.com/highlightjs/highlight.js)

## 本地运行、编译环境

### 安装依赖

[参考链接](https://tauri.app/start/prerequisites/#_top)

- 注意：

国内安装 rust 由于网络原因，会很慢，会很容易失败。如果失败了，可以在当前用户目录下，找到 `.cargo` 目录，新建配置文件 `cargo.toml`，填写国内镜像源地址后再安装，中国科学技术大学的镜像源示例如下：

```toml
[source.crates-io]
replace-with = 'ustc'

[source.ustc]
registry = "https://mirrors.ustc.edu.cn/crates.io-index"

[net]
git-fetch-with-cli = true
```

### 本地开发、运行

```
# 安装依赖
pnpm install

# 启动tauri客户端版
pnpm tauri dev

# 启动web版
pnpm dev
```
