const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG and GIF are allowed.'));
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
  const { completed, reminder_date, reminder_time, title, notes, priority, list_type } = req.body;
  
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
    
    if (list_type !== undefined) {
      updates.push(' list_type = ?');
      values.push(list_type);
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
router.post('/tasks/:taskId/attachments', upload.single('file'), async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const fileUrl = `/uploads/${req.file.filename}`;

    const [result] = await db.query(
      'INSERT INTO task_attachments (task_id, file_url) VALUES (?, ?)',
      [taskId, fileUrl]
    );

    res.json({
      id: result.insertId,
      task_id: taskId,
      file_url: fileUrl
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

// Endpoint untuk mendapatkan attachments
router.get('/tasks/:taskId/attachments', async (req, res) => {
  try {
    const [attachments] = await db.query(
      'SELECT * FROM task_attachments WHERE task_id = ?',
      [req.params.taskId]
    );
    res.json(attachments);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ error: 'Error fetching attachments' });
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