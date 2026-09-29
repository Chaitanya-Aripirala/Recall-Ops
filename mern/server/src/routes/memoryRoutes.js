const express = require('express');
const router = express.Router();
const {
  getAllMemories,
  getMemoryById,
  reseedMemories,
  createMemory,
} = require('../controllers/memoryController');

router.get('/', getAllMemories);
router.get('/:id', getMemoryById);
router.post('/reseed', reseedMemories);
router.post('/create', createMemory);

module.exports = router;
