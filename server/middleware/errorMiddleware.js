function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }
  res.status(status).json({ message });
}

module.exports = { errorHandler };
