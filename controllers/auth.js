import Jwt from "jsonwebtoken";
import User from "../model/user.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
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
  const { voice_id } = req.body;
  const { id } = req.params;
  console.log(voice_id);
  console.log(id);
  try {
    const user = await User.findById(id, {
      $set: {
        voice_id: voice_id,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    return res.status(200).json({ success: true, user: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
