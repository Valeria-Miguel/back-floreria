const jwt = require('jsonwebtoken');

const jwtUtils = {
    generateToken: (userId) => {
        return jwt.sign({ userId }, 'secretKey', { expiresIn: '1m' });
    }
};

module.exports = jwtUtils;