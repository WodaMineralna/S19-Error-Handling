const express = require("express");
const router = express.Router();

const isAuthed = require("../middleware/isAuthed");
const shopController = require("../controllers/shop");
const catchErrAsync = require("../utils/catchErrAsync");
const { validateObjectId } = require("../utils/validation");
const handleValidation = require("../middleware/handleValidation");

router.get("/", catchErrAsync(shopController.getIndex));

router.get("/products", catchErrAsync(shopController.getProductsPage));

router.get(
  "/products/:id",
  validateObjectId("id"),
  handleValidation("/products", {
    redirect: true,
  }),
  catchErrAsync(shopController.getProduct)
);

router.get("/cart", isAuthed(), catchErrAsync(shopController.getCart));

router.post(
  "/cart",
  isAuthed(),
  validateObjectId("productId"),
  handleValidation("/products", {
    redirect: true,
  }),
  catchErrAsync(shopController.postCart)
);

router.post(
  "/cart/delete/:productId",
  isAuthed(),
  validateObjectId("productId"),
  handleValidation("/cart", {
    redirect: true,
  }),
  catchErrAsync(shopController.postDeleteCart)
);

router.get("/orders", isAuthed(), catchErrAsync(shopController.getOrders));

router.post(
  "/orders/create",
  isAuthed(),
  catchErrAsync(shopController.postOrder)
);

module.exports = router;
