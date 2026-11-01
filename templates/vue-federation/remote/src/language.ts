export function reportLanguage(lang: string): 'zh' | 'en' {
  return lang.startsWith('en') ? 'en' : 'zh';
}
