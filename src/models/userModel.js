const users = [
    { id: 1, email: 'dulce@uteq.com', password: 'contrasena1!' },
    { id: 2, email: 'user2@example.com', password: 'Password2!' }
];

const userModel = {
    validateCredentials: (email, password) => {
        return users.find(u => u.email === email && u.password === password);
    }
};

module.exports = userModel;