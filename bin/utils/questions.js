// This question would be shown at the starting
const questions = [
    {
        type: 'input',
        name: 'projectName',
        message: 'Input project name'
    },
    {
        type: 'list', // checkbox confirm editor expand input list number password rawlist
        name: 'framework',
        message: 'Choose the JS framework which you are using:',
        choices: ['React', 'NextJS', 'Angular', 'Svelte', 'VueJS'],
    },
];

// module.exports.questions = questions;

export default questions
