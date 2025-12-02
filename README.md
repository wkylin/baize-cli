# 🦄 Baize CLI (白泽)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![node](https://img.shields.io/badge/node-%3E%3D16-green.svg)](https://nodejs.org/)

> **白泽**，中国古代神话中的瑞兽。能言语，通万物之情，知鬼神之事，“王者有德”才出现，能辟除人间一切邪气，可令人逢凶化吉。
>
> 本项目取名"白泽"，寓意作为开发者的瑞兽，帮助您辟除配置烦恼，逢凶化吉，快速启动高质量项目。

**Baize CLI** 是一个轻量、规范且高效的前端项目脚手架工具，旨在帮助开发者快速搭建基于 React、Vue 等现代框架的标准化项目结构。

## ✨ 特性

- 🚀 **快速启动**：秒级生成项目模板，开箱即用。
- 🛠 **规范集成**：内置 ESLint、Prettier 等代码规范配置。
- 📦 **多框架支持**：
  - [x] React (Vite + TypeScript)
  - [ ] Vue (Coming soon)
  - [ ] NextJS (Coming soon)
- 🎨 **交互友好**：优雅的命令行交互体验。

## 📦 安装

使用 npm 全局安装：

```bash
npm install -g baize-cli
```

## 🚀 使用

在终端中运行以下命令启动交互式向导：

```bash
baize
```

按提示输入项目名称并选择框架即可。

## 💻 本地开发

如果您想参与本项目开发或进行本地调试：

1. **克隆仓库**

   ```bash
   git clone https://github.com/wkylin/baize-cli.git
   cd baize-cli
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **本地链接**

   ```bash
   npm link
   ```

   现在您可以在本地直接使用 `baize` 命令进行测试。

4. **代码检查与测试**

   ```bash
   npm run lint    # 代码风格检查
   npm test        # 运行单元测试
   ```

## 🤝 贡献

欢迎提交 Pull Request 或 Issue！详情请查阅 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 📄 许可证

[MIT](./LICENSE)
