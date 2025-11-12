import { createElement } from '../utils/dom.js';
import { getBreadcrumbItems, navigate } from '../router.js';

export function createBreadcrumbs(segments) {
  const container = createElement('nav', { className: 'breadcrumbs' });
  const items = getBreadcrumbItems(segments);

  if (!items.length) {
    return container;
  }

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const link = createElement('a', {
      className: 'breadcrumbs__link',
      text: item.label,
      attrs: { href: `#${item.segments.join('#')}` },
      on: {
        click: (event) => {
          event.preventDefault();
          if (!isLast) {
            navigate(item.segments);
          }
        },
      },
    });

    if (isLast) {
      link.style.fontWeight = '600';
      link.style.color = 'var(--accent)';
      link.style.cursor = 'default';
    }

    container.append(link);

    if (!isLast) {
      container.append(
        createElement('span', {
          text: '>',
          attrs: { 'aria-hidden': 'true' },
        })
      );
    }
  });

  return container;
}
