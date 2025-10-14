const express = require("express");
const router = express.Router();

const isAuthed = require("../middleware/isAuthed");
const authController = require("../controllers/auth");
const catchErrAsync = require("../utils/catchErrAsync");
const {
  validateLogin,
  validateSignup,
  validateResetPassword,
  validateResetPasswordForm,
} = require("../utils/validation");
const handleValidation = require("../middleware/handleValidation");

router.get(
  "/login",
  isAuthed({ shouldBeAuthed: false }),
  authController.getLogin
);

router.post(
  "/login",
  isAuthed({ shouldBeAuthed: false }),
  validateLogin(),
  handleValidation("auth/login", { path: "/login", pageTitle: "Login" }),
  catchErrAsync(authController.postLogin)
);

router.post("/logout", catchErrAsync(authController.postLogout));

router.get(
  "/signup",
  isAuthed({ shouldBeAuthed: false }),
  authController.getSignup
);

router.post(
  "/signup",
  isAuthed({ shouldBeAuthed: false }),
  validateSignup(),
  handleValidation("auth/signup", { path: "/signup", pageTitle: "Signup" }),
  catchErrAsync(authController.postSignup)
);

router.get("/reset-password", authController.getResetPassword);

router.post(
  "/reset-password",
  validateResetPassword(),
  handleValidation("auth/reset-password", {
    path: "/reset-password",
    pageTitle: "Reset Password",
  }),
  catchErrAsync(authController.postResetPassword)
);

router.get(
  "/reset-password/:token",
  catchErrAsync(authController.getResetPasswordForm)
);

router.post(
  "/update-password",
  validateResetPasswordForm(),
  handleValidation("auth/form-reset-password", {
    path: "/form-reset-password",
    pageTitle: "Reset Password Form",
  }),
  catchErrAsync(authController.postResetPasswordForm)
);

module.exports = router;
