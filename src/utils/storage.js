const CUSTOM_USERS_KEY = 'spa_custom_users_v1';
const CUSTOM_TODOS_KEY = 'spa_custom_todos_v1';

function safeParse(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Failed to parse localStorage value', error);
    return fallback;
  }
}

function safeStringify(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to write to localStorage', error);
  }
}

function createId(prefix) {
  const random = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

export function getCustomUsers() {
  return safeParse(localStorage.getItem(CUSTOM_USERS_KEY), []);
}

export function saveCustomUsers(users) {
  safeStringify(CUSTOM_USERS_KEY, users);
}

export function addCustomUser(userData) {
  const users = getCustomUsers();
  const newUser = {
    id: createId('user'),
    name: userData.name.trim(),
    email: userData.email.trim(),
    username: userData.username.trim() || userData.name.trim().split(' ')[0] || 'user',
    phone: userData.phone?.trim() || '',
    website: userData.website?.trim() || '',
    company: { name: userData.company?.trim() || 'Independent' },
    address: {
      city: userData.city?.trim() || '',
      street: userData.street?.trim() || '',
    },
    isCustom: true,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveCustomUsers(users);
  return newUser;
}

export function removeCustomUser(userId) {
  const users = getCustomUsers();
  const updatedUsers = users.filter((user) => user.id !== userId);
  saveCustomUsers(updatedUsers);
  removeTodosByUser(userId);
}

export function getCustomTodos() {
  return safeParse(localStorage.getItem(CUSTOM_TODOS_KEY), []);
}

export function saveCustomTodos(todos) {
  safeStringify(CUSTOM_TODOS_KEY, todos);
}

export function addCustomTodo(todoData) {
  const todos = getCustomTodos();
  const newTodo = {
    id: createId('todo'),
    userId: todoData.userId,
    title: todoData.title.trim(),
    completed: Boolean(todoData.completed),
    isCustom: true,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  saveCustomTodos(todos);
  return newTodo;
}

export function toggleCustomTodo(todoId) {
  const todos = getCustomTodos();
  const updatedTodos = todos.map((todo) =>
    todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
  );
  saveCustomTodos(updatedTodos);
  return updatedTodos.find((todo) => todo.id === todoId) ?? null;
}

export function removeCustomTodo(todoId) {
  const todos = getCustomTodos();
  const updatedTodos = todos.filter((todo) => todo.id !== todoId);
  saveCustomTodos(updatedTodos);
}

function removeTodosByUser(userId) {
  const todos = getCustomTodos();
  const updatedTodos = todos.filter((todo) => todo.userId !== userId);
  saveCustomTodos(updatedTodos);
}
