const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Хранилище в памяти (массив)
let contacts = [];

// Генератор простого ID
function generateId() {
    return Date.now().toString();
}

// API маршруты
app.get('/api/contacts', (req, res) => {
    res.json({ 
        success: true, 
        data: contacts,
        count: contacts.length 
    });
});

app.post('/api/contacts', (req, res) => {
    try {
        const { username, email, phone } = req.body;
        
        // Простая валидация
        if (!username || !email || !phone?.mobile) {
            return res.status(400).json({
                success: false,
                error: 'Заполните все обязательные поля'
            });
        }

        const newContact = {
            _id: generateId(),
            username,
            email,
            phone: {
                mobile: phone.mobile,
                home: phone.home || ''
            },
            createdAt: new Date().toISOString()
        };

        contacts.push(newContact);
        
        res.json({ 
            success: true, 
            data: newContact, 
            message: 'Контакт добавлен!' 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.delete('/api/contacts/:id', (req, res) => {
    const initialLength = contacts.length;
    contacts = contacts.filter(contact => contact._id !== req.params.id);
    
    if (contacts.length === initialLength) {
        return res.status(404).json({ 
            success: false, 
            error: 'Контакт не найден' 
        });
    }
    
    res.json({ 
        success: true, 
        message: 'Контакт удален!' 
    });
});

app.delete('/api/contacts', (req, res) => {
    const deletedCount = contacts.length;
    contacts = [];
    
    res.json({ 
        success: true, 
        message: `Удалено ${deletedCount} контактов`,
        deletedCount 
    });
});

// Статический фронтенд
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`✅ БД не используется - данные в памяти`);
    console.log(`📞 API: http://localhost:${PORT}/api/contacts`);
});