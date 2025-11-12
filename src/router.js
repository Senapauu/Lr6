const ROUTE_DEFINITIONS = {
  'users': {
    key: 'users',
    segments: ['users'],
    title: 'Users',
    breadcrumbLabel: 'Users',
    searchPlaceholder: 'Name or email contains...',
  },
  'users/todos': {
    key: 'users/todos',
    segments: ['users', 'todos'],
    title: 'User Todos',
    breadcrumbLabel: 'Todos',
    searchPlaceholder: 'Todo title contains...',
  },
  'users/posts': {
    key: 'users/posts',
    segments: ['users', 'posts'],
    title: 'User Posts',
    breadcrumbLabel: 'Posts',
    searchPlaceholder: 'Post title or body contains...',
  },
  'users/posts/comments': {
    key: 'users/posts/comments',
    segments: ['users', 'posts', 'comments'],
    title: 'Post Comments',
    breadcrumbLabel: 'Comments',
    searchPlaceholder: 'Comment name or body contains...',
  },
};

const listeners = new Set();

export function ensureInitialHash() {
  if (!window.location.hash) {
    navigate(['users']);
  }
}

export function parseHash(hash = window.location.hash) {
  const segments = hash
    .split('#')
    .map((segment) => segment.trim())
    .filter(Boolean);

  return segments.length ? segments : ['users'];
}

export function getRouteKey(segments) {
  return segments.join('/') || 'users';
}

export function getRouteConfig(key) {
  return ROUTE_DEFINITIONS[key];
}

export function getBreadcrumbItems(segments) {
  const items = [];

  for (let index = 0; index < segments.length; index += 1) {
    const partial = segments.slice(0, index + 1);
    const key = getRouteKey(partial);
    const config = getRouteConfig(key);

    if (config) {
      items.push({
        key,
        segments: partial,
        label: config.breadcrumbLabel ?? config.title,
      });
    }
  }

  return items;
}

export function getRouteDefinitions() {
  return Object.values(ROUTE_DEFINITIONS);
}

export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function startRouter() {
  ensureInitialHash();

  const notify = () => {
    const segments = parseHash();
    listeners.forEach((listener) => listener(segments));
  };

  window.addEventListener('hashchange', notify);
  notify();
}

export function navigate(segments) {
  const hash = `#${segments.join('#')}`;
  if (window.location.hash === hash) {
    const segmentsCopy = [...segments];
    listeners.forEach((listener) => listener(segmentsCopy));
    return;
  }
  window.location.hash = hash;
}
