import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/OrderModel.js';
import User from '../models/UserModel.js';
import { isAuth } from '../Utiles.js';

const OrderRouter = express.Router();

OrderRouter.post(
    '/',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const newOrder = new Order({
            orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod,
            itemsPrice: req.body.itemsPrice,
            shippingPrice: req.body.shippingPrice,
            taxPrice: req.body.taxPrice,
            totalPrice: req.body.totalPrice,
            user: req.user._id,
        });

        const order = await newOrder.save();
        res.status(201).send({ message: 'New Order Created', order });
    })
);


OrderRouter.get(
    '/history/:_id',

    expressAsyncHandler(async(req, res) => {
        console.log( "id from server: ", req.params._id);
        try{
            const userById = await User.findById(req.params._id);
            console.log(userById)
            const orders = await Order.find({ user: userById });
            console.log(orders)
            res.status(200).send(orders)
        }
        catch(err){
            res.status(404).send({ message: 'User not found' })
        }
    })
)


OrderRouter.get(
    '/:id',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const id = req.params.id;
        try{
            const order = await Order.findById(id);
            if (order) {
                console.log(order);
                res.send(order);
            }
            console.log(order);
        }
        catch(err){
            console.log(err)
            res.status(404).send({ message: 'Orderssss not found' });
        }
    })
);
export default OrderRouter;
