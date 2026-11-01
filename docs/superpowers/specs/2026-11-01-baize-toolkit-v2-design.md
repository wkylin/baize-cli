# Baize Toolkit V2 Design

## Intent

Baize should create a small but complete React admin engineering baseline for a single product, a workspace of independent products, or a host/remote microfrontend. Teams choose a package manager, app bundler, and whether to include the published WUI component library without inheriting the full `pro-react-admin` repository.

## Creation Contract

- `baize create <name>` remains non-interactive when a name is supplied. `baize` and `baize create` without a name prompt for choices in a terminal.
- `--package-manager npm|pnpm` defaults to `pnpm`; `--bundler vite|webpack` defaults to `vite`; `--mode single|multi|microfrontend` defaults to `single`.
- `--wui` adds `@w.ui/wui-react@6.1.1` and its required base peer `framer-motion@14.9.0` (within WUI's `>=12 <15` peer range), imports its stylesheet, and installs dependencies. It requires Node `^22.22.2 || ^24.15.0 || >=26.0.0`. Other selections retain optional `--install`.
- Generated projects preserve existing destinations, create without Git/network unless installation is selected or implied by `--wui`, and never include `node_modules`, build output, or upstream Git history.
- The selected package manager is recorded in package metadata and determines the quick-start, CI, and release commands. Yarn is removed from the choice set.

## Project Shapes

- `single`: one admin app at the project root.
- `multi`: an npm/pnpm workspace with `apps/admin` and `apps/operations`, both independent admin apps. `baize add project <slug>` creates another app with the same build/WUI choices.
- `microfrontend`: an npm/pnpm workspace with `apps/shell` (admin host) and `apps/reports` (standalone remote). Module Federation connects a real `/reports` route to the remote. The remote has an independent entry point and its URL is configurable for deployment. The host shows a recoverable error if the remote is unavailable.
- Each shape has one root `dev`, `build`, `quality`, `storybook`, `build:storybook`, and `release` command. Workspace commands run all apps and build the remote before the host.

## App Architecture

- Common app source is builder-neutral. A small route generator writes typed, lazy route imports from page pairs so `baize add page` works with both Vite and Webpack.
- Vite uses the existing React plugin. Webpack 5 uses TypeScript/CSS loaders, HtmlWebpackPlugin, dev server history fallback, and production output. Federation uses `@module-federation/vite` for Vite and Webpack's ModuleFederationPlugin for Webpack; React and React DOM are shared singletons.
- Storybook has a working sample story and uses `@storybook/react-vite` or `@storybook/react-webpack5` to match the chosen builder.
- Every app includes a boot splash in `index.html` with a dedicated stylesheet. Its markup, labels, and CSS custom properties are documented customization points. It exits after React mounts and gives a retry action if boot fails.
- Preferences persist workspace name, theme mode (`system`, `light`, `dark`), accent color, density, and language (`zh`, `en`). Ant Design locale and theme tokens follow these settings. Built-in screens have translated copy in both languages; custom pages can opt into translation keys.

## Engineering Gates

- `lint` checks JavaScript/TypeScript and formatting, `typecheck` checks TypeScript, `test` runs focused logic tests, and `quality` runs lint, typecheck, test, and build.
- `release` runs quality and writes versioned deployable output under `release/` with a manifest. CI runs quality on pushes and pull requests; tag builds upload the release artifact. Neither command publishes an app to npm.
- `README.md` explains every choice, command, output layout, WUI version/Node requirement, customization path, and deployment boundary. Demo browser auth remains explicitly non-production.

## Decisions And Sources

Composition avoids copying the large upstream repository or maintaining a full checked-in copy for every option combination. The workspace uses standard npm workspaces plus `pnpm-workspace.yaml` when selected. Module Federation follows the local `pro-react-admin` implementation in a smaller two-app form.

- [Storybook React Vite](https://storybook.js.org/docs/get-started/frameworks/react-vite) and [React Webpack](https://storybook.js.org/docs/get-started/frameworks/react-webpack5) document the matching framework packages.
- [pnpm workspaces](https://pnpm.io/workspaces) documents workspace package discovery.
- [Module Federation Vite](https://module-federation.io/guide/basic/vite.html) and [Webpack](https://module-federation.io/guide/basic/webpack.html) document the plugin model.
- [Webpack TypeScript](https://webpack.js.org/guides/typescript) documents the loader and typecheck boundary.
- Local `pro-react-admin/packages/wui-react/package.json` identifies the published package, required peers, and Node engine.

## Exclusions

The starter does not copy enterprise APIs, upstream project registries, remote compatibility protocols, or production identity infrastructure. Generated projects must replace demo auth/data services and configure production remote URLs before deployment.
