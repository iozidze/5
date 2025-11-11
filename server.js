const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к MongoDB (исправленная версия)
const MONGODB_URI = process.env.MONGODB_URI;

// Более простое подключение без устаревших опций
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('MongoDB подключена успешно');
  console.log(`База данных: ${mongoose.connection.db.databaseName}`);
})
.catch(err => {
  console.log('Ошибка подключения к MongoDB:', err.message);
  console.log('Проверьте:');
  console.log('   - Правильность username и password');
  console.log('   - Наличие сети "Allow Access from Anywhere" в MongoDB Atlas');
  console.log('   - Правильность connection string');
});

// Модель контакта и остальной код остается без изменений...
const contactSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  phone: {
    mobile: { type: String, required: true },
    home: { type: String }
  }
}, {
  timestamps: true
});

const Contact = mongoose.model('Contact', contactSchema);

// Маршруты API (остаются без изменений)
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
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
// Маршруты API
// GET /api/contacts - получить все контакты
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
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

// GET /api/contacts/:id - получить контакт по ID
app.get('/api/contacts/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID контакта'
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Контакт не найден'
      });
    }
    
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

// POST /api/contacts - создать новый контакт
app.post('/api/contacts', async (req, res) => {
  try {
    const { username, email, phone } = req.body;
    
    // Валидация
    if (!username || !email || !phone?.mobile) {
      return res.status(400).json({
        success: false,
        error: 'Обязательные поля: username, email, phone.mobile'
      });
    }

    const newContact = new Contact({
      username,
      email,
      phone: {
        mobile: phone.mobile,
        home: phone.home || ''
      }
    });

    const savedContact = await newContact.save();
    
    res.status(201).json({
      success: true,
      data: savedContact,
      message: 'Контакт успешно создан'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/contacts/:id - обновить контакт
app.put('/api/contacts/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID контакта'
      });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedContact) {
      return res.status(404).json({
        success: false,
        error: 'Контакт не найден'
      });
    }
    
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

// DELETE /api/contacts/:id - удалить контакт
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный ID контакта'
      });
    }

    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!deletedContact) {
      return res.status(404).json({
        success: false,
        error: 'Контакт не найден'
      });
    }
    
    res.json({
      success: true,
      message: 'Контакт успешно удален',
      data: deletedContact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/contacts - удалить все контакты
app.delete('/api/contacts', async (req, res) => {
  try {
    const result = await Contact.deleteMany({});
    
    res.json({
      success: true,
      message: `Удалено ${result.deletedCount} контактов`,
      deletedCount: result.deletedCount
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

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Приложение доступно: https://iip-pract5.onrender.com`);
});