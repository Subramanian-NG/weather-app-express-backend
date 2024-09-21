require("dotenv").config();
const express = require("express");

const app = express();
const db = require("../config/db");
const { body, validationResult } = require("express-validator");

const router = express.Router();

//middleware to validate email and password
const validateUserInput = [
    body("email").trim()
      .isEmail().withMessage("Invalid email format")
      .notEmpty().withMessage("Email cannot be empty"),
    body("password").trim()
      .notEmpty().withMessage("Password cannot be empty")
  ];

router.post("/register", validateUserInput, async (req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  const { email, password } = req.body;
  const result = await db.registerUser(email, password);
  if (result.success) {
    res.json({ message: result.message });
  } else {
    res.status(400).json({ message: result.message });
  }
});

router.post("/login", validateUserInput, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  const result = await db.authenticateUser(email, password);
  if (result.success) {
    //for better implementation, we can store the token in database mapped to userId or cache it. For every protected API call in verifyToken middleware, we can check database/cache. If not present, authenticaion denied
    res.cookie("token", result.token);
    res.json({ message: result.message });
  } else {
    res.status(401).json({ message: result.message });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  // we can do better to invalidate the token assigned to user.
  //for better implementation, we can remove the token from database/cache mapped to userId.
  res.json({ message: "Successfully logged out." });
});

module.exports = router;
