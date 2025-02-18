const express = require('express');
const bodyParser = require('body-parser');
const authController = require('./src/controllers/authController');
const jwt = require('jsonwebtoken');
const verifyToken = require('./src/middleware/verifyToken');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3001;
const cors = require('cors');

const {db} = require('./db');

app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true
}));

app.use(bodyParser.json());
app.get('/', async (req, res) => {
    try {
        console.log("Conectando a Firestore...");
        const querySnapshot = await db.collection('users').get();

        if (querySnapshot.empty) {
            console.log("No se encontraron documentos en la colección 'users'.");
            return res.status(404).json({ message: "No hay usuarios en la base de datos." });
        }

        const users = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log("Usuarios obtenidos:", users);
        res.json(users);  
    } catch (error) {
        console.error("Error obteniendo los usuarios:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});


app.post('/register', async (req, res) => {
    try {
        const { email, username, password, role } = req.body;

        
        if (!email || !username || !password || !role) {
            return res.status(400).json({ error: "Faltan datos: email, username, password y role son requeridos." });
        }

    
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "El correo electrónico no tiene un formato válido." });
        }

    
        const userExists = await db.collection('users').where('email', '==', email).get();
        if (!userExists.empty) {
            return res.status(400).json({ error: "El correo electrónico ya está registrado." });
        }

      
        const hashedPassword = await bcrypt.hash(password, 10); 

     
        const dateRegister = new Date();

        const newUserRef = await db.collection('users').add({
            email,
            username,
            password: hashedPassword,
            role,
            'date-register': dateRegister,
            'last-login': dateRegister,  
        });

        res.status(201).json({
            id: newUserRef.id,
            email,
            username,
            role,
            'date-register': dateRegister,
            'last-login': dateRegister,
        });

    } catch (error) {
        console.error("Error al registrar el usuario:", error);
        res.status(500).send("Error en el servidor");
    }
});






app.post('/auth/login', authController.login);

app.get('/auth/protected', verifyToken, (req, res) => {
    return res.status(200).json({
        statusCode: 200,
        intDataMessage: [{ message: 'Tienes acceso a esta ruta', userId: req.userId }]
    });
});


// Ruta para actualizar los datos de un usuario
app.put('/update-user/:id', async (req, res) => {
    try {
        const userId = req.params.id;  // Obtener el ID del usuario de la URL
        const { username, password, role } = req.body;  // Datos a actualizar

        // Verificar que al menos uno de los datos esté presente
        if (!username && !password && !role) {
            return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar." });
        }

        // Buscar el usuario en Firestore
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        // Verificar si el usuario existe
        if (!userDoc.exists) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        // Preparar los datos que se van a actualizar
        const updatedData = {};

        if (username) updatedData.username = username;
        if (role) updatedData.role = role;
        if (password) {
            // Encriptar la nueva contraseña
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedData.password = hashedPassword;
        }

        // Actualizar el usuario en Firestore
        await userRef.update(updatedData);

        // Responder con el usuario actualizado (sin la contraseña)
        res.status(200).json({
            id: userId,
            username: updatedData.username || userDoc.data().username,
            role: updatedData.role || userDoc.data().role,
        });

    } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        res.status(500).send("Error en el servidor");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
