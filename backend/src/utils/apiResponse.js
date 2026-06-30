function sendSuccess(res, data = null, meta = undefined, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

function sendError(res, statusCode, code, message, field) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(field ? { field } : {}),
    },
  });
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

module.exports = { sendSuccess, sendError, asyncHandler };
