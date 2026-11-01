# Baize Toolkit Implementation Plan

> **For agentic workers:** Implement the tasks in order. Keep the generated project independent of the source repository.

**Goal:** Create a usable React admin starter through a compact, offline-capable CLI.

**Architecture:** Baize ships a local template and copies it atomically. Generated pages self-register through Vite file discovery; app services isolate demo persistence.

**Tech Stack:** Node.js ESM, Commander, Inquirer, React, TypeScript, Vite, React Router, Ant Design, Lucide.

**Spec:** `docs/superpowers/specs/2026-11-01-baize-toolkit-design.md`

## Tasks

- [x] Replace clone-based init with template registry, safe local copy, `create/init/list/doctor`, opt-in installation, and package publication rules.
- [x] Build the admin template with routing, demo auth, access checks, dashboard, user CRUD, workspace settings, and responsive layout.
- [x] Add `add page` generation and self-registering routes; document extension points and generated-project commands.
- [x] Verify CLI generation, package contents, template typecheck/build, and basic browser navigation. Fix defects found in those checks.

## Review Focus

- Existing destination: preserve it and report a clear error.
- Invalid or traversal-like name: reject before writing files.
- Installation failure: retain the generated project and return a nonzero exit code.
- Viewer account: never expose or render the admin-only users route.
- Added page: appear in navigation and load after a build without editing route tables.
