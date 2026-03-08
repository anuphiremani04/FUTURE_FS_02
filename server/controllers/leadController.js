const leadModel = require('../models/leadModel');

async function getLeads(req, res, next) {
  try {
    const leads = await leadModel.getAllLeads();
    return res.json(leads);
  } catch (error) {
    return next(error);
  }
}

async function createLead(req, res, next) {
  try {
    const { name, company, email } = req.body;
    if (!name || !company || !email) {
      return res.status(400).json({ message: 'Name, company and email are required' });
    }

    const lead = await leadModel.createLead(req.body);
    return res.status(201).json(lead);
  } catch (error) {
    return next(error);
  }
}

async function updateLead(req, res, next) {
  try {
    const lead = await leadModel.updateLead(req.params.id, req.body);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    return res.json(lead);
  } catch (error) {
    return next(error);
  }
}

async function deleteLead(req, res, next) {
  try {
    const deleted = await leadModel.deleteLead(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    return res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getLeads,
  createLead,
  updateLead,
  deleteLead
};
