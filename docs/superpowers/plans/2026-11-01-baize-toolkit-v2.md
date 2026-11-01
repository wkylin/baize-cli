# Baize Toolkit V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate working single, multi-project, and Module Federation React admin starters with selectable package manager and bundler, WUI, Storybook, splash, preferences, quality gates, and release output.

**Architecture:** Keep one admin source template and compose builder and workspace variants at creation. Generate a typed route registry before development/build so app code works under Vite and Webpack. Use small root scripts to coordinate workspace development, quality, and release.

**Tech Stack:** Node ESM, Commander, Inquirer, React 19, TypeScript, Ant Design 6, Vite 8 or Webpack 5, Storybook 10, Module Federation, i18next.

**Spec:** `docs/superpowers/specs/2026-11-01-baize-toolkit-v2-design.md`

## Global Constraints

- Defaults: `pnpm`, `vite`, `single`, no WUI; creation without install remains offline.
- WUI uses `@w.ui/wui-react@6.1.1`, installs required peers, and requires Node `^22.22.2 || ^24.15.0 || >=26.0.0`.
- Preserve existing target directories and all current uncommitted user changes.

## Review Focus

- Invalid option or unsupported package manager: fail before writing the destination.
- Workspace app creation: keep unique package names, ports, and root build order.
- `baize add page`: rebuild the route registry for the correct app in every shape.
- Missing microfrontend remote: show a clear retry state rather than blanking the host.
- WUI install failure: retain the generated project and return a nonzero exit status.

---

### Task 1: Choice Model And CLI

**Files:** `src/index.js`, `src/project/create.js`, `src/project/options.js`, `test/project/create.test.js`

**Interfaces:** `normalizeOptions(input)` validates manager/bundler/mode/WUI; `createProject(name, options)` uses it; interactive prompts return the same option shape.

- [ ] Test defaults, each accepted option, invalid options, and WUI install behavior.
- [ ] Implement flags/prompts and preserve non-interactive generation.
- [ ] Run CLI tests and lint.

### Task 2: Builder-Neutral Admin Template

**Files:** `templates/react-admin/src/app/routes.ts`, `templates/react-admin/scripts/generate-routes.mjs`, `templates/react-admin/webpack.config.mjs`, `templates/react-admin/vite.config.ts`, `src/project/add-page.js`

**Interfaces:** route generator writes `src/app/route-registry.ts`; both builders compile it; `addPage` regenerates it.

- [ ] Test route generation and add-page behavior for Vite and Webpack outputs.
- [ ] Implement Vite/Webpack dependency and script selection with a working dev/build path.
- [ ] Build generated single-app variants.

### Task 3: Workspace And Federation Shapes

**Files:** `src/project/create.js`, `src/project/workspace.js`, `templates/workspace/`, `templates/federation/`, `test/project/workspace.test.js`

**Interfaces:** workspace generator creates independent apps and root scripts; federation generator connects shell and reports remote; `add project` extends multi mode.

- [ ] Test layout, manager-specific workspace files, ports, scripts, and generated remote imports.
- [ ] Implement root orchestration and Vite/Webpack federation configurations.
- [ ] Build and browser-check both workspace shapes.

### Task 4: WUI, Splash, Preferences, I18n

**Files:** `templates/react-admin/index.html`, `templates/react-admin/public/boot-splash.css`, `templates/react-admin/src/app/preferences.tsx`, `templates/react-admin/src/i18n/`, `templates/react-admin/src/pages/`, `templates/react-admin/src/screens/`

**Interfaces:** preferences persist theme/language/density/accent; WUI option writes dependencies and imports; splash exits on mounted app.

- [ ] Test WUI manifest/engine and persisted preference parsing.
- [ ] Implement translated built-in UI, theme controls, and customizable boot splash.
- [ ] Browser-check language/theme/splash and WUI-selected build.

### Task 5: Storybook And Engineering Gates

**Files:** `templates/react-admin/.storybook/`, `templates/react-admin/src/components/`, `templates/react-admin/scripts/`, `templates/react-admin/.github/workflows/`, `templates/react-admin/README.md`, `README.md`, `docs/PUBLISHING.md`

**Interfaces:** every generated shape offers `lint`, `typecheck`, `test`, `quality`, `build`, `storybook`, `build:storybook`, `release`; release writes deployable files and a manifest.

- [ ] Add a real story and framework-matched Storybook config.
- [ ] Add CI/release scripts and tests for their output and failure paths.
- [ ] Document all options and verify quality, Storybook build, release output, npm package contents, and browser access.
