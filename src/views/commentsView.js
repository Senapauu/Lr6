import { fetchComments, fetchPosts } from '../api/jsonPlaceholder.js';
import { createElement } from '../utils/dom.js';
import { createEmptyState } from '../components/emptyState.js';

function normalize(value) {
  return value.trim().toLowerCase();
}

function filterComments(comments, searchQuery) {
  if (!searchQuery) {
    return comments;
  }

  const query = normalize(searchQuery);
  return comments.filter((comment) => {
    const name = normalize(comment.name ?? '');
    const body = normalize(comment.body ?? '');
    return name.includes(query) || body.includes(query);
  });
}

function buildPostMap(posts) {
  const map = new Map();
  posts.forEach((post) => {
    map.set(post.id, post);
  });
  return map;
}

function createCommentCard(comment, postMap) {
  const relatedPost = postMap.get(comment.postId);

  const card = createElement('article', { className: 'card' });

  card.append(
    createElement('h2', {
      className: 'card__title',
      text: comment.name,
    })
  );

  card.append(
    createElement('p', {
      className: 'card__subtitle',
      text: comment.email,
    })
  );

  card.append(
    createElement('p', {
      className: 'card__text',
      text: comment.body,
    })
  );

  if (relatedPost) {
    card.append(
      createElement('p', {
        className: 'card__text',
        text: `Post: ${relatedPost.title}`,
      })
    );
  }

  return card;
}

export async function renderCommentsView({ searchQuery = '' }) {
  const [comments, posts] = await Promise.all([fetchComments(), fetchPosts()]);
  const filteredComments = filterComments(comments, searchQuery ?? '');
  const postMap = buildPostMap(posts);

  const container = createElement('section');

  if (!filteredComments.length) {
    container.append(createEmptyState('No comments match the search.'));
    return container;
  }

  const grid = createElement('div', { className: 'card-grid' });
  filteredComments.forEach((comment) => {
    grid.append(createCommentCard(comment, postMap));
  });

  container.append(grid);
  return container;
}
