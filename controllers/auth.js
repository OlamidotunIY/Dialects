import Jwt from "jsonwebtoken";
import User from "../model/user.js";
import bcrypt from "bcrypt";
import stripe from "../utills/stripe.js";
import dotenv from "dotenv";

dotenv.config();

export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const customer = await stripe.customers.create(
      {
        email: email,
        name: fullName,
      },
      {
        apiKey: process.env.STRIPE_SECRET_KEY,
      }
    );

    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
      customerID: customer.id,
    });

    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login User

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    const token = Jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User

export const update = async (req, res) => {
  const { voice_Id } = req.body;
  const { id } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { _id: id },
      { voice_id: voice_Id },
      { new: true }
    );

    return res.status(200).json({ success: true, user: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
