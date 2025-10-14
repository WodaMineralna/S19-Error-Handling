const {
  loginUser,
  singupUser,
  resetPassword,
  validateToken,
  updatePassword,
} = require("../models/auth");

const newError = require("../utils/newError");

const PLACEHOLDER_DETAILS = { cause: null, message: "Something went wrong..." };

exports.getLogin = (req, res, next) => {
  return res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const {
    didSucceed,
    details = PLACEHOLDER_DETAILS,
    oldInput,
    user,
  } = await loginUser({ email, password });

  if (!didSucceed) {
    return res.render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: [...details],
      oldInput,
    });
  }
  if (didSucceed) {
    req.session.user = user;
    req.session.loggedIn = true;
    req.session.save((err) => {
      if (err) throw newError("Failed to log in", err);
      req.flash("info", details);
      return res.redirect("/");
    });
  }
};

exports.postLogout = async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) throw newError("Failed to logout", err);
    return res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  return res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
  });
};

exports.postSignup = async (req, res, next) => {
  const { email, password } = req.body;
  const { didSucceed, details = PLACEHOLDER_DETAILS } = await singupUser({
    email,
    password,
  });

  if (!didSucceed) {
    return res.render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: [details],
    });
  }
  if (didSucceed) {
    req.flash("info", details);
    return res.redirect("/login");
  }
};

exports.getResetPassword = (req, res, next) => {
  return res.render("auth/reset-password", {
    path: "/reset-password",
    pageTitle: "Reset Password",
  });
};

exports.postResetPassword = async (req, res, next) => {
  const { email } = req.body;
  const {
    didSucceed,
    details = PLACEHOLDER_DETAILS,
    oldInput,
  } = await resetPassword(email);

  if (!didSucceed) {
    return res.render("auth/reset-password", {
      path: "/reset-password",
      pageTitle: "Reset Password",
      errorMessage: [details],
      oldInput,
    });
  }
  if (didSucceed) {
    req.flash("info", details);
    return res.redirect("/login");
  }
};

exports.getResetPasswordForm = async (req, res, next) => {
  const token = req.params.token;
  const { didSucceed, details = PLACEHOLDER_DETAILS } = await validateToken(
    token
  );

  if (!didSucceed) {
    req.flash("error", details);
    return res.redirect("/login");
  }
  if (didSucceed) {
    return res.render("auth/form-reset-password", {
      path: "/form-reset-password",
      pageTitle: "Reset Password Form",
      token,
    });
  }
};

exports.postResetPasswordForm = async (req, res, next) => {
  const { password, confirmPassword, token } = req.body;
  const {
    didSucceed,
    details = PLACEHOLDER_DETAILS,
    toLoginPage,
  } = await updatePassword({
    password,
    confirmPassword,
    token,
  });

  if (!didSucceed) {
    if (toLoginPage) {
      req.flash("error", details);
      return res.redirect("/login");
    }
    return res.render("auth/form-reset-password", {
      path: "/form-reset-password",
      pageTitle: "Reset Password Form",
      token,
      errorMessage: [details],
    });
  }
  if (didSucceed) {
    req.flash("info", details);
    return res.redirect("/login");
  }
};
