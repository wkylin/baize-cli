# Baize Toolkit Design

## Intent

Baize creates small, independent React admin projects that teams can adapt to different products. The current CLI clones the entire `pro-react-admin` repository, including unrelated examples and build infrastructure, then runs `npm install` without asking. New projects should start from a versioned, local template with a clear path to replacing demo services.

## Scope

- `baize create [name]` and `baize init [name]` create a React admin project from a template shipped in the npm package. Running `baize` starts the same interactive flow.
- `baize list` lists supported templates; `baize doctor` reports local prerequisites; `baize add page <slug>` adds a routable page inside a generated project.
- The initial template provides login, protected routes, role-aware navigation, a dashboard, user CRUD, and workspace settings. Demo data is local to the browser. Authentication and data services are explicit replacement points for real APIs.
- Project generation requires no Git or network access. Dependency installation is optional via `--install` and a selected package manager. Existing paths are never overwritten.
- `--title` controls a project display name stored in `src/app/project.json`; without it, the CLI derives a name from the directory slug.
- Only React admin is offered until other templates exist. Unsupported framework options are removed from the interface.

## Architecture

The CLI copies `templates/react-admin` into a new directory, renames `_gitignore`, and updates package metadata with JSON APIs. It validates the target name before any write and stages output before the final rename. A marker file identifies Baize projects for the page generator.

The template uses Vite, React, TypeScript, React Router, Ant Design, and Lucide. Each page has a metadata file and a lazy-loaded component; Vite's `import.meta.glob` builds the route registry, so `add page` creates the pair without editing application code. Auth and async user services isolate demo storage from views and allow HTTP adapters. Route guards and menu visibility share the same role metadata. The demo auth is a local UI example, not a server security boundary.

## Alternatives

1. Clone `pro-react-admin` and prune files afterward. This keeps exact upstream behavior but leaves a fragile dependency on its changing repository layout and large install graph.
2. Download a remote template archive. This reduces Git history but makes creation depend on network availability and a mutable upstream branch.
3. Ship a focused template with Baize. This makes output reproducible and creates a small, reviewable baseline. **Chosen.**

## Constraints And Follow-up

The first release targets Node.js 20.19+ and npm by default. `pnpm` and `yarn` are supported when explicitly selected. Browser demo credentials and local storage must be replaced by a real auth/data adapter before production deployment. The template intentionally excludes microfrontends, multi-project orchestration, audit logs, and enterprise API code.

## Open-source References

Tavily search on 2026-11-01 informed the boundaries:

- [Vite / create-vite](https://github.com/vitejs/vite): small local framework templates and explicit follow-up install commands.
- [create-vue](https://github.com/vuejs/create-vue): an interactive scaffold with CLI flags and no forced package manager.
- [Ant Design Pro route guide](https://github.com/ant-design/ant-design-pro/blob/master/docs/cheatsheet.en-US.md): route metadata drives navigation and access.
- [Refine](https://github.com/refinedev/refine): auth, access control, routing, and data are replaceable integration points.
- [React-admin](https://github.com/marmelab/react-admin): resource screens sit over a data provider and auth provider.
- Local `pro-react-admin` 6.1.1: React 19, Ant Design 6, React Router 7 and TypeScript; its full enterprise and demo repository is much broader than a starter.
