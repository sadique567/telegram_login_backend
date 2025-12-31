import mongoose from "mongoose";

const telegramSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true, // allows null for telegram users
    },
    password: {
      type: String,
    },

    telegramId: {
      type: String,
      unique: true,
      sparse: true,
    },
    username: String,
    firstName: String,
    photoUrl: String,

    provider: {
      type: String,
      enum: ["local", "telegram"],
      default: "telegram",
      // required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("telegramLogin", telegramSchema);
