"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const productsModel_1 = require("../../models/productsModel");
const router = express.Router();
router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /products'
    });
});
router.post('/', (req, res, next) => {
    const product = new productsModel_1.ProductModel({
        name: req.body.name,
        price: req.body.price
    });
    product.save().then((result) => {
        console.log(result);
        res.status(201).json({
            message: 'Handling POST requests to /products',
            createdProduct: product
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    productsModel_1.ProductModel.findById(id).exec().then(doc => {
        console.log("From DB: ", doc);
        if (doc) {
            res.status(200).json(doc);
        }
        else {
            res.status(404).json({
                message: "Not valid entry for provided ID"
            });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
router.patch('/:productId', (req, res, next) => {
    res.status(200).json({
        message: 'Updated product!'
    });
});
router.delete('/:productId', (req, res, next) => {
    res.status(200).json({
        message: 'Deleted product!'
    });
});
module.exports = router;
//# sourceMappingURL=productsRoute.js.map