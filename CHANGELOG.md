# Changelog

All notable changes to this project will be documented in this file.

## 1.3.0 (2026-11-01)

- Replace remote repository cloning with a bundled React admin template and optional dependency installation.
- Add `create`/`init`, `list`, `doctor`, and `add page` commands; support project display names with `--title`.
- Ship login, role-aware navigation, dashboard, user management, settings, and async service interfaces.
- Require Node.js 20.19+; remove the unsupported Next.js choice.
- Replace legacy lint and release dependencies with Oxlint and npm's built-in versioning workflow.
- Add npm/pnpm, Vite/Webpack, single/multi/microfrontend choices, with pnpm + Vite + single defaults.
- Add optional WUI installation, customizable boot splash, theme and language preferences, and Storybook stories.
- Add generated project quality gates, CI workflows, versioned release artifacts, and workspace app commands.
- Add a Vue 3 + Vite + Pinia admin template with the same app features, project shapes, Storybook, and quality gates.
- Run repository CI on Node.js 24 to match the supported runtime.
- Keep generated page labels compatible with template formatting checks, including quoted and escaped titles.

## 1.2.0 (2025-12-02)

### Features

- baize cli init ([d6de13b](https://github.com/wkylin/baize-cli/commit/d6de13b71c383c6235424342d9a50775f4262c5e))
- delete nodemodule ([96a2bba](https://github.com/wkylin/baize-cli/commit/96a2bbab545df3a8a98b86cd2b975fe6e8518caa))
- git branch vite ([2fab5b9](https://github.com/wkylin/baize-cli/commit/2fab5b99d519718cb26df2b5f544019af9d124bc))
- type text ([7eceb64](https://github.com/wkylin/baize-cli/commit/7eceb64e768c1c9164707c14b986bbf7bad3c6f3))
- upate cli ([3400bd1](https://github.com/wkylin/baize-cli/commit/3400bd1cef827361e1d4d500300ce684bcab6578))
