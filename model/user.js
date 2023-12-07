import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    min: 5,
    max: 50,
  },
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true,
  },
  gender: {
    type: String,
  },
  age: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    min: 6,
  },
  picture: {
    type: String,
    default: "",
  },
  voice_id: {
    type: String,
    default: "",
  },
  subscriptionID: {
    type: String,
    default: "",
  },
  customerID: {
    type: String,
    default: "",
  },
});

const User = mongoose.model("User", userSchema);
export default User;
