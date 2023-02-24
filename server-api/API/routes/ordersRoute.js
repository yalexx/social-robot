"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const ordersController_1 = require("../controllers/ordersController");
const router = express.Router();
router.get('/', ordersController_1.ordersGetAll);
router.post('/', ordersController_1.ordersCreate);
router.get('/:orderId', ordersController_1.ordersGetOrder);
router.delete('/:orderId', ordersController_1.ordersDeleteOrder);
module.exports = router;
//# sourceMappingURL=ordersRoute.js.map