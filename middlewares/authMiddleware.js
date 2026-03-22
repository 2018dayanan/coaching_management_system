
const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    // console.log(token);
    if (!token) {
      return res.status(400).json({
        status: false,
        message: "Authorization header is missing or invalid",
      });
    }
    const verifyAuthToken = jwt.verify(token, process.env.SECRET_KEY);
    req.userInfo = verifyAuthToken;

    next();
  } catch (e) {
    console.error("Auth Middleware erroro", e);
    return res.status(401).json({
      status: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;