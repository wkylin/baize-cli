import { getRepoUrl } from '../../src/utils/links.js';

describe('Links Utils', () => {
  test('should return correct URL for React', () => {
    const url = getRepoUrl('React');
    expect(url).toBe('https://github.com/wkylin/pro-react-admin.git');
  });

  test('should return undefined for unknown framework', () => {
    const url = getRepoUrl('Unknown');
    expect(url).toBeUndefined();
  });
});