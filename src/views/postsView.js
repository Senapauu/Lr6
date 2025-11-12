import { fetchPosts, fetchUsers } from '../api/jsonPlaceholder.js';
import { createElement } from '../utils/dom.js';
import { createEmptyState } from '../components/emptyState.js';
import { getCustomUsers } from '../utils/storage.js';

function normalize(value) {
  return value.trim().toLowerCase();
}

function filterPosts(posts, searchQuery) {
  if (!searchQuery) {
    return posts;
  }

  const query = normalize(searchQuery);
  return posts.filter((post) => {
    const title = normalize(post.title ?? '');
    const body = normalize(post.body ?? '');
    return title.includes(query) || body.includes(query);
  });
}

function buildUserMap(users, customUsers) {
  const map = new Map();
  [...users, ...customUsers].forEach((user) => {
    map.set(String(user.id), user);
  });
  return map;
}

function createPostCard(post, userMap) {
  const author = userMap.get(String(post.userId));
  const body = typeof post.body === 'string' ? post.body : '';

  const card = createElement('article', { className: 'card' });
  card.append(
    createElement('h2', {
      className: 'card__title',
      text: post.title,
    })
  );

  card.append(
    createElement('p', {
      className: 'card__subtitle',
      text: author ? `Author: ${author.name}` : 'Author: unknown',
    })
  );

  const preview = body.length > 220 ? `${body.slice(0, 220)}...` : body;

  card.append(
    createElement('p', {
      className: 'card__text',
      text: preview,
    })
  );

  return card;
}

export async function renderPostsView({ searchQuery = '' }) {
  const [posts, users, customUsers] = await Promise.all([
    fetchPosts(),
    fetchUsers(),
    Promise.resolve(getCustomUsers()),
  ]);

  const filteredPosts = filterPosts(posts, searchQuery ?? '');
  const userMap = buildUserMap(users, customUsers);

  const container = createElement('section');

  if (!filteredPosts.length) {
    container.append(createEmptyState('No posts match the search.'));
    return container;
  }

  const grid = createElement('div', { className: 'card-grid' });
  filteredPosts.forEach((post) => {
    grid.append(createPostCard(post, userMap));
  });

  container.append(grid);
  return container;
}
