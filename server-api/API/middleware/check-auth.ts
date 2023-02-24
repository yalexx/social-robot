import {SETTINGS} from "../../../settings";
const jwt = require('jsonwebtoken');

module.exports = (req: any, res: any, next: any) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        console.log('Auth token: ', token);
        const decoded = jwt.verify(token, SETTINGS.JWT_KEY);
        req.userData = decoded;
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
    next();
};