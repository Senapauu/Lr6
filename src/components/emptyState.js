import { createElement } from '../utils/dom.js';

export function createEmptyState(message = 'Nothing found') {
  return createElement('div', {
    className: 'empty-state',
    text: message,
  });
}
