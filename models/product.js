import mongoose from "mongoose";
import { newError, createLogger } from "../utils/index.js";

const { Schema } = mongoose;
const log = createLogger(import.meta.url);

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
  // log("info", "Products fetched");
  try {
    return await this.find(filter ? { userId: filter } : {});
  } catch (error) {
    log("error", error);
    throw newError("Failed to fetch products", error);
  }
};

productSchema.statics.findProductById = async function (id) {
  try {
    const product = await this.findById(id);

    if (!product) {
      log("warn", `Product with ID ${id} not found`);
      return {
        didSucceed: false,
        details: { message: "Product not found!" },
      };
    }

    return { didSucceed: true, details: {}, product };
  } catch (error) {
    log("error", error);
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

    if (updatedProduct.matchedCount === 0) {
      log("warn", `Product not updated - no ID match (${id})`);
      return {
        didSucceed: false,
        details: {
          message: "Product not found or you don't have permission to edit it",
        },
      };
    }

    if (updatedProduct.modifiedCount === 0) {
      log("info", "No changes made in product data");
      return {
        didSucceed: true,
        details: {
          message: "No changes detected in the product data",
        },
      };
    }

    log("success", "Product updated");
    return {
      didSucceed: true,
      details: {
        message: "Product updated!",
      },
    };
  } catch (error) {
    log("error", error);
    throw newError(`Failed update product with ID: ${id}`, error);
  }
};

productSchema.statics.addProduct = async function (productData) {
  try {
    const product = await this.create(productData);

    if (!product) {
      log("error", "Adding product failed");
      return {
        didSucceed: false,
        details: {
          message: "Creating new product failed. Please try again later",
        },
      };
    }

    log("success", "Product created");
    return {
      didSucceed: true,
      details: {
        message: "Product created!",
      },
    };
  } catch (error) {
    log("error", error);
    throw newError("Failed to add new product", error);
  }
};

productSchema.statics.deleteProduct = async function (id, userId) {
  try {
    userId = userId.toString();
    const deletedProduct = await this.deleteOne({ _id: id, userId });

    if (deletedProduct.deletedCount === 0) {
      log("warn", "Deleting product failed - invalid ID or userId");
      return {
        didSucceed: false,
        details: {
          message: "Deleting product failed. Please try again later",
        },
      };
    }

    log("success", "Product deleted");
    return {
      didSucceed: true,
      details: {
        message: "Product deleted!",
      },
    };
  } catch (error) {
    log("error", error);
    throw newError(`Failed to delete product with ID: ${id}`, error);
  }
};

export default mongoose.model("Product", productSchema);
