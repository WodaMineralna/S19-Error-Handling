import bcrypt from "bcryptjs";
import { oneOf, check, body, param, query } from "express-validator";
import mongoose from "mongoose";

const PASSWORD_MIN_LENGTH = 3; // only 3 so app is easier to debug

async function comparePasswords(pwd1, pwd2) {
  return await bcrypt.compare(pwd1, pwd2);
}

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

function validateObjectId(name) {
  return [
    oneOf(
      [param(name).exists(), query(name).exists(), body(name).exists()],
      `${name} is required`
    ),
    check(name).custom(isValidObjectId).withMessage(`Invalid ${name}`),
  ];
}

function validateEmail() {
  return [
    body("email")
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage("Email must be a valid adress"),
  ];
}

function validatePassword() {
  return [
    body("password")
      .trim()
      .isLength({ min: PASSWORD_MIN_LENGTH })
      .withMessage(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
      ),
  ];
}

function validatePasswordsEquality() {
  return [
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords must match");
        }
        return true;
      })
      .withMessage("Passwords must match"),
  ];
}

function validateTitle() {
  return [
    body("title")
      .trim()
      .isString()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long"),
  ];
}

function validateImageUrl() {
  return [body("imageUrl").trim().isURL().withMessage("Invalid image URL")];
}

function validatePrice() {
  return [
    body("price")
      .trim()
      .isFloat()
      .withMessage("Price must be a decimal point number"),
  ];
}

function validateDescription() {
  return [
    body("description")
      .trim()
      .isLength({ min: 3, max: 128 })
      .withMessage(
        "Description must be more than 3 and less than 128 characters long"
      ),
  ];
}

function validateLogin() {
  return [...validateEmail(), ...validatePassword()];
}

function validateSignup() {
  return [
    ...validateEmail(),
    ...validatePassword(),
    ...validatePasswordsEquality(),
  ];
}

function validateResetPassword() {
  return [...validateEmail()];
}

function validateResetPasswordForm() {
  return [...validatePassword(), ...validatePasswordsEquality()];
}

function validateAddProductForm() {
  return [
    ...validateTitle(),
    ...validateImageUrl(),
    ...validatePrice(),
    ...validateDescription(),
  ];
}

function validateEditProductForm(idName) {
  return [...validateObjectId(idName), ...validateAddProductForm()];
}

export {
  comparePasswords,
  validateLogin,
  validateSignup,
  validateResetPassword,
  validateResetPasswordForm,
  validateObjectId,
  validateAddProductForm,
  validateEditProductForm,
};
