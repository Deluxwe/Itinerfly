function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success:   true,
    data,
    timestamp: new Date().toISOString(),
  });
}


function clientError(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    success:   false,
    error:     message,
    timestamp: new Date().toISOString(),
  });
}


function serverError(res, message = "Error interno del servidor") {
  return res.status(500).json({
    success:   false,
    error:     message,
    timestamp: new Date().toISOString(),
  });
}

module.exports = { success, clientError, serverError };
