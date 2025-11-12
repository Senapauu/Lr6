import { fetchTodos, fetchUsers } from '../api/jsonPlaceholder.js';
import { createElement } from '../utils/dom.js';
import { createEmptyState } from '../components/emptyState.js';
import {
  addCustomTodo,
  getCustomTodos,
  getCustomUsers,
  removeCustomTodo,
  toggleCustomTodo,
} from '../utils/storage.js';

function normalize(value) {
  return value.trim().toLowerCase();
}

function filterTodos(todos, searchQuery) {
  if (!searchQuery) {
    return todos;
  }

  const query = normalize(searchQuery);
  return todos.filter((todo) => normalize(todo.title ?? '').includes(query));
}

function toKey(value) {
  return String(value);
}

function buildUserMap(users, customUsers) {
  const map = new Map();
  [...users, ...customUsers].forEach((user) => {
    map.set(toKey(user.id), user);
  });
  return map;
}

function buildTodoForm(users, customUsers, onAdd) {
  const sortedUsers = [...users, ...customUsers].sort((a, b) => a.name.localeCompare(b.name));

  const label = createElement('label', {
    className: 'label',
    text: 'User',
    attrs: { for: 'todo-user' },
  });

  const select = createElement('select', {
    className: 'select',
    attrs: { id: 'todo-user', name: 'userId', required: 'true' },
  });

  sortedUsers.forEach((user) => {
    select.append(
      createElement('option', {
        text: `${user.name} (${user.email ?? 'no email'})`,
        attrs: { value: toKey(user.id) },
      })
    );
  });

  const titleLabel = createElement('label', {
    className: 'label',
    text: 'Todo title',
    attrs: { for: 'todo-title' },
  });

  const titleInput = createElement('input', {
    className: 'input',
    attrs: {
      id: 'todo-title',
      name: 'title',
      type: 'text',
      placeholder: 'e.g. write README',
      required: 'true',
    },
  });

  const completedLabel = createElement('label', {
    className: 'label',
    text: 'Status',
    attrs: { for: 'todo-status' },
  });

  const completedSelect = createElement('select', {
    className: 'select',
    attrs: { id: 'todo-status', name: 'completed' },
    children: [
      createElement('option', { text: 'In progress', attrs: { value: 'false' } }),
      createElement('option', { text: 'Done', attrs: { value: 'true' } }),
    ],
  });

  const submitButton = createElement('button', {
    className: 'button button--primary',
    attrs: { type: 'submit' },
    text: 'Add todo',
  });

  const form = createElement('form', {
    className: 'form',
    children: [
      createElement('div', { className: 'form__section', children: [label, select] }),
      createElement('div', { className: 'form__section', children: [titleLabel, titleInput] }),
      createElement('div', { className: 'form__section', children: [completedLabel, completedSelect] }),
      submitButton,
    ],
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const userId = formData.get('userId');
    const title = formData.get('title');
    const completed = formData.get('completed') === 'true';

    if (!userId || !title.trim()) {
      form.classList.add('form--error');
      return;
    }

    form.classList.remove('form--error');
    onAdd({ userId, title, completed });
    form.reset();
  });

  return form;
}

function createTodoCard(todo, userMap, onToggle, onDelete) {
  const user = userMap.get(toKey(todo.userId));

  const card = createElement('article', { className: 'card' });

  if (todo.isCustom) {
    card.append(
      createElement('span', {
        className: 'card__badge',
        text: 'Local todo',
      })
    );
  } else if (todo.completed) {
    card.append(
      createElement('span', {
        className: 'card__badge',
        text: 'Done',
      })
    );
  }

  card.append(
    createElement('h2', {
      className: 'card__title',
      text: todo.title,
    })
  );

  card.append(
    createElement('p', {
      className: 'card__text',
      text: user ? `User: ${user.name}` : 'User: unknown',
    })
  );

  card.append(
    createElement('p', {
      className: 'card__text',
      text: todo.completed ? 'Status: done (complete)' : 'Status: in progress (pending)',
    })
  );

  if (todo.isCustom) {
    const actions = createElement('div', { className: 'card__actions' });

    const toggleButton = createElement('button', {
      className: 'button',
      text: todo.completed ? 'Mark as in progress' : 'Mark as done',
      attrs: { type: 'button' },
      on: {
        click: () => onToggle(todo.id),
      },
    });

    const deleteButton = createElement('button', {
      className: 'button button--danger',
      text: 'Delete',
      attrs: { type: 'button' },
      on: {
        click: () => onDelete(todo.id),
      },
    });

    actions.append(toggleButton, deleteButton);
    card.append(actions);
  }

  return card;
}

export async function renderTodosView({ searchQuery = '', refresh }) {
  const [remoteTodos, customTodos, remoteUsers, customUsers] = await Promise.all([
    fetchTodos(),
    Promise.resolve(getCustomTodos()),
    fetchUsers(),
    Promise.resolve(getCustomUsers()),
  ]);

  const todos = [...remoteTodos, ...customTodos];
  const filteredTodos = filterTodos(todos, searchQuery ?? '');
  const userMap = buildUserMap(remoteUsers, customUsers);

  const container = createElement('section');
  const form = buildTodoForm(remoteUsers, customUsers, (payload) => {
    addCustomTodo(payload);
    if (typeof refresh === 'function') {
      refresh();
    }
  });

  container.append(form);

  if (!filteredTodos.length) {
    container.append(createEmptyState('No todos match the search.'));
    return container;
  }

  const grid = createElement('div', { className: 'card-grid' });

  filteredTodos.forEach((todo) => {
    grid.append(
      createTodoCard(
        todo,
        userMap,
        (todoId) => {
          toggleCustomTodo(todoId);
          if (typeof refresh === 'function') {
            refresh();
          }
        },
        (todoId) => {
          removeCustomTodo(todoId);
          if (typeof refresh === 'function') {
            refresh();
          }
        }
      )
    );
  });

  container.append(grid);
  return container;
}
