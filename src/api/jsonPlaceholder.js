const API_BASE = 'https://jsonplaceholder.typicode.com';
const cache = new Map();

async function fetchFrom(endpoint) {
  if (cache.has(endpoint)) {
    return cache.get(endpoint);
  }

  const url = ${API_BASE}/;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(Failed to fetch : );
  }

  const data = await response.json();
  cache.set(endpoint, data);
  return data;
}

export function fetchUsers() {
  return fetchFrom('users');
}

export function fetchTodos() {
  return fetchFrom('todos');
}

export function fetchPosts() {
  return fetchFrom('posts');
}

export function fetchComments() {
  return fetchFrom('comments');
}
