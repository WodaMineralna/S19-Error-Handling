import { validationResult } from "express-validator";
import { createLogger } from "../utils/index.js";

const log = createLogger(import.meta.url);

export default function handleValidation(viewPath, fixedLocals) {
  return (req, res, next) => {
    if (
      fixedLocals.redirect !== true &&
      (!fixedLocals.path || !fixedLocals.pageTitle)
    ) {
      log("error", "'handleValidation' function args missing");
      throw new Error("Missing 'handleValidation' function args");
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const errorMessage = errors.errors.map(
      (error) => new Object({ cause: error.path, message: error.msg })
    ); // format to an array

    log(
      "warn",
      `Input validation errors:\n${JSON.stringify(errorMessage, null, 2)}`
    );

    if (fixedLocals.redirect === true) {
      log("info", "User forcefully redirected");
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
