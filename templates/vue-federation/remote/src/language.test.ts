import { expect, it } from 'vitest';
import { reportLanguage } from './language';

it('matches the host language and falls back to Chinese', () => {
  expect(reportLanguage('en-US')).toBe('en');
  expect(reportLanguage('zh-CN')).toBe('zh');
  expect(reportLanguage('')).toBe('zh');
});
