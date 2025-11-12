import { createHeader } from './components/header.js';
import { createBreadcrumbs } from './components/breadcrumbs.js';
import { createSearchBar } from './components/searchBar.js';
import { createLoader } from './components/loader.js';
import { debounce } from './utils/debounce.js';
import { clearChildren, createElement } from './utils/dom.js';
import {
  getRouteConfig,
  getRouteKey,
  navigate,
  parseHash,
  startRouter,
  subscribe,
} from './router.js';
import { renderUsersView } from './views/usersView.js';
import { renderTodosView } from './views/todosView.js';
import { renderPostsView } from './views/postsView.js';
import { renderCommentsView } from './views/commentsView.js';

const ROUTE_VIEWS = {
  'users': renderUsersView,
  'users/todos': renderTodosView,
  'users/posts': renderPostsView,
  'users/posts/comments': renderCommentsView,
};

const searchState = new Map();
let currentRenderToken = 0;

const appRoot = document.getElementById('app');

if (!appRoot) {
  throw new Error('Root element #app was not found');
}

const appShell = createElement('div', { className: 'app-shell' });
const header = createHeader();
const breadcrumbsHolder = createElement('div');
const controlsHolder = createElement('div');
const viewHolder = createElement('div');

appShell.append(header, breadcrumbsHolder, controlsHolder, viewHolder);
appRoot.append(appShell);

function setBreadcrumbs(segments) {
  clearChildren(breadcrumbsHolder);
  breadcrumbsHolder.append(createBreadcrumbs(segments));
}

function setSearchBar(routeKey, config) {
  const placeholder = config?.searchPlaceholder ?? 'Search...';
  const currentValue = searchState.get(routeKey) ?? '';
  const debouncedRender = debounce(() => renderView(routeKey), 250);

  const searchBar = createSearchBar({
    placeholder,
    value: currentValue,
    onInput: (value) => {
      searchState.set(routeKey, value);
      debouncedRender();
    },
  });

  clearChildren(controlsHolder);
  controlsHolder.append(searchBar);
}

function showLoader() {
  clearChildren(viewHolder);
  viewHolder.append(createLoader());
}

function showError(message) {
  clearChildren(viewHolder);
  const errorBox = createElement('div', {
    className: 'empty-state',
    text: message,
  });
  viewHolder.append(errorBox);
}

async function renderView(routeKey) {
  const renderToken = ++currentRenderToken;
  const viewFactory = ROUTE_VIEWS[routeKey];

  if (!viewFactory) {
    showError('Page not found.');
    return;
  }

  showLoader();

  try {
    const node = await viewFactory({
      searchQuery: searchState.get(routeKey) ?? '',
      refresh: () => renderView(routeKey),
    });

    if (renderToken !== currentRenderToken) {
      return;
    }

    clearChildren(viewHolder);
    viewHolder.append(node);
  } catch (error) {
    console.error(error);
    showError('Failed to load data. Try refreshing the page.');
  }
}

function handleRouteChange(rawSegments) {
  const segments = rawSegments.length ? rawSegments : ['users'];
  const routeKey = getRouteKey(segments);
  const config = getRouteConfig(routeKey);

  if (!config) {
    navigate(['users']);
    return;
  }

  document.title = `${config.title} - JSONPlaceholder Explorer`;

  setBreadcrumbs(segments);
  setSearchBar(routeKey, config);
  renderView(routeKey);
}

subscribe(handleRouteChange);
startRouter();

// Support direct navigation without hash on first load
if (!window.location.hash) {
  const initialSegments = parseHash();
  navigate(initialSegments);
}
