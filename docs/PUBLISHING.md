# 发布与部署

Baize CLI 自身发布到 npm；CLI 生成的业务工程使用 `release` 产出静态部署文件。两者是不同的发布流程。

## 发布 Baize CLI

本地先运行：

```bash
npm install
npm run lint
npm test
npm pack --dry-run
```

`npm pack` 应只包含 CLI、精简模板、README 和 LICENSE，不应包含模板目录中的 `node_modules`、`dist` 或 Git 历史。可以使用 `npm link` 在本地测试 `baize` 命令，结束后用 `npm unlink -g baize-cli` 取消链接。

发布前更新 `CHANGELOG.md`，确认版本和工作区改动，再执行适当的版本命令：

```bash
npm version patch
# 或 npm version minor / npm version major
npm publish
```

`npm version` 会更新版本、创建提交和 Git 标签。`npm publish` 需要 npm 账号登录及该包的发布权限；本仓库的生成工程 release 命令不会替你运行它。标签和代码推送应由维护者在检查结果后执行。

## 发布生成的应用

在生成项目根目录运行所选包管理器的命令：

```bash
pnpm install
pnpm run quality
pnpm run release
```

选择 npm 的项目使用 `npm`。`release` 会再次执行 lint、类型检查、Vitest 与生产构建，然后创建 `release/<package.json version>/manifest.json` 和各应用的静态输出目录。单项目目录名是包名；多项目和微前端目录名是 `admin`、`operations` 或 `reports`、`shell` 等应用名。

生成项目的 `.github/workflows/ci.yml` 在 push/PR 上运行质量门禁；`release.yml` 在 `v*` 标签上上传 `release/` 为 GitHub Actions artifact。两者都不会自动部署到服务器。建议提交 npm 或 pnpm 锁文件，让 CI 与本地使用同一依赖版本。

部署时给每个应用配置浏览器历史路由回退到 `index.html`。微前端需分别部署 shell 与 reports，并在构建 shell 时设置生产 `BAIZE_REMOTE_URL`；远端入口及其资源需允许宿主跨域访问。将演示认证和用户服务换为真实后端后再对外提供业务功能。
