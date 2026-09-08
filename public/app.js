const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const list = document.querySelector('#todo-list');
const empty = document.querySelector('#empty');
const count = document.querySelector('#count');
const status = document.querySelector('#status');

const request = (url, options) => fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });

function render(todos) {
  const remaining = todos.filter((todo) => !todo.completed).length;
  count.textContent = `${remaining}개의 할 일 남음`;
  empty.hidden = todos.length > 0;
  list.innerHTML = todos.map((todo) => `
    <li class="${todo.completed ? 'completed' : ''}">
      <input type="checkbox" ${todo.completed ? 'checked' : ''} data-toggle="${todo.id}" aria-label="완료 처리" />
      <label>${escapeHtml(todo.title)}</label>
      <button class="delete" data-delete="${todo.id}" aria-label="삭제">×</button>
    </li>
  `).join('');
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

async function load() {
  const response = await request('/api/todos');
  if (!response.ok) throw new Error('load failed');
  render(await response.json());
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  status.textContent = '저장 중…';
  const response = await request('/api/todos', { method: 'POST', body: JSON.stringify({ title }) });
  if (response.ok) { input.value = ''; await load(); }
  status.textContent = '';
});

list.addEventListener('click', async (event) => {
  const toggle = event.target.closest('[data-toggle]');
  const remove = event.target.closest('[data-delete]');
  if (toggle) {
    await request(`/api/todos/${toggle.dataset.toggle}`, { method: 'PATCH', body: JSON.stringify({ completed: toggle.checked }) });
    await load();
  }
  if (remove) {
    await request(`/api/todos/${remove.dataset.delete}`, { method: 'DELETE' });
    await load();
  }
});

load().catch(() => { status.textContent = '서버 연결을 확인해주세요'; });
