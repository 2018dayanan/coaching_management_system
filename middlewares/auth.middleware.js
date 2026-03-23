const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const protect = catchAsync(async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.authorization) {
        token = req.headers.authorization;
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        req.userInfo = decoded;
        req.user = decoded; 
        
        if (decoded.role === 'SUPER_ADMIN') {
            req.adminInfo = decoded;
        }

        next();
    } catch (err) {
        return next(new AppError('Invalid or expired token.', 401));
    }
});

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }
        next();
    };
};

module.exports = {
    protect,
    restrictTo
};
