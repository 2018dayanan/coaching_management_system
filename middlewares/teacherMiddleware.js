const jwt = require("jsonwebtoken");

const teacherMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(400).json({
                status: false,
                message: "Authorization header is missing or invalid",
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.userInfo = decoded;

        if (req.userInfo.role !== "teacher") {
            return res.status(403).json({
                status: false,
                message: "Access denied. Teachers only.",
            });
        }

        next();
    } catch (error) {
        console.error("Teacher auth middleware error:", error);
        return res.status(401).json({
            status: false,
            message: "Unauthorized: Invalid or expired token",
        });
    }
};

module.exports = teacherMiddleware;
