# Baize Vue Toolkit Design

## Intent

Add a Vue 3 + Vite + Pinia admin starter to the existing Baize CLI. Teams should be able to choose React or Vue without copying an upstream repository, and receive the same usable admin baseline and engineering commands.

## Choices And Boundaries

- `react-admin` remains the default template. `vue-admin` is selected with `--template vue-admin` or the interactive template prompt.
- Vue uses Vite only. `--template vue-admin --bundler webpack` and `--template vue-admin --wui` fail before the destination is created; `@w.ui/wui-react` is React-only.
- Both templates support npm/pnpm and `single`, `multi`, and `microfrontend` shapes. Vue workspaces use the existing root task runner and release layout.
- The Vue starter uses Vue Router, Pinia, Vue I18n, Element Plus, and lucide-vue-next. It keeps the existing Node.js 20.19+ baseline.

## Generated Vue App

- The first screen is a working login. Demo administrator and viewer accounts, role-aware navigation and route guards, dashboard, user CRUD, settings, 403 and 404 views match the React baseline.
- Pinia owns session and persisted preferences. Preferences include theme mode, accent, density, language, and workspace name. Built-in screens have Chinese and English copy.
- `baize add page` creates a Vue single-file component and route metadata, then regenerates lazy routes. `baize add project` adds an app to a Vue multi-project workspace.
- Boot splash markup and CSS custom properties are editable in the generated app; it closes after mount and exposes retry after a timeout.
- Storybook has a real Vue component story. `lint`, `typecheck`, `test`, `quality`, `build`, `storybook`, `build:storybook`, and `release` are available in every shape, with generated GitHub Actions workflows.
- Vue microfrontends have a shell and a standalone reports remote using Vite Module Federation. A missing remote shows a retry state.

## Approach

The React and Vue source templates remain separate because their components and state models differ. The CLI shares project validation, workspace orchestration, workflows, and release scripts, while delegating app configuration and route generation to the selected template. This keeps existing React output stable and gives Vue an idiomatic Pinia implementation.

## Verification

CLI tests cover defaults, incompatible choices, page and project additions, workspace and federation files, and package contents. Generated npm and pnpm Vue projects must pass quality; the single app and microfrontend must pass Storybook and browser smoke checks. Demo auth and browser storage remain development-only.
