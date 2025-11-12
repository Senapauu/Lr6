import { createElement } from '../utils/dom.js';

export function createSearchBar({ placeholder, value = '', onInput }) {
  const input = createElement('input', {
    className: 'search-bar__input',
    attrs: {
      type: 'search',
      placeholder: placeholder ?? 'Search...',
      value,
      spellcheck: 'false',
    },
  });

  if (typeof onInput === 'function') {
    input.addEventListener('input', (event) => {
      onInput(event.target.value);
    });
  }

  return createElement('div', {
    className: 'search-bar',
    children: [input],
  });
}
