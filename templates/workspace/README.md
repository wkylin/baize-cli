# %%PROJECT_TITLE%%

Baize 生成的 %%MODE_DESCRIPTION%%。使用 **%%PM%% + %%BUNDLER%%**，%%WUI_STATE%%

## 启动

在工作区根目录运行：

```bash
%%PM%% install
%%PM%% run dev
```

| 应用                  | 地址                            | Storybook                            |
| --------------------- | ------------------------------- | ------------------------------------ |
| `apps/%%APP_0_NAME%%` | http://localhost:%%APP_0_PORT%% | http://localhost:%%APP_0_STORYBOOK%% |
| `apps/%%APP_1_NAME%%` | http://localhost:%%APP_1_PORT%% | http://localhost:%%APP_1_STORYBOOK%% |

管理员 `admin@baize.dev`、访客 `viewer@baize.dev`，密码均为 `Demo123!`。这是浏览器中的演示认证和数据，接入真实业务前需替换各应用 `src/services/`，并由服务端执行授权。

## 根命令

| 命令                         | 作用                                    |
| ---------------------------- | --------------------------------------- |
| `%%PM%% run dev`             | 启动所有应用                            |
| `%%PM%% run lint`            | 各应用的 Oxlint 与 Prettier 检查        |
| `%%PM%% run typecheck`       | 各应用 TypeScript 检查                  |
| `%%PM%% run test`            | 各应用 Vitest 测试                      |
| `%%PM%% run build`           | 顺序构建应用，微前端先构建远端          |
| `%%PM%% run quality`         | lint、类型、测试、构建质量门禁          |
| `%%PM%% run storybook`       | 启动每个应用的 Storybook                |
| `%%PM%% run build:storybook` | 构建各应用 `storybook-static/`          |
| `%%PM%% run release`         | 质量门禁通过后生成 `release/<version>/` |

%%SHAPE_GUIDE%%

## 定制

每个管理应用的 `README.md` 说明页面、主题、多语言、boot splash 和服务替换点。项目显示名在各应用的 `src/app/project.json`；splash 标记和文案在 `index.html`，颜色与动效在 `public/boot-splash.css`。设置页偏好在 `%%PREFERENCES_PATH%%`，翻译资源在 `src/i18n/resources.ts`。

根目录的 `.github/workflows/ci.yml` 在推送和 PR 时执行质量门禁；`release.yml` 在 `v*` 标签上上传 `release/` 构建产物。`release` 不会自动部署或发布 npm 包。部署静态文件时将未知路径回退到各应用的 `index.html`，并提交依赖锁文件以固定 CI 安装结果。
