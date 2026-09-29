const express = require('express');
const router = express.Router();
const { getBenchmarkMetrics, getAllPostmortems } = require('../controllers/analyticsController');

router.get('/benchmarks', getBenchmarkMetrics);
router.get('/postmortems', getAllPostmortems);

module.exports = router;
