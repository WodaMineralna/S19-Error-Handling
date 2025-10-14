const newError = require("../utils/newError");

const Order = require("./order");
const Product = require("./product");

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordToken: {
    token: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.getCart = async function () {
  try {
    const userData = await this.populate("cart.items.productId");
    // console.log("Cart items:", userData); // DEBUGGING

    return userData.cart.items;
  } catch (error) {
    throw newError("Failed to get cart data", error);
  }
};

userSchema.methods.addToCart = async function (productId, productData) {
  try {
    // * check if product exists in DB (if it was deleted / productId tampering attempt)
    const {
      didSucceed,
      details,
      product: productData,
    } = await Product.findProductById(productId);

    if (!didSucceed) {
      return { didSucceed, details };
    }

    // ! conversion to string is needed, comparing two 'ObjectId' objects won't work
    const existingProductIndex = this.cart.items.findIndex((prod) => {
      return prod.productId.toString() === productData._id.toString();
    });
    console.log("Existing prod index:", existingProductIndex); // DEBUGGING

    let updatedCart;

    // ^ if cart product already exists, increase quantity
    if (existingProductIndex !== -1) {
      updatedCart = { items: [...this.cart.items] };
      updatedCart.items[existingProductIndex].quantity += 1;
    } else {
      updatedCart = {
        items: [
          ...this.cart.items,
          { productId: productData._id, quantity: 1 },
        ],
      };
    }
    // console.log("Updated Cart:", updatedCart); // DEBUGGING

    this.cart = updatedCart;
    await this.save();
    return { didSucceed: true, details: { message: "Product added to cart!" } };
  } catch (error) {
    throw newError("Failed to add item to cart", error);
  }
};

userSchema.methods.deleteItemFromCart = async function (productId) {
  try {
    const updatedCartItems = this.cart.items.filter((cartItem) => {
      return cartItem.productId.toString() !== productId.toString();
    });
    // console.log("Updated cart items:", updatedCartItems); // DEBUGGING

    // * check if product was NOT deleted from cart (due to an error / productId tampering attempt)
    if (updatedCartItems.length === this.cart.items.length) {
      return {
        didSucceed: false,
        details: {
          message: "Item not found in cart or already removed",
        },
      };
    }

    this.cart.items = updatedCartItems;
    this.save();

    return {
      didSucceed: true,
      details: { message: "Product deleted from cart" },
    };
  } catch (error) {
    throw newError("Failed to delete product from cart", error);
  }
};

userSchema.methods.clearCart = async function () {
  try {
    this.cart = { items: [] };
    return await this.save();
  } catch (error) {
    throw newError("Failed to clear cart", error);
  }
};

userSchema.methods.getOrders = async function () {
  try {
    const orders = await Order.find({ "user.userId": this._id });
    return orders;
  } catch (error) {
    throw newError("Failed to find orders", error);
  }
};

userSchema.methods.addOrder = async function () {
  try {
    const userData = await this.populate("cart.items.productId");
    const products = userData.cart.items.map((item) => {
      return {
        productData: {
          title: item.productId.title,
          price: item.productId.price,
          description: item.productId.description,
          imageUrl: item.productId.imageUrl,
        },
        quantity: item.quantity,
      };
    });
    const order = new Order({
      user: {
        email: this.email,
        userId: this._id,
      },
      products,
    });

    console.log("Created order:", order); // DEBUGGING

    await order.save();
    await this.clearCart();
  } catch (error) {
    throw newError("Failed to add an order", error);
  }
};

module.exports = mongoose.model("User", userSchema);
