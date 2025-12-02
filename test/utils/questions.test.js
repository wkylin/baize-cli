import { jest } from '@jest/globals';

jest.unstable_mockModule('fs', () => ({
  default: {
    existsSync: jest.fn(),
  },
  existsSync: jest.fn(),
}));

const fs = await import('fs');
const questions = (await import('../../src/utils/questions.js')).default;

describe('Questions Utils', () => {
  const projectNameQuestion = questions.find(q => q.name === 'projectName');

  test('should validate valid project name', () => {
    fs.default.existsSync.mockReturnValue(false);
    const result = projectNameQuestion.validate('my-project');
    expect(result).toBe(true);
  });

  test('should reject invalid project name', () => {
    const result = projectNameQuestion.validate('my project');
    expect(result).toBe('Project name may only include letters, numbers, underscores and hashes.');
  });

  test('should reject existing directory', () => {
    fs.default.existsSync.mockReturnValue(true);
    const result = projectNameQuestion.validate('existing-project');
    expect(result).toBe('The directory already exists. Please choose another name.');
  });
});