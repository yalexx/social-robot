"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("../../../settings");
const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        console.log('Auth token: ', token);
        const decoded = jwt.verify(token, settings_1.SETTINGS.JWT_KEY);
        req.userData = decoded;
    }
    catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
    next();
};
//# sourceMappingURL=check-auth.js.map