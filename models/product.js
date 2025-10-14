const newError = require("../utils/newError");

const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

// ^ pagination is currently unnecessary, app won't be handling thousands of products at once (because there aren't so many)
// ! pagination will be implemented during course section S21 - Adding Pagination
productSchema.statics.fetchAll = async function (filter) {
  try {
    return await this.find(filter ? { userId: filter } : {});
  } catch (error) {
    throw newError("Failed to fetch products", error);
  }
};

productSchema.statics.findProductById = async function (id) {
  try {
    const product = await this.findById(id);

    if (!product)
      return {
        didSucceed: false,
        details: { message: "Product not found!" },
      };

    return { didSucceed: true, details: {}, product };
  } catch (error) {
    throw newError(`Failed to fetch product with ID: ${id}`, error);
  }
};

productSchema.statics.editProductById = async function (
  id,
  title,
  price,
  description,
  imageUrl,
  userId
) {
  try {
    userId = userId.toString();
    const updatedProduct = await this.updateOne(
      { _id: id, userId },
      { title, price, description, imageUrl },
      { new: true, runValidations: true }
    );

    console.log(updatedProduct);

    if (updatedProduct.matchedCount === 0) {
      return {
        didSucceed: false,
        details: {
          message: "Product not found or you don't have permission to edit it",
        },
      };
    }

    if (updatedProduct.modifiedCount === 0) {
      return {
        didSucceed: true,
        details: {
          message: "No changes detected in the product data",
        },
      };
    }

    return {
      didSucceed: true,
      details: {
        message: "Product updated!",
      },
    };
  } catch (error) {
    throw newError(`Failed update product with ID: ${id}`, error);
  }
};

productSchema.statics.addProduct = async function (productData) {
  try {
    const product = await this.create(productData);

    if (!product)
      return {
        didSucceed: false,
        details: {
          message: "Creating new product failed. Please try again later",
        },
      };

    return {
      didSucceed: true,
      details: {
        message: "Product created!",
      },
    };
  } catch (error) {
    throw newError("Failed to add new product", error);
  }
};

productSchema.statics.deleteProduct = async function (id, userId) {
  try {
    userId = userId.toString();
    const deletedProduct = await this.deleteOne({ _id: id, userId });

    if (deletedProduct.deletedCount === 0)
      return {
        didSucceed: false,
        details: {
          message: "Deleting product failed. Please try again later",
        },
      };

    return {
      didSucceed: true,
      details: {
        message: "Product deleted!",
      },
    };
  } catch (error) {
    throw newError(`Failed to delete product with ID: ${id}`, error);
  }
};

module.exports = mongoose.model("Product", productSchema);
