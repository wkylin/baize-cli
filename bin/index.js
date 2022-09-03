#! /usr/bin/env node

console.log('The CLI is working 🚀');

// const inquirer = require('inquirer');
// const shell = require('shelljs');
// const chalk = require('chalk');

// const { questions } = require('./utils/questions.js');
// const links = require('./utils/links.js');

import inquirer from 'inquirer';
import shell from 'shelljs'
import chalk from 'chalk'

const path = process.cwd();

import questions from './utils/questions.js'
import links from './utils/links.js'

inquirer.prompt(questions).then((answers) => {
  // Use user feedback for... whatever!!
  if (answers.framework === 'React') {
    shell.exec(`mkdir ${answers.projectName}`);
    console.log(chalk.green('📁 Created a folder for the project'));
    shell.exec(`git clone ${links.get('React')} ${answers.projectName}`);
    console.log(
      chalk.green(`🖨️  Cloned started files into ${answers.projectName}`)
    );
    shell.cd(`${path}/${answers.projectName}`);
    shell.exec(`npm i`);
    console.log(
      chalk.green(
        '👨‍💻 Successfully installed all the required dependencies\nHappy hacking 🚀'
      )
    );
  } else {
    console.log(
      '👨‍💻 Coming soon... 🚀'
    );
  }
});