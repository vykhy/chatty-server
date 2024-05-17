import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./../models/User.js";
import { Op } from "sequelize";

const signup = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  try {
    if (password !== confirmPassword) throw new Error("Passwords do not match");
    if (!email) throw new Error("Email is required");
    if (!username) throw new Error("First Name is required");
    if (!password) throw new Error("Password is required");

    const hashedPassword = await bcrypt.hash(password, 10);

    const usernameExists = await User.count({ username: username });
    if (usernameExists > 0) throw new Error("Username is already taken");

    const emailExists = await User.count({ email: email });
    if (emailExists > 0) throw new Error("email is already taken");

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res
      .status(201)
      .json({ message: "User created successfully", data: { user: newUser } });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
      },
    });
    console.log(user);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const userData = user.get({ plain: true });
    delete userData.password;

    res.json({ message: "Login successful", data: { token, user: userData } });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id); // Assume req.user.id is set by authentication middleware
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error getting user", error });
  }
};

const editUser = async (req, res) => {
  const { firstName, lastName, email } = req.body;
  try {
    const user = await User.findByPk(req.user.id); // Assume req.user.id is set by authentication middleware
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

export { signup, login, getUser, editUser };
