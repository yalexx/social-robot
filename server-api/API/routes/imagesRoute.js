"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const imagesController_1 = require("../controllers/imagesController");
const router = express.Router();
router.post('/checkText', imagesController_1.checkText);
module.exports = router;
//# sourceMappingURL=imagesRoute.js.map