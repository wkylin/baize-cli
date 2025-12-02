import inquirer from 'inquirer';
import shell from 'shelljs';
import path from 'path';
import { Command } from 'commander';
import fs from 'fs';
import { fileURLToPath } from 'url';
import questions from './utils/questions.js';
import { getRepoUrl } from './utils/links.js';
import logger from './utils/logger.js';

// 获取 package.json 信息
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));

export async function run() {
  const program = new Command();

  program
    .name('baize')
    .description(packageJson.description)
    .version(packageJson.version, '-v, --version', 'output the current version')
    .helpOption('-h, --help', 'display help for command');

  program
    .command('init')
    .description('Initialize a new project')
    .action(async () => {
      await initProject();
    });

  // 如果没有参数，默认执行 init
  if (process.argv.length === 2) {
    await initProject();
  } else {
    program.parse(process.argv);
  }
}

async function initProject() {
  logger.info('Welcome to Baize CLI!');

  try {
    const answers = await inquirer.prompt(questions);
    const { projectName, framework } = answers;
    const repoUrl = getRepoUrl(framework);

    if (!repoUrl) {
      logger.error(`Framework ${framework} is not supported yet.`);
      process.exit(1);
    }

    logger.info(`Initializing project ${projectName} with ${framework}...`);
    
    if (!shell.which('git')) {
      logger.error('Sorry, this script requires git');
      process.exit(1);
    }

    // Clone
    logger.info(`Cloning from ${repoUrl}...`);
    if (shell.exec(`git clone ${repoUrl} ${projectName}`).code !== 0) {
      logger.error('Error: Git clone failed');
      process.exit(1);
    }

    const projectPath = path.join(process.cwd(), projectName);
    shell.cd(projectPath);

    // Remove .git
    shell.rm('-rf', '.git');

    // Install dependencies
    logger.info('Installing dependencies...');
    if (shell.exec('npm install').code !== 0) {
      logger.error('Error: npm install failed');
      process.exit(1);
    }

    logger.success(`Successfully created project ${projectName}!`);
    logger.info(`\ncd ${projectName}\nnpm run dev`);

  } catch (error) {
    logger.error('An error occurred: ' + error.message);
    process.exit(1);
  }
}