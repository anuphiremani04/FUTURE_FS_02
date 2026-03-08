const express = require('express');
const followupController = require('../controllers/followupController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', followupController.getFollowups);
router.post('/', followupController.createFollowup);
router.put('/:id', followupController.updateFollowup);
router.delete('/:id', followupController.deleteFollowup);

module.exports = router;
