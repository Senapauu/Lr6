import { fetchUsers } from '../api/jsonPlaceholder.js';
import { createElement } from '../utils/dom.js';
import { createEmptyState } from '../components/emptyState.js';
import {
  addCustomUser,
  getCustomUsers,
  removeCustomUser,
} from '../utils/storage.js';

function buildUserForm(onAdd) {
  const nameField = createInputField('Name', 'name', 'text', 'John Doe', true);
  const emailField = createInputField('Email', 'email', 'email', 'user@example.com', true);
  const usernameField = createInputField('Username', 'username', 'text', 'john_dev');
  const cityField = createInputField('City', 'city', 'text', 'Moscow');
  const companyField = createInputField('Company', 'company', 'text', 'Indie Studio');

  const submitButton = createElement('button', {
    className: 'button button--primary',
    attrs: { type: 'submit' },
    text: 'Add user',
  });

  const form = createElement('form', {
    className: 'form',
    children: [
      nameField.wrapper,
      emailField.wrapper,
      usernameField.wrapper,
      cityField.wrapper,
      companyField.wrapper,
      submitButton,
    ],
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = {
      name: nameField.input.value,
      email: emailField.input.value,
      username: usernameField.input.value,
      city: cityField.input.value,
      company: companyField.input.value,
    };

    if (!payload.name.trim() || !payload.email.trim()) {
      form.classList.add('form--error');
      return;
    }

    form.classList.remove('form--error');

    onAdd(payload);
    form.reset();
  });

  return form;
}

function createInputField(labelText, name, type = 'text', placeholder = '', required = false) {
  const label = createElement('label', {
    className: 'label',
    text: labelText,
    attrs: { for: name },
  });

  const input = createElement('input', {
    className: 'input',
    attrs: {
      type,
      id: name,
      name,
      placeholder,
      required: required ? 'true' : undefined,
    },
  });

  const wrapper = createElement('div', {
    className: 'form__section',
    children: [label, input],
  });

  return { wrapper, input };
}

function normalize(value) {
  return value.trim().toLowerCase();
}

function filterUsers(users, searchQuery) {
  if (!searchQuery) {
    return users;
  }

  const query = normalize(searchQuery);
  return users.filter((user) => {
    const name = normalize(user.name ?? '');
    const email = normalize(user.email ?? '');
    return name.includes(query) || email.includes(query);
  });
}

function createUserCard(user, onDelete) {
  const card = createElement('article', { className: 'card' });

  if (user.isCustom) {
    card.append(
      createElement('span', {
        className: 'card__badge',
        text: 'Local user',
      })
    );
  }

  card.append(
    createElement('h2', {
      className: 'card__title',
      text: user.name,
    })
  );

  card.append(
    createElement('p', {
      className: 'card__subtitle',
      text: user.email,
    })
  );

  card.append(
    createElement('p', {
      className: 'card__text',
      text: user.company?.name ? `Company: ${user.company.name}` : 'Company: n/a',
    })
  );

  card.append(
    createElement('p', {
      className: 'card__text',
      text: user.address?.city ? `City: ${user.address.city}` : 'City: n/a',
    })
  );

  if (user.isCustom && typeof onDelete === 'function') {
    const actions = createElement('div', { className: 'card__actions' });
    const deleteButton = createElement('button', {
      className: 'button button--danger',
      text: 'Delete',
      attrs: { type: 'button' },
      on: {
        click: () => onDelete(user.id),
      },
    });
    actions.append(deleteButton);
    card.append(actions);
  }

  return card;
}

export async function renderUsersView({ searchQuery = '', refresh }) {
  const [remoteUsers, customUsers] = await Promise.all([
    fetchUsers(),
    Promise.resolve(getCustomUsers()),
  ]);

  const users = [...remoteUsers, ...customUsers];
  const filteredUsers = filterUsers(users, searchQuery ?? '');

  const container = createElement('section');

  const form = buildUserForm((payload) => {
    addCustomUser(payload);
    if (typeof refresh === 'function') {
      refresh();
    }
  });

  container.append(form);

  if (!filteredUsers.length) {
    container.append(createEmptyState('No users match the search.'));
    return container;
  }

  const grid = createElement('div', { className: 'card-grid' });

  filteredUsers.forEach((user) => {
    grid.append(
      createUserCard(user, (userId) => {
        removeCustomUser(userId);
        if (typeof refresh === 'function') {
          refresh();
        }
      })
    );
  });

  container.append(grid);
  return container;
}
