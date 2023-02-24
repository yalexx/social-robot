export let ordersGetAll = (req: any, res: any, next: any) => {
    res.status(200).json({
        message: 'Orders were fetched'
    });
};

export let ordersCreate = (req: any, res: any, next: any) => {
    const order = {
        productId: req.body.productId,
        quantity: req.body.quantity
    };
    res.status(201).json({
        message: 'Order was created',
        order: order
    });
};

export let ordersGetOrder = (req: any, res: any, next: any) => {
    res.status(200).json({
        message: 'Orders order details',
        orderId: req.params.orderId
    });
};

export let ordersDeleteOrder = (req: any, res: any, next: any) => {
    res.status(200).json({
        message: 'Orders deleted',
        orderId: req.params.orderId
    });
};