const Product = require("../models/product");

const PLACEHOLDER_DETAILS = { cause: null, message: "Something went wrong..." };

exports.getIndex = async (req, res, next) => {
  const products = await Product.fetchAll();
  return res.render("shop/index", {
    products,
    pageTitle: "Shop",
    path: "/",
  });
};

exports.getProductsPage = async (req, res, next) => {
  const products = await Product.fetchAll();
  return res.render("shop/product-list", {
    products,
    pageTitle: "All Products",
    path: "/products",
  });
};

exports.getProduct = async (req, res, next) => {
  const id = req.params.id;
  const { didSucceed, details, product } = await Product.findProductById(id);

  if (!didSucceed) {
    req.flash("error", details);
    return res.redirect("/products");
  }
  if (didSucceed) {
    return res.render("shop/product-detail", {
      product,
      pageTitle: `${product.title} Details`,
      path: "/products",
    });
  }
};

exports.getCart = async (req, res, next) => {
  const cartItems = await req.user.getCart();

  return res.render("shop/cart", {
    products: cartItems,
    path: "/cart",
    pageTitle: "Your Cart",
  });
};

exports.postCart = async (req, res, next) => {
  const id = req.body.productId;
  const { didSucceed, details = PLACEHOLDER_DETAILS } =
    await req.user.addToCart(id);

  req.flash(didSucceed ? "info" : "error", details);
  return res.redirect("/products");
};

exports.postDeleteCart = async (req, res, next) => {
  const id = req.body.productId;

  const { didSucceed, details = PLACEHOLDER_DETAILS } =
    await req.user.deleteItemFromCart(id);

  req.flash(didSucceed ? "info" : "error", details);
  return res.redirect("/cart");
};

exports.getOrders = async (req, res, next) => {
  const orders = await req.user.getOrders();
  return res.render("shop/orders", {
    orders,
    path: "/orders",
    pageTitle: "Your Orders",
  });
};

exports.postOrder = async (req, res, next) => {
  await req.user.addOrder();

  return res.redirect("/orders");
};
