const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Determine status code
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Send error response
  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;