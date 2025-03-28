const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // استخراج التوكن من الهيدر
            token = req.headers.authorization.split(" ")[1];

            // فك تشفير التوكن والتحقق منه
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

            // جلب بيانات المستخدم وإضافتها إلى `req.user`
            req.user = await User.findById(decoded.userId).select("-password");

            next();
        } catch (error) {
            res.status(401).json({
                success: false,
                message: "Not authorized, token failed",
            });
        }
    } else {
        res.status(401).json({
            success: false,
            message: "Not authorized, no token",
        });
    }
};

module.exports = { protect };
