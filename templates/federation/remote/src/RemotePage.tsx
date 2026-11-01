import { useEffect, useState } from 'react';
import './styles.css';

const copy = {
  zh: {
    eyebrow: '报表',
    title: '报表中心',
    description: '这个页面由独立远端应用提供，可以单独开发、构建和部署。',
    visits: '今日访问',
    pending: '待处理事项',
    completion: '完成率',
  },
  en: {
    eyebrow: 'Reports',
    title: 'Reports overview',
    description: 'This page is served by an independent remote application.',
    visits: 'Visits today',
    pending: 'Pending items',
    completion: 'Completion rate',
  },
};

function currentLanguage(): 'zh' | 'en' {
  return typeof document !== 'undefined' &&
    document.documentElement.lang.startsWith('en')
    ? 'en'
    : 'zh';
}

export default function RemotePage() {
  const [language, setLanguage] = useState(currentLanguage);
  useEffect(() => {
    const observer = new MutationObserver(() => setLanguage(currentLanguage()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });
    return () => observer.disconnect();
  }, []);
  const text = copy[language];
  return (
    <section className="remote-page">
      <header className="remote-page__header">
        <p className="remote-page__eyebrow">{text.eyebrow}</p>
        <h1>{text.title}</h1>
        <p>{text.description}</p>
      </header>
      <div className="remote-page__metrics">
        <div>
          <span>{text.visits}</span>
          <strong>1,284</strong>
        </div>
        <div>
          <span>{text.pending}</span>
          <strong>18</strong>
        </div>
        <div>
          <span>{text.completion}</span>
          <strong>92%</strong>
        </div>
      </div>
    </section>
  );
}
