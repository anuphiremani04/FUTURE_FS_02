const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/leads-per-month', analyticsController.leadsPerMonth);
router.get('/conversion-rate', analyticsController.conversionRate);
router.get('/revenue', analyticsController.revenue);

module.exports = router;
