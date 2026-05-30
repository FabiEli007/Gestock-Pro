export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Donnees invalides",
      errors: result.error.flatten().fieldErrors
    });
  }

  req.body = result.data;
  next();
};
