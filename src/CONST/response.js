const prepareResponse = (res, status, message, args) => {
  res.status(status).json({
    message,
    ...args,
  });
};

module.exports = { prepareResponse };
