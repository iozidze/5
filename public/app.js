// Базовый URL API
const API_URL = '';

// Загрузка контактов при старте
document.addEventListener('DOMContentLoaded', function() {
    loadContacts();
    
    // Обработчик формы
    document.getElementById('contact-form').addEventListener('submit', handleFormSubmit);
});

// Загрузка всех контактов
async function loadContacts() {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_URL}/api/contacts`);
        const result = await response.json();
        
        if (result.success) {
            displayContacts(result.data);
            document.getElementById('contacts-count').textContent = result.count;
        } else {
            showMessage('Ошибка при загрузке контактов', 'error');
        }
    } catch (error) {
        showMessage('Ошибка сети: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Отображение контактов
function displayContacts(contacts) {
    const container = document.getElementById('contacts-list');
    
    if (contacts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3> Контактов пока нет</h3>
                <p>Добавьте первый контакт с помощью формы</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = contacts.map(contact => `
        <div class="contact-item">
            <div class="contact-header">
                <div class="contact-name">${contact.username}</div>
                <div class="contact-actions">
                    <button class="action-btn edit-btn" onclick="editContact('${contact._id}')" title="Редактировать">
                        
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteContact('${contact._id}')" title="Удалить">
                        
                    </button>
                </div>
            </div>
            <div class="contact-details">
                <div class="contact-email"> ${contact.email}</div>
                <div class="contact-phone">
                     ${contact.phone.mobile}
                    ${contact.phone.home ? ` • ${contact.phone.home}` : ''}
                </div>
                <div class="contact-date">
                    <small>Добавлен: ${new Date(contact.createdAt).toLocaleDateString('ru-RU')}</small>
                </div>
            </div>
        </div>
    `).join('');
}

// Обработчик формы
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        phone: {
            mobile: document.getElementById('mobile').value,
            home: document.getElementById('home').value
        }
    };
    
    try {
        const response = await fetch(`${API_URL}/api/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Контакт успешно создан!', 'success');
            document.getElementById('contact-form').reset();
            loadContacts();
        } else {
            showMessage('Ошибка при создании: ' + result.error, 'error');
        }
    } catch (error) {
        showMessage('Ошибка сети: ' + error.message, 'error');
    }
}

// Редактирование контакта
async function editContact(id) {
    try {
        const response = await fetch(`${API_URL}/api/contacts/${id}`);
        const result = await response.json();
        
        if (result.success) {
            const contact = result.data;
            
            // Заполняем форму данными для редактирования
            document.getElementById('username').value = contact.username;
            document.getElementById('email').value = contact.email;
            document.getElementById('mobile').value = contact.phone.mobile;
            document.getElementById('home').value = contact.phone.home || '';
            
            // Меняем поведение формы на обновление
            const form = document.getElementById('contact-form');
            form.onsubmit = async (e) => {
                e.preventDefault();
                
                const updateData = {
                    username: document.getElementById('username').value,
                    email: document.getElementById('email').value,
                    phone: {
                        mobile: document.getElementById('mobile').value,
                        home: document.getElementById('home').value
                    }
                };
                
                try {
                    const updateResponse = await fetch(`${API_URL}/api/contacts/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updateData)
                    });
                    
                    const updateResult = await updateResponse.json();
                    
                    if (updateResult.success) {
                        showMessage('Контакт успешно обновлен!', 'success');
                        form.reset();
                        form.onsubmit = handleFormSubmit; // Возвращаем исходный обработчик
                        document.querySelector('.btn-primary').textContent = 'Добавить контакт';
                        loadContacts();
                    } else {
                        showMessage('Ошибка при обновлении: ' + updateResult.error, 'error');
                    }
                } catch (error) {
                    showMessage('Ошибка сети: ' + error.message, 'error');
                }
            };
            
            document.querySelector('.btn-primary').textContent = 'Обновить контакт';
            showMessage('Заполните форму для редактирования контакта', 'success');
        }
    } catch (error) {
        showMessage('Ошибка при загрузке контакта: ' + error.message, 'error');
    }
}

// Удаление контакта
async function deleteContact(id) {
    if (!confirm('Вы уверены, что хотите удалить этот контакт?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/contacts/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Контакт успешно удален!', 'success');
            loadContacts();
        } else {
            showMessage('Ошибка при удалении: ' + result.error, 'error');
        }
    } catch (error) {
        showMessage('Ошибка сети: ' + error.message, 'error');
    }
}

// Удаление всех контактов
async function deleteAllContacts() {
    if (!confirm('Вы уверены, что хотите удалить ВСЕ контакты? Это действие нельзя отменить.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/contacts`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(`Удалено ${result.deletedCount} контактов!`, 'success');
            loadContacts();
        } else {
            showMessage('Ошибка при удалении: ' + result.error, 'error');
        }
    } catch (error) {
        showMessage('Ошибка сети: ' + error.message, 'error');
    }
}

// Вспомогательные функции
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('contacts-list').style.display = show ? 'none' : 'block';
}

function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type} show`;
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 4000);
}