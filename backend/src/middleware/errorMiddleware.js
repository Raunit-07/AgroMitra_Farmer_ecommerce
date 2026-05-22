export const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";
  
  // Log the stack trace internally for developers
  console.error("❌ Error:", err.message);
  if (!isProduction) console.error(err.stack);

  const statusCode = err.status || res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    message: isProduction && statusCode === 500 ? "Internal Server Error" : err.message,
    stack: isProduction ? null : err.stack,
  });
};
