import { createElement } from '../utils/dom.js';

export function createHeader() {
  const logo = createElement('div', {
    className: 'brand__logo',
    text: 'JS',
  });

  const title = createElement('h1', {
    className: 'brand__title',
    text: 'JSONPlaceholder Explorer',
  });

  const brand = createElement('div', {
    className: 'brand',
    children: [logo, title],
  });

  const hint = createElement('p', {
    className: 'header__hint',
    text: 'Vanilla JS SPA - no frameworks allowed.',
  });

  return createElement('header', {
    className: 'header',
    children: [brand, hint],
  });
}
