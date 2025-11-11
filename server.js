const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Инициализация базы данных (файловая база)
const db = new sqlite3.Database('./contacts.db', (err) => {
    if (err) {
        console.error('Ошибка подключения к SQLite:', err.message);
    } else {
        console.log('Подключено к SQLite базе данных');
    }
});

// Создание таблицы
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        _id TEXT UNIQUE,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        mobile_phone TEXT NOT NULL,
        home_phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Ошибка создания таблицы:', err.message);
        } else {
            console.log('Таблица contacts готова');
        }
    });
});

// Вспомогательные функции для промисов
function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Маршруты API
app.get('/api/contacts', async (req, res) => {
    try {
        const rows = await dbAll('SELECT * FROM contacts ORDER BY created_at DESC');
        const contacts = rows.map(row => ({
            _id: row._id,
            username: row.username,
            email: row.email,
            phone: {
                mobile: row.mobile_phone,
                home: row.home_phone
            },
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
        
        res.json({
            success: true,
            data: contacts,
            count: contacts.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/contacts/:id', async (req, res) => {
    try {
        const row = await dbGet('SELECT * FROM contacts WHERE _id = ?', [req.params.id]);
        
        if (!row) {
            return res.status(404).json({
                success: false,
                error: 'Контакт не найден'
            });
        }

        const contact = {
            _id: row._id,
            username: row.username,
            email: row.email,
            phone: {
                mobile: row.mobile_phone,
                home: row.home_phone
            },
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
        
        res.json({
            success: true,
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/contacts', async (req, res) => {
    try {
        const { username, email, phone } = req.body;
        
        if (!username || !email || !phone?.mobile) {
            return res.status(400).json({
                success: false,
                error: 'Обязательные поля: username, email, phone.mobile'
            });
        }

        const _id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        await dbRun(
            'INSERT INTO contacts (_id, username, email, mobile_phone, home_phone) VALUES (?, ?, ?, ?, ?)',
            [_id, username, email, phone.mobile, phone.home || '']
        );

        // Получаем созданный контакт
        const row = await dbGet('SELECT * FROM contacts WHERE _id = ?', [_id]);
        const newContact = {
            _id: row._id,
            username: row.username,
            email: row.email,
            phone: {
                mobile: row.mobile_phone,
                home: row.home_phone
            },
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
        
        res.status(201).json({
            success: true,
            data: newContact,
            message: 'Контакт успешно создан'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

app.put('/api/contacts/:id', async (req, res) => {
    try {
        const { username, email, phone } = req.body;
        
        if (!username || !email || !phone?.mobile) {
            return res.status(400).json({
                success: false,
                error: 'Обязательные поля: username, email, phone.mobile'
            });
        }

        const result = await dbRun(
            'UPDATE contacts SET username = ?, email = ?, mobile_phone = ?, home_phone = ?, updated_at = CURRENT_TIMESTAMP WHERE _id = ?',
            [username, email, phone.mobile, phone.home || '', req.params.id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'Контакт не найден'
            });
        }

        // Получаем обновленный контакт
        const row = await dbGet('SELECT * FROM contacts WHERE _id = ?', [req.params.id]);
        const updatedContact = {
            _id: row._id,
            username: row.username,
            email: row.email,
            phone: {
                mobile: row.mobile_phone,
                home: row.home_phone
            },
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
        
        res.json({
            success: true,
            data: updatedContact,
            message: 'Контакт успешно обновлен'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

app.delete('/api/contacts/:id', async (req, res) => {
    try {
        // Сначала получаем контакт для ответа
        const row = await dbGet('SELECT * FROM contacts WHERE _id = ?', [req.params.id]);
        
        if (!row) {
            return res.status(404).json({
                success: false,
                error: 'Контакт не найден'
            });
        }

        const contact = {
            _id: row._id,
            username: row.username,
            email: row.email,
            phone: {
                mobile: row.mobile_phone,
                home: row.home_phone
            },
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };

        // Удаляем контакт
        await dbRun('DELETE FROM contacts WHERE _id = ?', [req.params.id]);
        
        res.json({
            success: true,
            message: 'Контакт успешно удален',
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.delete('/api/contacts', async (req, res) => {
    try {
        const result = await dbRun('DELETE FROM contacts');
        
        res.json({
            success: true,
            message: 'Все контакты удалены',
            deletedCount: result.changes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Закрыто подключение к SQLite.');
        process.exit(0);
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Приложение доступно: http://localhost:${PORT}`);
    console.log(`API доступно: http://localhost:${PORT}/api/contacts`);
});