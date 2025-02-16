const express = require('express');
const bodyParser = require('body-parser');
const authController = require('./src/controllers/authController');
const jwt = require('jsonwebtoken');
const verifyToken = require('./src/middleware/verifyToken');

const app = express();
const PORT = 3001;
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:3001', 
    credentials: true
}));

app.use(bodyParser.json());

app.post('/auth/login', authController.login);


app.get('/auth/protected', verifyToken, (req, res) => {
    return res.status(200).json({
        statusCode: 200,
        intDataMessage: [{ message: 'Tienes acceso a esta ruta ', userId: req.userId }]
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});