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
    const subscription = await stripe.subscriptions.list(
      {
        customer: user.customerID,
        status: "all",
        expand: ["data.default_payment_method"],
      },
      {
        apiKey: process.env.STRIPE_SECRET_KEY,
      }
    );
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    let plan = null;
    console.log(subscription.data.length);
    if (!subscription.data.length) {
      plan = "free";
    }

    if (subscription.data.length) {
      if (subscription.data[0].plan.nickname == "Basic") {
        plan = "basic";
      } else if (subscription.data[0].plan.nickname == "Pro") {
        plan = "pro";
      } else if (subscription.data[0].plan.nickname == "Master") {
        plan = "master";
      }
    }
    const token = Jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({ user, token, plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User

export const update = async (req, res) => {
  const { voice_id } = req.body;
  const { id } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { _id: id },
      { voice_id: voice_id },
      { new: true }
    );

    return res.status(200).json({ success: true, user: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
