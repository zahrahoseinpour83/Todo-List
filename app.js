/* =========================
   Selecting Elements
========================= */

// Search
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#search");

// Todo List
const todoList = document.querySelector("#todoList");
const emptyState = document.querySelector("#emptyState");

// Task Counters
const totalTasks = document.querySelector("#totalTasks");
const completedTasks = document.querySelector("#completedTasks");

// Filters
const filterButtons = document.querySelectorAll(".filter-btn");

// Add Todo Button
const addTodoBtn = document.querySelector("#addTodoBtn");

// Modal
const todoModal = document.querySelector("#todoModal");
const todoForm = document.querySelector("#todoForm");
const todoInput = document.querySelector("#todoInput");
const cancelTodoBtn = document.querySelector("#cancelTodoBtn");

const modalTitle = document.querySelector("#modalTitle");
const modalSubmitBtn = todoForm.querySelector('[type="submit"]');

/* =========================
   Data & Local Storage
========================= */

const STORAGE_KEY = "todoos";

function loadTodos() {
  try {
    const savedTodos = localStorage.getItem(STORAGE_KEY);

    if (!savedTodos) return [];

    const parsedTodos = JSON.parse(savedTodos);

    if (
      !Array.isArray(parsedTodos) ||
      !parsedTodos.every(
        (todo) =>
          todo &&
          Number.isSafeInteger(todo.id) &&
          typeof todo.title === "string" &&
          typeof todo.isCompleted === "boolean" &&
          typeof todo.createdAt === "string",
      )
    ) {
      return [];
    }

    return parsedTodos;
  } catch (error) {
    console.error("Could not load saved tasks:", error);
    return [];
  }
}

const todoos = loadTodos();

let currentFilter = "all";
let editingTodoId = null;

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todoos));
  } catch (error) {
    console.error("Could not save tasks:", error);
    alert(
      "Your changes could not be saved. Check your browser storage settings.",
    );
  }
}

/* =========================
   Open Modal
========================= */

function openTodoModal(todo = null) {
  todoModal.classList.add("show");
  todoModal.setAttribute("aria-hidden", "false");

  if (todo) {
    editingTodoId = todo.id;
    modalTitle.textContent = "Edit Task";
    modalSubmitBtn.textContent = "Save Changes";
    todoInput.value = todo.title;
  } else {
    editingTodoId = null;
    modalTitle.textContent = "Create New Task";
    modalSubmitBtn.textContent = "Add Task";
    todoForm.reset();
  }

  todoInput.focus();
}

requestAnimationFrame(() => {
  todoInput.focus();
  todoInput.select(); 
});

/* =========================
   Close Modal
========================= */

function closeTodoModal() {
  todoModal.classList.remove("show");
  todoModal.setAttribute("aria-hidden", "true");

  todoForm.reset();
  editingTodoId = null;

  modalTitle.textContent = "Create New Task";
  modalSubmitBtn.textContent = "Add Task";

  addTodoBtn.focus();
}

/* =========================
   Add & Edit Todo
========================= */

todoForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = todoInput.value.trim();

  if (!title) {
    todoInput.focus();
    return;
  }

  if (editingTodoId !== null) {
    const todo = todoos.find((item) => item.id === editingTodoId);

    if (!todo) {
      closeTodoModal();
      renderTodos();
      return;
    }

    todo.title = title;
  } else {
    const newTodo = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      title: title,
      isCompleted: false,
    };

    todoos.push(newTodo);
  }

  saveTodos();
  closeTodoModal();
  renderTodos();
});

/* =========================
   Modal Events
========================= */

addTodoBtn.addEventListener("click", function () {
  openTodoModal();
});

cancelTodoBtn.addEventListener("click", closeTodoModal);

// Close when clicking outside the modal box
todoModal.addEventListener("click", function (e) {
  if (e.target === todoModal) {
    closeTodoModal();
  }
});

// Close with Escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && todoModal.classList.contains("show")) {
    closeTodoModal();
  }
});

/* =========================
   Render Todos
========================= */

function renderTodos() {
  const searchText = searchInput.value.trim().toLowerCase();

  const filteredTodos = todoos.filter((todo) => {
    const matchesSearch = todo.title.toLowerCase().includes(searchText);

    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "completed" && todo.isCompleted) ||
      (currentFilter === "uncompleted" && !todo.isCompleted);

    return matchesSearch && matchesFilter;
  });

  // Update counters
  totalTasks.textContent = todoos.length;

  completedTasks.textContent = todoos.filter((todo) => todo.isCompleted).length;

  // Clear old list
  todoList.replaceChildren();

  // Show empty state when there are no matching tasks
  if (filteredTodos.length === 0) {
    emptyState.style.display = "block";

    const messages = emptyState.querySelectorAll("p");

    if (todoos.length === 0) {
      messages[0].textContent = "You have no pending tasks.";
      messages[1].textContent = "Create one to get started.";
    } else if (searchText) {
      messages[0].textContent = "No matching tasks found.";
      messages[1].textContent = "Try another search.";
    } else if (currentFilter === "completed") {
      messages[0].textContent = "No completed tasks yet.";
      messages[1].textContent = "Complete a task to see it here.";
    } else {
      messages[0].textContent = "All tasks are completed!";
      messages[1].textContent = "Great job!";
    }

    return;
  }

  emptyState.style.display = "none";

  filteredTodos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-list__item";

    if (todo.isCompleted) {
      li.classList.add("completed");
    }

    // Left side
    const leftSide = document.createElement("div");

    const checkButton = document.createElement("button");
    checkButton.type = "button";
    checkButton.className = "todo-list__check";
    checkButton.dataset.action = "toggle";
    checkButton.dataset.todoId = todo.id;
    checkButton.setAttribute(
      "aria-label",
      todo.isCompleted ? "Mark as uncompleted" : "Mark as completed",
    );
    checkButton.setAttribute("aria-pressed", String(todo.isCompleted));

    if (todo.isCompleted) {
      checkButton.textContent = "✓";
    }

    const title = document.createElement("span");
    title.className = "todo-list__title";
    title.textContent = todo.title;

    leftSide.append(checkButton, title);

    // Right side
    const rightSide = document.createElement("div");

    const time = document.createElement("time");
    time.dateTime = todo.createdAt;

    time.textContent = new Date(todo.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Edit button
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "todo-list__edit";
    editButton.dataset.action = "edit";
    editButton.dataset.todoId = todo.id;
    editButton.textContent = "Edit";
    editButton.setAttribute("aria-label", "Edit task");

    // Delete button
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "todo-list__close";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.todoId = todo.id;
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete task");

    rightSide.append(time, editButton, deleteButton);

    li.append(leftSide, rightSide);
    todoList.appendChild(li);
  });
}

/* =========================
   Todo Actions
========================= */

todoList.addEventListener("click", function (e) {
  const button = e.target.closest("button[data-action]");

  if (!button) return;

  const todoId = Number(button.dataset.todoId);

  const todoIndex = todoos.findIndex((item) => item.id === todoId);

  if (todoIndex === -1) return;

  const todo = todoos[todoIndex];

  switch (button.dataset.action) {
    case "toggle":
      todo.isCompleted = !todo.isCompleted;
      saveTodos();
      renderTodos();
      break;

    case "edit":
      openTodoModal(todo);
      break;

    case "delete":
      todoos.splice(todoIndex, 1);
      saveTodos();
      renderTodos();
      break;
  }
});

/* =========================
   Filters
========================= */

filterButtons.forEach((button) => {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;

      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    renderTodos();
  });
});

/* =========================
   Search
========================= */

searchInput.addEventListener("input", renderTodos);

searchForm.addEventListener("submit", function (e) {
  e.preventDefault();
  renderTodos();
});

/* =========================
   Initial Render
========================= */

renderTodos();
