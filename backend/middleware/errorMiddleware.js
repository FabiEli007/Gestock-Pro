export const notFound = (req, res, next) => {
  const error = new Error(`Route introuvable: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Erreur serveur";

  if (err.name === "CastError") {
    statusCode = 404;
    message = "Ressource introuvable";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "Cette reference ou cet email existe deja";
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};
