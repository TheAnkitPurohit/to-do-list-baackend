const express = require("express");
const router = express.Router();

// model
const User = require("../models/User");

// express-validator
const { body, validationResult } = require("express-validator");

// crypto
const CryptoJS = require("crypto-js");
const cryptoKey = process.env.CRYPTO_KEY;

// JsonWebToken
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middleware/auth");
const jwtSecret = process.env.JWT_SECRET;

// Register
router.post(
  "/register",
  [
    body("username", "Username must be greator than 3 charactor").isLength({
      min: 3,
    }),
    body("email", "Not an valid Email").isEmail(),
    body("password", "Password must be greator than 5 charactor").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      //   check the user is already registered
      if (user) {
        return res
          .status(400)
          .json({ success: false, msg: "Email is already registered" });
      } else {
        const securePassword = CryptoJS.AES.encrypt(
          password,
          cryptoKey
        ).toString();
        user = new User({
          username,
          email,
          password: securePassword,
        });

        const newUser = await user.save();
        const authToken = jwt.sign(newUser.id, jwtSecret);
        res.status(201).json({ success: true, authToken });
      }
    } catch (error) {
      return res.status(400).json({ success: false, error });
    }
  }
);

// Login
router.post(
  "/login",
  [
    body("email", "Not an valid Email").isEmail(),
    // body("password", "Password Can't be blank").exists(),
  ],
  async (req, res) => {
    try {
      let user = await User.findOne({ email: req.body.email });
      //   check the user is exist
      if (!user) {
        return res.status(400).json({
          success: false,
          msg: "Please try to login with correct login credentials",
        });
      }

      //   check password

      const bytes = CryptoJS.AES.decrypt(user.password, cryptoKey);
      const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

      if (originalPassword === req.body.password) {
        const authToken = jwt.sign(user.id, jwtSecret);
        res.status(200).json({ success: true, authToken });
      } else {
        return res.status(400).json({
          success: false,
          msg: "Please try to login with correct login credentials",
        });
      }
    } catch (error) {
      return res.status(400).json({ success: false, error });
    }
  }
);

// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post("/getuser", isAuthenticated, async (req, res) => {
  try {
    let userId = req.user;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// exports
module.exports = router;
