const clientModel = require('../models/clientModel');

async function getClients(req, res, next) {
  try {
    const clients = await clientModel.getAllClients();
    return res.json(clients);
  } catch (error) {
    return next(error);
  }
}

async function createClient(req, res, next) {
  try {
    const { name, company, email } = req.body;
    if (!name || !company || !email) {
      return res.status(400).json({ message: 'Name, company and email are required' });
    }

    const client = await clientModel.createClient(req.body);
    return res.status(201).json(client);
  } catch (error) {
    return next(error);
  }
}

async function updateClient(req, res, next) {
  try {
    const client = await clientModel.updateClient(req.params.id, req.body);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    return res.json(client);
  } catch (error) {
    return next(error);
  }
}

async function deleteClient(req, res, next) {
  try {
    const deleted = await clientModel.deleteClient(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Client not found' });
    }
    return res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getClients,
  createClient,
  updateClient,
  deleteClient
};
