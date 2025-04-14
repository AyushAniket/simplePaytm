const jwt = require('jsonwebtoken');
const JWT_SECRET = require('./config.js');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer')) {
        return res.status(403).json({ message: "Unauthorized: Token Invalid" });
    }

    const jwtToken = token.split(' ')[1];

    try{
        const decoded = jwt.verify(jwtToken, JWT_SECRET);
        req.user = decoded.id;
        console.log(req.user);
        next();
    }
    catch(err){
        return res.status(403).json({ message: "Unauthorized" });
    }
}

module.exports = authMiddleware;