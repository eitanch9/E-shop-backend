import express from 'express';
import Product from '../models/productModel.js';
import expressAsyncHandler from 'express-async-handler';


const ProductRouter = express.Router();
const PAGE_SIZE = 6;


ProductRouter.get('/', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

ProductRouter.get('/token/:token', async (req, res) => {
  const token = req.params.token;
  const product = await Product.findOne({ token });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product was not found' });
  }
});

ProductRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

ProductRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';
    console.log(req);
    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
          title: {
            //like 'Contains' in ASP.NET
            $regex: searchQuery,
            //Case-insensitive for Mongo
            $options: 'i',
          },
        }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? { 'rating.rate': { $gte: Number(rating) } }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
          price: {
            $gte: Number(price.split('-')[0]),
            $lte: Number(price.split('-')[1]),
          },
        }
        : {};
    const sortOrder =
      order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
          ? { price: -1 }
          : order === 'toprated'
            ? { rating: -1 }
            : order === 'newest'
              ? { createdAt: -1 }
              : { _id: -1 };

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

ProductRouter.get('/:id', async (req, res) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product was not found' });
  }
});



export default ProductRouter;
