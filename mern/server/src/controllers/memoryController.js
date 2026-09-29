const HindsightMemory = require('../models/HindsightMemory');
const { seedDefaultMemories, DEFAULT_MEMORIES } = require('../services/memoryEngine');

/**
 * Get all organizational hindsight memories
 */
async function getAllMemories(req, res) {
  try {
    const { service, search, tag } = req.query;
    const filter = {};

    if (service) {
      filter.service = new RegExp(service, 'i');
    }
    if (tag) {
      filter.tags = { $in: [tag] };
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { rootCause: new RegExp(search, 'i') },
        { symptomSignature: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const memories = await HindsightMemory.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: memories.length, memories });
  } catch (err) {
    console.error('Error fetching memories:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve hindsight memories' });
  }
}

/**
 * Get single memory by ID
 */
async function getMemoryById(req, res) {
  try {
    const { id } = req.params;
    const memory = await HindsightMemory.findOne({
      $or: [{ memoryId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!memory) {
      return res.status(404).json({ success: false, message: 'Memory not found' });
    }

    res.json({ success: true, memory });
  } catch (err) {
    console.error('Error fetching memory details:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve memory' });
  }
}

/**
 * Re-seed memory bank to default demo state
 */
async function reseedMemories(req, res) {
  try {
    await HindsightMemory.deleteMany({});
    await seedDefaultMemories();
    const memories = await HindsightMemory.find({}).sort({ createdAt: -1 });
    res.json({ success: true, message: 'Memory bank reseeded with default organizational knowledge', count: memories.length, memories });
  } catch (err) {
    console.error('Error reseeding memories:', err);
    res.status(500).json({ success: false, message: 'Failed to reseed memories' });
  }
}

/**
 * Create custom memory
 */
async function createMemory(req, res) {
  try {
    const memoryData = req.body;
    if (!memoryData.memoryId) {
      memoryData.memoryId = `MEM-CUSTOM-${Date.now().toString().slice(-4)}`;
    }

    const memory = await HindsightMemory.create(memoryData);
    res.status(201).json({ success: true, memory });
  } catch (err) {
    console.error('Error creating memory:', err);
    res.status(500).json({ success: false, message: 'Failed to create memory' });
  }
}

module.exports = {
  getAllMemories,
  getMemoryById,
  reseedMemories,
  createMemory,
};
