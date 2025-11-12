import { createElement } from '../utils/dom.js';

export function createLoader() {
  return createElement('div', {
    className: 'loader',
    children: [
      createElement('div', {
        className: 'loader__spinner',
        attrs: { role: 'status', 'aria-label': 'Loading' },
      }),
    ],
  });
}
