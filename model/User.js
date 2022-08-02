import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  avatar: {
    public_id: String,
    url: String,
  },
  email: {
    type: String,
    required: [true, "Please enter your name"],
    unique: [true, "Email already exist"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [6, "Password must be atleast 6 characters long"],
    select: false,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPaswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export default mongoose.model("User", UserSchema);
