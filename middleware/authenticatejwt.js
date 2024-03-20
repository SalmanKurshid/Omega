const jwt = require('jsonwebtoken');
const passport = process.env.SECRET_KEY;

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const authHeaderParts = authHeader.split(' ');
        if (authHeaderParts.length === 2 && authHeaderParts[0] === 'Bearer') {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, passport, (err, user) => {
                if (err) {
                    console.log("err", err);
                    return res.json({
                        "message": 'Authorization Failed',
                        "status": 403
                    });
                }
                req.user = user;
                next();
            });
        } else {
            return res.json({
                "message": 'Invalid Authorization Header Format',
                "status": 400
            });
        }
    } else {
        res.json({
            "message": 'Unauthorized',
            "status": 401
        });
    }
};

module.exports = authenticateJWT