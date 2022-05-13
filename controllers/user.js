const { v4: uuidv4 } = require('uuid');
const Database = require('../db/index');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const signJwtToken = (userId, email, username, userType) => {
    const token = jwt.sign(
        { userId, email, username, userType },
        'secretword',
        {
            expiresIn: '24h',
        }
    );
    return token;
};

const userController = {
    register: async (req, res, next) => {
        try {
            console.log(req.body.password);
            const { email, username, password, type } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const id = uuidv4();
            const result = await Database.query(
                'INSERT INTO users (id, email, username, password, type) VALUES ($1, $2, $3, $4, $5)',
                [id, email, username, hashedPassword, type]
            );
            const token = signJwtToken(id, email, username, type);
            res.status(200).json({ token });
        } catch (error) {
            next(error);
        }
    },
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const result = await Database.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );
            const user = result.rows[0];
            console.log('user', user);
            if (!user) {
                return next(new AppError(400, 'Invalid user with id'));
            }
            const passwordCorrect = await bcrypt.compare(
                password,
                user.password
            );
            if (!passwordCorrect) {
                return next(new AppError(400, 'Invalid password'));
            }
            const token = signJwtToken(
                user.id,
                user.email,
                user.username,
                user.type
            );
            res.status(200).json({ token });
        } catch (error) {
            next(error);
        }
    },
};
module.exports = userController;
