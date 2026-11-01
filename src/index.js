import fs from 'node:fs';
import { Command } from 'commander';
import inquirer from 'inquirer';
import logger from './utils/logger.js';
import { createProject, validateProjectName } from './project/create.js';
import { addPage } from './project/add-page.js';
import { addProject } from './project/add-project.js';
import { listTemplates } from './project/templates.js';
import { inspectEnvironment } from './project/doctor.js';
import { normalizeOptions } from './project/options.js';

const packageJson = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);

async function projectName(name) {
  if (name) return name;
  if (!process.stdin.isTTY)
    throw new Error('Project name is required in non-interactive mode.');
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      validate(input) {
        try {
          validateProjectName(input);
          return fs.existsSync(input) ? 'Destination already exists.' : true;
        } catch (error) {
          return error.message;
        }
      },
    },
  ]);
  return answer.name;
}

async function creationInput(name, options = {}) {
  const actualName = await projectName(name);
  if (name)
    return {
      name: actualName,
      options: { ...normalizeOptions(options), template: options.template },
    };
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Template:',
      choices: listTemplates().map(({ name, description }) => ({
        name: `${name} - ${description}`,
        value: name,
      })),
      default: options.template || 'react-admin',
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Package manager:',
      choices: ['pnpm', 'npm'],
      default: options.packageManager || 'pnpm',
    },
    {
      type: 'list',
      name: 'bundler',
      message: 'Bundler:',
      choices: ['vite', 'webpack'],
      default: options.bundler || 'vite',
      when: (answers) => answers.template === 'react-admin',
    },
    {
      type: 'list',
      name: 'mode',
      message: 'Project mode:',
      choices: [
        { name: 'Single app', value: 'single' },
        { name: 'Multi-project workspace', value: 'multi' },
        { name: 'Microfrontend host + remote', value: 'microfrontend' },
      ],
      default: options.mode || 'single',
    },
    {
      type: 'confirm',
      name: 'wui',
      message: 'Install @w.ui/wui-react?',
      default: Boolean(options.wui),
      when: (answers) => answers.template === 'react-admin',
    },
    {
      type: 'confirm',
      name: 'install',
      message: 'Install dependencies now?',
      default: Boolean(options.install),
      when: (answers) => !answers.wui,
    },
  ]);
  return {
    name: actualName,
    options: {
      ...normalizeOptions({ ...options, ...answer }),
      template: answer.template,
    },
  };
}

function nextStep(name, options) {
  return `Next: cd ${name} && ${options.install ? `${options.packageManager} run dev` : `${options.packageManager} install && ${options.packageManager} run dev`}`;
}

export async function run(argv = process.argv) {
  const program = new Command();
  program
    .name('baize')
    .description(packageJson.description)
    .version(packageJson.version, '-v, --version');

  program
    .command('create')
    .alias('init')
    .description('Create a project from a bundled template')
    .argument('[name]', 'project directory name')
    .option('-t, --template <name>', 'react-admin or vue-admin', 'react-admin')
    .option('--title <title>', 'project display name')
    .option('--install', 'install dependencies after creation')
    .option('--package-manager <name>', 'npm or pnpm', 'pnpm')
    .option('--bundler <name>', 'vite or webpack', 'vite')
    .option('--mode <name>', 'single, multi, or microfrontend', 'single')
    .option('--wui', 'include and install @w.ui/wui-react')
    .action(async (name, options) => {
      const input = await creationInput(name, options);
      const target = createProject(input.name, {
        ...options,
        ...input.options,
      });
      logger.success(`Created ${target}`);
      logger.info(nextStep(input.name, input.options));
    });

  const add = program
    .command('add')
    .description('Add a feature to a Baize project');
  add
    .command('page')
    .description('Add a page and navigation entry')
    .argument('<slug>', 'lowercase URL segment, for example reports')
    .option('--title <title>', 'navigation and page title')
    .option('--project <name>', 'workspace app name')
    .action((slug, options) => {
      const file = addPage(slug, options);
      logger.success(`Created ${file}`);
    });

  program
    .command('list')
    .description('List available templates')
    .action(() => {
      for (const template of listTemplates())
        console.log(`${template.name}  ${template.description}`);
    });

  program
    .command('doctor')
    .description('Check local prerequisites')
    .action(() => {
      const report = inspectEnvironment();
      for (const item of report.items)
        logger[item.ok ? 'success' : 'warning'](`${item.name}: ${item.detail}`);
      if (!report.ok) process.exitCode = 1;
    });

  program.action(async () => {
    const input = await creationInput();
    const target = createProject(input.name, input.options);
    logger.success(`Created ${target}`);
    logger.info(nextStep(input.name, input.options));
  });

  add
    .command('project')
    .description('Add an app to a multi-project workspace')
    .argument('<slug>', 'lowercase app name')
    .option('--title <title>', 'app display name')
    .action((slug, options) => {
      const directory = addProject(slug, options);
      logger.success(`Created ${directory}`);
      logger.info('Run your package manager install at the workspace root.');
    });

  try {
    await program.parseAsync(argv);
  } catch (error) {
    logger.error(error.message);
    process.exitCode = 1;
  }
}
