const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const userSchema = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Schema = mongoose.Schema;
let User;

const initialize = async (url) => {
  console.log("state--",mongoose.connection.readyState);
  try {
    mongoose.connect(url);
    console.log("state--",mongoose.connection.readyState);
    console.log("Database connection established!");
    User = mongoose.model("Users", userSchema, "Users"); 
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
};


const authenticateUser = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: "User not found" };
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      return { success: false, message: "Incorrect password" };
    }
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    return {
      success: true,
      token: token,
      message: "User Authenticated successfully",
    };
  } catch (error) {
    console.error("Error in authenticating user:", error);
    return { success: false, message: "Error in authenticating uer" };
  }
};

const registerUser = async (email, password) => {
    try {
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return { message: "User already exists", success: false };
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email: email,
        password: hashedPassword,
      });
      await newUser.save();
      return { message: "User registered successfully", success: true };
    } catch (error) {
      console.error("Error while registering user -- ", error);
      return {
        message: "An error occurred while registering new user",
        success: false,
      };
    }
  };

  const bookmarkCity = async (userId, city) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    if (!user.bookmarks.includes(city)) {
        user.bookmarks.push(city);
        await user.save();
        return { message: 'City bookmarked' };
    } else {
        return { message: 'City is already bookmarked' };
    }
};


const getBookmarks = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
      throw new Error('User not found');
  }
  return user.bookmarks;
};

const getUserIdByEmail = async (email) => {
  console.log("email--",email);
  const user = await User.findOne({ email: email }); 
  if (!user) {
    throw new Error('User not found');
  }
  return user._id;
};



const removeBookmark = async (userId, city) => {
  const user = await User.findById(userId);
  if (!user) {
      throw new Error('User not found');
  }
  user.bookmarks = user.bookmarks.filter(bookmark => bookmark !== city);
  await user.save();
  return { message: 'City removed from bookmarks' };
};



module.exports = {
  initialize,
  authenticateUser,
  registerUser,
  getBookmarks,
  bookmarkCity,
  removeBookmark,
  getUserIdByEmail
};