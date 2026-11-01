import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import RemotePage from './RemotePage';

it('renders the standalone reports overview', () => {
  const html = renderToStaticMarkup(<RemotePage />);
  expect(html).toContain('报表中心');
  expect(html).toContain('1,284');
});
