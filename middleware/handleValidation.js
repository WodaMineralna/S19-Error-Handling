import { validationResult } from "express-validator";

export default function handleValidation(viewPath, fixedLocals) {
  return (req, res, next) => {
    if (
      fixedLocals.redirect !== true &&
      (!fixedLocals.path || !fixedLocals.pageTitle)
    )
      throw new Error("Missing 'handleValidation' function args");

    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const errorMessage = errors.errors.map(
      (error) => new Object({ cause: error.path, message: error.msg })
    ); // format to an array
    console.log("Errors:", errorMessage); // DEBUGGING

    if (fixedLocals.redirect === true) {
      req.flash("error", errorMessage);
      return res.redirect(viewPath);
    }

    // console.log("'handleValidation.js' req.body:", req.body); // DEBUGGING

    return res.render(viewPath, {
      ...fixedLocals,
      errorMessage,
      token: req.body.token ?? undefined,
      oldInput: {
        email: req.body.email && req.body.email !== "@" ? req.body.email : "",
        title: req.body.title ?? "",
        imageUrl: req.body.imageUrl ?? "",
        price: req.body.price ?? "",
        description: req.body.description ?? "",
      },
      productId: req.body.productId ?? undefined,
    });
  };
}
