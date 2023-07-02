import express from 'express';
import Product from '../models/productModel.js';
import Order from '../models/OrderModel.js';
import data from '../data.js';
import User from '../models/UserModel.js';

const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
  await Product.deleteMany({});
  const createdProducts = await Product.insertMany(data.products);
  await User.deleteMany({});
  const createrUsers = await User.insertMany(data.users);
  // await Order.deleteMany({});
  // const createdOrders = await Order.insertMany(data.orders)
  res.send({ createdProducts, createrUsers});
});

export default seedRouter;
