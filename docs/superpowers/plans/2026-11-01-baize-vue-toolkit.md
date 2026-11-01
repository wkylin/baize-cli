# Baize Vue Toolkit Implementation Plan

> **For agentic workers:** Use the existing CLI test suite and generated-project quality commands as the implementation gates. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Vue 3 + Vite + Pinia admin template with the same project shapes, CLI extensions, and engineering gates as the React starter.

**Architecture:** Keep Vue application source in its own bundled template. Select a template-specific configurator and route generator at CLI boundaries; reuse root workspace orchestration, workflows, and release scripts. Add a Vue reports remote and host overlay for Module Federation.

**Tech Stack:** Node ESM, Vue 3, Vite 8, Pinia 3, Vue Router 4, Vue I18n 11, Element Plus, Storybook 10, Vitest 5.

**Spec:** `docs/superpowers/specs/2026-11-01-baize-vue-toolkit-design.md`

## Global Constraints

- React remains the default, with its existing options and output unchanged.
- Vue accepts npm/pnpm and all three project modes, but rejects Webpack and WUI before writing a destination.
- Generated projects remain independent of the upstream Git repository and do not contain dependencies or build output.

## Review Focus

- Interactive Vue selection must not offer React-only choices.
- Invalid template combinations must leave no destination or staging directory.
- `add page` must generate a `.vue` component and register it for the selected app.
- Vue workspace app names and ports must remain unique after `add project`.
- A missing reports remote must render a retry state in the host.

---

### Task 1: CLI Template Selection

**Files:** `src/index.js`, `src/project/{templates,create,add-page,add-project,workspace}.js`, `test/project/vue.test.js`

- [ ] Add failing tests for Vue selection, incompatible options, and Vue page/project creation.
- [ ] Add template-aware configuration and route generation without changing React defaults.
- [ ] Run `npm test` and `npm run lint`.

### Task 2: Vue Admin Template

**Files:** `templates/vue-admin/`

- [ ] Add boot splash, Vue Router, Pinia stores, i18n, login, dashboard, users, settings, 403/404, and a generated route registry.
- [ ] Add Vue Storybook and quality/release scripts with focused tests.
- [ ] Generate npm and pnpm single apps, install, and run quality, Storybook build, and release.

### Task 3: Vue Workspace And Federation

**Files:** `templates/vue-federation/`, `src/project/workspace.js`, `test/project/vue.test.js`

- [ ] Generate and test a multi-project Vue workspace with `add project` and `add page`.
- [ ] Generate and test a Vue shell/reports remote with Vite Module Federation and fallback UI.
- [ ] Build both shapes and browser-check the remote route.

### Task 4: Docs And Package Verification

**Files:** `README.md`, `docs/PROJECT_ANALYSIS.md`, `package.json`, generated template READMEs

- [ ] Document template selection, Vue constraints, commands, customization and production boundaries.
- [ ] Run root lint/tests, generated quality gates, and `npm pack --dry-run`.
