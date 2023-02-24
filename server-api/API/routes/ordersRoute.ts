import * as express from "express";
import {ordersCreate, ordersDeleteOrder, ordersGetAll, ordersGetOrder} from "../controllers/ordersController";
const router = express.Router();

router.get('/', ordersGetAll);

router.post('/', ordersCreate);

router.get('/:orderId', ordersGetOrder);

router.delete('/:orderId', ordersDeleteOrder);

module.exports = router;