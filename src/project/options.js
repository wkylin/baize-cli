const managers = new Set(['npm', 'pnpm']);
const bundlers = new Set(['vite', 'webpack']);
const modes = new Set(['single', 'multi', 'microfrontend']);

export function supportsWuiNode(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!match) return false;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  return (
    (major === 22 && (minor > 22 || (minor === 22 && patch >= 2))) ||
    (major === 24 && minor >= 15) ||
    major >= 26
  );
}

export function normalizeOptions(input = {}, environment = {}) {
  const packageManager = input.packageManager || 'pnpm';
  const bundler = input.bundler || 'vite';
  const mode = input.mode || 'single';
  if (!managers.has(packageManager))
    throw new Error('Package manager must be npm or pnpm.');
  if (!bundlers.has(bundler))
    throw new Error('Bundler must be vite or webpack.');
  if (!modes.has(mode))
    throw new Error('Project mode must be single, multi, or microfrontend.');
  const wui = Boolean(input.wui);
  if (
    wui &&
    !supportsWuiNode(environment.nodeVersion || process.versions.node)
  ) {
    throw new Error(
      '@w.ui/wui-react requires Node.js ^22.22.2, ^24.15.0, or >=26.0.0.'
    );
  }
  return {
    packageManager,
    bundler,
    mode,
    wui,
    install: Boolean(input.install || wui),
  };
}
