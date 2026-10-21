const notFound = (req, res, next) => next(new Error(`Not Found - ${req.originalUrl}`));
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Server error";
  if (err.name === "CastError") { statusCode = 400; message = "Invalid resource identifier."; }
  if (err.code === 11000) { statusCode = 409; message = "A record with this value already exists."; }
  if (err.name === "ValidationError") { statusCode = 400; message = Object.values(err.errors).map((item) => item.message).join(" "); }
  res.status(statusCode).json({ message, ...(process.env.NODE_ENV === "production" ? {} : { stack: err.stack }) });
};
module.exports = { notFound, errorHandler };
