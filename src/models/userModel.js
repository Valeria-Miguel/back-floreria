const bcrypt = require('bcryptjs');
const { db } = require('../../db')  // Importa la conexión a la base de datos

const userModel = {
    validateCredentials: async (email, password) => {
        try {
         
            const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

            if (userSnapshot.empty) {
                return null;  // No se encontró el usuario
            }

          
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();

            // Verificar la contraseña
            const isPasswordValid = await bcrypt.compare(password, userData.password);

            if (isPasswordValid) {
                return {
                    id: userDoc.id,  // devolver el ID del documento
                    email: userData.email,
                    role: userData.role
                };
            }

            return null;  // la contraseña no es válida
        } catch (error) {
            console.error('Error al validar credenciales:', error);
            throw new Error('Error en la base de datos');
        }
    }
};

module.exports = userModel;
