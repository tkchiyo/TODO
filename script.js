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

let emojiCount = 0; // 絵文字表示回数をカウントする変数

function createEmojiEffect(element) {
    const explosionContainer = document.getElementById('explosion-container');
    const numEmojis = 15; 
    const emojis = [];
    const emojiList = ['🎉', '✨', '🎊', '🥳', '🤩', '👍', '👏', '🙌', '😎', '🔥', '🚀', '💯', '🏆', '🥇', '🎯'];
    const poopEmoji = '💩';

    emojiCount++; // カウントアップ

    for (let i = 0; i < numEmojis; i++) {
        const emojiSpan = document.createElement('span');
        // 15回に1回の確率でPoop絵文字にする
        const emoji = emojiCount % 15 === 0 ? poopEmoji : emojiList[Math.floor(Math.random() * emojiList.length)];
        emojiSpan.textContent = emoji;
        emojiSpan.classList.add('emoji');

        // 重ならない位置を探す
        let x, y;
        do {
            x = Math.random() * (window.innerWidth - emojiSpan.offsetWidth);
            y = Math.random() * (window.innerHeight - emojiSpan.offsetHeight);
        } while (emojis.some(existingEmoji => {
            const dx = Math.abs(x - existingEmoji.x);
            const dy = Math.abs(y - existingEmoji.y);
            return dx < emojiSpan.offsetWidth && dy < emojiSpan.offsetHeight; // 重なっているか判定
        }));

        emojiSpan.style.left = x + 'px';
        emojiSpan.style.top = y + 'px';
        emojiSpan.style.animationDelay = Math.random() * 0.5 + 's'; 

        explosionContainer.appendChild(emojiSpan);
        emojis.push({ x, y }); // 配置した絵文字の位置を記録

        // アニメーション終了後に要素を削除
        emojiSpan.addEventListener('animationend', () => {
            explosionContainer.removeChild(emojiSpan);
            emojis.splice(emojis.indexOf({ x, y }), 1); // 削除した絵文字の位置を配列から削除
        });

    }
    // 15回ごとにカウントをリセット
    if (emojiCount === 15) {
        emojiCount = 0;
    }
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
    saveOrder();
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
        loadOrder();
    }
    updateStats(); 
}

function saveOrder() {
    const order = [];
    document.querySelectorAll('.todo-item').forEach(todoItem => {
        order.push(todoItem.querySelector('span').textContent);
    });
    localStorage.setItem('todo-order', JSON.stringify(order));
}

function loadOrder() {
    const order = JSON.parse(localStorage.getItem('todo-order'));
    if (order) {
        const todoList = document.getElementById('todo-list');
        order.forEach(todoText => {
            const todoItem = Array.from(todoList.children).find(item => item.querySelector('span').textContent === todoText);
            if (todoItem) {
                todoList.appendChild(todoItem);
            }
        });
    }
}

function initializeSortable(container = document.getElementById('todo-list')) {
    new Sortable(container, {
        animation: 100,
        easing: "cubic-bezier(1, 0, 0, 1)",
        group: 'nested',
        fallbackOnBody: true,
        swapThreshold: 1,
        handle: '.handle', 

        // ドラッグ開始時に色を変更
        onChoose: function (evt) {
            evt.item.style.backgroundColor = '#f0f0f0';
            evt.item.style.border = '2px dashed #007bff';
        },

        // ドラッグ終了時に色を元に戻す
        onUnchoose: function (evt) {
            evt.item.style.backgroundColor = '';
            evt.item.style.border = '';
        },

        onEnd: function (evt) {
            saveOrder();  // ドラッグ終了時に順序を保存
                evt.item.classList.remove('over');
                saveTodos();
                updateStats(); 
        }
    });
}

function updateStats() {
    const totalTasks = document.querySelectorAll('.todo-item').length;
    const completedTasks = document.querySelectorAll('.todo-item span[style*="line-through"]').length;
    document.getElementById('total-tasks').textContent = `タスク総数: ${totalTasks}`;
    document.getElementById('completed-tasks').textContent = `完了タスク: ${completedTasks}`;
}
