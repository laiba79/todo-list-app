// DOM Elements
const input = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const clearBtn = document.getElementById('clear-btn');
const exportBtn = document.getElementById('export-btn');
const toggleTheme = document.getElementById('toggle-theme');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const pendingTasksEl = document.getElementById('pending-tasks');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let theme = localStorage.getItem('theme') || 'light';
let currentFilter = 'all';

// Initialize
function init() {
  setTheme(theme);
  renderTasks();
  updateStats();
}

// Theme functions
function setTheme(mode) {
  document.body.classList.toggle('dark', mode === 'dark');
  toggleTheme.innerHTML = mode === 'dark'
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
  localStorage.setItem('theme', mode);
}

// Task functions
function addTask() {
  const taskText = input.value.trim();
  if (taskText !== '') {
    tasks.push({
      text: taskText,
      done: false,
      createdAt: new Date().toISOString()
    });
    saveTasks();
    input.value = '';
    renderTasks();
    updateStats();
  }
  input.focus();
}

function toggleDone(index) {
  tasks[index].done = !tasks[index].done;
  saveTasks();
  renderTasks();
  updateStats();
}

function deleteTask(index) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
    updateStats();
  }
}

function editTask(index) {
  const newText = prompt("Edit your task:", tasks[index].text);
  if (newText !== null && newText.trim() !== '') {
    tasks[index].text = newText.trim();
    saveTasks();
    renderTasks();
  }
}

function clearCompleted() {
  if (confirm("Are you sure you want to delete all completed tasks?")) {
    tasks = tasks.filter(task => !task.done);
    saveTasks();
    renderTasks();
    updateStats();
  }
}

function exportTasks() {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  
  let filteredTasks = tasks;
  if (currentFilter === 'active') {
    filteredTasks = tasks.filter(task => !task.done);
  } else if (currentFilter === 'completed') {
    filteredTasks = tasks.filter(task => task.done);
  }
  
  if (filteredTasks.length === 0) {
    taskList.innerHTML = `<li class="empty-state">No tasks found</li>`;
    return;
  }
  
  filteredTasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = task.done ? 'done' : '';
    li.innerHTML = `
      <span class="task-text" onclick="toggleDone(${index})">${task.text}</span>
      <div class="task-actions">
        <button class="edit-btn" onclick="editTask(${index})" aria-label="Edit task">
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-btn" onclick="deleteTask(${index})" aria-label="Delete task">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function updateStats() {
  totalTasksEl.textContent = tasks.length;
  const completed = tasks.filter(task => task.done).length;
  completedTasksEl.textContent = completed;
  pendingTasksEl.textContent = tasks.length - completed;
}

function setFilter(filter) {
  currentFilter = filter;
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderTasks();
}

// Event Listeners
toggleTheme.addEventListener('click', () => {
  theme = theme === 'light' ? 'dark' : 'light';
  setTheme(theme);
});

addBtn.addEventListener('click', addTask);
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

clearBtn.addEventListener('click', clearCompleted);
exportBtn.addEventListener('click', exportTasks);

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    setFilter(btn.dataset.filter);
  });
});

// Initialize the app
init();