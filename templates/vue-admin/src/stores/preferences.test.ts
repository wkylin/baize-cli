import { describe, expect, it } from 'vitest';
import { defaults, parsePreferences } from './preferences';

describe('preferences', () => {
  it('uses defaults for invalid storage values', () => {
    expect(parsePreferences(null)).toEqual(defaults);
    expect(
      parsePreferences({ themeMode: 'unknown', accentColor: '#fff' })
    ).toEqual(defaults);
  });

  it('keeps valid choices and switches the default workspace name with language', () => {
    expect(
      parsePreferences({
        language: 'en',
        themeMode: 'dark',
        density: 'compact',
      })
    ).toEqual({
      ...defaults,
      workspaceName: 'Main workspace',
      language: 'en',
      themeMode: 'dark',
      density: 'compact',
    });
  });
});
