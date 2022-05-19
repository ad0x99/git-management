const Responser = (res, status, message, rest) => {
  res.status(status).json({
    message,
    ...rest,
  });
};

module.exports = { Responser };
