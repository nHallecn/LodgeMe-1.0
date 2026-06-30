const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";
  const code = err.code || (statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR");

  if (statusCode >= 500) {
    console.error(err.stack || err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(err.field ? { field: err.field } : {}),
      ...(process.env.NODE_ENV === "development" && err.stack ? { stack: err.stack } : {}),
    },
  });
};

module.exports = errorHandler;
