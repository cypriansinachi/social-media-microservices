const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateTokens = async (user) => {
    const accessToken = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '15m' })

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days validity

    await RefreshToken.create({ token: refreshToken, user: user._id, expiresAt });

    return { accessToken, refreshToken }
}
module.exports = generateTokens;