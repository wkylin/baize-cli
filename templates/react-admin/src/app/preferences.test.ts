import { describe, expect, it } from 'vitest';
import { defaults, parsePreferences } from './preferences';

describe('parsePreferences', () => {
  it('uses defaults for invalid stored values', () => {
    expect(parsePreferences(null)).toEqual(defaults);
    expect(
      parsePreferences({
        workspaceName: '',
        accentColor: 'red',
        language: 'fr',
      })
    ).toEqual(defaults);
  });

  it('preserves valid preferences and migrates the old darkMode value', () => {
    expect(
      parsePreferences({
        workspaceName: '运营',
        darkMode: true,
        accentColor: '#2c7655',
        density: 'compact',
        language: 'en',
      })
    ).toEqual({
      workspaceName: '运营',
      themeMode: 'dark',
      accentColor: '#2c7655',
      density: 'compact',
      language: 'en',
    });
  });

  it('localizes the default workspace name when language changes', () => {
    expect(parsePreferences({ language: 'en' }).workspaceName).toBe(
      'Main workspace'
    );
    expect(
      parsePreferences({ ...defaults, language: 'en' }).workspaceName
    ).toBe('Main workspace');
    expect(
      parsePreferences({ ...defaults, workspaceName: 'Custom', language: 'en' })
        .workspaceName
    ).toBe('Custom');
  });
});
