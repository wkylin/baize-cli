import fs from 'fs';

const questions = [
  {
    type: 'input',
    name: 'projectName',
    message: 'Enter your project name:',
    validate: function (input) {
      if (/^[\w-]+$/.test(input)) {
        if (fs.existsSync(input)) {
          return 'The directory already exists. Please choose another name.';
        }
        return true;
      } else {
        return 'Project name may only include letters, numbers, underscores and hashes.';
      }
    },
  },
  {
    type: 'list',
    name: 'framework',
    message: 'Choose the JS framework which you are using:',
    choices: ['React', 'VueJS', 'NextJS'],
  },
];

export default questions;