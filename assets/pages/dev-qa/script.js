// Dom elements
const checkboxes = document.querySelectorAll('.item-checkbox');
const resetBtn = document.getElementById('resetBtn');
const printBtn = document.getElementById('printBtn');
const exportBtn = document.getElementById('exportBtn');
const addItemBtn = document.getElementById('addItemBtn');
const modal = document.getElementById('modal');
const customItemInput = document.getElementById('customItemInput');
const confirmAddBtn = document.getElementById('confirmAddBtn');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const closeBtn = document.querySelector('.close');
const notesArea = document.getElementById('notesArea');
const customItemsContainer = document.getElementById('custom-items');
const progressFill = document.getElementById('progressFill');
const completedCount = document.getElementById('completedCount');
const totalCount = document.getElementById('totalCount');
const percentComplete = document.getElementById('percentComplete');

// Storage keys
const STORAGE_PREFIX = 'devqa_';
const STORAGE_CHECKLIST = STORAGE_PREFIX + 'checklist';
const STORAGE_NOTES = STORAGE_PREFIX + 'notes';
const STORAGE_CUSTOM_ITEMS = STORAGE_PREFIX + 'custom_items';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateProgress();
    setupEventListeners();
    setupCheckboxListeners();
});

// Setup event listeners
function setupEventListeners() {
    resetBtn.addEventListener('click', resetAll);
    printBtn.addEventListener('click', printChecklist);
    exportBtn.addEventListener('click', exportToFile);
    addItemBtn.addEventListener('click', () => openModal());
    confirmAddBtn.addEventListener('click', addCustomItem);
    cancelAddBtn.addEventListener('click', () => closeModal());
    closeBtn.addEventListener('click', () => closeModal());
    notesArea.addEventListener('change', saveNotes);

    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Allow Enter key to add item
    customItemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addCustomItem();
        }
    });
}

// Setup checkbox listeners
function setupCheckboxListeners() {
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            saveState();
            updateProgress();
        });
    });
}

// Update progress
function updateProgress() {
    const allCheckboxes = document.querySelectorAll('.item-checkbox');
    const checked = Array.from(allCheckboxes).filter(cb => cb.checked).length;
    const total = allCheckboxes.length;

    completedCount.textContent = checked;
    totalCount.textContent = total;

    const percent = total === 0 ? 0 : Math.round((checked / total) * 100);
    percentComplete.textContent = percent;
    progressFill.style.width = percent + '%';

    // Update category progress
    updateCategoryProgress();
}

// Update category progress
function updateCategoryProgress() {
    const categories = ['code', 'testing', 'performance', 'browser', 'a11y', 'security', 'docs'];

    categories.forEach(category => {
        const categoryCheckboxes = document.querySelectorAll(`[data-category="${category}"]`);
        const checked = Array.from(categoryCheckboxes).filter(cb => cb.checked).length;
        const total = categoryCheckboxes.length;
        const percent = total === 0 ? 0 : Math.round((checked / total) * 100);

        const progressElement = document.getElementById(`progress-${category}`);
        if (progressElement) {
            progressElement.textContent = `${percent}% (${checked}/${total})`;
        }
    });
}

// Save state to localStorage
function saveState() {
    const state = {};
    document.querySelectorAll('.item-checkbox').forEach((checkbox, index) => {
        state[index] = checkbox.checked;
    });
    localStorage.setItem(STORAGE_CHECKLIST, JSON.stringify(state));
}

// Load state from localStorage
function loadState() {
    const stored = localStorage.getItem(STORAGE_CHECKLIST);
    if (stored) {
        const state = JSON.parse(stored);
        document.querySelectorAll('.item-checkbox').forEach((checkbox, index) => {
            if (state[index] !== undefined) {
                checkbox.checked = state[index];
            }
        });
    }

    // Load notes
    const notes = localStorage.getItem(STORAGE_NOTES);
    if (notes) {
        notesArea.value = notes;
    }

    // Load custom items
    const customItems = localStorage.getItem(STORAGE_CUSTOM_ITEMS);
    if (customItems) {
        try {
            const items = JSON.parse(customItems);
            items.forEach(item => createCustomItemElement(item));
        } catch (e) {
            console.error('Error loading custom items:', e);
        }
    }
}

// Save notes to localStorage
function saveNotes() {
    localStorage.setItem(STORAGE_NOTES, notesArea.value);
}

// Modal functions
function openModal() {
    modal.classList.add('show');
    customItemInput.value = '';
    customItemInput.focus();
}

function closeModal() {
    modal.classList.remove('show');
}

// Add custom item
function addCustomItem() {
    const text = customItemInput.value.trim();
    if (text === '') {
        alert('Please enter an item');
        return;
    }

    createCustomItemElement(text);
    saveCustomItems();
    closeModal();
    updateProgress();
}

// Create custom item element
function createCustomItemElement(text) {
    const label = document.createElement('label');
    label.className = 'checklist-item custom-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'item-checkbox';
    checkbox.dataset.category = 'custom';

    const span = document.createElement('span');
    span.textContent = text;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '✕ Remove';
    removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        label.remove();
        saveCustomItems();
        updateProgress();
    });

    label.appendChild(checkbox);
    label.appendChild(span);
    label.appendChild(removeBtn);

    customItemsContainer.appendChild(label);

    checkbox.addEventListener('change', () => {
        saveState();
        updateProgress();
    });

    setupCheckboxListeners();
}

// Save custom items to localStorage
function saveCustomItems() {
    const items = [];
    document.querySelectorAll('#custom-items .checklist-item span').forEach(span => {
        items.push(span.textContent);
    });
    localStorage.setItem(STORAGE_CUSTOM_ITEMS, JSON.stringify(items));
}

// Reset all
function resetAll() {
    if (confirm('Are you sure you want to reset all items? This cannot be undone.')) {
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        notesArea.value = '';
        localStorage.clear();
        updateProgress();
    }
}

// Print checklist
function printChecklist() {
    window.print();
}

// Export to file
function exportToFile() {
    const data = {
        timestamp: new Date().toLocaleString(),
        progress: {
            completed: document.getElementById('completedCount').textContent,
            total: document.getElementById('totalCount').textContent,
            percent: document.getElementById('percentComplete').textContent
        },
        items: [],
        notes: notesArea.value
    };

    // Collect all checked items
    document.querySelectorAll('.checklist-category').forEach(category => {
        const categoryName = category.querySelector('h2').textContent;
        const categoryItems = [];

        category.querySelectorAll('.checklist-item').forEach(item => {
            const checkbox = item.querySelector('.item-checkbox');
            const text = item.querySelector('span').textContent;
            categoryItems.push({
                text: text,
                completed: checkbox.checked
            });
        });

        if (categoryItems.length > 0) {
            data.items.push({
                category: categoryName,
                items: categoryItems
            });
        }
    });

    // Create and download file
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qa-checklist-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Checklist exported successfully!');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+P to print
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        printChecklist();
    }

    // Ctrl+S to export
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        exportToFile();
    }

    // Esc to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
});
