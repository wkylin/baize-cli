import { spawnSync } from 'node:child_process';

function toolVersion(command) {
  const result = spawnSync(command, ['--version'], {
    encoding: 'utf8',
    shell: false,
  });
  return result.status === 0 ? result.stdout.trim() : null;
}

export function inspectEnvironment() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  const nodeOk = major > 20 || (major === 20 && minor >= 19);
  const items = [
    {
      name: 'Node.js',
      ok: nodeOk,
      detail: `${process.versions.node} (requires 20.19+)`,
    },
    ...['npm', 'pnpm'].map((name) => {
      const version = toolVersion(name);
      return {
        name,
        ok: Boolean(version),
        detail: version || 'not found (optional)',
      };
    }),
  ];
  return {
    ok: nodeOk && items.some((item) => item.name !== 'Node.js' && item.ok),
    items,
  };
}
