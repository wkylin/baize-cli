# Baize CLI 项目分析

## 原有问题

原 CLI 的 `init` 实际执行 `git clone`，复制整个 `pro-react-admin` 仓库、删除 `.git`，然后强制运行 `npm install`。新项目继承了展示应用、微前端、双构建器与企业 API 等大量与业务起步无关的内容；创建过程依赖 Git 和网络，输出也会随远端分支变化。框架选择中还列出未实现的 Vue/Next.js 项目，其中 Next.js 地址是 GitHub 子目录，不能直接作为仓库克隆。

仓库旁的 `pro-react-admin` 6.1.1 已是约 10 GB 的完整开发工作区，包含约 9 GB 的依赖目录。它是功能参考，不适合原样成为每个业务项目的初始文件集。

## 开源项目对照

通过 Tavily 检索官方仓库和文档，得到以下取舍：

| 项目                                                                                                                                                           | 可借鉴的做法                                               | Baize 的取舍                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------- |
| [Vite / create-vite](https://github.com/vitejs/vite)、[create-vue](https://github.com/vuejs/create-vue)                                                        | 随工具发布本地模板，脚手架参数可跳过交互，安装由使用者选择 | 本地模板、`create` 参数、`--install` 可选          |
| [Ant Design Pro](https://github.com/ant-design/ant-design-pro/blob/master/docs/cheatsheet.en-US.md)                                                            | 路由元数据同时服务菜单与权限                               | 页面 `.route.ts` 同时驱动导航和路由守卫            |
| [Refine](https://github.com/refinedev/refine)、[React-admin](https://github.com/marmelab/react-admin)                                                          | 认证和数据接口是独立扩展点                                 | 演示认证与异步用户服务可被真实 API 替换            |
| 本地 `pro-react-admin`                                                                                                                                         | React 19、Ant Design 6、React Router 7 与管理页的基本交互  | 保留基础体验，微前端作为可选工程形态               |
| [Storybook](https://storybook.js.org/docs/get-started/frameworks/react-vite)、[Webpack 5](https://storybook.js.org/docs/get-started/frameworks/react-webpack5) | 组件 story 与构建器配套                                    | 随 Vite/Webpack 选择对应 framework                 |
| [pnpm](https://pnpm.io/workspaces)、[Module Federation](https://module-federation.io/guide/basic/vite.html)                                                    | 工作区与独立部署的远端                                     | `multi` 用工作区，`microfrontend` 用 shell/reports |

## 本次落地

CLI 现在把随包发布的精简本地模板复制到独立目录，更新包名和项目显示名，保护已有目录，过滤本地依赖与构建产物。命令包括 `create`/`init`、`list`、`doctor`、`add page`、`add project`。生成项目可选择 React 或 Vue 3 + Pinia、npm/pnpm、普通/多项目/微前端；React 还可选 Vite/Webpack 与 WUI。两套模板都包含登录、角色导航、工作台、用户管理、设置页、可自动注册的新页面、Storybook、boot splash、中英文偏好和质量门禁。

Vue 扩展参考 [create-vue](https://github.com/vuejs/create-vue)、[Pinia](https://pinia.vuejs.org/)、[Vue Router](https://router.vuejs.org/) 和 [Storybook Vue 3 + Vite](https://storybook.js.org/docs/get-started/frameworks/vue3-vite) 的官方工程方式。Vue 与 React 应用分别维护组件和状态层，复用 CLI 的目录保护、工作区命令、CI 与 release 产物结构。

生成应用使用浏览器演示数据，适合开发业务界面。生产部署前须把 `src/services/auth.ts` 和 `src/services/users.ts` 接到后端，并在服务端执行身份和权限校验。下一步扩展可以是 API 适配器、组织级权限和业务资源生成器；这些应由实际项目需求决定。
