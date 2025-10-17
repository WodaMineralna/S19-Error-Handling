import Product from "../models/product.js";

const PLACEHOLDER_DETAILS = { cause: null, message: "Something went wrong..." };

export async function getIndex(req, res, next) {
  const products = await Product.fetchAll();
  return res.render("shop/index", {
    products,
    pageTitle: "Shop",
    path: "/",
  });
}

export async function getProductsPage(req, res, next) {
  const products = await Product.fetchAll();
  return res.render("shop/product-list", {
    products,
    pageTitle: "All Products",
    path: "/products",
  });
}

export async function getProduct(req, res, next) {
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
}

export async function getCart(req, res, next) {
  const cartItems = await req.user.getCart();

  return res.render("shop/cart", {
    products: cartItems,
    path: "/cart",
    pageTitle: "Your Cart",
  });
}

export async function postCart(req, res, next) {
  const id = req.body.productId;
  const { didSucceed, details = PLACEHOLDER_DETAILS } =
    await req.user.addToCart(id);

  req.flash(didSucceed ? "info" : "error", details);
  return res.redirect("/products");
}

export async function postDeleteCart(req, res, next) {
  const id = req.body.productId;

  const { didSucceed, details = PLACEHOLDER_DETAILS } =
    await req.user.deleteItemFromCart(id);

  req.flash(didSucceed ? "info" : "error", details);
  return res.redirect("/cart");
}

export async function getOrders(req, res, next) {
  const orders = await req.user.getOrders();
  return res.render("shop/orders", {
    orders,
    path: "/orders",
    pageTitle: "Your Orders",
  });
}

export async function postOrder(req, res, next) {
  await req.user.addOrder();

  return res.redirect("/orders");
}

export default {
  getIndex,
  getProductsPage,
  getProduct,
  getCart,
  postCart,
  postDeleteCart,
  getOrders,
  postOrder,
};
