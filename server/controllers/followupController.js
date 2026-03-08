const followupModel = require('../models/followupModel');

async function getFollowups(req, res, next) {
  try {
    const followups = await followupModel.getAllFollowups();
    return res.json(followups);
  } catch (error) {
    return next(error);
  }
}

async function createFollowup(req, res, next) {
  try {
    if (!req.body.dueDate) {
      return res.status(400).json({ message: 'followup_date is required' });
    }
    const followup = await followupModel.createFollowup(req.body);
    return res.status(201).json(followup);
  } catch (error) {
    return next(error);
  }
}

async function updateFollowup(req, res, next) {
  try {
    const followup = await followupModel.updateFollowup(req.params.id, req.body);
    if (!followup) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }
    return res.json(followup);
  } catch (error) {
    return next(error);
  }
}

async function deleteFollowup(req, res, next) {
  try {
    const deleted = await followupModel.deleteFollowup(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }
    return res.json({ message: 'Follow-up deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getFollowups,
  createFollowup,
  updateFollowup,
  deleteFollowup
};
