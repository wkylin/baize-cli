import path from 'node:path';
import { fileURLToPath } from 'node:url';

const templates = [
  {
    name: 'react-admin',
    description:
      'React + TypeScript admin starter with auth, roles, dashboard, and users',
    directory: fileURLToPath(
      new URL('../../templates/react-admin/', import.meta.url)
    ),
  },
  {
    name: 'vue-admin',
    description:
      'Vue 3 + Vite + Pinia admin starter with auth, roles, dashboard, and users',
    directory: fileURLToPath(
      new URL('../../templates/vue-admin/', import.meta.url)
    ),
  },
];

export function listTemplates() {
  return templates.map(({ name, description }) => ({ name, description }));
}

export function getTemplate(name) {
  const template = templates.find((item) => item.name === name);
  if (!template)
    throw new Error(
      `Unknown template "${name}". Run "baize list" to see available templates.`
    );
  return { ...template, directory: path.resolve(template.directory) };
}
