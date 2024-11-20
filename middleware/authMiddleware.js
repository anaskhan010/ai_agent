const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const secretKey = "ASAJKLDSLKDJLASJDLA";

module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!authHeader) {
    console.error("Authorization header missing.");
  } else if (!token) {
    console.error("Bearer token missing.");
  }

  if (token) {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        console.error("Token verification failed:", err.message);
        return res
          .status(401)
          .json({ status: false, message: "Invalid token" });
      } else {
        req.user = decoded; // Add the decoded token payload to `req.user`
        next();
      }
    });
  } else {
    return res
      .status(403)
      .json({ status: false, message: "No token provided" });
  }
};
