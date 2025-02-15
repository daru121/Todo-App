const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // pastikan folder 'uploads' sudah dibuat
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get all tasks
router.get('/tasks', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new task
router.post('/tasks', async (req, res) => {
  const { title, list_type = 'Personal' } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO tasks (title, list_type) VALUES (?, ?)',
      [title, list_type]
    );
    
    const [newTask] = await db.query(
      'SELECT * FROM tasks WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newTask[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update task
router.patch('/tasks/:id', async (req, res) => {
  const { completed, reminder_date, reminder_time, title, notes, priority } = req.body;
  
  try {
    let query = 'UPDATE tasks SET';
    const values = [];
    const updates = [];
    
    if (completed !== undefined) {
      updates.push(' completed = ?');
      values.push(completed);
    }
    
    if (reminder_date !== undefined) {
      updates.push(' reminder_date = ?');
      values.push(reminder_date);
    }
    
    if (reminder_time !== undefined) {
      updates.push(' reminder_time = ?');
      values.push(reminder_time);
    }
    
    if (title !== undefined) {
      updates.push(' title = ?');
      values.push(title);
    }

    if (notes !== undefined) {
      updates.push(' notes = ?');
      values.push(notes);
    }

    // Tambahkan update untuk priority
    if (priority !== undefined) {
      updates.push(' priority = ?');
      values.push(priority);
    }
    
    query += updates.join(',');
    query += ' WHERE id = ?';
    values.push(req.params.id);

    const [result] = await db.query(query, values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete task
router.delete('/tasks/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM tasks WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint untuk upload attachments
router.post('/tasks/:id/attachments', upload.array('images', 5), async (req, res) => {
  try {
    const taskId = req.params.id;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    // Generate URLs untuk file yang diupload
    const fileUrls = files.map(file => {
      return `/uploads/${file.filename}`;
    });

    // Simpan informasi attachment ke database
    const attachments = await Promise.all(fileUrls.map(url => {
      return db.query(
        'INSERT INTO task_attachments (task_id, file_url) VALUES (?, ?)',
        [taskId, url]
      );
    }));

    res.json({ urls: fileUrls });
  } catch (error) {
    console.error('Error uploading attachments:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Endpoint untuk mendapatkan attachments
router.get('/tasks/:id/attachments', async (req, res) => {
  try {
    const taskId = req.params.id;
    const [attachments] = await db.query(
      'SELECT * FROM task_attachments WHERE task_id = ?',
      [taskId]
    );
    res.json({ attachments });
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
});

// Endpoint untuk menghapus attachment
router.delete('/tasks/:taskId/attachments/:attachmentId', async (req, res) => {
  try {
    const { taskId, attachmentId } = req.params;
    
    // Hapus file dari storage
    const [attachment] = await db.query(
      'SELECT * FROM task_attachments WHERE id = ? AND task_id = ?',
      [attachmentId, taskId]
    );

    if (attachment.length > 0) {
      const filePath = path.join(__dirname, '..', '..', attachment[0].file_url);
      fs.unlinkSync(filePath);
      
      // Hapus record dari database
      await db.query(
        'DELETE FROM task_attachments WHERE id = ? AND task_id = ?',
        [attachmentId, taskId]
      );

      res.json({ message: 'Attachment deleted successfully' });
    } else {
      res.status(404).json({ error: 'Attachment not found' });
    }
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
});

module.exports = router; 