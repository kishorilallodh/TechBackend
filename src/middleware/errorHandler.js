// A robust, centralized error handling middleware for Express.js

const errorHandler = (err, req, res, next) => {
  // Default to 500 Internal Server Error if no status code is set
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // --- Handle Specific Mongoose Errors ---

  // 1. Mongoose Bad ObjectId (CastError)
  // This occurs when an invalid ID format is passed in params (e.g., /api/products/1)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404; // Treat as Not Found, as the ID format is wrong
    message = 'Resource not found. Invalid ID format.';
  }

  
  // 2. Mongoose Duplicate Key Error (code 11000)
  // This occurs when a unique field in the schema gets a duplicate value
  if (err.code === 11000) {
    statusCode = 400; // Bad Request
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for ${field} field. Please choose another value.`;
  }

  // 3. Mongoose Validation Error (ValidationError)
  // This occurs if required fields are missing or data types are wrong during save/update
  if (err.name === 'ValidationError') {
    statusCode = 400; // Bad Request
    // Combine all validation error messages into a single string
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
  }

  // Log the error to the console for the developer
  // You can also integrate a logging library like Winston or Morgan here
  console.error(`[ERROR] ${statusCode} - ${message}\nStack: ${process.env.NODE_ENV === 'production' ? 'hidden' : err.stack}`);

  // Send the final, formatted error response to the client
  res.status(statusCode).json({
    message: message,
    // Only show the stack trace in development mode for security reasons
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler;