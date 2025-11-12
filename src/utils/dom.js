export function createElement(tag, options = {}) {
  const element = document.createElement(tag);
  if (!options) {
    return element;
  }

  const {
    className,
    classes,
    text,
    html,
    attrs,
    dataset,
    children,
    on,
  } = options;

  if (className) {
    element.className = className;
  }

  if (Array.isArray(classes)) {
    element.classList.add(...classes.filter(Boolean));
  }

  if (typeof text === 'string') {
    element.textContent = text;
  }

  if (typeof html === 'string') {
    element.innerHTML = html;
  }

  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        element.setAttribute(key, value);
      }
    });
  }

  if (dataset) {
    Object.entries(dataset).forEach(([key, value]) => {
      element.dataset[key] = value;
    });
  }

  if (Array.isArray(children)) {
    element.append(...children);
  }

  if (on) {
    Object.entries(on).forEach(([eventName, handler]) => {
      if (typeof handler === 'function') {
        element.addEventListener(eventName, handler);
      }
    });
  }

  return element;
}

export function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
