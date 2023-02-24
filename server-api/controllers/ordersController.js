"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersGetAll = (req, res, next) => {
    res.status(200).json({
        message: 'Orders were fetched'
    });
};
exports.ordersCreate = (req, res, next) => {
    const order = {
        productId: req.body.productId,
        quantity: req.body.quantity
    };
    res.status(201).json({
        message: 'Order was created',
        order: order
    });
};
exports.ordersGetOrder = (req, res, next) => {
    res.status(200).json({
        message: 'Orders order details',
        orderId: req.params.orderId
    });
};
exports.ordersDeleteOrder = (req, res, next) => {
    res.status(200).json({
        message: 'Orders deleted',
        orderId: req.params.orderId
    });
};
//# sourceMappingURL=ordersController.js.map