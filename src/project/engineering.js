import fs from 'node:fs';
import path from 'node:path';

export function writeWorkflows(root, packageManager) {
  const directory = path.join(root, '.github', 'workflows');
  fs.mkdirSync(directory, { recursive: true });
  const setupPnpm =
    packageManager === 'pnpm'
      ? '      - uses: pnpm/action-setup@v4\n        with:\n          version: 11.8.0\n'
      : '';
  const install =
    packageManager === 'pnpm'
      ? 'pnpm install --no-frozen-lockfile'
      : 'npm install';
  const command = packageManager === 'pnpm' ? 'pnpm' : 'npm';
  const common = `      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
${setupPnpm}      - run: ${install}
`;
  fs.writeFileSync(
    path.join(directory, 'ci.yml'),
    `name: Quality
on:
  push:
    branches: ['**']
  pull_request:
permissions:
  contents: read
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
${common}      - run: ${command} run quality
`
  );
  fs.writeFileSync(
    path.join(directory, 'release.yml'),
    `name: Release artifact
on:
  push:
    tags: ['v*']
permissions:
  contents: read
jobs:
  artifact:
    runs-on: ubuntu-latest
    steps:
${common}      - run: ${command} run release
      - uses: actions/upload-artifact@v4
        with:
          name: baize-release
          path: release/
`
  );
}
