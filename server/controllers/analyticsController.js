const analyticsModel = require('../models/analyticsModel');

async function leadsPerMonth(req, res, next) {
  try {
    const data = await analyticsModel.getLeadsPerMonth();
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function conversionRate(req, res, next) {
  try {
    const data = await analyticsModel.getConversionRateBySource();
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function revenue(req, res, next) {
  try {
    const data = await analyticsModel.getRevenueByMonth();
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  leadsPerMonth,
  conversionRate,
  revenue
};
