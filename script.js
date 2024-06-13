window.onload = function() {
    loadTodos();
    initializeSortable();
    updateStats();

    // イベントリスナーを追加
    document.getElementById('add-bulk-todos').addEventListener('click', addBulkTodos);
    document.getElementById('add-bulk-todos').addEventListener('click', addBulkTodos);
    document.getElementById('complete-all').addEventListener('click', () => toggleAllTodos(true));
    document.getElementById('revive-all').addEventListener('click', () => toggleAllTodos(false)); 
};

function addBulkTodos() {
    const bulkText = document.getElementById('bulk-todos').value;
    if (bulkText === '') return;

    const todos = bulkText.split('\n').filter(todo => todo.trim() !== '');
    todos.forEach(todoText => {
        createTodoItem(todoText);
    });

    document.getElementById('bulk-todos').value = '';
    saveTodos();
    updateStats(); 
}


function createTodoItem(todoText, parent = document.getElementById('todo-list')) {
    const todoItem = document.createElement('li');
    todoItem.className = 'todo-item';

    const todoItemText = document.createElement('span'); 
    todoItemText.textContent = todoText;
    todoItem.appendChild(todoItemText);

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'buttons';

    const toggleCompleteButton = document.createElement('button');
    toggleCompleteButton.textContent = '完了';
    toggleCompleteButton.className = 'complete-button';
    toggleCompleteButton.addEventListener('click', () => { 
        toggleCompleted(todoItemText, toggleCompleteButton);
    });
    buttonsDiv.appendChild(toggleCompleteButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', () => {
        if (confirm(`"${todoText}"を本当に削除しますか？`)) {
            parent.removeChild(todoItem);
            saveTodos();
            updateStats(); 
        }
    });
    buttonsDiv.appendChild(deleteButton);

    todoItem.appendChild(buttonsDiv); 

    const subList = document.createElement('ul');
    subList.className = 'todo-list';
    todoItem.appendChild(subList);

    const handleIcon = document.createElement('i');
    handleIcon.className = 'fas fa-grip-vertical handle';
    todoItem.insertBefore(handleIcon, todoItem.firstChild);

    parent.appendChild(todoItem);

    initializeSortable(subList);
    return todoItem;
}

function toggleCompleted(todoItemText, toggleCompleteButton) {
    if (todoItemText.style.textDecoration === 'line-through') {
        todoItemText.style.textDecoration = '';
        todoItemText.style.color = '';
        toggleCompleteButton.textContent = '完了';
        toggleCompleteButton.className = 'complete-button';
    } else {
        todoItemText.style.textDecoration = 'line-through';
        todoItemText.style.color = 'gray';
        toggleCompleteButton.textContent = '復活';
        toggleCompleteButton.className = 'revive-button';
        createEmojiEffect(toggleCompleteButton, '💥');
    }
    saveTodos();
    updateStats(); 
}

function createEmojiEffect(element, emoji) {
  // ... (他のコードは変更なし)
}

// toggleAllTodos関数をwindowオブジェクトに追加
window.toggleAllTodos = function(complete) {
  const todoItems = document.querySelectorAll('.todo-item span');
  const completeButtons = document.querySelectorAll('.complete-button, .revive-button');
  todoItems.forEach((todoSpan, index) => {
    todoSpan.style.textDecoration = complete ? 'line-through' : '';
    todoSpan.style.color = complete ? 'gray' : '';
    completeButtons[index].textContent = complete ? '復活' : '完了';
    completeButtons[index].className = complete ? 'revive-button' : 'complete-button';
  });
  saveTodos();
  updateStats(); 
}

function saveTodos() {
    const todos = [];
    document.querySelectorAll('.todo-item').forEach(todoItem => {
        const todoSpan = todoItem.querySelector('span');
        const subTodos = [];
        todoItem.querySelectorAll('ul .todo-item').forEach(subTodoItem => {
            const subTodoSpan = subTodoItem.querySelector('span');
            subTodos.push({
                text: subTodoSpan.textContent,
                completed: subTodoSpan.style.textDecoration === 'line-through'
            });
        });
        todos.push({
            text: todoSpan.textContent,
            completed: todoSpan.style.textDecoration === 'line-through',
            subTodos: subTodos
        });
    });
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
    const todos = JSON.parse(localStorage.getItem('todos'));
    if (todos) {
        todos.forEach(todo => {
            const todoItem = createTodoItem(todo.text);
            if (todo.completed) {
                const todoSpan = todoItem.querySelector('span');
                const completeButton = todoItem.querySelector('button');
                todoSpan.style.textDecoration = 'line-through';
                todoSpan.style.color = 'gray';
                completeButton.textContent = '復活';
                completeButton.className = 'revive-button';
            }
            if (todo.subTodos) {
                todo.subTodos.forEach(subTodo => {
                    const subList = todoItem.querySelector('ul');
                    const subTodoItem = createTodoItem(subTodo.text, subList);
                    if (subTodo.completed) {
                        const subTodoSpan = subTodoItem.querySelector('span');
                        const completeButton = subTodoItem.querySelector('button');
                        subTodoSpan.style.textDecoration = 'line-through';
                        subTodoSpan.style.color = 'gray';
                        completeButton.textContent = '復活';
                        completeButton.className = 'revive-button';
                    }
                });
            }
        });
    }
    updateStats(); 
}

function initializeSortable(container = document.getElementById('todo-list')) {
    new Sortable(container, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        group: 'nested',
        fallbackOnBody: true,
        swapThreshold: 0.65,
        handle: '.handle', 
        onEnd: function (evt) {
            if (evt.to !== evt.from) {
                evt.item.classList.remove('over');
                saveTodos();
                updateStats(); 
            }
        }
    });
}

function updateStats() {
    const totalTasks = document.querySelectorAll('.todo-item').length;
    const completedTasks = document.querySelectorAll('.todo-item span[style*="line-through"]').length;
    document.getElementById('total-tasks').textContent = `タスク総数: ${totalTasks}`;
    document.getElementById('completed-tasks').textContent = `完了タスク: ${completedTasks}`;
}
