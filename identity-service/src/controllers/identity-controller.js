const generateTokens = require('../utils/generateToken');
const logger = require('../utils/logger');
const { validateRegistration } = require('../utils/validation');

// user registration
const registerUser = async (req, res, next) => {
    logger.info('Registering new user with data: %o', req.body)
    try {
        // validate input
        const { error } = validateRegistration(req.body);
        if (error) {
            logger.warn('Validation failed for user registration: %o', error.details[0].message);
            return res.status(400).json({ success: false, error: error.details[0].message });
        }
        const { email, username, password } = req.body;
        // check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            logger.warn('User registration failed: email or username already exists');
            return res.status(400).json({ success: false, error: 'Email or username already exists' });
        }
        // create new user
        const newUser = new User({ email, username, password });
        await newUser.save();
        logger.info('User saved successfully with id: %s', newUser._id);

        const { accessToken, refreshToken } = await generateTokens(newUser)
        res.status(201).json({ success: true, message: 'User registered successfully', accessToken, refreshToken });

    } catch (err) {
        logger.error('Error occurred while registering user: %o', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

// user login

// refresh token

// logout

module.exports = { registerUser }   