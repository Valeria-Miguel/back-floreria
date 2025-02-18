const userModel = require('../models/userModel');  // Asegúrate de la ruta correcta
const jwtUtils = require('../utils/jwtUtils');
const validators = require('../utils/validators');

const authController = {
    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                statusCode: 400,
                intDataMessage: [{ error: 'Se requiere correo electrónico y contraseña' }]
            });
        }

        if (!validators.validateEmail(email)) {
            return res.status(400).json({
                statusCode: 400,
                intDataMessage: [{ error: 'Formato invalido del email' }]
            });
        }

        if (!validators.validatePassword(password)) {
            return res.status(400).json({
                statusCode: 400,
                intDataMessage: [{ error: 'La contraseña debe tener al menos 8 caracteres e incluir una letra mayúscula, una letra minúscula, un número y un carácter especial.' }]
            });
        }

        try {
            const user = await userModel.validateCredentials(email, password);

            if (user) {
                const token = jwtUtils.generateToken(user.id);
                console.log('Token generado:', token);

                return res.status(200).json({
                    statusCode: 200,
                    intDataMessage: [{ credentials: token }]
                });
            } else {
                return res.status(401).json({
                    statusCode: 401,
                    intDataMessage: [{ error: 'Credenciales inválidas' }]
                });
            }
        } catch (error) {
            console.error('Error al procesar el login:', error);
            return res.status(500).json({
                statusCode: 500,
                intDataMessage: [{ error: 'Error en el servidor' }]
            });
        }
    }
};

module.exports = authController;
