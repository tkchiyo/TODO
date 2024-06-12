document.getElementById('add-todo').addEventListener('click', addTodo);
document.getElementById('new-todo').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTodo();
    }
});
document.getElementById('complete-all').addEventListener('click', completeAllTodos);
document.getElementById('revive-all').addEventListener('click', reviveAllTodos);
document.getElementById('add-bulk-todos').addEventListener('click', addBulkTodos);

window.onload = function() {
    loadTodos();
    initializeSortable();
    updateStats();
};

function addTodo() {
    const todoText = document.getElementById('new-todo').value;
    if (todoText === '') return;

    createTodoItem(todoText);
    document.getElementById('new-todo').value = '';
    saveTodos();
    updateStats(); // タスクを追加した後に統計情報を更新
}

function addBulkTodos() {
    const bulkText = document.getElementById('bulk-todos').value;
    if (bulkText === '') return;

    const todos = bulkText.split('\n').filter(todo => todo.trim() !== '');
    todos.forEach(todoText => {
        createTodoItem(todoText);
    });

    document.getElementById('bulk-todos').value = '';
    saveTodos();
    updateStats(); // タスクを追加した後に統計情報を更新
}

function createTodoItem(todoText, parent = document.getElementById('todo-list')) {
    const todoItem = document.createElement('li');
    todoItem.className = 'todo-item';

    const todoSpan = document.createElement('span');
    todoSpan.textContent = todoText;

    const completeButton = document.createElement('button');
    completeButton.textContent = '完了';
    completeButton.className = 'complete-button';
    completeButton.addEventListener('pointerdown', () => { // pointerdownイベントに変更
        toggleCompleted(todoSpan, completeButton);
    });
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', () => {
        parent.removeChild(todoItem);
        saveTodos();
        updateStats(); // タスクを削除した後に統計情報を更新
    });

    const subList = document.createElement('ul');
    subList.className = 'todo-list';

    todoItem.appendChild(todoSpan);
    todoItem.appendChild(completeButton);
    todoItem.appendChild(deleteButton);
    todoItem.appendChild(subList);
    parent.appendChild(todoItem);

    initializeSortable(subList);
    return todoItem; // todoItemを返すように修正
}

function toggleCompleted(todoSpan, completeButton) {
    if (todoSpan.style.textDecoration === 'line-through') {
        todoSpan.style.textDecoration = '';
        todoSpan.style.color = '';
        completeButton.textContent = '完了';
        completeButton.className = 'complete-button';
    } else {
        todoSpan.style.textDecoration = 'line-through';
        todoSpan.style.color = 'gray';
        completeButton.textContent = '復活';
        completeButton.className = 'revive-button';
        createEmojiEffect(completeButton, '💥');
    }
    saveTodos();
    updateStats(); // 完了状態を切り替えた後に統計情報を更新
}

function createEmojiEffect(element, emoji) {
    const rect = element.getBoundingClientRect();
    
    const emojiElement = document.createElement('div');
    emojiElement.className = 'emoji';
    emojiElement.style.left = `${rect.left + rect.width / 2}px`;
    emojiElement.style.top = `${rect.top + rect.height / 2}px`;
    emojiElement.textContent = emoji;
    
    const explosionContainer = document.getElementById('explosion-container');
    if (explosionContainer) {
        explosionContainer.appendChild(emojiElement);
        setTimeout(() => emojiElement.remove(), 2000);
    } else {
        console.error('Explosion container not found.');
    }
}

function completeAllTodos() {
    const todoItems = document.querySelectorAll('.todo-item span');
    const completeButtons = document.querySelectorAll('.complete-button, .revive-button');
    todoItems.forEach((todoSpan, index) => {
        todoSpan.style.textDecoration = 'line-through';
        todoSpan.style.color = 'gray';
        completeButtons[index].textContent = '復活';
        completeButtons[index].className = 'revive-button';
    });
    saveTodos();
    updateStats(); // タスクを完了状態にした後に統計情報を更新
}

function reviveAllTodos() {
    const todoItems = document.querySelectorAll('.todo-item span');
    const completeButtons = document.querySelectorAll('.complete-button, .revive-button');
    todoItems.forEach((todoSpan, index) => {
        todoSpan.style.textDecoration = '';
        todoSpan.style.color = '';
        completeButtons[index].textContent = '完了';
        completeButtons[index].className = 'complete-button';
    });
    saveTodos();
    updateStats(); // タスクを未完了状態にした後に統計情報を更新
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
    updateStats(); // ロードが完了した後に統計情報を更新
}

function initializeSortable(container = document.getElementById('todo-list')) {
    new Sortable(container, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        group: 'nested',
        fallbackOnBody: true,
        swapThreshold: 0.65,
        onEnd: function (evt) {
            if (evt.to !== evt.from) {
                evt.item.classList.remove('over');
                saveTodos();
                updateStats(); // ソートが完了した後に統計情報を更新
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
