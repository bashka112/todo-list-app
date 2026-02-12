class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderTasks();
        this.updateTaskCounter();
    }
    
    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.taskCount = document.getElementById('taskCount');
        this.emptyState = document.getElementById('emptyState');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
    }
    
    bindEvents() {
        // Add task events
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // Filter events
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
        
        // Clear completed tasks
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        // Task list events (using event delegation)
        this.taskList.addEventListener('click', (e) => this.handleTaskAction(e));
        this.taskList.addEventListener('change', (e) => this.handleTaskToggle(e));
        this.taskList.addEventListener('keypress', (e) => this.handleTaskInputKeypress(e));
    }
    
    generateId() {
        return Date.now() + Math.random();
    }
    
    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;
        
        const newTask = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(newTask);
        this.taskInput.value = '';
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCounter();
        
        // Add subtle animation feedback
        this.taskInput.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.taskInput.style.transform = 'scale(1)';
        }, 150);
    }
    
    deleteTask(id) {
        const taskElement = document.querySelector(`[data-id="${id}"]`);
        if (taskElement) {
            taskElement.classList.add('removing');
            setTimeout(() => {
                this.tasks = this.tasks.filter(task => task.id !== id);
                this.saveTasks();
                this.renderTasks();
                this.updateTaskCounter();
            }, 300);
        }
    }
    
    toggleTask(id) {
        this.tasks = this.tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCounter();
    }
    
    editTask(id) {
        this.editingTaskId = id;
        const taskItem = document.querySelector(`[data-id="${id}"]`);
        const taskText = taskItem.querySelector('.task-text');
        const taskInput = taskItem.querySelector('.task-input');
        const editBtn = taskItem.querySelector('.edit-btn');
        const deleteBtn = taskItem.querySelector('.delete-btn');
        const saveBtn = taskItem.querySelector('.save-btn');
        const cancelBtn = taskItem.querySelector('.cancel-btn');
        
        taskText.classList.add('editing');
        taskInput.classList.add('editing');
        taskInput.value = taskText.textContent;
        editBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
        saveBtn.classList.add('editing');
        cancelBtn.classList.add('editing');
        
        taskInput.focus();
        taskInput.select();
    }
    
    saveTask(id) {
        const taskItem = document.querySelector(`[data-id="${id}"]`);
        const taskInput = taskItem.querySelector('.task-input');
        const newText = taskInput.value.trim();
        
        if (newText) {
            this.tasks = this.tasks.map(task => 
                task.id === id ? { ...task, text: newText } : task
            );
            this.saveTasks();
        }
        
        this.cancelEdit(id);
        this.renderTasks();
    }
    
    cancelEdit(id) {
        this.editingTaskId = null;
        const taskItem = document.querySelector(`[data-id="${id}"]`);
        const taskText = taskItem.querySelector('.task-text');
        const taskInput = taskItem.querySelector('.task-input');
        const editBtn = taskItem.querySelector('.edit-btn');
        const deleteBtn = taskItem.querySelector('.delete-btn');
        const saveBtn = taskItem.querySelector('.save-btn');
        const cancelBtn = taskItem.querySelector('.cancel-btn');
        
        taskText.classList.remove('editing');
        taskInput.classList.remove('editing');
        editBtn.style.display = 'inline-block';
        deleteBtn.style.display = 'inline-block';
        saveBtn.classList.remove('editing');
        cancelBtn.classList.remove('editing');
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderTasks();
    }
    
    clearCompleted() {
        const completedTasks = this.tasks.filter(task => task.completed);
        
        if (completedTasks.length === 0) return;
        
        if (confirm(`Are you sure you want to delete ${completedTasks.length} completed task(s)?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCounter();
        }
    }
    
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }
    
    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = '';
            this.emptyState.classList.add('show');
            return;
        }
        
        this.emptyState.classList.remove('show');
        
        this.taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <input type="text" class="task-input" value="${this.escapeHtml(task.text)}">
                <div class="task-actions">
                    <button class="task-btn edit-btn" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-btn delete-btn" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="task-btn save-btn" title="Save changes">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="task-btn cancel-btn" title="Cancel editing">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </li>
        `).join('');
    }
    
    updateTaskCounter() {
        const activeTasks = this.tasks.filter(task => !task.completed).length;
        const taskText = activeTasks === 1 ? 'task' : 'tasks';
        this.taskCount.textContent = `${activeTasks} ${taskText} remaining`;
        
        // Show/hide clear completed button
        const completedTasks = this.tasks.filter(task => task.completed).length;
        this.clearCompletedBtn.style.display = completedTasks > 0 ? 'block' : 'none';
    }
    
    handleTaskAction(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const taskId = parseFloat(taskItem.dataset.id);
        
        if (e.target.closest('.edit-btn')) {
            this.editTask(taskId);
        } else if (e.target.closest('.delete-btn')) {
            this.deleteTask(taskId);
        } else if (e.target.closest('.save-btn')) {
            this.saveTask(taskId);
        } else if (e.target.closest('.cancel-btn')) {
            this.cancelEdit(taskId);
        }
    }
    
    handleTaskToggle(e) {
        if (e.target.classList.contains('task-checkbox')) {
            const taskItem = e.target.closest('.task-item');
            const taskId = parseFloat(taskItem.dataset.id);
            this.toggleTask(taskId);
        }
    }
    
    handleTaskInputKeypress(e) {
        if (e.key === 'Enter' && e.target.classList.contains('task-input')) {
            const taskItem = e.target.closest('.task-item');
            const taskId = parseFloat(taskItem.dataset.id);
            this.saveTask(taskId);
        } else if (e.key === 'Escape' && e.target.classList.contains('task-input')) {
            const taskItem = e.target.closest('.task-item');
            const taskId = parseFloat(taskItem.dataset.id);
            this.cancelEdit(taskId);
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// Add some helpful keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + / to focus on input
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        document.getElementById('taskInput').focus();
    }
});