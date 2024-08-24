import mongoose, { Document, Schema } from "mongoose";

export interface IWishlistItem {
  product: mongoose.Types.ObjectId;
}

export interface WishlistType extends Document {
  user: mongoose.Types.ObjectId;
  items: IWishlistItem[];
}

const WishlistSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const WishlistModel = mongoose.model<WishlistType>("Wishlist", WishlistSchema);

export default WishlistModel;
