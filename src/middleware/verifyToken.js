const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({
            statusCode: 401,
            intDataMessage: [{ error: 'No token provided' }]
        });
    }

    jwt.verify(token, 'secretKey', (err, decoded) => {
        if (err) {
            return res.status(401).json({
                statusCode: 401,
                intDataMessage: [{ error: 'No proporciona ningun token' }]
            });
        }

        req.userId = decoded.userId;
        next();
    });
};

module.exports = verifyToken;
