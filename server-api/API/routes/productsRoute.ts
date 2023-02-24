import * as express from "express";
import {ProductModel} from "../../models/productsModel";
import * as mongoose from "mongoose";

const router = express.Router();

router.get('/', (req: any, res: any, next: any) => {
    res.status(200).json({
        message: 'Handling GET requests to /products'
    })
});

router.post('/', (req: any, res: any, next: any) => {

    const product = new ProductModel({
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

router.get('/:productId', (req: any, res: any, next: any) => {
    const id = req.params.productId;

    ProductModel.findById(id).exec().then(doc => {

        console.log("From DB: ", doc);
        if (doc) {
            res.status(200).json(doc);
        }
        else {
            res.status(404).json({
                message: "Not valid entry for provided ID"
            })
        }


    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });

});

router.patch('/:productId', (req: any, res: any, next: any) => {
    res.status(200).json({
        message: 'Updated product!'
    })
});

router.delete('/:productId', (req: any, res: any, next: any) => {
    res.status(200).json({
        message: 'Deleted product!'
    })
});

module.exports = router;