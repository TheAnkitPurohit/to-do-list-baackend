// JsonWebToken
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

exports.isAuthenticated = (req, res, next) => {
  // Get the user from the jwt token and add id to req object
  const token = req.header("authToken");
  if (!token) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, jwtSecret);
    req.user = data;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
};
